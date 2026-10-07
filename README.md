# 📚 Sharing Revisions Notes Site

A collaborative platform designed for students to upload, organize, and share their lesson and revision notes with the entire school community.

## 🚀 Features

- **Hierarchical Organization**: Notes are structured by Subject $\rightarrow$ Class $\rightarrow$ Specialization for easy discovery.
- **Metadata Support**: Every upload includes a title, author, and description.
- **Secure Storage**: Files are stored with unique IDs to prevent naming collisions.
- **Simple API**: Lightweight Flask-based backend for seamless uploading and downloading.

## 🛠️ Tech Stack

- **Backend**: Python / Flask
- **Frontend**: HTML, CSS, JavaScript
- **Storage**: Local filesystem (JSON for metadata, dedicated folder for uploads)

## 📦 Installation & Setup

### Prerequisites
- Python 3.x
- Git

### Server Deployment
Follow these steps to set up the server on a Linux environment:

```bash
# 1. Clone the repository
cd /opt
git clone --branch dev/claude https://github.com/Python-Nath/sharing-revisions-notes-site.git
cd sharing-revisions-notes-site

# 2. Setup virtual environment
sudo apt install python3-venv
python3 -m venv ./venv
source ./venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Initialize structure and start server
# This creates the subject hierarchy and configures systemd/nginx
python make_structure.py && sh init-server.sh
```

## 📂 Project Structure

- `app.py`: Core Flask application and API routes.
- `matiere/`: Hierarchical "database" storing metadata JSONs.
- `uploads/`: Storage for the actual uploaded files.
- `utils/make_structure.py`: Script to generate the predefined school subject folders.
- `init-server.sh`: Deployment script for systemd and Nginx configuration.

## 🛠️ Development

To run the app in development mode:
```bash
python app.py
```

To clean the workspace:
```bash
sh clean.sh
```

---
*Created to empower students through shared knowledge.*
