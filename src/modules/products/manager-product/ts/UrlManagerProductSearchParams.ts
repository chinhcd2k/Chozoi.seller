export class UrlManagerProductSearchParams extends URLSearchParams {
    get getKeyWord(): string | '' {
        return this.get('search') || '';
    }

    get getState(): 'PUBLIC' | 'DRAFT' | 'READY' | 'PENDING' | 'DELETED' | 'REJECT' | 'ALL' {
        const result = this.get('state');
        if (result === 'PUBLIC' || result === 'DRAFT' || result === 'READY' || result === 'PENDING' || result === 'DELETED' || result === 'REJECT')
            return result;
        else return 'ALL';
    }

    get getAspect(): 'selling' | 'soldOff' | '' {
        const result = this.get('aspect');
        if (result === 'selling' || result === 'soldOff')
            return result;
        else return '';
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