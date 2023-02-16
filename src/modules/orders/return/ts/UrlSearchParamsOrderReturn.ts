export class UrlSearchParamsOrderReturn extends URLSearchParams {
    constructor(search: string) {
        super(search);
        Object.setPrototypeOf(this, UrlSearchParamsOrderReturn.prototype);
    }
    get getState(): 'request' | 'processing' | 'finished' {
        const state: string = this.get('state') || '';
        if (state === 'request' || state === 'processing' || state === 'finished')
            return state;
        else
            return 'request';
    }

    get getKeyword(): string {
        return this.get('keyword') || '';
    }

    get getFrom(): string {
        const value: string = this.get('from') || '';
        const re = RegExp(/^\d{4}-\d{2}-\d{2}$/g);
        if (re.test(value)) return value;
        return '';
    }

    get getTo(): string {
        const value: string = this.get('to') || '';
        const re = RegExp(/^\d{4}-\d{2}-\d{2}$/g);
        if (re.test(value)) return value;
        return '';
    }

    get getPage(): number {
        const value: number = parseInt(this.get('page') || '0');
        return isNaN(value) ? 0 : value;
    }

    get getSize(): number {
        const value: number = parseInt(this.get('page') || '10');
        return isNaN(value) ? 10 : value;
    }
}