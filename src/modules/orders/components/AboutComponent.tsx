import React from "react";
import {Moment} from "../../../common/functions/Moment";
import "../containers/AboutStyle.scss";
import $ from "jquery";
import {Link} from "react-router-dom";

interface IAboutComponentProps {
    type: 'normal' | 'return',
    title: string,
    code: string,
    createdAt: string | number,
    state: 'DRAFT' | 'NEW' | 'CANCELED' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'WAIT_REFUND' | 'FINISHED',
    packageId?: number
    emitActionOrder?: (type: 'CONFIRMED' | 'CANCELED') => void,
    emitActionOrderReturn?: (type: 'CHOZOI_VIA_RETURN' | 'RETURN_NOT_RECEVIE' | 'CHOZOI_ARBITRATION') => void,
    sellerShipping?: boolean // update 23-06-2020
    emitActionSellerShipping?: (state: 'SHIPPING' | 'SHIPPED' | 'CANCELED') => void
}

let type: 'CHOZOI_VIA_RETURN' | 'RETURN_NOT_RECEVIE' | 'CHOZOI_ARBITRATION' = "CHOZOI_VIA_RETURN";

export const AboutComponent: React.FC<IAboutComponentProps> = (props: IAboutComponentProps) => {
    const confirmAction = (_type: 'CHOZOI_VIA_RETURN' | 'RETURN_NOT_RECEVIE' | 'CHOZOI_ARBITRATION') => {
        type = _type;
        $('div.modal#modal-confirm-action').modal({show: true, backdrop: 'static'});
    };

    const renderAction = (): React.ReactNode => {
        if (props.sellerShipping) {
            if (props.state === "NEW")
                return <div className="action">
                    <button className="btn btn-primary"
                            onClick={() => (props as any).emitActionOrder("CONFIRMED")}>Xác nhận đơn
                    </button>
                    <button className="btn btn-danger"
                            onClick={() => (props as any).emitActionOrder("CANCELED")}>Hủy bỏ
                    </button>
                </div>;
            else if (props.state === "CONFIRMED")
                return <div className="action">
                    <button className="btn btn-primary"
                            onClick={() => props.emitActionSellerShipping && props.emitActionSellerShipping("SHIPPING")}>Đi giao hàng
                    </button>
                    <button className="btn btn-danger"
                            onClick={() => props.emitActionSellerShipping && props.emitActionSellerShipping("CANCELED")}>Hủy giao hàng
                    </button>
                </div>;
            else if (props.state === "SHIPPING")
                return <div className="action">
                    <button className="btn btn-primary"
                            onClick={() => props.emitActionSellerShipping && props.emitActionSellerShipping("SHIPPED")}>Đã giao hàng
                    </button>
                    <button className="btn btn-danger"
                            onClick={() => props.emitActionSellerShipping && props.emitActionSellerShipping("CANCELED")}>Hủy đơn hàng
                    </button>
                </div>;
        } //
        else {
            if (props.type === "normal" && props.state === 'NEW' && props.emitActionOrder)
                return <div className="action">
                    <button className="btn btn-primary"
                            onClick={() => (props as any).emitActionOrder("CONFIRMED")}>Xác nhận đơn
                    </button>
                    <button className="btn btn-danger"
                            onClick={() => (props as any).emitActionOrder("CANCELED")}>Hủy bỏ
                    </button>
                </div>;
            else if (props.type === "return" && props.state === "DRAFT" && props.emitActionOrderReturn)
                return <div className="action">
                    <button className="btn btn-primary"
                            onClick={() => confirmAction("CHOZOI_VIA_RETURN")}>Trả hàng hoàn tiền
                        qua Chozoi
                    </button>
                    <button className="btn btn-success"
                            onClick={() => confirmAction("RETURN_NOT_RECEVIE")}>Hoàn tiền không cần
                        nhận hàng
                    </button>
                    <button className="btn btn-danger"
                            onClick={() => confirmAction("CHOZOI_ARBITRATION")}>Không đồng ý yêu
                        cầu đổi trả
                    </button>
                </div>;
        }
        return null;  // default return
    }

    return (<div id="order-return-about">
        <div>{props.title} <b>#{props.code}</b> (Khởi tạo
            ngày {`${Moment.getDate(props.createdAt, 'dd/mm/yyyy')} ${Moment.getTime(props.createdAt, 'hh:mm:ss')}`})
        </div>
        {(props.type === "return" && props.packageId) && <Link className="redirect-order" to={`/home/order/package/${props.packageId}`}>Xem đơn gốc</Link>}
        {/*action return order*/}
        {renderAction()}
        <div className="modal fade" id="modal-confirm-action">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-body" style={{minHeight: 'unset'}}>
                        <p>Bạn có chắc chắn muốn thực hiện thao tác này?</p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-sm btn-default" data-dismiss="modal" type="button">Hủy</button>
                        <button className="btn btn-sm btn-primary" data-dismiss="modal" type="button"
                                onClick={() => props.emitActionOrderReturn && props.emitActionOrderReturn(type)}>Đồng ý
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>);
};

export default AboutComponent;
