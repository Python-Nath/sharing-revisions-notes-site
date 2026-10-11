# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install Dependencies**: `pip install -r requirements.txt`
- **Run App (Dev)**: `python app.py`
- **Initial Server Setup**: `python make_structure.py && sh init-server.sh` (Creates subject hierarchy and configures systemd/nginx)
- **Clean Workspace**: `sh clean.sh`

## Architecture & Structure

### High-Level Overview
A Flask-based file-sharing system for students. It uses a hybrid storage approach: a relational SQLite database for user accounts and history, and a hierarchical filesystem for file metadata and actual uploads.

### Key Components
- **`app.py`**: Entry point. Configures JWT (cookie-based), SQLAlchemy, and defines core upload/download routes.
- **`database/model.py`**: Defines the `User` model. Uses `JSON` columns to store lists of uploaded/downloaded file IDs and their associated metadata.
- **`info/routes.py`**: Discovery API. Scans the `matiere/` directory structure to provide lists of subjects, classes, and specializations.
- **`users/routes.py`**: User management, including JWT login/logout and a personal dashboard for managing owned files.
- **`matiere/`**: Filesystem-based metadata store. 
    - Path: `matiere/<subject>/<class>/<specialization>/<file_id>.json`
- **`uploads/`**: Flat storage for actual files, named as `<file_id>_<original_filename>`.
- **`utils/`**: 
    - `dir.py`: Optimized directory scanning using `os.scandir` and path validation logic.
    - `json_utils.py`: Robust JSON read/write helpers with UTF-8 encoding and error handling.

### Authentication & Security
- **JWT**: Implemented via `flask-jwt-extended` using cookies (`JWT_TOKEN_LOCATION = ["cookies"]`).
- **CSRF**: Enabled via `JWT_COOKIE_CSRF_PROTECT = True`.
- **Path Safety**: Uses `secure_filename` and `Path` objects to prevent path traversal attacks.

### Data Flow
1. **Upload**: Authenticated User $\rightarrow$ Validate `matiere/` path $\rightarrow$ Save file to `uploads/` $\rightarrow$ Save JSON metadata to `matiere/.../` $\rightarrow$ Update `User` record in SQLite.
2. **Discovery**: Client $\rightarrow$ `/info/...` $\rightarrow$ Scan `matiere/` hierarchy $\rightarrow$ Return lists of names.
3. **Download**: Client $\rightarrow$ Fetch JSON from `matiere/.../` $\rightarrow$ Serve file from `uploads/` $\rightarrow$ Update `User` download history in SQLite.

### Critical implementation details
- **Mutable JSON**: When updating `User.uploaded_metadatas` or `User.download_metadatas`, `sqlalchemy.orm.attributes.flag_modified` must be called before `db.session.commit()` to ensure changes are persisted.
- **Metadata**: Metadata JSONs in `matiere/` must be kept in sync with the `User` model's JSON columns.
