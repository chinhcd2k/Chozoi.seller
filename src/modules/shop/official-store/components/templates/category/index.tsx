import React from "react";
import {Product} from "./components/product";
import {CATEGORY_CTRL} from "./control";
import PopupProducts from "./components/popup-products";
import {observer} from "mobx-react";
import CategoryView from "./components/category-view";

const MAX_CATEGORY = 3;

@observer
export default class TemplateCategory extends React.Component<any, any> {
    private store = CATEGORY_CTRL.store;

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="template-category">
            {this.store.category.map((value, index) => <div className="panel" key={index}>
                <div className="panel-heading">
                    <div className="float-right">
                        {this.store.category.length > 1 &&
                        <button className="btn btn-danger"
                                onClick={() => CATEGORY_CTRL.handlerOnRemoveCategory(index)}>Xóa</button>}
                        {this.store.category.length < MAX_CATEGORY && <button className="btn btn-primary ml-3" onClick={() => CATEGORY_CTRL.handlerOnAddCategory()}>Thêm</button>}
                    </div>
                </div>
                <div className="panel-body p-0">
                    <div className="banner-container">
                        <CategoryView index={index}/>
                        {/*Add Image*/}
                        {!this.store.category[index].web.image &&
                        <div className="add" onClick={() => CATEGORY_CTRL.showPopupManager(index)}>
                            <label>Ảnh banner danh muc</label>
                            <i className="fas fa-plus fa-2x"/>
                        </div>}
                        {/*Show Image*/}
                        {this.store.category[index].web.image &&
                        <div className="image" onClick={() => CATEGORY_CTRL.showPopupManager(index)}>
                            <img src={(this.store.category[index].web.image as any).url} alt=""/>
                        </div>}
                    </div>
                    {/*List Product*/}
                    <div className="list-product">
                        {this.store.category[index].products.map((value1, index1) =>
                            <Product key={index1} data={value1}
                                     OnRemoveProduct={() => CATEGORY_CTRL.handlerOnRemoveProduct(index, index1)}/>)}
                        {this.store.category[index].products.length < 8 &&
                        <div className="add" onClick={() => CATEGORY_CTRL.showPopupSelectProducts(index)}>
                            <label>Thêm sản phẩm</label>
                            <i className="fas fa-plus"/>
                        </div>}
                    </div>
                </div>
            </div>)}
            <PopupProducts/>
        </div>;
    }
};
