import requests
import os
import json

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
from rich.table import Table
from rich.text import Text

console = Console()


# ============================================================
# UTILITAIRES
# ============================================================

def fetch_data(url):
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        console.print(f"[red]Erreur : {e}[/red]")
        return None


def load_json_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def ask_required_text(prompt):
    """
    Demande une valeur obligatoire dans le terminal.
    """
    while True:
        value = Prompt.ask(prompt).strip()

        if value:
            return value

        console.print("[yellow]La saisie ne peut pas être vide.[/yellow]")

        retry = Prompt.ask(
            "Voulez-vous recommencer ?",
            choices=["o", "n"],
            default="o"
        )

        if retry.lower() == "n":
            return None


def choose_file():
    """
    Demande directement le chemin du fichier dans Termux.
    """
    while True:
        filepath = Prompt.ask(
            "[bold cyan]Chemin du fichier à envoyer[/bold cyan]"
        ).strip()

        if not filepath:
            console.print("[yellow]Aucun fichier indiqué.[/yellow]")
            continue

        # Support de ~/...
        filepath = os.path.expanduser(filepath)

        if not os.path.isfile(filepath):
            console.print(
                f"[red]Fichier introuvable : {filepath}[/red]"
            )

            retry = Prompt.ask(
                "Voulez-vous réessayer ?",
                choices=["o", "n"],
                default="o"
            )

            if retry.lower() == "n":
                return None

            continue

        return filepath


def choose_from_list(
    items,
    title,
    item_style="orange1",
    orange_items=None
):
    if not items:
        console.print(
            f"[yellow]Aucun élément disponible pour {title.lower()}.[/yellow]"
        )
        return None

    table = Table(
        title=title,
        title_style=item_style,
        border_style="cyan",
        show_lines=True
    )

    table.add_column(
        "N°",
        style="bold cyan",
        justify="right"
    )

    table.add_column("Choix")

    for index, item in enumerate(items, start=1):
        choice_style = (
            "orange1"
            if orange_items and item in orange_items
            else item_style
        )

        table.add_row(
            str(index),
            Text(str(item), style=choice_style)
        )

    console.print(table)

    while True:
        answer = ask_required_text(
            "[bold]Votre choix (numéro)[/bold]"
        )

        if answer is None:
            return None

        try:
            index = int(answer) - 1
        except ValueError:
            console.print(
                "[red]Entrez un numéro valide.[/red]"
            )
            continue

        if 0 <= index < len(items):
            return items[index]

        console.print(
            f"[red]Choisissez un numéro entre 1 et {len(items)}.[/red]"
        )


# ============================================================
# AIDE API
# ============================================================

def show_api_info(base_url):
    try:
        response = requests.get(
            f"{base_url}/help",
            timeout=15
        )
    except requests.exceptions.RequestException as e:
        console.print(
            f"[red]Impossible de contacter le serveur : {e}[/red]"
        )
        return

    if response.status_code != 200:
        console.print(
            f"[red]Erreur HTTP {response.status_code}[/red]"
        )
        return

    try:
        data = response.json()
    except ValueError:
        console.print(
            "[red]La réponse du serveur n'est pas un JSON valide.[/red]"
        )
        return

    console.print()

    console.print(
        Panel.fit(
            "[bold cyan]📚 Sharing Revisions & Notes[/bold cyan]\n"
            "[dim]API disponible[/dim]",
            border_style="cyan"
        )
    )

    console.print()

    console.print(
        f"[green]✓[/green] {data.get('message', '')}"
    )

    console.print()

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

    for endpoint, description in data.get(
        "endpoints",
        {}
    ).items():

        table.add_row(
            endpoint,
            str(description)
        )

    console.print(table)
    console.print()


# ============================================================
# DOWNLOAD
# ============================================================

def download_file(
    matiere,
    classe,
    specialite,
    file_id,
    base_url
):
    url = (
        f"{base_url}/download/"
        f"{matiere}/{classe}/{specialite}/{file_id}"
    )

    # Termux :
    # ~/Downloads existe généralement avec le stockage partagé.
    downloads_dir = os.path.join(
        os.path.expanduser("~"),
        "Downloads"
    )

    os.makedirs(
        downloads_dir,
        exist_ok=True
    )

    try:
        response = requests.get(
            url,
            stream=True,
            timeout=30
        )
    except requests.exceptions.RequestException as e:
        return False, f"Erreur réseau : {e}"

    if response.status_code != 200:
        return (
            False,
            f"Erreur HTTP {response.status_code}"
        )

    # Nom fourni par le serveur
    content_disposition = response.headers.get(
        "Content-Disposition"
    )

    if (
        content_disposition
        and "filename=" in content_disposition
    ):
        filename = content_disposition.split(
            "filename=",
            1
        )[1].strip('"')
    else:
        filename = f"{file_id}.bin"

    filepath = os.path.join(
        downloads_dir,
        filename
    )

    try:
        with open(filepath, "wb") as f:
            for chunk in response.iter_content(
                chunk_size=8192
            ):
                if chunk:
                    f.write(chunk)

    except OSError as e:
        return False, f"Erreur d'écriture : {e}"

    return True, filepath


# ============================================================
# UPLOAD
# ============================================================

def upload_file(
    matiere,
    classe,
    specialite,
    base_url
):
    # --------------------------------------------------------
    # Sélection du fichier dans le terminal
    # --------------------------------------------------------

    filepath = choose_file()

    if not filepath:
        console.print(
            "[yellow]Upload annulé.[/yellow]"
        )
        return

    # --------------------------------------------------------
    # Informations du fichier
    # --------------------------------------------------------

    title = ask_required_text(
        "[bold cyan]Titre du fichier[/bold cyan]"
    )

    if title is None:
        console.print(
            "[yellow]Upload annulé.[/yellow]"
        )
        return

    author = ask_required_text(
        "[bold cyan]Auteur[/bold cyan]"
    )

    if author is None:
        console.print(
            "[yellow]Upload annulé.[/yellow]"
        )
        return

    desc = ask_required_text(
        "[bold cyan]Description[/bold cyan]"
    )

    if desc is None:
        console.print(
            "[yellow]Upload annulé.[/yellow]"
        )
        return

    # --------------------------------------------------------
    # URL Flask
    # --------------------------------------------------------

    url = (
        f"{base_url}/upload/"
        f"{matiere}/{classe}/{specialite}"
    )

    console.print()
    console.print(
        "[cyan]Envoi du fichier en cours...[/cyan]"
    )

    try:
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
                data=data,
                timeout=60
            )

        # ----------------------------------------------------
        # Succès
        # ----------------------------------------------------

        if response.status_code == 201:

            try:
                result = response.json()
            except ValueError:
                result = {}

            metadata = Table(
                title="Métadonnées du fichier",
                border_style="green"
            )

            metadata.add_column(
                "Champ",
                style="orange1"
            )

            metadata.add_column(
                "Valeur",
                style="orange1"
            )

            metadata.add_row(
                "Titre",
                str(result.get("title", title))
            )

            metadata.add_row(
                "Auteur",
                str(result.get("author", author))
            )

            metadata.add_row(
                "Description",
                str(result.get("desc", desc))
            )

            console.print()

            console.print(
                Panel.fit(
                    "[bold green]"
                    "✓ Fichier envoyé avec succès !"
                    "[/bold green]",
                    border_style="green"
                )
            )

            console.print(metadata)

        # ----------------------------------------------------
        # Erreur serveur
        # ----------------------------------------------------

        else:

            try:
                error = response.json().get(
                    "error",
                    response.text
                )
            except Exception:
                error = response.text

            console.print(
                f"[red]Échec de l'upload : {error}[/red]"
            )

    except requests.exceptions.RequestException as e:

        console.print(
            "[red]"
            f"Impossible de contacter le serveur : {e}"
            "[/red]"
        )

    except OSError as e:

        console.print(
            f"[red]Impossible de lire le fichier : {e}[/red]"
        )


# ============================================================
# MAIN
# ============================================================

def main():

    base_url = "http://141.11.237.34:8000"

    console.print(
        Panel.fit(
            "[bold bright_cyan]"
            "Sharing Revisions & Notes"
            "[/bold bright_cyan]\n"
            "[dim]Gestion des fichiers de cours[/dim]",
            border_style="bright_cyan"
        )
    )

    # --------------------------------------------------------
    # MENU PRINCIPAL
    # --------------------------------------------------------

    action = choose_from_list(
        [
            "Parcourir et transférer un fichier",
            "Aide API"
        ],
        "Menu principal",
        orange_items={
            "Parcourir et transférer un fichier",
            "Aide API"
        }
    )

    if action is None:
        console.print(
            "[yellow]Opération annulée.[/yellow]"
        )
        return

    if action == "Aide API":
        show_api_info(base_url)
        return

    # --------------------------------------------------------
    # MATIÈRES
    # --------------------------------------------------------

    matiere_response = fetch_data(
        f"{base_url}/info/matiere"
    )

    if not matiere_response:
        return

    try:
        matieres = matiere_response.json().get(
            "matiere",
            []
        )
    except ValueError:
        console.print(
            "[red]Réponse JSON invalide.[/red]"
        )
        return

    chosen_matiere = choose_from_list(
        matieres,
        "Matières disponibles",
        item_style="orange1"
    )

    if chosen_matiere is None:
        return

    # --------------------------------------------------------
    # CLASSES
    # --------------------------------------------------------

    classe_response = fetch_data(
        f"{base_url}/info/classe/{chosen_matiere}"
    )

    if not classe_response:
        return

    try:
        classes = classe_response.json().get(
            "classe",
            []
        )
    except ValueError:
        console.print(
            "[red]Réponse JSON invalide.[/red]"
        )
        return

    chosen_classe = choose_from_list(
        classes,
        f"Classes de {chosen_matiere}",
        item_style="orange1"
    )

    if chosen_classe is None:
        return

    # --------------------------------------------------------
    # SPÉCIALITÉS
    # --------------------------------------------------------

    specialite_response = fetch_data(
        f"{base_url}/info/specialite/"
        f"{chosen_matiere}/{chosen_classe}"
    )

    if not specialite_response:
        return

    try:
        specialities = specialite_response.json().get(
            "specialite",
            []
        )
    except ValueError:
        console.print(
            "[red]Réponse JSON invalide.[/red]"
        )
        return

    chosen_specialite = choose_from_list(
        specialities,
        f"Spécialités de {chosen_classe}",
        item_style="orange1"
    )

    if chosen_specialite is None:
        return

    # --------------------------------------------------------
    # OPÉRATION
    # --------------------------------------------------------

    operation = choose_from_list(
        [
            "Envoyer un fichier",
            "Télécharger un fichier"
        ],
        "Action",
        orange_items={
            "Envoyer un fichier",
            "Télécharger un fichier"
        }
    )

    if operation is None:
        return

    # --------------------------------------------------------
    # UPLOAD
    # --------------------------------------------------------

    if operation == "Envoyer un fichier":

        upload_file(
            chosen_matiere,
            chosen_classe,
            chosen_specialite,
            base_url
        )

        return

    # --------------------------------------------------------
    # DOWNLOAD : RÉCUPÉRATION DES FICHIERS
    # --------------------------------------------------------

    files_response = fetch_data(
        f"{base_url}/info/files/"
        f"{chosen_matiere}/"
        f"{chosen_classe}/"
        f"{chosen_specialite}"
    )

    if not files_response:
        return

    try:
        files = files_response.json().get(
            "files",
            []
        )
    except ValueError:
        console.print(
            "[red]Réponse JSON invalide.[/red]"
        )
        return

    if not files:
        console.print(
            "[yellow]Aucun fichier disponible.[/yellow]"
        )
        return

    # --------------------------------------------------------
    # CONSTRUCTION DES LABELS
    # --------------------------------------------------------

    file_labels = []

    for file_name in files:

        metadata_path = os.path.join(
            "matiere",
            chosen_matiere,
            chosen_classe,
            chosen_specialite,
            file_name
        )

        try:
            metadata = load_json_file(
                metadata_path
            )

            label = (
                f"{metadata.get('title', file_name)} "
                f"(Auteur : "
                f"{metadata.get('author', 'inconnu')}) "
                f"[{file_name}]"
            )

        except (
            OSError,
            json.JSONDecodeError,
            AttributeError
        ):
            label = str(file_name)

        file_labels.append(label)

    # --------------------------------------------------------
    # CHOIX DU FICHIER
    # --------------------------------------------------------

    selected_label = choose_from_list(
        file_labels,
        "Fichiers disponibles",
        item_style="orange1"
    )

    if selected_label is None:
        return

    selected_index = file_labels.index(
        selected_label
    )

    chosen_file = files[selected_index]

    # --------------------------------------------------------
    # FILE ID
    # --------------------------------------------------------

    if str(chosen_file).endswith(".json"):
        file_id = chosen_file[:-5]
    else:
        file_id = str(chosen_file)

    # --------------------------------------------------------
    # DOWNLOAD
    # --------------------------------------------------------

    success, result = download_file(
        chosen_matiere,
        chosen_classe,
        chosen_specialite,
        file_id,
        base_url
    )

    if success:

        console.print(
            Panel.fit(
                "[bold green]"
                "✓ Téléchargement réussi"
                "[/bold green]\n"
                f"{result}",
                border_style="green"
            )
        )

    else:

        console.print(
            f"[red]"
            f"Échec du téléchargement : {result}"
            f"[/red]"
        )


# ============================================================
# LANCEMENT
# ============================================================

if __name__ == "__main__":
    main()
