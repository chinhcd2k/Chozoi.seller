import React from "react";
import {observer} from "mobx-react";
import {Form, Input, Select, Typography} from "antd";
import {observable} from "mobx";
import {FormInstance} from "antd/lib/form/hooks/useForm";
import {getListDistrict, getListProvince, getListWard} from "../../../../api/contact";
import {IReqContact} from "../../../../api/contact/interfaces/request";


interface IProps {
    type: "warehouse" | "refurn"
    onSubmit: (target: "warehouse" | "refurn", data: IReqContact) => any
}

@observer
export default class FormAddress extends React.Component<IProps, any> {
    public FormInstance: FormInstance<any> | null = null;
    @observable provinces: { id: number, provinceName: string }[] = [];
    @observable districts: { id: number, districtName: string }[] = [];
    @observable wards: { id: number, wardName: string }[] = [];
    @observable contact: { province?: number, district?: number, ward?: number } = {};

    async handlerOnChangeSelect(target: "province" | "district" | "ward", value: number) {
        this.contact[target] = value;
        switch (target) {
            case "province":
                const resProvince = await getListDistrict(value);
                if (resProvince.status === 200) {
                    this.districts = resProvince.body.districts;
                    this.contact.district = undefined;
                    this.contact.ward = undefined;
                    this.wards = [];
                    if (this.FormInstance) {
                        this.FormInstance.resetFields(["district", "ward"]);
                    }
                }
                break;
            case "district":
                const resDistrict = await getListWard(value);
                if (resDistrict.status === 200) {
                    this.wards = resDistrict.body.wards;
                    this.contact.ward = undefined;
                }
                break;
        }
    }

    render() {
        const {province, district, ward} = this.contact;

        return <Form
            ref={(instance => this.FormInstance = instance)}
            onFinish={(data: IReqContact) => this.props.onSubmit(this.props.type, data)}>
            <div className="row">
                <div className="col-xs-6">
                    <Typography.Text>Họ tên liên hệ <RequireField/></Typography.Text>
                    <Form.Item name={"name"}
                               rules={[{required: true, message: "Không được bỏ trống"}]}>
                        <Input autoFocus={true}/>
                    </Form.Item>
                </div>
                <div className="col-xs-6">
                    <Typography.Text>Số điện thoại liên hệ <RequireField/></Typography.Text>
                    <Form.Item name={"numberPhone"}
                               rules={[
                                   {required: true, message: "Không được bỏ trống"},
                                   {pattern: /^\d{10}$/, message: "Số điện thoại bao gồm 10 chữ số"}
                               ]}>
                        <Input/>
                    </Form.Item>
                </div>
            </div>
            <div className="row">
                <div className="col-xs-4">
                    <Typography.Text>Tỉnh/Thành phố <RequireField/></Typography.Text>
                    <Form.Item name={"province"}
                               initialValue={province || ""}
                               rules={[{required: true, message: "Không được bỏ trống"}]}>
                        <Select
                            onChange={value => this.handlerOnChangeSelect("province", value as number)}>
                            <Select.Option value={""} disabled>Lựa chọn</Select.Option>
                            {this.provinces.map((value, index) =>
                                <Select.Option key={index} value={value.id}>{value.provinceName}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </div>
                <div className="col-xs-4">
                    <Typography.Text>Quận/Huyện <RequireField/></Typography.Text>
                    <Form.Item name={"district"}
                               initialValue={district || ""}
                               rules={[{required: true, message: "Không được bỏ trống"}]}>
                        <Select
                            onChange={value => this.handlerOnChangeSelect("district", value as number)}
                            disabled={this.districts.length === 0}>
                            <Select.Option value={""} disabled>Lựa chọn</Select.Option>
                            {this.districts.map((value, index) =>
                                <Select.Option key={index} value={value.id}>{value.districtName}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </div>
                <div className="col-xs-4">
                    <Typography.Text>Phường/Xã <RequireField/></Typography.Text>
                    <Form.Item name={"ward"}
                               initialValue={ward || ""}
                               rules={[{required: true, message: "Không được bỏ trống"}]}>
                        <Select
                            onChange={value => this.handlerOnChangeSelect("ward", value as number)}
                            disabled={this.wards.length === 0}>
                            <Select.Option value={""} disabled>Lựa chọn</Select.Option>
                            {this.wards.map((value, index) =>
                                <Select.Option key={index} value={value.id}>{value.wardName}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12">
                    <Typography.Text>Địa chỉ chi tiết <RequireField/></Typography.Text>
                    <Form.Item name={"address"}
                               rules={[{required: true, message: "Không được bỏ trống"}]}
                    >
                        <Input/>
                    </Form.Item>
                </div>
            </div>
        </Form>;
    }

    async componentDidMount() {
        const res = await getListProvince();
        if (res.status === 200) {
            this.provinces = res.body.provinces;
        }
    }
}

const RequireField: React.FC = () => <span style={{color: "red"}}>*</span>
