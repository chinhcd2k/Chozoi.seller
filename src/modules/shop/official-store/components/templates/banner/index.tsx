import React from "react";
import {observer} from "mobx-react";
import {BANNER_CTRL} from "./control";

@observer
export default class TemplateBanner extends React.Component<any, any> {
    private store = BANNER_CTRL.store;

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="template-banner">
            <div className="list-banner">
                {this.store.getBanner.map((value, index) => {
                    if (value.web.image)
                        return <div className="image" key={index}
                                    onClick={() => BANNER_CTRL.showPopupManager(index)}>
                            <img src={value.web.image.url} alt=""/>
                        </div>;
                    else return <div className="add" key={index}
                                     onClick={() => BANNER_CTRL.showPopupManager(index)}>
                        <label>Ảnh banner phụ 1</label>
                        <i className="fas fa-plus fa-2x"/>
                    </div>
                })}
            </div>
        </div>;
    }
};
