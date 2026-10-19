# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install Dependencies**: `pip install -r requirements.txt`
- **Run App (Dev)**: `python app.py` (runs on port 8000)
- **Initial Server Setup**: `python make_structure.py && sh init-server.sh` (Creates subject hierarchy and configures systemd/nginx)
- **Clean Workspace**: `sh clean.sh` (Removes all files from `matiere/` and `uploads/` except `.gitkeep`)

## Architecture & Structure

### High-Level Overview
A Flask-based file-sharing system for students. It uses a hybrid storage approach: a relational SQLite database for user accounts and history, and a hierarchical filesystem for file metadata and actual uploads.

### Key Components
- **`app.py`**: Entry point. Configures JWT (cookie-based), SQLAlchemy, and defines core upload/download routes.
- **`database/model.py`**: Defines the `User` model. Uses `JSON` columns to store lists of uploaded/downloaded file IDs and their associated metadata.
- **`info/routes.py`**: Discovery API. Scans the `matiere/` directory structure to provide lists of subjects, classes, and specializations.
- **`users/routes.py`**: User management, including JWT login/logout and a personal dashboard for managing owned files.
- **`auth/routes.py`**: Authentication endpoints (login, logout, login/logout pages).
- **`admin/routes.py`**: Admin blueprint (reserved for admin features).
- **`moderator/routes.py`**: Moderator blueprint (reserved for moderator features).
- **`matiere/`**: Filesystem-based metadata store. 
    - Path: `matiere/<subject>/<class>/<specialization>/<file_id>.json`
- **`uploads/`**: Flat storage for actual files, named as `<file_id>_<original_filename>`.
- **`utils/`**: 
    - `dir.py`: Optimized directory scanning using `os.scandir` and path validation logic.
    - `json_utils.py`: Robust JSON read/write helpers with UTF-8 encoding and error handling.
- **`make_structure.py`**: Generates the predefined school subject hierarchy.
- **`init-server.sh`**: Deployment script for systemd service and Nginx configuration.
- **`clean.sh`**: Interactive cleanup script for uploaded files and metadata.

### Blueprints & Templates
Blueprints are used for modular routing. Templates are co-located with their blueprints using `template_folder="."` instead of a global `templates/` folder.
- **`info_bp`** (`/info`): Public discovery endpoints
- **`users_bp`** (`/users`): Authenticated user dashboard and file management
- **`auth_bp`** (`/auth`): Authentication (login/logout)

### Authentication & Security
- **JWT**: Implemented via `flask-jwt-extended` using cookies (`JWT_TOKEN_LOCATION = ["cookies"]`).
- **Access Control**: 
    - **Bans**: The `is_token_revoked` loader in `app.py` checks `User.is_ban` to invalidate tokens for banned users.
    - **Path Safety**: Uses `secure_filename` and `Path.resolve()` with `is_relative_to()` to prevent path traversal attacks.
- **CSRF**: Enabled via `JWT_COOKIE_CSRF_PROTECT = True`.
- **Password Hashing**: Uses `werkzeug.security.generate_password_hash` / `check_password_hash`.

### Data Flow
1. **Upload**: Authenticated User → Validate `matiere/` path → Save file to `uploads/` → Save JSON metadata to `matiere/.../` → Update `User` record in SQLite.
2. **Discovery**: Client → `/info/...` → Scan `matiere/` hierarchy → Return lists of names.
3. **Download**: Client → Fetch JSON from `matiere/.../` → Serve file from `uploads/` → Update `User` download history in SQLite.
4. **Modify/Delete**: Authenticated user → Verify ownership via `user.uploaded_files` → Update/delete both filesystem metadata and SQLite records.

### Critical Implementation Details
- **Mutable JSON**: When updating `User.uploaded_metadatas` or `User.download_metadatas`, `sqlalchemy.orm.attributes.flag_modified` must be called before `db.session.commit()` to ensure changes are persisted.
- **Metadata Sync**: Metadata JSONs in `matiere/` must be kept in sync with the `User` model's JSON columns.
- **File ID**: UUIDv4 used as unique identifier for both metadata files and uploaded files.
- **Defaults**: `JWT_COOKIE_SECURE = False` and `JWT_COOKIE_HTTPS_ONLY = False` for dev; must be `True` in production.
