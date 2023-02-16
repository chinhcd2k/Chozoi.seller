export class Moment {
    static get getGTM(): number {
        return -new Date().getTimezoneOffset() / 60;
    }

    static LocalDatetime(value: number | string | Date): number {
        if (typeof value === "string") {
            if (!/Z$/i.test(value)) value += 'Z';
            const date: Date = new Date(value);
            return date.getTime() / 1000;
        } else if (typeof value === "number") return value / 1000;
        else return new Date(-1).getTime() / 1000;
    }

    static getDate(_date: number | string, format: string, use_utc_0: boolean = true): string {
        const date = use_utc_0 ? new Date(this.LocalDatetime(_date) * 1000) : new Date(_date);
        const D = date.getDate();
        const M = date.getMonth() + 1;
        const dd = D < 10 ? '0' + D : D;
        const mm = M < 10 ? '0' + M : M;
        const yyyy = date.getFullYear();

        // replace
        let result: string = format;
        result = result.replace('D', D.toString());
        result = result.replace('M', D.toString());
        result = result.replace('dd', dd.toString());
        result = result.replace('mm', mm.toString());
        result = result.replace('yyyy', yyyy.toString());

        return result;
    }

    static getTime(_date: number | string, format: string, use_utc_0: boolean = true): string {
        const date = use_utc_0 ? new Date(this.LocalDatetime(_date) * 1000) : new Date(_date);
        /*Time*/
        const H = date.getHours();
        const M = date.getMinutes();
        const S = date.getSeconds();
        const hh = H < 10 ? '0' + H : H;
        const mm = M < 10 ? '0' + M : M;
        const ss = S < 10 ? '0' + S : S;


        // replace
        let result: string = format;
        result = result.replace('H', H.toString());
        result = result.replace('M', M.toString());
        result = result.replace('S', S.toString());
        result = result.replace('hh', hh.toString());
        result = result.replace('mm', mm.toString());
        result = result.replace('ss', ss.toString());

        return result;
    }

    static getTimeRemaining(_date: number | string, use_utc_0: boolean = true): string {
        const date = use_utc_0 ? new Date(this.LocalDatetime(_date) * 1000) : new Date(_date);
        const timeEnd = date.getTime();
        const now = new Date().getTime();
        const distance = timeEnd - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        return `${days}ngày ${hours}h ${minutes}p`;
    }

    static countJoinDate(_date: number | string, use_utc_0: boolean = true): string {
        let date: Date = null as any;
        if (!use_utc_0) {
            if (typeof _date === "string") {
                const date_tmp = new Date(_date);
                date = new Date(date_tmp.getFullYear(), date_tmp.getMonth(), date_tmp.getDate(), date_tmp.getHours(), date_tmp.getMinutes(), date_tmp.getSeconds(), date_tmp.getMilliseconds())
            } else date = new Date(_date);
        } else date = new Date(this.LocalDatetime(_date) * 1000);
        const createdAt = date.getTime();
        const now = Math.floor(Date.now());
        const distance: number = now - createdAt;
        const days: number = Math.floor(distance / (1000 * 60 * 60 * 24));
        if (days < 1) {
            return "Hôm nay"
        }
        if (days >= 1 && days < 30) {
            return days + " ngày trước"
        }
        if (days > 30 && days < 365) {
            return Math.floor(days / 30) + " tháng trước"
        }
        if (days >= 365) {
            return Math.floor(days / 365) + " năm trước"
        }
        return "";
    }

    static getTimeUTC0(timestamp: number, short?: boolean): number {
        if (typeof timestamp !== "number") {
            console.error('value invalid format number');
            return NaN;
        }
        const GMT = -new Date().getTimezoneOffset() / 60;
        if (timestamp.toString().length === 10) timestamp = Math.floor(timestamp * 1000)
        return Math.floor(timestamp - (GMT * 60 * 60 * 1000)) / (short ? 1000 : 1);
    }
}