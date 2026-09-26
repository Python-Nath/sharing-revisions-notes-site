import requests
import os
import json

import tkinter as tk
from tkinter import filedialog, simpledialog, messagebox

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()

def fetch_data(url):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad responses
        return response 
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

def load_json_file(file_path):
	with open(file_path, "r") as f:
		return json.load(f)


def show_api_info(base_url):
    response = requests.get(f"{base_url}/help")

    if response.status_code != 200:
        console.print(
            f"[red]Erreur HTTP {response.status_code}[/red]"
        )
        return

    data = response.json()

    # Titre
    console.print()
    console.print(
        Panel.fit(
            "[bold cyan]📚 Sharing Revisions & Notes[/bold cyan]\n"
            "[dim]API disponible[/dim]",
            border_style="cyan"
        )
    )

    console.print()

    # Message
    console.print(
        f"[green]✓[/green] {data.get('message', '')}"
    )

    console.print()

    # Tableau des endpoints
    table = Table(
        title="🚀 Endpoints disponibles",
        border_style="blue",
        show_lines=True
    )

    table.add_column(
        "Endpoint",
        style="cyan",
        no_wrap=True
    )

    table.add_column(
        "Description",
        style="white"
    )

    for endpoint, description in data.get("endpoints", {}).items():
        table.add_row(endpoint, description)

    console.print(table)
    console.print()

def download_file(matiere, classe, specialite, file_id, base_url):
    url = (
        f"{base_url}/download/"
        f"{matiere}/{classe}/{specialite}/{file_id}"
    )

    downloads_dir = os.path.join(os.path.expanduser("~"), "Downloads")
    os.makedirs(downloads_dir, exist_ok=True)

    response = requests.get(url, stream=True)

    if response.status_code != 200:
        return False, f"Erreur HTTP {response.status_code}"

    # Nom du fichier fourni par le serveur
    filename = response.headers.get("Content-Disposition")

    if filename and "filename=" in filename:
        filename = filename.split("filename=", 1)[1].strip('"')
    else:
        filename = f"{file_id}.bin"

    filepath = os.path.join(downloads_dir, filename)

    with open(filepath, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

    return True, filepath

def upload_file(matiere, classe, specialite, base_url):
    # Création de la fenêtre
    root = tk.Tk()
    root.withdraw()

    # Sélection du fichier
    filepath = filedialog.askopenfilename(
        title="Sélectionner le fichier à envoyer"
    )

    if not filepath:
        messagebox.showwarning(
            "Upload",
            "Aucun fichier sélectionné."
        )
        return

    # Récupération des informations
    title = simpledialog.askstring(
        "Titre",
        "Titre du fichier :"
    )

    author = simpledialog.askstring(
        "Auteur",
        "Auteur :"
    )

    desc = simpledialog.askstring(
        "Description",
        "Description :"
    )

    if not title or not author or not desc:
        messagebox.showerror(
            "Erreur",
            "Le titre, l'auteur et la description sont obligatoires."
        )
        return

    # URL Flask
    url = (
        f"{base_url}/upload/"
        f"{matiere}/{classe}/{specialite}"
    )

    try:
        # Ouverture du fichier
        with open(filepath, "rb") as file:
            files = {
                "file": (
                    os.path.basename(filepath),
                    file
                )
            }

            data = {
                "title": title,
                "author": author,
                "desc": desc
            }

            response = requests.post(
                url,
                files=files,
                data=data
            )

        # Traitement de la réponse
        if response.status_code == 201:
            result = response.json()

            messagebox.showinfo(
                "Succès",
                "Fichier envoyé avec succès !"
            )

            print(result)

        else:
            try:
                error = response.json().get("error")
            except Exception:
                error = response.text

            messagebox.showerror(
                "Erreur",
                f"Échec de l'upload :\n{error}"
            )

    except requests.RequestException as e:
        messagebox.showerror(
            "Erreur",
            f"Impossible de contacter le serveur :\n{e}"
        )

    finally:
        root.destroy()

def main():
    base_url = "http://127.0.0.1:8000"
    print("================ Site cli ================")
    print("Choose an option:")
    print("1. Choose a matiere")
    print("2. help")
    option = input("Enter your choice (1 or 2): ")
    if option == "1":
        matiere_url = f"{base_url}/info/matiere"
        matiere_response = fetch_data(matiere_url)
        if matiere_response:
            matieres = matiere_response.json().get("matiere", [])
            print("Available matieres:")
            for idx, matiere in enumerate(matieres, start=1):
                print(f"{idx}. {matiere}")
            matiere_choice = input("Enter the number of the matiere you want to choose: ")
            try:
                matiere_index = int(matiere_choice) - 1
                if 0 <= matiere_index < len(matieres):
                    chosen_matiere = matieres[matiere_index]
                    print(f"You chose: {chosen_matiere}")
                    print("Fetching classes for the chosen matiere...")
                    classe_url = f"{base_url}/info/classe/{chosen_matiere}"
                    classe_response = fetch_data(classe_url)
                    if classe_response:
                        classes = classe_response.json().get("classe", [])
                        print("Available classes:")
                        for idx, classe in enumerate(classes, start=1):
                            print(f"{idx}. {classe}")
                        classe_choice = input("Enter the number of the class you want to choose: ")
                        try:
                            classe_index = int(classe_choice) - 1
                            if 0 <= classe_index < len(classes):
                                chosen_classe = classes[classe_index]
                                print(f"You chose: {chosen_classe}")
                                print("Fetching specialities for the chosen class...")
                                specialite_url = f"{base_url}/info/specialite/{chosen_matiere}/{chosen_classe}"
                                specialite_response = fetch_data(specialite_url)
                                if specialite_response:
                                    specialities = specialite_response.json().get("specialite", [])
                                    print("Available specialities:")
                                    for idx, specialite in enumerate(specialities, start=1):
                                        print(f"{idx}. {specialite}")
                                    specialite_choice = input("Enter the number of the speciality you want to choose: ")
                                    try:
                                        specialite_index = int(specialite_choice) - 1
                                        if 0 <= specialite_index < len(specialities):
                                            chosen_specialite = specialities[specialite_index]
                                            print(f"You chose: {chosen_specialite}")
                                            print("Fetching files for the chosen speciality...")
                                            files_url = f"{base_url}/info/files/{chosen_matiere}/{chosen_classe}/{chosen_specialite}"
                                            files_response = fetch_data(files_url)
                                            if files_response:
                                                files = files_response.json().get("files", [])
                                                print("Available files:")
                                                for idx, file in enumerate(files, start=1):
                                                    json_data = load_json_file(os.path.join("matiere", chosen_matiere, chosen_classe, chosen_specialite, file))
                                                    print(f"{idx}. {json_data.get('title', 'No Title')} (Author: {json_data.get('author', 'Unknown')})")
                                                print("Do you want to upload (1) or download (2) a file?")
                                                action_choice = input("Enter your choice (1 or 2): ")
                                                if action_choice == "1":
                                                    upload_file(
                                                        chosen_matiere,
                                                        chosen_classe,
                                                        chosen_specialite,
                                                        base_url
                                                    )
                                                elif action_choice == "2":
                                                    file_choice = input("Enter the number of the file you want to download: ")
                                                    try:
                                                        file_index = int(file_choice) - 1
                                                        if 0 <= file_index < len(files):
                                                            chosen_file = files[file_index]
                                                            print(f"You chose to download: {chosen_file}")
                                                            success, result = download_file(
                                                                chosen_matiere,
                                                                chosen_classe,
                                                                chosen_specialite,
                                                                chosen_file[:-5],  # Assuming the file_id is the filename without extension
                                                                base_url
                                                            )
                                                            if success:
                                                                print(f"File downloaded successfully to: {result}")
                                                            else:
                                                                print(f"Failed to download file: {result}")
                                                        else:
                                                            print("Invalid choice. Please run the program again.")
                                                    except ValueError:
                                                        print("Invalid input. Please enter a number.")
                                        else:
                                            print("Invalid choice. Please run the program again.")
                                    except ValueError:
                                        print("Invalid input. Please enter a number.")
                            else:
                                print("Invalid choice. Please run the program again.")
                        except ValueError:
                            print("Invalid input. Please enter a number.")
                else:
                    print("Invalid choice. Please run the program again.")
            except ValueError:
                print("Invalid input. Please enter a number.")
    elif option == "2":
        show_api_info(base_url)

if __name__ == "__main__":
    main()