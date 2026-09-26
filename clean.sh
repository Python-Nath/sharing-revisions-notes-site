#!/bin/sh

FILES=$(find ./matiere ./uploads -type f ! -name '.gitkeep')

if [ -z "$FILES" ]; then
    echo "Aucun fichier à supprimer."
    exit 0
fi

echo "Fichiers qui seront supprimés :"
echo "$FILES"
echo

printf "Supprimer ces fichiers ? [yes/no] "
read -r ANSWER

case "$ANSWER" in
    yes|y|Y)
        find ./matiere ./uploads -type f ! -name '.gitkeep' -delete
        echo "Fichiers supprimés."
        ;;
    no|n|N)
        echo "Suppression annulée."
        ;;
    *)
        echo "Réponse invalide. Suppression annulée."
        exit 1
        ;;
esac
