// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('https://www.gstatic.com/firebasejs/7.2.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.2.2/firebase-messaging.js');
// importScripts('/__/firebase/init.js');

var firebaseConfig = {
    apiKey: "AIzaSyDJtgU2Tfa-ZzAkE3JWduttn7Nynpz37Fs",
    authDomain: "chozoi-c5a8b.firebaseapp.com",
    databaseURL: "https://chozoi-c5a8b.firebaseio.com",
    projectId: "chozoi-c5a8b",
    storageBucket: "chozoi-c5a8b.appspot.com",
    messagingSenderId: "787759702658",
    appId: "1:787759702658:web:f74d2d1c281cc36a92ca9b",
    measurementId: "G-BPJFJ31NG8"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var messaging = firebase.messaging();

/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.

 // [START initialize_firebase_in_sw]
 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here, other Firebase libraries
 // are not available in the service worker.
 importScripts('https://www.gstatic.com/firebasejs/6.3.4/firebase-app.js');
 importScripts('https://www.gstatic.com/firebasejs/6.3.4/firebase-messaging.js');

 // Initialize the Firebase app in the service worker by passing in the
 // messagingSenderId.
 firebase.initializeApp({
   'messagingSenderId': 'YOUR-SENDER-ID'
 });

 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();
 // [END initialize_firebase_in_sw]
 **/


// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]

messaging.setBackgroundMessageHandler(function (payload) {
    // console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here

    var notificationTitle = 'Bạn có 1 thông báo mới từ Chozoi.vn';
    var notificationOptions = {
        body: payload.data.content
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});
// [END background_handler]

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    var clickResponsePromise = Promise.resolve();
    clickResponsePromise = clients.openWindow('home/notifications/type=all&page=0&size=10');

    event.waitUntil(Promise.all([clickResponsePromise, self.analytics.trackEvent('notification-click')]));
});

