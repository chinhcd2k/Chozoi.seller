import React from "react";
import {observer} from "mobx-react";
import {CATEGORY_CTRL, MAX_PRODUCTS} from "../control";
import {PaginationComponent} from "../../../../../../../common/pagination";
import {numberWithCommas} from "../../../../../../../common/functions/FormatFunc";
import * as Sentry from "@sentry/browser";
import {store as ProfileStore} from "../../../../../../profile";
import {observable} from "mobx";
import {service} from "../../../../../../products/ProductServices";

@observer
export default class PopupProducts extends React.Component<any, any> {
    private store = CATEGORY_CTRL.store;
    @observable shopId: number = -1;
    @observable textSearch: string = '';

    componentDidMount() {
        if (ProfileStore.profile) {
            this.shopId = ProfileStore.profile.shopId as number;
            // this.role = ProfileStore.profile.profile.user.role;
        }
    }

    getTextSearch(e: any) {
        this.textSearch = e.currentTarget.value;
    }

    @observable isSearch: boolean = false;

    public async handleSearch() {
        this.isSearch = this.textSearch.length !== 0;
        const response = await service.search(this.shopId, 'NORMAL', this.textSearch, "PUBLIC", "", 5, 0);
        if (response.status === 200) {
            this.store.popupProductsData.products = response.body.products;
            this.store.popupProductsData.size = response.body.metadata.size;
            this.store.popupProductsData.total = response.body.metadata.total;
            this.store.popupProductsData.page = response.body.metadata.page;

        } else {
            console.log("search fail!!!")
        }

    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            return <div className="modal fade" id="popup-products">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header pb-0">
                            <h4>Chọn sản phẩm hiển thị trong danh mục (Tối đa {MAX_PRODUCTS} sản phẩm)</h4>
                            <p>Đã chọn: <b>{this.store.popupProductsData.selected.length}</b></p>
                        </div>
                        <div className="search-pick-product d-flex">
                            <div className="input-search">
                                <input placeholder="Tìm kiếm" onChange={(e: any) => this.getTextSearch(e)}/>
                            </div>
                            <div className="btn-search ">

                                <button className="d-flex" onClick={() => this.handleSearch()}>
                                    <div className="icon">
                                        <i className="fal fa-search"/>
                                    </div>
                                    Tìm kiếm
                                </button>
                            </div>
                        </div>
                        <div className="modal-body pt-0">
                            <div className="table-responsive">
                                <table className="table table-striped table-sm">
                                    <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Ảnh</th>
                                        <th>Tên</th>
                                        <th>Giá</th>
                                        <th/>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.store.popupProductsData.products.map((value, index) => <tr key={index}>
                                        <td>{(this.store.popupProductsData.page * this.store.popupProductsData.size) + index + 1}</td>
                                        <td><img src={value.imageVariants[0].image65} alt=''/></td>
                                        <td>{value.name}</td>
                                        <td>
                                            {value.variants[0].price &&
                                            <p>{numberWithCommas(value.variants[0].price)}</p>}
                                            {numberWithCommas(value.variants[0].salePrice)}
                                        </td>
                                        <td>
                                            <div className="input-group">
                                                <input id={`checkbox-${value.id}`}
                                                       readOnly={true}
                                                       className="magic-checkbox"
                                                       checked={this.isChecked(value.id)}
                                                       onClick={() => CATEGORY_CTRL.handlerOnChangeSelectProduct(value, this.isChecked(value.id))}
                                                       type="checkbox"/>
                                                <label htmlFor={`checkbox-${value.id}`}/>
                                            </div>
                                        </td>
                                    </tr>)}
                                    {this.store.popupProductsData.products.length === 0 && <tr>
                                        <td colSpan={5}><p className="text-center mt-3">Không có sản phẩm nào</p></td>
                                    </tr>}
                                    </tbody>
                                </table>
                                <div className="pagination d-flex justify-content-center">
                                    {this.isSearch?  <PaginationComponent
                                        number={this.store.popupProductsData.size}
                                        total={this.store.popupProductsData.total}
                                        defaultActive={this.store.popupProductsData.page}
                                        emitOnChangePage={page => CATEGORY_CTRL.getProductsForShop(page - 1,true,this.textSearch)}
                                    />:  <PaginationComponent
                                        number={this.store.popupProductsData.size}
                                        total={this.store.popupProductsData.total}
                                        defaultActive={this.store.popupProductsData.page}
                                        emitOnChangePage={page => CATEGORY_CTRL.getProductsForShop(page - 1,false)}
                                    />}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-danger" data-dismiss='modal'>Hủy</button>
                            <button className="btn btn-primary"
                                    onClick={() => CATEGORY_CTRL.handlerOnSaveSelectProduct()}>Lưu
                            </button>
                        </div>
                    </div>
                </div>
            </div>;
        } catch (e) {
            console.log(e);
            Sentry.captureException(e);
            return null;
        }
    }

    public isChecked(id: number): boolean {
        const find = this.store.popupProductsData.selected.findIndex(value => value.id === id);
        return find !== -1;
    }
}
