# Sharing Revisions Notes Site

```text
A site where all students can upload their lesson or revisions notes to share them with all the school.
```

## Code Languages

- Python
- JavaScript
- HTML
- CSS 

## 1) Commands for install server

```bash
cd /opt
git clone --branch server/server https://github.com/Python-Nath/sharing-revisions-notes-site.git
cd sharing-revisions-notes-site
sudo apt install python3-venv
python3 -m venv ./venv
. ./venv/bin/activate
python -m pip install -r requirements.txt
python make_structure.py && sh init-server.sh
```

## 2) Commands for install client

### Si Linux 

```bash
sudo apt install python3-venv
python3 -m venv ./venv
. ./venv/bin/activate
```
### Install

```bash
git clone --branch server/client-cli https://github.com/Python-Nath/sharing-revisions-notes-site.git
cd sharing-revisions-notes-site
python -m pip install -r requirements.txt
python init_client_cli.py && python cli_site_example_rich_ai.py
```
