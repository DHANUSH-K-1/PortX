from flask_login import UserMixin
from flask_bcrypt import Bcrypt
from bson import ObjectId

bcrypt = Bcrypt()

class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data.get('_id'))
        self.name = user_data.get('name')
        self.email = user_data.get('email')
        self.password_hash = user_data.get('password')

    @staticmethod
    def get_by_id(mongo, user_id):
        user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        if user_data:
            return User(user_data)
        return None

    @staticmethod
    def get_by_email(mongo, email):
        user_data = mongo.db.users.find_one({'email': email})
        if user_data:
            return User(user_data)
        return None

    @staticmethod
    def create_user(mongo, name, email, password):
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        user_id = mongo.db.users.insert_one({
            'name': name,
            'email': email,
            'password': password_hash
        }).inserted_id
        return User.get_by_id(mongo, user_id)

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
