#!/bin/sh

# Installe le service systemd et Nginx, ou lance simplement Python.
# Le choix 2 est celui du développement : il démarre app.py sur le port 8000,
# avec les valeurs par défaut déjà prévues dans app.py.
#
# Le choix 1 écrit les variables d'environnement du service.
# Elles ne sont pas dans le dépôt : le secret de session ne doit pas être versionné.
#
# JWT_SECRET_KEY
#     Secret qui signe les jetons de connexion (cookie de session).
#     S'il change, tout le monde est déconnecté.
#     Généré ici s'il n'existe pas encore. Il n'est pas affiché.
# JWT_COOKIE_SECURE
#     1 : le cookie n'est envoyé qu'en HTTPS. C'est le réglage dès qu'un certificat est en place.
#     0 : le cookie circule aussi en HTTP, pour un essai sur la machine, sans HTTPS.
# DATABASE_URI
#     Adresse de la base des comptes.
#     sqlite:///users.db la range dans le dossier instance de l'application.
# LOGIN_MAX_ATTEMPTS
#     Nombre d'échecs de mot de passe acceptés pour un même identifiant, sur 10 minutes.
# SITE_STATUS_PATH
#     Fichier qui mémorise la suspension du site décidée par le propriétaire.
#     Il reste sur le serveur, à côté de la base, pas dans git.

echo "Que veux-tu faire ?"
echo "1) Créer/démarrer le service systemd et nginx"
echo "2) Lancer directement Python"

printf "Choix [1/2] : "
read choix

# Refuse un texte qui casserait le fichier d'environnement ou qui y glisserait une commande.
refuser_texte() {
    nom="$1"
    valeur="$2"
    case "$valeur" in
        *[\`\$\#\"\'\\]*)
            echo "$nom : caractère refusé."
            exit 1
            ;;
        *" "*|*"	"*)
            echo "$nom : les espaces sont refusés."
            exit 1
            ;;
    esac
}

case "$choix" in
    1)
        echo "Création du service systemd et nginx..."

        printf "Quelle IP veux-tu utiliser pour Nginx [127.0.0.1] : "
        read ip

        # Sans réponse, on reste sur la machine locale.
        if [ -z "$ip" ]; then
            ip="127.0.0.1"
        fi

        echo "IP sélectionnée : $ip"

        # --- Variables d'environnement, demandées à l'installation ---

        # Cookie de session.
        # 0 = HTTP accepté (défaut, machine locale).
        # 1 = HTTPS obligatoire.
        printf "Cookie de session uniquement en HTTPS ? [0/1, défaut 0] : "
        read cookie_secure
        if [ -z "$cookie_secure" ]; then
            cookie_secure="0"
        fi
        case "$cookie_secure" in
            0|1) ;;
            *)
                echo "Réponds 0 ou 1."
                exit 1
                ;;
        esac

        # Plafond de tentatives de connexion.
        printf "Échecs de connexion tolérés sur 10 minutes [8] : "
        read tentatives
        if [ -z "$tentatives" ]; then
            tentatives="8"
        fi
        case "$tentatives" in
            ''|*[!0-9]*)
                echo "Il faut un nombre."
                exit 1
                ;;
        esac
        if [ "$tentatives" -lt 1 ] || [ "$tentatives" -gt 50 ]; then
            echo "Choisis un nombre entre 1 et 50."
            exit 1
        fi

        # Base des comptes. Le défaut suit le dossier de travail du service.
        printf "Adresse de la base [sqlite:///users.db] : "
        read database_uri
        if [ -z "$database_uri" ]; then
            database_uri="sqlite:///users.db"
        fi
        refuser_texte "DATABASE_URI" "$database_uri"

        # Fichier d'état « site suspendu ». Chemin absolu, sans remontée de dossier.
        defaut_etat="/opt/sharing-revisions-notes-site/instance/site_status.json"
        printf "Fichier d'état du site [%s] : " "$defaut_etat"
        read status_path
        if [ -z "$status_path" ]; then
            status_path="$defaut_etat"
        fi
        refuser_texte "SITE_STATUS_PATH" "$status_path"
        case "$status_path" in
            /*) ;;
            *)
                echo "Le chemin d'état doit être absolu."
                exit 1
                ;;
        esac
        case "$status_path" in
            *..*)
                echo "Le chemin d'état ne peut pas contenir .."
                exit 1
                ;;
        esac

        # Secret des jetons.
        # Vide + fichier déjà installé : on garde l'ancienne clé, sinon tout le monde est déconnecté.
        # Vide + pas de fichier : on en génère une. Elle n'est pas affichée.
        env_file="/etc/sharing-revisions-notes-site.env"
        secret_actuel=""
        # Le fichier est en 600, root : seul sudo peut relire la clé déjà installée.
        if sudo test -f "$env_file"; then
            secret_actuel=$(sudo sed -n 's/^JWT_SECRET_KEY=//p' "$env_file" | head -n 1)
        fi
        # La saisie n'est pas affichée : la clé ne doit pas rester lisible dans le terminal.
        # Le trap remet l'affichage si l'installation est interrompue pendant la saisie.
        printf "Nouvelle clé JWT (vide = garder l'existante, ou en générer une) : "
        if [ -t 0 ]; then
            stty -echo
            trap 'stty echo 2>/dev/null' INT TERM
        fi
        read -r jwt_secret
        if [ -t 0 ]; then
            stty echo
            trap - INT TERM
            printf "\n"
        fi
        if [ -n "$jwt_secret" ]; then
            refuser_texte "JWT_SECRET_KEY" "$jwt_secret"
        elif [ -n "$secret_actuel" ]; then
            jwt_secret="$secret_actuel"
        else
            if command -v python >/dev/null 2>&1; then
                py=python
            else
                py=python3
            fi
            jwt_secret=$($py -c "import secrets; print(secrets.token_urlsafe(64))")
        fi
        case "$jwt_secret" in
            *[!A-Za-z0-9_-]*)
                echo "La clé JWT ne doit contenir que des lettres, des chiffres, - et _."
                exit 1
                ;;
        esac
        if [ ${#jwt_secret} -lt 32 ]; then
            echo "La clé JWT est trop courte (32 caractères minimum)."
            exit 1
        fi

        # Le fichier est créé en 600 : systemd le lit en root, le processus n'a pas à l'ouvrir.
        umask 077
        tmp=$(mktemp)
        cat > "$tmp" << EOF
# Environnement du service sharing-revisions-notes-site.
# Produit par init-server.sh. Ne pas committer ce fichier.

# Secret de signature des jetons de session.
JWT_SECRET_KEY=${jwt_secret}

# 1 = cookie seulement en HTTPS. 0 = aussi en HTTP.
JWT_COOKIE_SECURE=${cookie_secure}

# Base des comptes.
DATABASE_URI=${database_uri}

# Échecs de mot de passe tolérés sur 10 minutes, par identifiant.
LOGIN_MAX_ATTEMPTS=${tentatives}

# Mémorise la suspension du site par le propriétaire.
SITE_STATUS_PATH=${status_path}
EOF
        sudo cp "$tmp" "$env_file"
        sudo chmod 600 "$env_file"
        rm -f "$tmp"
        unset jwt_secret secret_actuel

        # Le fichier Nginx du dépôt écoute 127.0.0.1. On remplace cette IP.
        sed "s/127\.0\.0\.1/$ip/g" sharing-revisions-notes-site \
            | sudo tee /etc/nginx/sites-available/sharing-revisions-notes-site > /dev/null

        sudo cp sharing-revisions-notes-site.service /etc/systemd/system/

        # Le drop-in attache le fichier d'environnement au service dont le nom
        # est celui du fichier .service copié juste au-dessus.
        sudo mkdir -p /etc/systemd/system/sharing-revisions-notes-site.service.d
        sudo tee /etc/systemd/system/sharing-revisions-notes-site.service.d/environnement.conf > /dev/null << 'EOF'
[Service]
EnvironmentFile=/etc/sharing-revisions-notes-site.env
EOF

        sudo systemctl daemon-reload
        # Le nom de l'unité est le nom du fichier, pas « site ».
        sudo systemctl enable --now sharing-revisions-notes-site

        sudo apt install -y nginx
        sudo ln -sf \
            /etc/nginx/sites-available/sharing-revisions-notes-site \
            /etc/nginx/sites-enabled/sharing-revisions-notes-site

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
        echo "Variables d'environnement écrites dans $env_file"
        echo "État du service :"
        sudo systemctl status sharing-revisions-notes-site
        ;;

    2)
        # Pas d'écriture d'environnement : app.py utilise ses défauts
        # (SQLite locale, cookie aussi en HTTP, 8 tentatives, état dans instance/).
        # La commande « python » n'existe pas sur toutes les machines : on prend
        # d'abord l'interpréteur du venv, qui a Flask, sinon python, sinon python3.
        echo "Lancement de l'application..."
        if [ -x ./venv/bin/python ]; then
            exec ./venv/bin/python app.py
        elif command -v python >/dev/null 2>&1; then
            exec python app.py
        else
            exec python3 app.py
        fi
        ;;

    *)
        echo "Choix invalide."
        exit 1
        ;;
esac
