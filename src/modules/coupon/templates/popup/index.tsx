import React from "react";
import {observer} from "mobx-react";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import {IProduct, TemplateStore} from "../store";
import {Product} from "../Product";
import {PaginationComponent} from "../../../../common/pagination";
import {TEMPLATE_CTRL} from "../controls";
import PopupFilter from "./Filter";

@observer
export default class PopupListProduct extends React.Component<any, any> {
    handlerOnAgree() {
        const EQUAL = (item: IProduct): boolean => {
            return TemplateStore.listProductTemp.findIndex(value => value.id === item.id) !== -1;
        }
        TemplateStore.listProductPopup.map(value => {
            if (value.selected && !EQUAL(value)) {
                let clone: IProduct = {} as any;
                Object.assign(clone, value);
                delete clone.selected;
                TemplateStore.listProductTemp.push(clone);
            }
            return value;
        }, []);

        TemplateStore.listProductSelected = TemplateStore.listProductTemp.reduce((previousValue: IProduct[], currentValue) => {
            let clone: IProduct = {} as any;
            Object.assign(clone, currentValue);
            delete clone.selected;
            previousValue.push(clone);
            return previousValue;
        }, []);

        TemplateStore.metadata = {
            total: TemplateStore.listProductSelected.length,
            size: TemplateStore.metadata.size,
            page: 0
        }

        if (TemplateStore.listProduct.length < TemplateStore.metadata.size) {
            TemplateStore.listProduct = TemplateStore.listProductSelected.slice(0, TemplateStore.metadata.size);
        }
    }

    protected getDisabledProduct(item: IProduct): boolean {
        return TemplateStore.listProductTemp.findIndex(value => value.id === item.id) !== -1;
    }

    protected handlerOnChangePage(page: number) {
        const EQUAL = (item: IProduct): boolean => {
            return TemplateStore.listProductTemp.findIndex(value => value.id === item.id) !== -1;
        }
        TemplateStore.listProductPopup.map(value => {
            if (value.selected && !EQUAL(value)) {
                let clone: IProduct = {} as any;
                Object.assign(clone, value);
                clone.selected = false;
                TemplateStore.listProductTemp.push(clone);
            }
            return value;
        });
        TEMPLATE_CTRL.GET_getListProduct(page, TemplateStore.metadataPopup.size).then();
    }

    render() {
        return <div className="modal fade" id="popup-select-products">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4>Thêm sản phẩm</h4>
                    </div>
                    <div className="modal-body">
                        <PopupFilter/>
                        <h5>Đã chọn: {numberWithCommas(TemplateStore.listProductSelected.length)}</h5>
                        <div className="table-responsive">
                            <table className="table table-striped popup-table mb-0">
                                <thead>
                                <tr>
                                    <th/>
                                    <th>Tên sản phẩm</th>
                                    <th>Giá sản phẩm</th>
                                    <th>Tình trạng</th>
                                </tr>
                                </thead>
                                <tbody>
                                {TemplateStore.listProductPopup.length === 0 && <tr>
                                    <td colSpan={4} className="text-center">Không tìm thấy sản phẩm nào</td>
                                </tr>}
                                {TemplateStore.listProductPopup.map(value =>
                                    <Product key={value.id}
                                             data={value}
                                             type={"POPUP"}
                                             disabled={this.getDisabledProduct(value)}
                                             OnChange={checked => value.selected = checked}
                                    />)}
                                </tbody>
                                {TemplateStore.metadataPopup.total > 0 && <tfoot>
                                <tr>
                                    <td colSpan={4}>
                                        <div className="d-flex justify-content-end">
                                            <PaginationComponent
                                                total={TemplateStore.metadataPopup.total}
                                                number={TemplateStore.metadataPopup.size}
                                                defaultActive={TemplateStore.metadataPopup.page}
                                                emitOnChangePage={page => this.handlerOnChangePage(page - 1)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                                </tfoot>}
                            </table>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-default" data-dismiss="modal">Hủy</button>
                        <button className="btn btn-primary" data-dismiss="modal" onClick={() => this.handlerOnAgree()}>Xác nhận</button>
                    </div>
                </div>
            </div>
        </div>;
    }
}