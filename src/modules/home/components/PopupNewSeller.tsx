import React from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Modal} from "antd";
import {css} from "@emotion/core";

@observer
export default class PopupNewSeller extends React.Component<any, any> {
    private static instance?: PopupNewSeller;

    @observable private visiable: boolean = false;

    constructor(props: any) {
        super(props);
        PopupNewSeller.instance = this;
    }

    render() {
        return <Modal title={null}
                      css={css`.ant-modal-content {background-color: transparent; box-shadow: none;}`}
                      footer={null}
                      visible={this.visiable}
                      closeIcon={<button style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: "50%",
                          border: "none",
                          backgroundColor: "#ffffff",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center"
                      }}><i className="fal fa-times" style={{color: "#F54B24"}}/></button>}
                      mask={true}
                      onCancel={() => this.visiable = false}>
            <p style={{
                color: "#FFFFFF",
                fontSize: '21px',
                fontFamily: "OpenSans-Semibold",
                textAlign: "center"
            }}>Chào mừng nhà bán mới Shop của bạn đã được tạo, bán hàng thôi nào!</p>
            <img src="/assets/images/landing-page/ima-dangkithanhcong.png" alt="new-seller"/>
        </Modal>;
    }

    static show() {
        if (PopupNewSeller.instance) {
            PopupNewSeller.instance.visiable = true;
        }
    }
}