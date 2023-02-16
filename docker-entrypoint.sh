#!/bin/sh -eu
./generate_config_js.sh >/usr/share/nginx/html/assets/js/config.js
nginx -g "daemon off;"