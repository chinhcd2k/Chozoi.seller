import React from "react";
import {observer} from "mobx-react";
import {TemplateStore} from "./store";

@observer
export default class Steep extends React.Component<any, any> {
    render() {
        return <div className="steep">
            <ol>
                <li className={TemplateStore.steep === 0 ? 'active' : 'completed'}>
                    <div>
                        {TemplateStore.steep === 0 && <i className="fas fa-pencil"/>}
                        {TemplateStore.steep === 1 && <i className="fas fa-check"/>}
                    </div>
                    Thiết lập cơ bản
                </li>
                <li className={TemplateStore.steep === 1 ? 'active' : ''}>
                    <div>
                        {TemplateStore.steep === 1 && <i className="fas fa-pencil"/>}
                    </div>
                    Danh sách sản phẩm áp dụng
                </li>
            </ol>
        </div>;
    }
}