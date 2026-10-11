from flask_sqlalchemy import SQLAlchemy
import uuid

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    surname = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")  # Default role is 'user'
    download_ids = db.Column(db.JSON, nullable=True, default=list)  # Store download information as JSON
    download_metadatas = db.Column(db.JSON, nullable=True, default=dict)  # Store download metadata as JSON
    uploaded_files = db.Column(db.JSON, nullable=True, default=list)  # Store uploaded files as JSON
    uploaded_metadatas = db.Column(db.JSON, nullable=True, default=dict)  # Store uploaded metadata as JSON

    # email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    def __repr__(self):
        return f"<User {self.username}>"

""" class Files(db.Model):
    __tablename__ = "files"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    filename = db.Column(db.String(200), nullable=False)  # Stored filename
    original_filename = db.Column(db.String(200), nullable=False)  # Original filename
    matiere = db.Column(db.String(100), nullable=False)
    classe = db.Column(db.String(100), nullable=False)
    specialite = db.Column(db.String(100), nullable=False)
    uploaded_at = db.Column(db.DateTime, server_default=db.func.now()) """