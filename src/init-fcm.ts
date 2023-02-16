import * as firebase from "firebase/app";
import "firebase/messaging";

const FIREBASE_CONFIG: object = (window as any).FIREBASE_CONFIG || {};
const FIREBASE_KEY_PUBLIC: string = (window as any).FIREBASE_KEY_PUBLIC || '';

export var messaging: firebase.messaging.Messaging | null = null;
if (firebase.messaging.isSupported()) {
    const initializeFireBaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    messaging = initializeFireBaseApp.messaging();
    messaging.usePublicVapidKey(FIREBASE_KEY_PUBLIC);
}
