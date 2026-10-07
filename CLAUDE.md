# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install Dependencies**: `pip install -r requirements.txt`
- **Run App (Dev)**: `python app.py`
- **Initial Server Setup**: `python make_structure.py && sh init-server.sh` (Creates the folder hierarchy for subjects and configures systemd/nginx)
- **Clean Workspace**: `sh clean.sh`

## Architecture & Structure

### High-Level Overview
The project is a Flask-based file-sharing system designed for students to upload and download revision notes. It uses a hierarchical directory structure to organize files by subject, class, and specialization.

### Key Components
- **`app.py`**: The core Flask application. It provides an API for:
    - Uploading files with metadata (title, author, description).
    - Downloading files using a unique `file_id`.
    - Querying the available subjects, classes, and specializations.
- **`matiere/`**: A hierarchical directory acting as the "database" for metadata. 
    - Structure: `matiere/<subject>/<class>/<specialization>/<file_id>.json`
    - Each `.json` file contains metadata about the uploaded file, while the actual file is stored in the `uploads/` folder.
- **`uploads/`**: Stores the actual files, renamed to `<file_id>_<original_filename>` to prevent collisions.
- **`init-server.sh`**: A deployment script that can either launch the app directly or configure it as a systemd service with an Nginx reverse proxy.
- **`utils/make_structure.py`**: Generates the predefined folder structure under `matiere/` based on school subjects.

### Data Flow
1. **Upload**: User sends a file $\rightarrow$ App generates UUID $\rightarrow$ File saved to `uploads/` $\rightarrow$ Metadata JSON saved to `matiere/.../`.
2. **Discovery**: Client requests `/info/matiere` $\rightarrow$ App lists directories in `matiere/`.
3. **Download**: Client requests file by ID $\rightarrow$ App looks up JSON in `matiere/.../` $\rightarrow$ App serves file from `uploads/`.
