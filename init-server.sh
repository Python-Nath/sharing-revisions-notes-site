#!/bin/sh

echo "Que veux-tu faire ?"
echo "1) Créer/démarrer le service systemd"
echo "2) Lancer directement Python"

printf "Choix [1/2] : "
read choix

case "$choix" in
    1)
        echo "Création du service systemd..."

        sudo cp site.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable --now site

        echo "État du service :"
        sudo systemctl status site
        ;;

    2)
        echo "Lancement de l'application..."
        python app.py
        ;;

    *)
        echo "Choix invalide."
        exit 1
        ;;
esac
