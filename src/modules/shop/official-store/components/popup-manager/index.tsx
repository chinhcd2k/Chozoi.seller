import {observer} from "mobx-react";
import React from "react";
import {POPUP_MANAGER_CTRL} from "./control";
import {IReqCategory, IReqCategoryParent} from "../../../../../api/offical-store/interfaces/request";

interface IPopupManagerProps {
    OnSave: () => any
}

@observer
export default class PopupManager extends React.Component<IPopupManagerProps, any> {
    private store = POPUP_MANAGER_CTRL.store;

    constructor(props: IPopupManagerProps) {
        super(props);
        POPUP_MANAGER_CTRL.view = this;
    }

    protected generateCategory(item: IReqCategoryParent): string {
        if (item) {
            if (this.store.categoryChildrenType === "checkbox") {
                let child = '';
                item.children.map((value: IReqCategory) => child += `, ${value.name}`);
                return `[${item.name}${child}]`;
            } else {
                if (item.children.length === 0) return `${item.name}`;
                else return `${item.children[0].name}`
            }
        }
        return '';
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="modal fade" id="popup-manager">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-body">
                        <ol>
                            <li>
                                <p>Hiển thị Web {this.store.multiple &&
                                <button onClick={() => POPUP_MANAGER_CTRL.handlerOnAddRow("web")}><i
                                    className="fas fa-plus"/></button>}</p>
                                <div className="table-responsive">
                                    <table className="table table-striped table-sm web">
                                        <thead>
                                        <tr>
                                            <th>Thumbnail</th>
                                            <th>Chọn điều hướng</th>
                                            {this.store.multiple && <th/>}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.store.data.web.map((value: any, index: number) => <tr key={index}>
                                            <td onClick={() => POPUP_MANAGER_CTRL.handlerOnShowPopupUpload("web", value.image, index)}>
                                                {value.image &&
                                                <div className="image">
                                                    <img
                                                        src={value.image.url}
                                                        alt="banner-web"/></div>}
                                                {!value.image &&
                                                <button><i className="fas fa-camera"/></button>}
                                            </td>
                                            <td>
                                                {/*Chua chon*/}
                                                {!value.category &&
                                                <button
                                                    onClick={() => POPUP_MANAGER_CTRL.handlerOnShowPopupSelectCategory("web", value.category, index)}>
                                                    <i
                                                        className="fas fa-plus"/> Chọn danh mục
                                                </button>}
                                                {/*Da chon*/}
                                                {value.category &&
                                                <p className="cursor-pointer"
                                                   onClick={() => POPUP_MANAGER_CTRL.handlerOnShowPopupSelectCategory("web", value.category, index)}>{this.generateCategory(value.category)}</p>}
                                            </td>
                                            {this.store.multiple && <td>
                                                <button
                                                    onClick={() => this.store.multiple && POPUP_MANAGER_CTRL.handlerOnDeleteRow("web", index)}>
                                                    <i
                                                        className="fas fa-trash"/></button>
                                            </td>}
                                        </tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </li>
                            <li>
                                <p>Hiển thị App {this.store.multiple &&
                                <button onClick={() => POPUP_MANAGER_CTRL.handlerOnAddRow("app")}><i
                                    className="fas fa-plus"/></button>}</p>
                                <div className="table-responsive">
                                    <table className="table table-striped table-sm app">
                                        <thead>
                                        <tr>
                                            <th>Thumbnail</th>
                                            <th>Chọn điều hướng</th>
                                            {this.store.multiple && <th/>}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.store.data.app.map((value: any, index: number) => <tr key={index}>
                                            <td onClick={() => POPUP_MANAGER_CTRL.handlerOnShowPopupUpload("app", value.image, index)}>
                                                {value.image &&
                                                <div className="image">
                                                    <img
                                                        src={value.image.url}
                                                        alt="banner-app"/></div>}
                                                {!value.image &&
                                                <button><i className="fas fa-camera"/></button>}
                                            </td>
                                            <td>
                                                {!value.category &&
                                                <button
                                                    onClick={() => POPUP_MANAGER_CTRL.handlerOnShowPopupSelectCategory("app", value.category, index)}>
                                                    <i
                                                        className="fas fa-plus"/> Chọn danh mục
                                                </button>}
                                                {/*Da chon*/}
                                                {value.category &&
                                                <p className="cursor-pointer"
                                                   onClick={() => POPUP_MANAGER_CTRL.handlerOnShowPopupSelectCategory("app", value.category, index)}>
                                                    {this.generateCategory(value.category)}
                                                </p>}
                                            </td>
                                            {this.store.multiple && <td>
                                                <button
                                                    onClick={() => this.store.multiple && POPUP_MANAGER_CTRL.handlerOnDeleteRow("app", index)}>
                                                    <i
                                                        className="fas fa-trash"/></button>
                                            </td>}
                                        </tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </li>
                        </ol>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-danger" data-dismiss="modal">Hủy</button>
                        <button className="btn btn-primary"
                                onClick={() => POPUP_MANAGER_CTRL.handlerOnSave()}>Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>;
    }
}
