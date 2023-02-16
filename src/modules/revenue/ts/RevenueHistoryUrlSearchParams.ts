export class RevenueHistoryUrlSearchParams extends URLSearchParams {
    public getType(): 'all' | 'order' | 'cashout' | 'return' {
        const type = this.get('type');
        if (type === 'order' || type === 'cashout' || type === 'return')
            return type;
        return 'all';
    }

    public getKeyword(): string {
        return this.get('keyword') || '';
    }

    public getFrom(): string {
        const value = this.get('from') || '';
        const re = new RegExp(/^\d{4}-\d{2}-\d{2}$/g);
        if (re.test(value)) return value;
        return '';
    }

    public getTo(): string {
        const value = this.get('from') || '';
        const re = new RegExp(/^\d{4}-\d{2}-\d{2}$/g);
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