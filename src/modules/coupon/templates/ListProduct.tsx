import React from "react";
import {observer} from "mobx-react";
import {IProduct, TemplateStore} from "./store";
import {Product} from "./Product";
import $ from "jquery";
import {TEMPLATE_CTRL} from "./controls";
import {PaginationComponent} from "../../../common/pagination";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {notify} from "../../../common/notify/NotifyService";
import {ICoupon} from "../manager/store";

interface IListProductProps {
    type: 'CREATE' | 'UPDATE' | 'DETAIL',
}

@observer
export default class ListProduct extends React.Component<IListProductProps, any> {
    protected async showPopupListProduct() {
        TemplateStore.listProductTemp = TemplateStore.listProductSelected.reduce((previousValue: IProduct[], currentValue) => {
            let clone: IProduct = {} as any;
            Object.assign(clone, currentValue);
            previousValue.push(currentValue);
            return previousValue;
        }, []);
        if (TemplateStore.listProductPopup.length === 0) {
            await TEMPLATE_CTRL.GET_getListProduct(0, TemplateStore.metadataPopup.size);
        }
        $('div#coupon-template-site div.modal#popup-select-products').modal({show: true, backdrop: "static"});
    }

    protected handlerOnRemove(item: IProduct) {
        let index = TemplateStore.listProductSelected.findIndex(value => value.id === item.id);
        let index_temp = TemplateStore.listProductTemp.findIndex(value => value.id === item.id);
        if (index !== -1) {
            TemplateStore.listProductPopup.map(value => value.id === item.id && (value.selected = false));
            TemplateStore.listProductSelected.splice(index, 1);
            let page = TemplateStore.listProductSelected.length / TemplateStore.metadata.size;
            let beginIndex = page !== Math.floor(page) ? (Math.floor(page) * TemplateStore.metadata.size) : (Math.floor(page) - 1) * TemplateStore.metadata.size;
            TemplateStore.listProduct = TemplateStore.listProductSelected.slice(beginIndex, beginIndex + TemplateStore.metadata.size);
            TemplateStore.metadata = {
                total: TemplateStore.metadata.total,
                size: TemplateStore.metadata.size,
                page: beginIndex
            }
        }
        if (index_temp !== -1) TemplateStore.listProductTemp.splice(index_temp, 1);

    }

    protected handlerOnChangePage(page: number) {
        let beignIndex = page * TemplateStore.metadata.size;
        TemplateStore.listProduct = TemplateStore.listProductSelected.slice(beignIndex, beignIndex + TemplateStore.metadata.size);
    }

    protected handerOnRemoves() {
        TemplateStore.listProduct.map(value => value.selected && this.handlerOnRemove(value));
    }

    protected get getIsRenderBtnRemoves(): boolean {
        let r = false;
        TemplateStore.listProduct.map(value => value.selected && (r = true));
        return r;
    }

    protected handlerOnSave() {
        if (TemplateStore.listProductSelected.length === 0)
            notify.show('Vui l??ng ch???n ??t nh???t 1 s???n ph???m', "error");
        else if (this.props.type === "CREATE") TEMPLATE_CTRL.POST_createCoupon().then();
        else if (this.props.type === "UPDATE") TEMPLATE_CTRL.POST_updateCoupon((TemplateStore.promotionTemp as ICoupon).id).then();
    }

    protected get isDisabledCheckbox(): boolean {
        return !!(TemplateStore.promotionTemp && /(PROCESSING|PAUSING|FINISHED|CLOSE|)/.test(TemplateStore.promotionTemp.state));
    }

    render() {
        if (TemplateStore.steep === 1)
            return <div className="container list-products">
                <div className="coupon-info">
                    <h4>Chi ti???t</h4>
                    <div className="row">
                        <div className="col-xs-6">
                            <p>T??n m?? gi???m gi??: {TemplateStore.name}</p>
                            <p>S??? l?????ng m??: {numberWithCommas(TemplateStore.amount)}</p>
                        </div>
                        <div className="col-xs-6">
                            <p>????n h??ng t???i thi???u: {numberWithCommas(TemplateStore.minPrice)} ??</p>
                            <p>M???c gi???m: {TemplateStore.type === "SOILD" ? (numberWithCommas(TemplateStore.discount) + '??') : (TemplateStore.discount + '%')}</p>
                        </div>
                    </div>
                </div>
                {this.isRenderAction && <div className="action">
                    {this.getIsRenderBtnRemoves && <button className="btn btn-default" onClick={() => this.handerOnRemoves()}>X??a</button>}
                    <button className="btn btn-primary" onClick={() => this.showPopupListProduct()}><i className="fas fa-plus"/> Th??m s???n ph???m</button>
                </div>}
                <div className="table-responsive">
                    <table className="table table-striped table-sm">
                        <thead>
                        <tr>
                            <th/>
                            <th>T??n s???n ph???m</th>
                            <th>Gi?? s???n ph???m</th>
                            <th>Tr???ng th??i</th>
                            <th>H??nh ?????ng</th>
                        </tr>
                        </thead>
                        <tbody>
                        {TemplateStore.listProduct.map(value =>
                            <Product key={value.id}
                                     type={"SELECTED"}
                                     data={value}
                                     disabled={this.isDisabledCheckbox}
                                     OnChange={checked => value.selected = checked}
                                     OnDelete={this.isRenderAction ? () => this.handlerOnRemove(value) : undefined}
                            />)}
                        </tbody>
                        {TemplateStore.metadata.total === 0 && <tr>
                            <td colSpan={5} className="text-center pt-3">Kh??ng c?? s???n ph???m n??o ???????c ch???n</td>
                        </tr>}
                        {TemplateStore.metadata.total > 0 && <tfoot>
                        <tr>
                            <td colSpan={5}>
                                <div className="d-flex justify-content-between">
                                    <p>???? ch???n: {numberWithCommas(TemplateStore.listProductSelected.length)} s???n ph???m</p>
                                    <PaginationComponent
                                        total={TemplateStore.metadata.total}
                                        number={TemplateStore.metadata.size}
                                        defaultActive={TemplateStore.metadata.page}
                                        emitOnChangePage={page => this.handlerOnChangePage(page - 1)}
                                    />
                                </div>
                            </td>
                        </tr>
                        </tfoot>}
                    </table>
                </div>
                {(this.isRenderAction || TemplateStore.forceRenderBtnSave) && <div className="action-footer d-flex justify-content-center">
                    <button className="btn btn-default" onClick={() => TemplateStore.steep -= 1}>Quay l???i</button>
                    <button className="btn btn-danger mx-3" onClick={() => TemplateStore.Router && TemplateStore.Router.goBack()}>H???y</button>
                    <button className="btn btn-primary"
                            disabled={TemplateStore.disabledSubmit}
                            onClick={() => this.handlerOnSave()}>L??u
                    </button>
                </div>}
            </div>;
        else return null;
    }

    get isRenderAction(): boolean {
        return !(TemplateStore.promotionTemp && TemplateStore.promotionTemp.state !== "COMINGSOON");
    }
}