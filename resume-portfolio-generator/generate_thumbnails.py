import os
import requests
from playwright.sync_api import sync_playwright

LAYOUTS = [
    '3d', 'brand', 'cards', 'creative', 'cyberpunk', 'dark', 'dashboard',
    'designer', 'developer', 'glass', 'glass2', 'impact', 'magazine',
    'minimal', 'modern', 'nature', 'neon', 'photographer', 'playful',
    'portfolio', 'portfolio_1', 'portfolio_2', 'portfolio_standalone',
    'professional', 'resume', 'space', 'story_v2', 'terminal'
]

DUMMY_DATA = {
    'name': "Alex Rivera",
    'email': "hello@alexrivera.dev",
    'mobile': "+1 (555) 123-4567",
    'portfolio_summary': "Visionary Full Stack Developer with 5+ years of experience designing scalable web applications and intuitive interfaces. Passionate about leveraging cutting-edge technologies to solve complex problems.",
    'experience': [
        {
            'title': "Senior Software Engineer",
            'company': "TechNova Solutions",
            'dates': "2020 - Present",
            'description': "Led a cross-functional team to develop a microservices architecture, reducing latency by 40%. Implemented responsive React frontends with robust Python backend APIs."
        },
        {
            'title': "Frontend Engineer",
            'company': "Creative Digital",
            'dates': "2018 - 2020",
            'description': "Built interactive, responsive data visualization dashboards using React and D3.js. Increased client engagement by 30%."
        }
    ],
    'education': [
        {
            'name': "B.S. in Computer Science",
            'institution': "University of Technology",
            'dates': "2014 - 2018"
        }
    ],
    'skills': ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Docker", "Tailwind CSS", "MongoDB"],
    'projects': [
        {
            'name': "Quantum E-Commerce",
            'description': "A high-performance modern e-commerce storefront with real-time inventory sync and Stripe payments integration.",
            'tech': "React, Node.js, MongoDB",
            'link': "github.com/alexrivera/quantum"
        },
        {
            'name': "TaskMaster Pro",
            'description': "Collaborative project management tool featuring real-time sockets notifications and Kanban boards.",
            'tech': "TypeScript, Express, PostgreSQL",
            'link': "github.com/alexrivera/taskmaster"
        }
    ]
}

API_URL = "http://localhost:5000/api/render-preview"
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "thumbnails"))

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def generate_all_thumbnails():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Using a nice 16:9 ratio mimicking a desktop browser window
        context = browser.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
        page = context.new_page()

        for layout in LAYOUTS:
            try:
                print(f"Generating thumbnail for {layout}...")
                response = requests.post(API_URL, json={'data': DUMMY_DATA, 'layout': layout})
                
                if response.status_code == 200:
                    html_content = response.text
                    
                    # Set content to the page
                    page.set_content(html_content, wait_until="networkidle")
                    
                    # Wait an additional 1500ms to allow animations or glassmorphism effects to settle
                    page.wait_for_timeout(1500)
                    
                    # Ensure base height is visible
                    thumbnail_path = os.path.join(OUTPUT_DIR, f"{layout}.jpg")
                    
                    # Capture screenshot as JPEG with high quality to balance size and look
                    page.screenshot(path=thumbnail_path, type="jpeg", quality=90, full_page=False)
                    print(f"Saved -> {thumbnail_path}")
                else:
                    print(f"Failed to fetch HTML for {layout}. Status code: {response.status_code}")
                    print(response.text)
            except Exception as e:
                print(f"Error processing {layout}: {e}")
                
        browser.close()
        print("Completed thumbnail generation.")

if __name__ == "__main__":
    generate_all_thumbnails()
