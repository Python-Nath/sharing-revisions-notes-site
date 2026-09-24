"""
This script will create a data.json file in all the last paths
to store the number of notes and the JSON files corresponding to them.
"""

from pathlib import Path
import json


def find_end_path(folder):
    paths = Path(folder).rglob("*")
    return [
        p for p in paths
        if p.is_dir() and not any(child.is_dir() for child in p.iterdir())
    ]


def main():
    folder = Path("site-v1")

    end_paths = find_end_path(folder)

    data = {
        "nb_sheet": [],
        "sheets_json": []
    }

    for path in end_paths:
        file = path / "data.json"

        if not file.exists():
            with open(file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    main()
