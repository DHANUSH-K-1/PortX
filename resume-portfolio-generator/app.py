import os
import json
import re
import requests
from flask import Flask, request, jsonify, send_from_directory, render_template, send_file
from werkzeug.utils import secure_filename
from werkzeug.exceptions import HTTPException
import PyPDF2
import docx
from dotenv import load_dotenv
import zipfile
import io
import datetime
from flask_pymongo import PyMongo
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from user_model import User, bcrypt
from bson import ObjectId

load_dotenv(override=True)

app = Flask(__name__,
            static_folder='../frontend/dist',
            template_folder='.') # Point template folder to root to access resume-portfolio-generator/templates
app.secret_key = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production")

# MongoDB Configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
if not app.config["MONGO_URI"]:
    print("WARNING: MONGO_URI not found in .env. Database features will fail.")

mongo = PyMongo(app)
bcrypt.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    try:
        if user_id == 'None':
            return None
        return User.get_by_id(mongo, user_id)
    except Exception as e:
        print(f"Error loading user {user_id}: {e}")
        return None

UPLOAD_FOLDER = 'uploads'
DATA_FOLDER = 'data'
GENERATED_FOLDER = 'generated'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['DATA_FOLDER'] = DATA_FOLDER
app.config['GENERATED_FOLDER'] = GENERATED_FOLDER

for folder in [UPLOAD_FOLDER, DATA_FOLDER, GENERATED_FOLDER, 'templates']:
    if not os.path.exists(folder):
        os.makedirs(folder)

def read_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in reader.pages:
            text += page.extract_text()
    return text

def read_docx(file_path):
    doc = docx.Document(file_path)
    text = ''
    for para in doc.paragraphs:
        text += para.text + '\n'
    return text

def extract_resume_data_with_openrouter(text):
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    if not openrouter_api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable not set.")

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {openrouter_api_key}",
            },
            json={
                "model": "mistralai/mistral-small-3.1-24b-instruct:free",
                "messages": [
                    {"role": "system", "content": "You are an expert resume parser. Extract information from the resume text and return it as a single, valid JSON object. Do not include any explanatory text before or after the JSON object. The JSON object should have the following keys: 'name', 'email', 'mobile', 'skills', 'education', 'experience', 'portfolio_summary'. 'projects'should be list of objects with relevant details(). 'skills' should be a list of strings. 'education' and 'experience' should be a list of objects with relevant details (like name, title, company, dates). 'portfolio_summary' should be a professional summary of 2-3 sentences. If a value is not found, use a sensible default like 'Not found' or an empty list."},
                    {"role": "user", "content": f"Here is the resume text:\n\n{text}"}
                ]
            },
            timeout=60
        )
        response.raise_for_status()
        
        content = response.json()['choices'][0]['message']['content']
        
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            json_str = match.group(0)
            return json.loads(json_str)
        else:
            print("No JSON object found in the model's response.")
            print(f"Received content: {content}")
            return None

    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error from OpenRouter: {e}")
        print(f"Response body: {e.response.text}")
        raise e
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        print(f"Error processing response from OpenRouter: {e}")
        try:
            content_for_log = response.json().get('choices', [{}])[0].get('message', {}).get('content', 'N/A')
        except:
            content_for_log = "Could not extract content from response."
        print(f"Received content: {content_for_log}")
        return None

# --- Auth Routes ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    print(f"Register attempt for email: {email}")
    if not all([name, email, password]):
        print("Missing fields in register")
        return jsonify(error="Missing fields"), 400

    if User.get_by_email(mongo, email):
        print("Email already exists")
        return jsonify(error="Email already exists"), 400

    try:
        user = User.create_user(mongo, name, email, password)
        login_user(user)
        print(f"User registered and logged in: {user.id}")
        return jsonify(message="Registered successfully", user={'id': user.id, 'name': user.name, 'email': user.email})
    except Exception as e:
        print(f"Error creating user: {e}")
        return jsonify(error=str(e)), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    print(f"Login attempt for email: {email}")
    user = User.get_by_email(mongo, email)
    if user:
        if user.check_password(password):
            login_user(user)
            print(f"User logged in: {user.id}")
            return jsonify(message="Logged in successfully", user={'id': user.id, 'name': user.name, 'email': user.email})
        else:
            print("Invalid password")
    else:
        print("User not found")
    
    return jsonify(error="Invalid credentials"), 401

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify(message="Logged out successfully")

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify(user={'id': current_user.id, 'name': current_user.name, 'email': current_user.email})
    return jsonify(user=None)

@app.route('/api/portfolios', methods=['GET'])
@login_required
def get_user_portfolios():
    try:
        user_portfolios = list(mongo.db.portfolios.find({'user_id': ObjectId(current_user.id)}).sort('created_at', -1))
        
        # Serialize for JSON
        results = []
        for p in user_portfolios:
            results.append({
                'id': str(p['_id']),
                'name': p.get('name', 'Untitled'),
                'created_at': p.get('created_at').isoformat() if p.get('created_at') else None,
                'preview_data': {
                    'layout': p.get('data', {}).get('layout', 'modern'), # Fallback or extracting if stored
                    'title': p.get('data', {}).get('portfolio_summary', '')[:100] + '...' # Snippet
                }
            })
            
        return jsonify(portfolios=results)
    except Exception as e:
        print(f"Error fetching portfolios: {e}")
        return jsonify(error=str(e)), 500

# --- Portfolio Routes ---

@app.route('/p/<path:filename>')
def serve_generated_portfolio(filename):
    return send_from_directory(app.config['GENERATED_FOLDER'], filename)

@app.route('/api/render-preview', methods=['POST'])
def render_preview():
    try:
        data = request.json.get('data')
        layout = request.json.get('layout', 'modern')
        
        if not data:
             return jsonify(error="No data provided"), 400

        # Sanitize layout input
        safe_layout = re.sub(r'[^a-zA-Z0-9_]', '', layout)
        template_name = f"templates/template_{safe_layout}.html"

        if not os.path.exists(os.path.join(os.path.dirname(__file__), template_name)):
            return jsonify(error=f"Template '{safe_layout}' not found."), 404
        
        # Render string only, don't save
        rendered_html = render_template(template_name, **data)
        return rendered_html

    except Exception as e:
        app.logger.error(f"Error in render_preview: {e}", exc_info=True)
        return jsonify(error=str(e)), 500

@app.route('/api/generate-html/<filename>', methods=['POST'])
def generate_html(filename):
    # Backward compatibility: Check if local file first, else DB
    try:
        # Check DB first (filename usually acts as ID or handle from DB nowadays, but initially keep file logic)
        json_filepath = os.path.join(app.config['DATA_FOLDER'], filename)
        if os.path.exists(json_filepath):
             with open(json_filepath, 'r') as json_file:
                data = json.load(json_file)
        # Else check DB (using filename as ID if it looks like one, or just passed ID)
        elif ObjectId.is_valid(filename.replace('.json', '')):
             portfolio = mongo.db.portfolios.find_one({'_id': ObjectId(filename.replace('.json', ''))})
             if portfolio:
                 data = portfolio.get('data')
             else:
                 return jsonify(error="Portfolio data not found."), 404
        else:
             return jsonify(error="Portfolio data not found."), 404
        
        layout = request.json.get('layout', 'modern')
        safe_layout = re.sub(r'[^a-zA-Z0-9_]', '', layout)
        template_name = f"templates/template_{safe_layout}.html"

        if not os.path.exists(os.path.join(os.path.dirname(__file__), template_name)):
            return jsonify(error=f"Template '{safe_layout}' not found."), 404

        html_filename = f"{os.path.splitext(filename)[0]}.html"
        
        rendered_html = render_template(template_name, **data)
        
        generated_html_filepath = os.path.join(app.config['GENERATED_FOLDER'], html_filename)
        with open(generated_html_filepath, 'w', encoding='utf-8') as f:
            f.write(rendered_html)

        return jsonify(success=True, message="HTML generated successfully.", generated_file=html_filename)
    except Exception as e:
        app.logger.error(f"Error in generate_html: {e}", exc_info=True)
        return jsonify(error=f"An error occurred while generating the portfolio: {e}"), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    mongo_status = "connected"
    try:
        mongo.db.command('ping')
    except:
        mongo_status = "disconnected"
    return jsonify(status="ok", message="Backend is running", mongo=mongo_status), 200

@app.route('/api/process-resume', methods=['POST'], strict_slashes=False)
def upload_api():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        if filename.lower().endswith('.pdf'):
            text = read_pdf(filepath)
        elif filename.lower().endswith('.docx'):
            text = read_docx(filepath)
        else:
            return jsonify({'error': 'Unsupported file type. Please upload a PDF or DOCX.'}), 400

        if not text or not text.strip():
            return jsonify({'error': 'Could not extract any text from the uploaded file.'}), 400

        resume_data = extract_resume_data_with_openrouter(text)
        if not resume_data:
            return jsonify({'error': 'Could not parse resume data from the model response.'}), 500

        name = resume_data.get('name', 'No_Name_Found')
        
        # Save to MongoDB if user logged in
        if current_user.is_authenticated:
            portfolio_id = mongo.db.portfolios.insert_one({
                'user_id': ObjectId(current_user.id),
                'name': name,
                'data': resume_data,
                'created_at': datetime.datetime.utcnow() # Note: Need to import datetime
            }).inserted_id
            json_filename = f"{str(portfolio_id)}.json" # Virtual filename for frontend compat
        else:
            # Fallback to local file for guest
            json_filename = f"{secure_filename(name.replace(' ', '_'))}.json"
            json_filepath = os.path.join(app.config['DATA_FOLDER'], json_filename)
            with open(json_filepath, 'w') as json_file:
                json.dump(resume_data, json_file, indent=4)

        return jsonify({'filename': json_filename, 'data': resume_data})

    return jsonify({'error': 'An unknown error occurred'}), 500

@app.route('/api/portfolio/<filename>', methods=['GET'])
def get_portfolio_data(filename):
    # Hybrid approach: DB or File
    if ObjectId.is_valid(filename.replace('.json', '')):
        portfolio = mongo.db.portfolios.find_one({'_id': ObjectId(filename.replace('.json', ''))})
        if portfolio:
            return jsonify(portfolio.get('data'))
    
    json_filepath = os.path.join(app.config['DATA_FOLDER'], filename)
    try:
        with open(json_filepath, 'r') as json_file:
            data = json.load(json_file)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({'error': 'Portfolio data not found.'}), 404

@app.route('/api/portfolio/<filename>', methods=['POST'])
def update_portfolio_data(filename):
    updated_data = request.json
    if not updated_data:
        return jsonify({'error': 'No data provided'}), 400

    if ObjectId.is_valid(filename.replace('.json', '')):
        # Check ownership logic if strict, for now simplistic
        mongo.db.portfolios.update_one(
            {'_id': ObjectId(filename.replace('.json', ''))},
            {'$set': {'data': updated_data}}
        )
        return jsonify({'message': 'Portfolio updated in DB successfully.'})

    json_filepath = os.path.join(app.config['DATA_FOLDER'], filename)
    if not os.path.exists(json_filepath):
        return jsonify({'error': 'Portfolio data not found.'}), 404
    
    with open(json_filepath, 'w') as json_file:
        json.dump(updated_data, json_file, indent=4)
        
    return jsonify({'message': 'Portfolio updated successfully.'})

@app.route('/download/<generated_filename>')
def download_portfolio(generated_filename):
    generated_html_filepath = os.path.join(app.config['GENERATED_FOLDER'], generated_filename)

    try:
        memory_file = io.BytesIO()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.write(generated_html_filepath, arcname=os.path.basename(generated_html_filepath))
        memory_file.seek(0)

        return send_file(memory_file,
                         download_name=f'{os.path.splitext(generated_filename)[0]}_portfolio.zip',
                         as_attachment=True)

    except FileNotFoundError:
        return jsonify({'error': 'Generated portfolio file not found for download.'}), 404
    except Exception as e:
        return jsonify({'error': f"Error creating zip file: {e}"}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(Exception)
def handle_exception(e):
    if request.path.startswith('/api/'):
        if isinstance(e, HTTPException):
            response = e.get_response()
            response.data = json.dumps({
                "code": e.code,
                "name": e.name,
                "description": e.description,
            })
            response.content_type = "application/json"
            return response
        
        app.logger.error(f"Unhandled API exception: {e}", exc_info=True)
        return jsonify(error="Internal Server Error", message=str(e)), 500
    return e


# --- AI Enhancement Route ---
@app.route('/api/ai-enhance', methods=['POST'])
def ai_enhance():
    data = request.json
    text = data.get('text')
    text_type = data.get('type', 'content') # summary, experience, project, or generic content

    if not text:
        return jsonify(error="No text provided"), 400

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return jsonify(error="OpenRouter API key missing"), 500

    # Construct prompt based on type
    system_prompt = "You are a professional resume writer. Rewrite the following text to be more impactful, professional, and concise. Use active verbs. Do not add conversational filler. Return only the rewritten text."
    
    if text_type == 'summary':
        system_prompt = "You are an expert career coach. Rewrite this professional summary to be compelling, concise (under 4 sentences), and highlight key strengths. Use a professional tone. Return only the rewritten text."
    elif text_type == 'experience':
        system_prompt = "You are a definitive resume editor. Rewrite this job description bullet point or paragraph to use strong action verbs, quantify achievements where possible (or suggest placeholders), and improve flow. Keep it professional. Return only the rewritten text."

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "mistralai/mistral-7b-instruct:free", # Using a free/cheap model for speed/cost. Change as needed.
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ]
            },
            timeout=30 
        )

        if response.status_code == 200:
            result = response.json()
            enhanced_text = result['choices'][0]['message']['content'].strip()
            # Remove quotes if the model added them unnecessarily
            if enhanced_text.startswith('"') and enhanced_text.endswith('"'):
                enhanced_text = enhanced_text[1:-1]
            return jsonify(enhanced_text=enhanced_text)
        else:
            print(f"OpenRouter Error: {response.text}")
            return jsonify(error="Failed to enhance text via AI provider"), 500

    except Exception as e:
        print(f"AI Enhance Exception: {e}")
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    app.run(debug=True)