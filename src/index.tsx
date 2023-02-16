import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import "./index.scss";
import $ from "jquery";
import "bootstrap";
import * as Sentry from '@sentry/browser';
import {notify} from "./common/notify/NotifyService";
import {messaging} from "./init-fcm";
import {service as HomeService} from "./modules/home";
import * as firebase from "firebase";
import {NotificationProvider} from "./modules/notifications/components/NotificationComponent";

const COOKIE_NAME: string = (window as any).COOKIE_NAME || '';

/*-------------------ADD THEMES JS-------------------*/
/*Required JQuery*/
(window as any).jQuery = $;

if (messaging) {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            localStorage.setItem('notification-permission', '1');
            const token = localStorage.getItem(COOKIE_NAME);
            const fcm_tokem = localStorage.getItem('fcm-token');
            if (token && fcm_tokem) HomeService.sendFcmTokenToServer(fcm_tokem);
            const _messaging = messaging as firebase.messaging.Messaging;
            _messaging.onTokenRefresh(() => {
                _messaging.getToken().then(newtoken => {
                    localStorage.setItem('fcm-token', newtoken);
                    if (newtoken && localStorage.getItem(COOKIE_NAME)) HomeService.sendFcmTokenToServer(newtoken);
                });
            });
            // Handler on new message
            _messaging.onMessage(mess => {
                notify.show(mess.data.content, 'success');
                NotificationProvider.totalNew += 1;
            });
        } else {
            localStorage.setItem('notification-permission', '0');
            // notify.show('Vui lòng bật thông báo trên trình duyệt để nhận được thông báo từ Chozoi', "warning");
        }
    });
}
/*-------------- END ---------------*/

/*Theme*/
const theme = document.createElement('script');
theme.type = 'text/javascript';
theme.src = "/theme/js/theme.min.js";
document.getElementsByTagName("body")[0].appendChild(theme);
//-------------------END-------------------

// @ts-ignore
Sentry.init({dsn: window.SENTRY_DSN, environment: window.SENTRY_ENVIRONMENT});

ReactDOM.render(<App/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
