import React, {ReactNode} from "react";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import "../containers/ProductStyle.scss";
import ImageViewer from "../../../common/image-viewer/ImageViewer";

interface IProductComponentProps {
    type: 'normal' | 'return'
    orderLineId?: number
    productId?: number
    productImage: string
    productName: string
    priceUnit: number
    quantity: number
    returnQuantity?: number
    reason: string
    note: string
    children?: ReactNode
    history?: { push: (path: string, state?: any) => void }
    viewAbout?: boolean
    images: { url: string }[]
    state: 'DRAFT' | 'NEW' | 'CANCELED' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'WAIT_REFUND' | 'FINISHED'
    productAttributes?: { name: string, value: string }[]
    action?: boolean
    emitAction?: (lineId: number) => void
    isFreeShip: boolean
}

const PRODUCT_DETAIL: string = '/home/product/detail/';

export const ProductComponent: React.FC<IProductComponentProps> = (props: IProductComponentProps) => {
    const ImageViewerRef = React.createRef<any>();
    return (<div className="table-responsive order-return-item-product">
        <table className="table">
            <thead>
            <tr>
                <th>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                {props.orderLineId && <th/>}
            </tr>
            </thead>
            <tbody>
            {props.quantity > 0 && <tr>
                <td>
                    <img className="cursor-pointer" src={props.productImage}
                         onClick={() => ImageViewerRef.current && ImageViewerRef.current.show(props.productImage)}
                         alt=""/>
                    <div className="product-name">
                        <p className="cursor-pointer"
                           onClick={() => props.history && props.productId && props.history.push(PRODUCT_DETAIL + props.productId)}>{props.productName}</p>
                        {props.productAttributes && <ul className="atrributes">
                            {props.productAttributes.map((value, index) => <li
                                key={index}>{value.name} : {value.value}</li>)}
                        </ul>}
                        {props.isFreeShip && <span className="label label-info font-weight-bold">Freeship</span>}
                    </div>
                </td>
                <td>{numberWithCommas(props.priceUnit, 'đ')}</td>
                <td>{numberWithCommas(props.quantity)}</td>
                <td>{numberWithCommas(props.priceUnit * props.quantity, 'đ')}</td>
                {props.action && <td style={{verticalAlign: 'middle', textAlign: 'end'}}>
                    <button
                        onClick={() => props.emitAction && props.orderLineId && props.emitAction(props.orderLineId)}
                        className="btn btn-primary">Xem chi tiết
                    </button>
                </td>}
            </tr>}
            {props.children}
            </tbody>
            {props.type === 'return' && <tfoot>
            <tr>
                <td colSpan={props.orderLineId ? 5 : 4}>
                    <div className="feedback">
                        <p className="font-weight-bold">Lý do trả hàng: <span
                            className="font-weight-normal">{props.reason}</span>
                        </p>
                        <ul>
                            {props.images.map((value: { url: string }, index: number) =>
                                <li key={index}><img src={value.url}
                                                     className="cursor-pointer"
                                    /* onClick={() => ImageViewerRef.current && ImageViewerRef.current.show(value.url)}*/
                                                     alt=""/></li>)}
                        </ul>
                        <div className="clearfix"/>
                        <p className="font-weight-bold mb-0 mt-3">Bình luận</p>
                        <span>{props.note}</span>
                    </div>
                </td>
            </tr>
            </tfoot>}
        </table>
        <ImageViewer ref={ImageViewerRef}/>
    </div>);
};

export default ProductComponent;
