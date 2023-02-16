export const numberWithCommas = (x: any, curency?: string) => {
    x = x.toString().replace(/[.]/g, "");
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x)) {
        x = x.replace(pattern, "$1.$2");
    }
    return `${x}${curency ? ' ' + curency : ''}`;
};

export function convert_datetime(timestamp: number) {
    const months_arr = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const date = new Date(timestamp * 1000);
    const year = parseInt(date.getFullYear().toString());
    const month = parseInt(months_arr[date.getMonth()].toString());
    const day = parseInt(date.getDate().toString());
    const hours = parseInt(date.getHours().toString());
    const minutes = parseInt(date.getMinutes().toString());
    const seconds = parseInt(date.getSeconds().toString());
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}T${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

export function timeRemaining(timeEnd: any): { days: string, hours: string, minutes: string, seconds: string } {
    const now = new Date().getTime();
    let time_end = new Date(timeEnd).getTime() + 7 * 60 * 60 * 1000;
    const distance = time_end - now;
    let days: string | number = Math.floor(distance / (1000 * 60 * 60 * 24));
    days = days && days > 0 && days < 10 ? "0" + days : days;
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return {
        days: days.toString(),
        hours: hours.toString(),
        minutes: minutes.toString(),
        seconds: seconds.toString()
    }
}

export function convertDateToString(timeStr: any, time: boolean, vn: boolean = false) {
    var date = new Date(timeStr),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    if (vn) {
        date.setHours(date.getHours() + 7);
    }
    if (time) {
        var hour = ("0" + (date.getHours())).slice(-2),
            minute = ("0" + (date.getMinutes())).slice(-2),
            second = ("0" + (date.getSeconds())).slice(-2);
        return [day, mnth, date.getFullYear()].join("/") + ' ' + [hour, minute, second].join(":");
    }
    return [day, mnth, date.getFullYear()].join("/");
}

export function alphabet(str: string): string {
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
    str = str.replace(/(đ)/g, 'd');
    return str;
}

export function slug(str: string) {
    // Chuyển hết sang chữ thường
    str = str.toLowerCase();

    // xóa dấu
    str = alphabet(str);

    // Xóa ký tự đặc biệt
    str = str.replace(/([^0-9a-z-\s])/g, '');

    // Xóa khoảng trắng thay bằng ký tự -
    str = str.replace(/(\s+)/g, '-');

    // xóa phần dự - ở đầu
    str = str.replace(/^-+/g, '');

    // xóa phần dư - ở cuối
    str = str.replace(/-+$/g, '');
    str = str.trim();
    // return
    return str;
}

export function partiallyHidden(value: string, type?: 'email' | 'numberphone'): string {
    let _type = type;
    if (!_type) {
        if (/^\d{10}$/.test(value)) _type = "numberphone";
        else if (/(^\d{10}$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/.test(value))
            _type = "email";
    }
    if (_type === "email") {
        return value.replace(/.{6}@/, "*****@");
    } else if (_type === "numberphone") {
        return value.replace(value.substring(2, value.length - 2), Array.from(new Array(value.length - 4), item => item = "*").join(""));
    } else return value;
}
