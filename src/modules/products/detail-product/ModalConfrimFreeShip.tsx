import React from "react";

interface IModalConfrimFreeShipProps {
    enable: boolean,
    OnApply: (enable: boolean) => any
}

export const ModalConfirmFreeShip: React.FC<IModalConfrimFreeShipProps> = (props: IModalConfrimFreeShipProps) => {
    return <div className="modal fade" id="modal-confirm-freeship">
        <div className="modal-dialog modal-md">
            <div className="modal-content">
                <div className="modal-header py-0" style={{borderBottom: 'solid 1px #E1E1E1'}}>
                    <h4>{props.enable ? "Miễn phí vận chuyển cho sản phẩm này?" : "Dừng miễn phí vận chuyển cho sản phẩm này?"}</h4>
                </div>
                <div className="modal-body">
                    <p>Sau khi {!props.enable ? 'dừng' : 'cho phép'} áp dụng miễn phí vận chuyển, toàn bộ phí vận chuyển
                        phát sinh của sản phẩm trong đơn hàng sẽ được tính
                        cho {!props.enable ? 'Người mua' : 'Nhà bán'} hàng.</p>
                    <p>Bạn có chắc chắn muốn thực hiện hành động này không ?</p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-default" data-dismiss="modal">Không</button>
                    <button className={`btn ${props.enable ? 'btn-primary' : 'btn-danger'}`}
                            data-dismiss="modal"
                            onClick={() => props.OnApply(props.enable)}>{props.enable ? 'Áp dụng' : 'Dừng'}</button>
                </div>
            </div>
        </div>
    </div>;
}
