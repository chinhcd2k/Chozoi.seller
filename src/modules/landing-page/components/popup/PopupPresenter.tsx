import React from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Modal, Form, Input, Button} from "antd";
import {handlerRequestError, putRequest} from "../../../../common/services/BaseService";
import {notify} from "../../../../common/notify/NotifyService";

@observer
export class PopupPresenter extends React.Component<{ onFinish: () => any }, any> {
    private static instance: PopupPresenter = undefined as any;

    @observable private visiable: boolean = false;
    @observable private refCode?: string;

    constructor(props: { onFinish: () => any }) {
        super(props);
        PopupPresenter.instance = this;
    }

    async handlerOnSubmit(code: string) {
        const res = await putRequest("/v1/users/_me/updateRefCode", {
            refCode: code,
            type: "Seller",
            regType: this.refCode ? "Link" : "Normal"
        });
        if (res.status === 200) {
            notify.show("Thao tác thực hiện thành công", "success");
            this.visiable = true;
            this.props.onFinish();
        } else handlerRequestError(res);
    }

    render() {
        return (<Modal maskClosable={false}
                       width={"500px"}
                       title={<p style={{
                           color: "#000000",
                           fontSize: "19px",
                           textAlign: "center",
                           marginBottom: 0,
                           fontFamily: "OpenSans-Semibold"
                       }}>Mã
                           giới thiệu</p>}
                       visible={this.visiable}
                       footer={null}
                       onCancel={() => this.visiable = false}>
            <p style={{
                color: "#000000",
                fontSize: "15px",
                textAlign: "center",
                fontFamily: "OpenSans-Semibold"
            }}>Nhập mã giới thiệu để nhận nhiều hơn các phần quà hấp dẫn từ Chozoi</p>
            <Form onFinish={(store: { refCode: string }) => this.handlerOnSubmit(store.refCode)}>
                <Form.Item name={"refCode"}
                           initialValue={this.refCode}
                           rules={[{required: true, message: "Không được bỏ trống"}]}>
                    <Input type={"text"}
                           autoFocus={true}
                           prefix={<i className="fal fa-share-alt"/>}
                           disabled={!!this.refCode}
                           style={{height: '40px'}}
                           placeholder={"Mã giới thiệu"}/>
                </Form.Item>
                <Form.Item style={{marginTop: '36px'}}>
                    <div className='d-flex justify-content-center'>
                        <Button style={{width: "172px"}} onClick={() => {
                            this.visiable = false;
                            this.props.onFinish();
                        }}>Bỏ qua</Button>
                        <Button style={{width: "172px", marginLeft: '24px'}}
                                type={"primary"}
                                htmlType={"submit"}>Tiếp tục</Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>);
    }

    static get getInstance(): PopupPresenter {
        return PopupPresenter.instance;
    }

    public static show(refCode?: string | null) {
        if (refCode) {
            PopupPresenter.getInstance.refCode = refCode;
        }
        PopupPresenter.getInstance.visiable = true;
    }
}