import React from "react";
import {observer} from "mobx-react";
import {PopupCategoryStore} from "./store";
import {notify} from "../../../../../common/notify/NotifyService";
import {TemplateStore} from "../templates/store";
import {IReqCategory, IReqCategoryParent} from "../../../../../api/offical-store/interfaces/request";

interface IPopupCategoryProps {
    OnSave: () => any
}

@observer
export default class PopupCategory extends React.Component<IPopupCategoryProps, any> {
    public store = PopupCategoryStore;

    public handlerOnSelectParentCategory(item: IReqCategoryParent) {
        this.store.categorySelected = {
            id: item.id,
            name: item.name,
            level: item.level,
            children: []
        };
    };

    public handlerOnSelectChildrenCategory(item: IReqCategory) {
        if (this.store.categorySelected) {
            if (this.store.categoryChildrenType === "checkbox") {
                const search = this.store.categorySelected.children.findIndex(value => value.id === item.id);
                if (search === -1) {
                    if (this.store.categorySelected.children.length < 3) this.store.categorySelected.children.push(item);
                    else notify.show('Bạn chỉ được chọn tối đa 3 danh mục con', "error");
                } else this.store.categorySelected.children.splice(search, 1);
            } else {
                this.store.categorySelected.children = [item];
            }
        }
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="modal fade" id="popup-category">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header pb-0">
                        <h4 className="text-primary text-center">
                            {this.store.targetDevice === "web" && "Chọn danh mục cho WEB"}
                            {this.store.targetDevice === "app" && "Chọn danh mục cho App"}
                        </h4>
                    </div>
                    <div className="modal-body pt-0">
                        <div className="table-responsive">
                            <table className="table table-striped table-sm">
                                <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên</th>
                                    <th/>
                                </tr>
                                </thead>
                                <tbody>
                                {TemplateStore.listCategory.map((value: IReqCategoryParent, index: number) =>
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <p>{value.name}</p>
                                            {this.isParentChecked(value) && <ul>
                                                {value.children.map((value1, index1) => <li key={index1}>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <p className="name">{value1.name}</p>
                                                        <div className={this.store.categoryChildrenType + "-group"}>
                                                            <input
                                                                id={`${this.store.categoryChildrenType}-${value1.id}`}
                                                                name="category-children"
                                                                readOnly={true}
                                                                checked={this.isChildrenChecked(value1)}
                                                                onClick={() => this.handlerOnSelectChildrenCategory(value1)}
                                                                className={"magic-" + this.store.categoryChildrenType}
                                                                type={this.store.categoryChildrenType}/><label
                                                            htmlFor={`${this.store.categoryChildrenType}-${value1.id}`}/>
                                                        </div>
                                                    </div>
                                                </li>)}
                                            </ul>}
                                        </td>
                                        <td className="text-center">
                                            <div className="radio-group">
                                                <input id={'radio-' + value.id}
                                                       checked={this.isParentChecked(value)}
                                                       readOnly={true}
                                                       name="category-lv1"
                                                       onClick={() => this.handlerOnSelectParentCategory(value)}
                                                       className="magic-radio"
                                                       type="radio"/><label
                                                htmlFor={"radio-" + value.id}/>
                                            </div>
                                        </td>
                                    </tr>)}
                                {/*Not found*/}
                                {TemplateStore.listCategory.length === 0 && <tr>
                                    <td colSpan={3}><p className="text-center mt-3">Không tìm thấy danh mục nào</p></td>
                                </tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-danger" data-dismiss="modal">Hủy</button>
                        <button className="btn btn-primary"
                                onClick={() => this.props.OnSave()}>Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>;
    }

    protected isParentChecked(item: IReqCategoryParent): boolean {
        if (this.store.categorySelected)
            return item.id === this.store.categorySelected.id;
        else return false;
    }

    protected isChildrenChecked(item: IReqCategory): boolean {
        if (this.store.categorySelected)
            return this.store.categorySelected.children.findIndex(value => value.id === item.id) !== -1;
        return false;
    }
}
