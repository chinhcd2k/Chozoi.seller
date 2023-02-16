import React from "react";
import {observer} from "mobx-react";
import {TemplateStore} from "../store";
import {TEMPLATE_CTRL} from "../controls";

@observer
export default class PopupFilter extends React.Component<any, any> {

    protected handlerOnChangeCategory(e: any) {
        TemplateStore.categoryId = e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined;
        TEMPLATE_CTRL.GET_getListProduct(0, TemplateStore.metadataPopup.size, TemplateStore.categoryId, TemplateStore.keywordPopup).finally();
    }

    protected handlerOnSearch() {
        TEMPLATE_CTRL.GET_getListProduct(0, TemplateStore.metadataPopup.size, TemplateStore.categoryId, TemplateStore.keywordPopup).finally();
    }

    render() {
        return <div className="popup-filter">
            <div className="d-flex">
                <select className="form-control mr-3 w-auto"
                        defaultValue={TemplateStore.categoryId ? TemplateStore.categoryId.toString() : ''}
                        onChange={e => this.handlerOnChangeCategory(e)}>
                    <option value="">Ngành hàng</option>
                    {TemplateStore.listCategory.map((value, index) =>
                        <option value={value.id} key={index}>{value.name}</option>)}
                </select>
                <div className="input-group mar-btm" style={{minWidth: '400px'}}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm"
                        className="form-control"
                        value={TemplateStore.keywordPopup}
                        onChange={e => TemplateStore.keywordPopup = e.currentTarget.value}
                    />
                    <span className="input-group-btn">
                    <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => this.handlerOnSearch()}
                    ><i className="fal fa-search"/></button>
                </span>
                </div>
            </div>
        </div>;
    }
}