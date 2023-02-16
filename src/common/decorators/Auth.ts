import {store, service} from "../../modules/profile";

let waiting: boolean = false;

function waitingFunc(): Promise<any> {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (!waiting) {
                clearInterval(interval);
                resolve();
            }
        });
    });
}

export function DGetProfile(target: any, key: string, descriptor: any) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        if (waiting) {
            await waitingFunc();
        } else {
            const TOKEN = localStorage.getItem((window as any).COOKIE_NAME || '');
            if (!TOKEN) window.location.href = "/login";
            else if (!store.profile) {
                waiting = true;
                try {
                    await service.getProfile();
                } catch (e) {
                } finally {
                    waiting = false;
                }
            }
        }
        return originalMethod.apply(this, args);
    };
    return descriptor;
}
