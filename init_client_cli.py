from rich.console import Console
from rich.panel import Panel
from rich.table import Table

import requests

console = Console()

def change_ip(files, old_ip, new_ip):
    for file in files:
        with open(file, "r") as f1:
            content = f1.read()
        content_update = content.replace(old_ip, new_ip)
        with open(file, "w") as f2:
            f2.write(content_update)

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



def main():
    new_ip = input("Enter the ip of the distant server (default: 127.0.0.1) : ") or "127.0.0.1"
    old_ip = "127.0.0.1"

    files = ["cli_site_example_rich_ai.py", "cli_site_example.py"]

    change_ip(files, old_ip, new_ip)

    print("======== Test the server connection ========")
    adresse_text = "http://" + new_ip + ":8000"
    show_api_info(adresse_text)



if __name__=="__main__":
    main()