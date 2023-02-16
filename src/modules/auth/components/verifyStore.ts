import {service} from "../AuthService";
import {notify} from "../../../common/notify/NotifyService";


class VerifyStore {

    async reSendOtp (userName: any){
        const response = await service.reSendOtpVerifyAccount(userName);
        if (response.status === 200) {
            notify.show(`Mã xác nhận mới đã được gửi tới ${userName.replace(/.{4}$/, "****")}`, "success");
        } else if (response.body.message) {
            notify.show(JSON.stringify(response.body.message), "error");
        } else {
            notify.show('Lỗi không xác định', "error");
        }
    }
}

export const verifyStore = new VerifyStore();