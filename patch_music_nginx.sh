#!/bin/bash
# Patch nginx for music.hidar.eu.cc
# Run this on your server as root or with sudo

set -e

DOMAIN="music.hidar.eu.cc"
BACKEND_PORT=3002
NGINX_CONF="/etc/nginx/sites-enabled/music.conf"

echo "Creating nginx config for $DOMAIN ..."

sudo tee "$NGINX_CONF" > /dev/null << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # If you want to serve built frontend from nginx instead of backend:
    # root /path/to/MusicApp/client/dist;
    # index index.html;

    location / {
        # Proxy everything to the Node backend (which can serve static + API + SPA fallback)
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Increase timeouts for Cloudflare
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Optional: specific for uploads if large files
    location /uploads/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        client_max_body_size 50M;
    }

    # SSL (managed by Certbot or Cloudflare)
    # If using Cloudflare, you can keep flexible or full, and use certbot for origin if needed
}

# If you have SSL certs from Certbot, uncomment and adjust:
# server {
#     listen 443 ssl;
#     listen [::]:443 ssl;
#     server_name $DOMAIN;
#
#     # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
#     # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
#     # include /etc/letsencrypt/options-ssl-nginx.conf;
#     # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
#
#     location / {
#         proxy_pass http://127.0.0.1:$BACKEND_PORT;
#         # ... same proxy headers
#     }
# }
EOF

echo "Testing nginx config..."
sudo nginx -t

echo "Reloading nginx..."
sudo systemctl reload nginx || sudo service nginx reload

echo "✅ Nginx patched for $DOMAIN"
echo "Make sure your backend is running on port $BACKEND_PORT"
echo "Test: curl -I http://127.0.0.1:$BACKEND_PORT/api/health"
echo ""
echo "If using Cloudflare, make sure the DNS is proxied (orange cloud) and SSL mode is Flexible or Full."
