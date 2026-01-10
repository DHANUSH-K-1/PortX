from app import app

with app.test_client() as c:
    data = {'resume': (open('test_resume.docx', 'rb'), 'test_resume.docx')}
    rv = c.post('/api/process-resume', data=data, content_type='multipart/form-data')
    print('STATUS', rv.status_code)
    print(rv.get_data(as_text=True))
