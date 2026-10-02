#!/bin/sh

echo "Que veux-tu faire ?"
echo "1) Créer/démarrer le service systemd et nginx"
echo "2) Lancer directement Python"

printf "Choix [1/2] : "
read choix

case "$choix" in
    1)
        echo "Création du service systemd et nginx..."

        printf "Quelle IP veux-tu utiliser pour Nginx [127.0.0.1] : "
        read ip

        # Si aucune IP n'est renseignée, utiliser 127.0.0.1
        if [ -z "$ip" ]; then
            ip="127.0.0.1"
        fi

        echo "IP sélectionnée : $ip"

        # Copie et modification de la configuration Nginx
        sed "s/127\.0\.0\.1/$ip/g" sharing-revisions-notes-site \
            | sudo tee /etc/nginx/sites-available/sharing-revisions-notes-site > /dev/null

        # Installation et configuration du service systemd
        sudo cp sharing-revisions-notes-site.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable --now site

        # Installation de nginx
        sudo apt install -y nginx

        # Activation du site
        sudo ln -sf \
            /etc/nginx/sites-available/sharing-revisions-notes-site \
            /etc/nginx/sites-enabled/sharing-revisions-notes-site

        # Vérification de la configuration
        sudo nginx -t

        if [ $? -eq 0 ]; then
            sudo systemctl reload nginx
            echo ""
            echo "Nginx a été configuré avec l'IP : $ip"
        else
            echo ""
            echo "Erreur dans la configuration Nginx."
            exit 1
        fi

        echo ""
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
esac#!/bin/sh

echo "Que veux-tu faire ?"
echo "1) Créer/démarrer le service systemd et nginx"
echo "2) Lancer directement Python"

printf "Choix [1/2] : "
read choix

case "$choix" in
    1)
        echo "Création du service systemd et nginx..."

        sudo cp sharing-revisions-notes-site.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable --now site
	sudo apt install nginx
	sudo cp sharing-revisions-notes-site /etc/nginx/sites-available/
	sudo ln -s /etc/nginx/sites-available/sharing-revisions-notes-site /etc/nginx/sites-enabled/sharing-revisions-notes-site
	sudo nginx -t
	sudo systemctl reload nginx


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
