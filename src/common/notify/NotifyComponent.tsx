import React from "react";
import {observer} from "mobx-react";
import {store} from "./NotifyService";
import "./NotifyStyle.scss";

@observer
export default class NotifyComponent extends React.Component {
    protected getAlert(flag: 'success' | 'warning' | 'error'): 'alert-success' | 'alert-warning' | 'alert-danger' {
        switch (flag) {
            case "error":
                return 'alert-danger';
            case "success":
                return 'alert-success';
            case "warning":
                return 'alert-warning';
        }
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className={store.show ? 'show' : ''} id="ui-notify" aria-hidden={store.init ? 'true' : 'false'}>
            <div className={`alert ${this.getAlert(store.flag)}`}>
                <strong>Thông báo!</strong> {store.text}
            </div>
        </div>;
    }
}
