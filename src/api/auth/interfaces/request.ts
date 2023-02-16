export interface IReqLogin {
    username: string
    password: string
    remember: boolean
}

export interface IReqRegister {
    username: string
    password: string
    confirm_password: string
    recaptchaResponse: string
    name: string
    refCode?: string
    type: "Buyer" | "Seller"
    regType: "Link" | "Normal"
}

export interface IReqChangePass {
    username: string
    password: string
    confirmPassword: string
    otp: string
}
