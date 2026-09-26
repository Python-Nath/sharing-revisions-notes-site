import requests
import os
import json

import tkinter as tk
from tkinter import filedialog, simpledialog, messagebox

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
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


def ask_required_text(root, title, prompt):
    while True:
        value = simpledialog.askstring(title, prompt, parent=root)
        if value is None:
            return None
        value = value.strip()
        if value:
            return value
        if not messagebox.askyesno(
            "Saisie vide",
            "Aucune valeur saisie. Voulez-vous recommencer ?",
            parent=root
        ):
            return None


def ask_console_text(prompt):
    while True:
        value = Prompt.ask(prompt).strip()
        if value:
            return value
        root = tk.Tk()
        root.withdraw()
        retry = messagebox.askyesno(
            "Saisie vide",
            "Aucune valeur saisie. Voulez-vous recommencer ?",
            parent=root
        )
        root.destroy()
        if not retry:
            return None


def choose_from_list(items, title):
    if not items:
        console.print(f"[yellow]Aucun élément disponible pour {title.lower()}.[/yellow]")
        return None

    table = Table(title=title, border_style="cyan", show_lines=True)
    table.add_column("N°", style="bold cyan", justify="right")
    table.add_column("Choix", style="black")
    for index, item in enumerate(items, start=1):
        table.add_row(str(index), str(item))
    console.print(table)

    while True:
        answer = ask_console_text("[bold]Votre choix (numéro)[/bold]")
        if answer is None:
            return None
        try:
            index = int(answer) - 1
        except ValueError:
            console.print("[red]Entrez un numéro valide.[/red]")
            continue
        if 0 <= index < len(items):
            return items[index]
        console.print(f"[red]Choisissez un numéro entre 1 et {len(items)}.[/red]")


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
        root.destroy()
        return

    # Récupération des informations
    title = ask_required_text(root, "Titre", "Titre du fichier :")
    if title is None:
        console.print("[yellow]Upload annulé.[/yellow]")
        root.destroy()
        return

    author = ask_required_text(root, "Auteur", "Auteur :")
    if author is None:
        console.print("[yellow]Upload annulé.[/yellow]")
        root.destroy()
        return

    desc = ask_required_text(root, "Description", "Description :")
    if desc is None:
        console.print("[yellow]Upload annulé.[/yellow]")
        root.destroy()
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

            console.print(Panel.fit(
                f"[bold green]Fichier envoyé avec succès ![/bold green]\n{result}",
                border_style="green"
            ))

        else:
            try:
                error = response.json().get("error")
            except Exception:
                error = response.text

            console.print(f"[red]Échec de l'upload : {error}[/red]")

    except requests.RequestException as e:
        console.print(f"[red]Impossible de contacter le serveur : {e}[/red]")

    finally:
        root.destroy()

def main():
    base_url = "http://127.0.0.1:8000"
    console.print(Panel.fit(
        "[bold bright_cyan]Sharing Revisions & Notes[/bold bright_cyan]\n"
        "[dim]Gestion des fichiers de cours[/dim]",
        border_style="bright_cyan"
    ))
    action = choose_from_list(["Parcourir et transférer un fichier", "Aide API"], "Menu principal")
    if action is None:
        console.print("[yellow]Opération annulée.[/yellow]")
        return
    if action == "Aide API":
        show_api_info(base_url)
        return

    matiere_response = fetch_data(f"{base_url}/info/matiere")
    if not matiere_response:
        return
    matieres = matiere_response.json().get("matiere", [])
    chosen_matiere = choose_from_list(matieres, "Matières disponibles")
    if chosen_matiere is None:
        return

    classe_response = fetch_data(f"{base_url}/info/classe/{chosen_matiere}")
    if not classe_response:
        return
    classes = classe_response.json().get("classe", [])
    chosen_classe = choose_from_list(classes, f"Classes de {chosen_matiere}")
    if chosen_classe is None:
        return

    specialite_response = fetch_data(
        f"{base_url}/info/specialite/{chosen_matiere}/{chosen_classe}"
    )
    if not specialite_response:
        return
    specialities = specialite_response.json().get("specialite", [])
    chosen_specialite = choose_from_list(
        specialities, f"Spécialités de {chosen_classe}"
    )
    if chosen_specialite is None:
        return

    operation = choose_from_list(["Envoyer un fichier", "Télécharger un fichier"], "Action")
    if operation is None:
        return
    if operation == "Envoyer un fichier":
        upload_file(chosen_matiere, chosen_classe, chosen_specialite, base_url)
        return

    files_response = fetch_data(
        f"{base_url}/info/files/{chosen_matiere}/{chosen_classe}/{chosen_specialite}"
    )
    if not files_response:
        return
    files = files_response.json().get("files", [])
    file_labels = []
    for file_name in files:
        metadata_path = os.path.join(
            "matiere", chosen_matiere, chosen_classe, chosen_specialite, file_name
        )
        try:
            metadata = load_json_file(metadata_path)
            label = (
                f"{metadata.get('title', file_name)} "
                f"(Auteur : {metadata.get('author', 'inconnu')}) [{file_name}]"
            )
        except (OSError, json.JSONDecodeError, AttributeError):
            label = str(file_name)
        file_labels.append(label)

    selected_label = choose_from_list(file_labels, "Fichiers disponibles")
    if selected_label is None:
        return
    selected_index = file_labels.index(selected_label)
    chosen_file = files[selected_index]
    file_id = chosen_file[:-5] if str(chosen_file).endswith(".json") else str(chosen_file)
    success, result = download_file(
        chosen_matiere,
        chosen_classe,
        chosen_specialite,
        file_id,
        base_url
    )
    if success:
        console.print(Panel.fit(
            f"[bold green]Téléchargement réussi[/bold green]\n{result}",
            border_style="green"
        ))
    else:
        console.print(f"[red]Échec du téléchargement : {result}[/red]")

if __name__ == "__main__":
    main()