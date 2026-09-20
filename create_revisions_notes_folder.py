"""
This script will create a data.json file in all the last paths
to store the number of notes and the JSON files corresponding to them.
"""

from pathlib import Path
import os


def find_end_path(folder):
    paths = Path(folder).rglob("*")
    return [
        p for p in paths
        if p.is_dir() and not any(child.is_dir() and child != "revisons_notes_files" for child in p.iterdir())
    ]


def main():
    folder = Path("site-v1")

    end_paths = find_end_path(folder)

    for path in end_paths:
        folder = path / "revisons_notes_files"

        if not folder.exists():
            os.makedirs(folder)


if __name__ == "__main__":
    main()
