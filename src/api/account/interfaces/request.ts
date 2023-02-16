export interface IReqUpdateProfile {
    birthDay: string,
    gender: "FEMALE" | "MALE",
    avatarUrl: string,
    name: string,
    enablePassport: boolean
}

export interface IReqChangePass {
    old_password: string,
    new_password: string,
    confirm_password: string,
    code: string
}
