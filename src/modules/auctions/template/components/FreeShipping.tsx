import React from "react";
import {Link} from "react-router-dom";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {store as ShopProfileStore} from "../../../shop/stores/ShopInfomationStore";

@observer
export default class FreeShipping extends React.Component<{ type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK'|'CREATE_F_N' }, object> {
    @observable freeShip: boolean = false;
    @observable disabledForm: boolean = false;

    componentDidMount() {
        if (this.props.type === "DETAIL" || this.props.type === "REPLAY_QUICK")
            this.disabledForm = true;
    }

    render() {
        if (ShopProfileStore.shopProfile && ShopProfileStore.shopProfile.freeShipStatus === "ON")
            return <div>
                <div className="card-header">
                    Miễn phí vận chuyển
                </div>
                <div className="card-body">
                    <i>Mẹo: Thông thường hiệu quả bán hàng tăng 20% khi MIỄN PHÍ VẬN CHUYỂN. Hãy áp dụng để
                        gia tăng doanh số của bạn</i>
                    <div className="dash">
                        <div className="btn-switch">
                            Áp dụng miễn phí vận chuyển cho sản phẩm
                            {!this.freeShip && <i className="fal fa-toggle-off fa-2x"
                                                  onClick={() => !this.disabledForm && (this.freeShip = true)}/>}
                            {this.freeShip && <i className="fal fa-toggle-on fa-2x"
                                                 onClick={() => !this.disabledForm && (this.freeShip = false)}/>}
                        </div>
                        <i>Khi áp dụng miễn phí vận chuyển: Sau khi phát sinh đơn hàng, tiền phí vận chuyển
                            sẽ được tính vào phí bán hàng của Nhà bán hàng. Để đảm bảo quyền lợi, hãy tham
                            kháo chính sách: Nhà bán hàng miễn phí vận chuyển <Link to="#">tại
                                đây</Link>.</i>
                    </div>
                </div>
            </div>;
        else return null
    }
}