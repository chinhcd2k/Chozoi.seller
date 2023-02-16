import React from "react";
import {Button, Checkbox, Modal} from "antd";
import {observer} from "mobx-react";
import {observable} from "mobx";
import FormAddress from "./FormAddress";
import {handlerRequestError} from "../../../../common/services/BaseService";
import {store as ProfileStore} from "../../../profile";
import {notify} from "../../../../common/notify/NotifyService";
import {IResProfile} from "../../../../api/auth/interfaces/response";
import {IReqContact} from "../../../../api/contact/interfaces/request";
import {sendCreateContact} from "../../../../api/contact";

@observer
export default class PopupNewAddress extends React.Component<{ onFinish: () => any }, any> {
    private static instance?: PopupNewAddress;
    private FormWareHouseRef = React.createRef<FormAddress>();
    private FormRefurnRef = React.createRef<FormAddress>();

    @observable visiable: boolean = false;
    @observable key: number = Date.now();
    @observable contact: { warehouse?: IReqContact, refurn?: IReqContact } = {};
    @observable refurnEqualWarehouse: boolean = true;
    @observable disabled: boolean = false;

    constructor(props: any) {
        super(props);
        PopupNewAddress.instance = this;
    }

    async handlerOnSubmit(target: "warehouse" | "refurn", data: IReqContact) {
        this.contact[target] = data;
        if (this.refurnEqualWarehouse) {
            this.contact["refurn"] = data;
        }
        const {warehouse, refurn} = this.contact;
        if (warehouse && refurn && !this.disabled) {
            this.disabled = true;
            try {
                const params = {
                    warehouse: {
                        detail_address: warehouse.address || "",
                        phone_number: warehouse.numberPhone,
                        province_id: warehouse.province,
                        district_id: warehouse.district,
                        ward_id: warehouse.ward,
                        name: warehouse.name
                    },
                    refund: {
                        detail_address: refurn.address || "",
                        phone_number: refurn.numberPhone,
                        province_id: refurn.province,
                        district_id: refurn.district,
                        ward_id: refurn.ward,
                        name: refurn.name
                    }
                };
                const {shopId} = ProfileStore.profile as IResProfile;
                const res = await sendCreateContact(shopId as number, params);
                if (res.status === 200) {
                    notify.show("Thêm địa chỉ thành công", "success");
                    this.visiable = false;
                    this.props.onFinish();
                } else handlerRequestError(res);
            } catch (e) {
                console.error(e);
            } finally {
                this.disabled = false;
            }
        }
    }

    triggerSubmit() {
        if (this.refurnEqualWarehouse) {
            if (this.FormWareHouseRef.current && this.FormWareHouseRef.current.FormInstance)
                this.FormWareHouseRef.current.FormInstance.submit();
        } else {
            if (this.FormWareHouseRef.current && this.FormWareHouseRef.current.FormInstance)
                this.FormWareHouseRef.current.FormInstance.submit();
            if (this.FormRefurnRef.current && this.FormRefurnRef.current.FormInstance)
                this.FormRefurnRef.current.FormInstance.submit();
        }
    }

    render() {
        return <Modal
            title={<p style={{marginBottom: 0, fontSize: "17px", fontFamily: "OpenSans-Semibold"}}>Thêm địa chỉ</p>}
            key={this.key}
            width={"640px"}
            onCancel={() => this.visiable = false}
            footer={null}
            visible={this.visiable}>
            <div>
                <h3>Địa chỉ lấy hàng</h3>
                <FormAddress
                    ref={this.FormWareHouseRef}
                    type={"warehouse"}
                    onSubmit={((target, data) => this.handlerOnSubmit(target, data))}/>
            </div>
            {!this.refurnEqualWarehouse && <div>
                <h3>Địa chỉ trả hàng</h3>
                <FormAddress
                    ref={this.FormRefurnRef}
                    type={"refurn"}
                    onSubmit={((target, data) => this.handlerOnSubmit(target, data))}/>
            </div>}
            <Checkbox
                defaultChecked={this.refurnEqualWarehouse}
                onChange={e => this.refurnEqualWarehouse = e.target.checked}>Địa chỉ trả hàng giống với địa chỉ
                lấy hàng</Checkbox>
            <div>
                <div className="text-center mt-5">
                    <Button type={"default"} onClick={() => this.visiable = false}>Hủy bỏ</Button>
                    <Button style={{marginLeft: "16px"}}
                            disabled={this.disabled}
                            onClick={() => this.triggerSubmit()}
                            type={"primary"}>Xác nhận</Button>
                </div>
            </div>
        </Modal>;
    }

    public static show() {
        if (PopupNewAddress.instance) {
            PopupNewAddress.instance.key = Date.now();
            PopupNewAddress.instance.visiable = true;
            PopupNewAddress.instance.refurnEqualWarehouse = true;
            PopupNewAddress.instance.disabled = false;
        }
    }
}
