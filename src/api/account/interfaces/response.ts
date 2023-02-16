import {IResContact, IResProfile} from "../../auth/interfaces/response";

export interface IResAccount {
    profile: IResProfile,
    contacts: IResContact[]
}
