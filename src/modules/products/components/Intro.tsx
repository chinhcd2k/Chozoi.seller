import React from "react";
import {observer} from "mobx-react";
import {Card, Button} from "antd";
import {observable} from "mobx";
import PopupFetchData from "./PopupFetchData";
import {IResponseProduct} from "../manager-product/components/ManagerProductComponent";
import {IResponseAuction} from "../../auctions/DetailAuction";
import {notify} from "../../../common/notify/NotifyService";
import ga from '../../../init-ga';

interface IProps {
    onNext: (name?: string) => any
    onFetch: (data: IResponseProduct | IResponseAuction) => any
}

@observer
export default class Intro extends React.Component<IProps, any> {
    private inputRef = React.createRef<HTMLInputElement>();
    @observable name?: string;

    handlerOnCreate() {
        if (!this.name) {
            notify.show("Vui lòng nhập tên sản phẩm!", "error");
            if (this.inputRef.current) this.inputRef.current.focus();
        } else if (this.name.length > 150) {
            notify.show("Tên sản phẩm tối đa 150 kí tự!", "error");
            if (this.inputRef.current) this.inputRef.current.focus();
        } else this.props.onNext(this.name)
    }

    render() {
        return <>
            <Card title={<h4 style={{marginBottom: 0, fontFamily: "OpenSans-Semibold"}}>Thêm mới sản phẩm</h4>}>
                <input className="form-control"
                       ref={this.inputRef}
                       style={{height: "40px"}}
                       value={this.name}
                       onChange={e => this.name = e.currentTarget.value}
                       placeholder={"Nhập tên của sản phẩm tại đây"}
                       type="text"/>
                <div className="d-flex justify-content-end">
                    <Button style={{
                        backgroundColor: "#1976d2",
                        height: "38px",
                        borderColor: "#1976d2",
                        marginTop: "1em"
                    }} type={"primary"}
                            onClick={() => {
                                this.handlerOnCreate();
                                ga.fcSendGaForSale(() => ga.pushEventGa('Submit_product_s1', 'Click_submit_name'), () => ga.pushEventGa('Submit_auction_product_s1', 'Click_submit_name'));
                            }}>Đăng sản phẩm</Button>
                </div>

                <h4 className="mt-5">Chozoi hỗ trợ nhà bán hàng tìm kiếm và đăng bán sản phẩm trên hệ thống.&nbsp;
                    <Button style={{color: "#1976d2", paddingLeft: 0}}
                            onClick={() => {
                                PopupFetchData.show(this.name || '');
                                ga.fcSendGaForSale(() => ga.pushEventGa('Submit_product_s1', 'Click_search_same_product'), () => ga.pushEventGa('Submit_auction_product_s1', 'Click_search_same_product'))
                            }}
                            type={"link"}>Tìm kiếm ngay <i className="fal fa-chevron-right"
                                                           style={{fontSize: "12px", paddingLeft: "4px"}}/></Button>
                </h4>
            </Card>
            <PopupFetchData
                onSkip={() => this.handlerOnCreate()}
                onFetch={data => this.props.onFetch(data)}/>
        </>;
    }
}
