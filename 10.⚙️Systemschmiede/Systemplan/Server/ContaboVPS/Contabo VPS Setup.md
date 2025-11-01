# SSH verbindung
sudo ssh root@</ip>
sudo ssh root@37.60.252.48

Linux Password eingeben
SSH Password aus Bitwarden eingeben

# Grundsetup
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw htop unzip

## Firewall aktivieren:
sudo ufw allow OpenSSH 
sudo ufw enable 
sudo ufw status

# VNC
## Installation
sudo apt install -y xfce4 xfce4-goodies tightvncserver
vncserver

Wenn du zusätzlich eine **Desktop-Oberfläche** auf dem Server willst:

`sudo apt install -y xfce4 xfce4-goodies tightvncserver vncserver`

Passwort setzen.  
Dann stoppen:

`vncserver -kill :1`

Startup-Datei bearbeiten:

`nano ~/.vnc/xstartup`

Inhalt ersetzen durch:

`#!/bin/bash xrdb $HOME/.Xresources startxfce4 &`

Dann:

`chmod +x ~/.vnc/xstartup vncserver :1`


37.60.252.48:5901

# Docker
## Installation
curl -fsSL https://get.docker.com | sudo bash 
sudo usermod -aG docker $USER

## Docker prüfen
### Version
docker --version
docker compose version

### Installations Test
Abmelden und wieder einloggen, dann:
docker run hello-world

## Portainer
### Installation
docker volume create portainer_data

docker run -d \
  -p 8000:8000 -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

### User erstellen
nach erster Installation und Zugriff auf Portainer kommt ein registrations Fenster

### Umgebung verbinden
Local environment (Manage the local Docker environment)
auswählen und auf connect drücken

### Zugriff
https://</deine-server-ip>:9443
https://37.60.252.48:9443

### Restart
docker restart portainer

# n8n
mkdir -p ~/n8n_data

Erstelle jetzt die Datei, die beschreibt, wie Docker n8n starten soll:
mkdir -p ~/n8n
nano ~/n8n/docker-compose.yml

Dann füge das ein:
version: "3.7"

services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - GENERIC_TIMEZONE=Europe/Berlin
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=
    volumes:
      - ~/n8n_data:/home/node/.n8n




Du musst nur dem Container erlauben, in den Ordner `~/n8n_data` zu schreiben, den du als Volume gemountet hast.

Führe diese Befehle auf deinem Server aus:

`sudo chown -R 1000:1000 ~/n8n_data`

➡ Das gibt dem internen n8n-Benutzer (UID 1000) Besitzrechte an dem Volume.  
(`node` im Container läuft nämlich **nicht als root**, sondern als User mit ID 1000.)

Jetzt wechsel in den Ordner und starte n8n:
cd ~/n8n
docker compose up -d



Zuerst Traefik:

`cd ~/traefik docker compose up -d`

Dann n8n:

`cd ~/n8n docker compose up -d`

---

### e) Zugriff testen

Im Browser:

`https://n8n.deinedomain.de`

✅ Du solltest jetzt **ein sicheres HTTPS** haben + Setup-Screen für n8n.

# Obsidian
## Lebensplan
# Traefik
## 2️⃣ Schritt-für-Schritt: n8n mit Traefik + HTTPS

### a) Traefik-Ordner und Config anlegen

`mkdir -p ~/traefik cd ~/traefik nano docker-compose.yml`

Inhalt:

`version: "3.8"  services:   traefik:     image: traefik:latest     container_name: traefik     restart: always     command:       - "--api.insecure=false"       - "--providers.docker=true"       - "--providers.docker.exposedbydefault=false"       - "--entrypoints.web.address=:80"       - "--entrypoints.websecure.address=:443"       - "--certificatesresolvers.le.acme.tlschallenge=true"       - "--certificatesresolvers.le.acme.email=deine-email@domain.de"       - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"     ports:       - "80:80"       - "443:443"     volumes:       - /var/run/docker.sock:/var/run/docker.sock:ro       - ./letsencrypt:/letsencrypt`

> ⚠ Ersetze `deine-email@domain.de` durch deine echte Mail.

---

### b) n8n Docker-Compose anpassen

Dein `~/n8n/docker-compose.yml` wird um Traefik-Labels ergänzt:

``version: "3.8"  services:   n8n:     image: n8nio/n8n     restart: always     environment:       - GENERIC_TIMEZONE=Europe/Berlin       - N8N_BASIC_AUTH_ACTIVE=true       - N8N_BASIC_AUTH_USER=admin       - N8N_BASIC_AUTH_PASSWORD=DeinPasswort123     volumes:       - ~/n8n_data:/home/node/.n8n     labels:       - "traefik.enable=true"       - "traefik.http.routers.n8n.rule=Host(`n8n.deinedomain.de`)"       - "traefik.http.routers.n8n.entrypoints=websecure"       - "traefik.http.routers.n8n.tls.certresolver=le"``

> ⚠ `n8n.deinedomain.de` durch deine echte Domain ersetzen.
# Nginx