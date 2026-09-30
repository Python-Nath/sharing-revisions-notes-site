sudo cp site.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start site
sudo systemctl enable --now site
sudo systemctl status site
