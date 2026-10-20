# CLAUDE.md

Guidance for working in this repository. The product UI and the folder `documentation/` are in French. This file stays in English.

## Development Commands

- **Install**: `python3 -m venv ./venv && ./venv/bin/pip install -r requirements.txt`
- **Course tree**: `./venv/bin/python make_structure.py`
- **Demo accounts**: `./venv/bin/python init_users.py` (those passwords must be changed on first login)
- **Run**: `./venv/bin/python app.py` (port 8000, debugger off). `python` is not on PATH on every machine. `init-server.sh` option 2 prefers `./venv/bin/python`.
- **Tests**: `./venv/bin/python tests/test_flows.py`
- **Server install**: `sh init-server.sh` option 1 writes commented env vars to `/etc/sharing-revisions-notes-site.env` and enables the unit `sharing-revisions-notes-site`.
- **Clean**: `sh clean.sh` removes files under `matiere/` and `uploads/` except `.gitkeep`.

There is no public signup.

## Architecture

Flask app. SQLite holds accounts, sessions, stars and comments. The filesystem is the source of truth for sheets:

- `matiere/<subject>/<class>/<specialization>/<uuid>.json`
- `uploads/<uuid>_<secure_filename>`

`create_app()` creates tables, then adds missing columns, then enforces a single owner. Column migrations must run before any ORM read. `User` selects `must_change_password`. Querying users before `_colonne_mot_de_passe()` crashes on an old database.

### Blueprints

Templates for auth live next to that blueprint (`template_folder="."`). The other pages are in `templates/`. Scripts are in `static/` except auth scripts in `auth/static/`.

- `info_bp` `/info` : subjects, classes, specializations, file list, search. Public. Star counts are added in the response. `etoile_moi` is set only for the current account.
- `auth_bp` `/auth` : login, logout, first-login and voluntary password change.
- `users_bp` `/users` : own uploads and downloads, edit, delete, personal audit.
- `moderator_bp` `/moderator` : edit or delete any sheet, ban a student, search accounts.
- `admin_bp` `/admin` : same moderation, plus role changes. Owner can open these pages too.
- `owner_bp` `/owner` : site audit and suspension. Admins do not see it and are blocked while the site is suspended.
- `fiches_bp` `/fiches` : toggle a star, list and post comments, claim, validate, remove.

`app.py` also serves `/accueil`, `POST /upload/...` and `GET /download/...`.

### Roles

Stored on `User.role` and read from the database on every request. Not copied into the JWT.

- `user` : own sheets, stars, comments, personal audit.
- `moderator` : any sheet, ban students, search accounts. Cannot change roles or ban staff.
- `admin` : moderator powers, plus roles `user` / `moderator` / `admin`, and banning a moderator.
- `owner` : exactly one. Partial unique index `uq_un_seul_proprietaire`. Nobody can assign this role from the admin page. Owner can suspend the site. On startup, extra owners are demoted to admin and the oldest remains.

`can_moderate` : no self-ban, owner is untouchable, admin cannot ban another admin, moderator can ban only a student.

### Stars

Table `stars`, unique `(user_id, file_id)`. Logged-in users only. `POST /fiches/<id>/etoile` toggles. Owner audit shows the single most-starred sheet and the top sheet or sheets of each subject.

### Comments

Table `comments`. Any logged-in account can comment on any existing sheet.

- `audience=auteur` : every `user`, plus the comment author.
- `audience=equipe` : moderator, admin, owner, plus the author.
- `audience=les_deux` : both groups.

Limits: 20 comments by the same account on one sheet, 30 per account per day, body at most 2000 characters. A body over 16 KB is rejected before it is stored.

Claim (`prendre`) is allowed for the sheet author or staff, and only while status is `ouvert` and `handler_id` is null. The update is conditional so only one claim succeeds. `corrected` is set back to false.

`corrected` becomes true only when that same account later saves the sheet (`update_file(..., acteur=...)`). Staff routes must pass the logged-in user as `acteur`, not the sheet author. Delete of the comment is allowed only for that handler after `corrected` is true.

Staff validate a claimed comment. The site owner can validate only if the handler is gone or banned.

Deleting a sheet deletes its stars and comments in the same transaction, then the JSON and the upload. The browser reloads the page so a stale download link disappears.

### Search

`GET /info/recherche` : `q`, `auteur`, `etoiles_min`. Subject, class and speciality are still accepted by the API but are not fields in the form. The course menu is used for those. At least one criterion. Cap 80. `%` is not a LIKE wildcard. Internal `filename` is not returned.

`GET /admin/comptes/recherche` and `GET /moderator/comptes/recherche` : `q`, `role`, `etat`. Staff only. No password in the payload. Cap 100.

### Password change

`User.must_change_password` defaults to true for new rows. `init_users.py` sets it true. Tests set it false in `creer_compte`. Old databases get the column via `ALTER TABLE` with default 0, so existing accounts are not forced.

While the flag is true, `forcer_mot_de_passe()` allows only password change, login, logout, `/auth/me` and static files. HTML is redirected to `/auth/mot-de-passe`. JSON gets 403.

`POST /auth/mot-de-passe` requires the current password, a matching confirmation, at least 10 characters, at most 200, different from the current password and from the username. Wrong current password counts toward `LOGIN_MAX_ATTEMPTS`. The voluntary page is the same URL. The nav link is `Mot de passe`.

### Audits

`/owner/audit` is the full site report, including star ranking. `/users/audit` is only that account's sheets and only comments they are allowed to read. No user id in the URL.

### Authentication and security

- JWT in HttpOnly cookies, `JWT_TOKEN_LOCATION = ["cookies"]`, CSRF on, SameSite Lax.
- Access token lasts 8 hours.
- `JWT_COOKIE_SECURE` is on only when the env var is `1`.
- Revocation: missing user, `is_ban`, or an explicitly revoked presence row. Tokens issued before presence tracking have no row and stay valid until expiry. Bans are checked separately.
- Login errors do not reveal whether the username exists. Attempts are counted per username for 10 minutes, not per IP.
- Paths: `segment_ok`, `secure_filename`, resolved paths, `is_relative_to`, no symlinks. HTML, SVG and JavaScript uploads are rejected.
- Responses that show user text use `textContent` or Jinja escaping. Do not introduce `innerHTML` for sheet or comment text.
- `flag_modified` is required after mutating `uploaded_files`, `uploaded_metadatas`, `download_ids` or `download_metadatas`.
- `wants_html()` is false for `/info`, `/upload` and `/download`, and for non-GET. Those errors stay JSON.
- Site suspension is `instance/site_status.json` or `SITE_STATUS_PATH`. Owner still passes. Login stays available so the owner can return.

### Environment

Read at startup. Documented and written by `init-server.sh` option 1:

- `JWT_SECRET_KEY`
- `JWT_COOKIE_SECURE` (`0` or `1`)
- `DATABASE_URI` (default `sqlite:///users.db`, file under `instance/`)
- `LOGIN_MAX_ATTEMPTS` (default 8)
- `SITE_STATUS_PATH`

Local secret file if `JWT_SECRET_KEY` is unset: `instance/jwt_secret`.

### Documentation folder

`documentation/index.html` is a standalone browser file. It does not call this API and must not be registered as a Flask route. `precisions.js` is generated from the source. If you add a function, a column, a page or a CSS rule, extend the matching `documentation/donnees-*.js` entry and regenerate or extend `documentation/precisions.js` so the variable table and the ordered actions stay complete.

### Tests

`tests/test_flows.py` is the end-to-end check: auth, upload types, path traversal, roles, suspension, stars, search, comment visibility, single claim, comment removal after edit, first-login password change. Keep `creer_compte(..., must_change_password=False)` unless the test is about that flag. Run the file before calling the work done.
