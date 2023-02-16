#!/bin/sh -eu

cat <<EOF
window.REACT_APP_PORT=${REACT_APP_PORT};
window.URL_API="${URL_API}";
window.TOKEN_EXPIRES="${TOKEN_EXPIRES}";
window.COOKIE_NAME="${COOKIE_NAME}";
window.HEADER_TOKEN_NAME="${HEADER_TOKEN_NAME}";
window.COOKIE_RECEIVER_NAME="${COOKIE_RECEIVER_NAME}";
window.GOOGLE_RECAPTCHA_CLIENT="${GOOGLE_RECAPTCHA_CLIENT}";
window.IS_SHOW_AUCTION=${IS_SHOW_AUCTION};
window.DOMAIN_BUYER="${DOMAIN_BUYER}";
window.GA="${GA}";
window.GTM="${GA}";
window.DELAY_SEND_OTP_TIME="${DELAY_SEND_OTP_TIME}";
window.PRODUCT_IMAGE_DIMENSION=${PRODUCT_IMAGE_DIMENSION};
window.LIMITED_SIZE_UPLOAD="${LIMITED_SIZE_UPLOAD}";
window.REACT_APP_ENV="${REACT_APP_ENV}";
window.SENTRY_DSN="${SENTRY_DSN}";
window.SENTRY_ENVIRONMENT="${SENTRY_ENVIRONMENT}";
window.HOST_DOMAIN_SHARE_TOKEN="${HOST_DOMAIN_SHARE_TOKEN}";
window.FIREBASE_CONFIG=${FIREBASE_CONFIG};
window.FIREBASE_KEY_PUBLIC="${FIREBASE_KEY_PUBLIC}";
window.YANDEX_ID="${YANDEX_ID}";
window.FACEBOOK_APP_ID="${FACEBOOK_APP_ID}";
window.GOOGLE_APP_ID="${GOOGLE_APP_ID}";
EOF