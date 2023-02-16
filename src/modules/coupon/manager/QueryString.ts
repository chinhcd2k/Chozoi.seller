export default class QueryString extends URLSearchParams {
    constructor(search: string) {
        super(search);
        Object.setPrototypeOf(this, QueryString.prototype);
    }

    get getType(): 'COMINGSOON' | 'PROCESSING' | 'PAUSING' | 'FINISHED' | undefined {
        const value = this.get('type') || '';
        if (/(COMINGSOON|PROCESSING|PAUSING|FINISHED|')/.test(value)) return value as any;
        else return undefined;
    }

    get getKeyword(): string {
        return this.get('name') || '';
    }

    get getPage(): number {
        const page = parseInt(this.get('page') || '');
        return !isNaN(page) ? page : 0;
    }
}