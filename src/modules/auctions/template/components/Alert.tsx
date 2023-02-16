import React, {ReactNode} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import * as Sentry from "@sentry/browser";
import {IResponseAuction} from "../../DetailAuction";

export interface IAlert {
    text: string | ReactNode,
    flag: 'success' | 'warring' | 'danger',
}

@observer
export default class Alert extends React.Component<{ type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK'|'CREATE_F_N', detailAuction?: IResponseAuction }, any> {
    @observable alert: IAlert | undefined;

    render() {
        if (this.props.detailAuction && this.props.detailAuction.state === "REJECT" && this.props.detailAuction.reportIssues) {
            const reportIssues = this.props.detailAuction.reportIssues;
            this.alert = {
                flag: 'danger',
                text: <ul>
                    <li key={'description'}>Lý do: {reportIssues.description}</li>
                    <li key={'solution'}>Hướng giải quyết: {reportIssues.solution}</li>
                </ul>
            };
        }
        try {
            if (this.alert && (this.props.type === "UPDATE" || this.props.type === "DETAIL"))
                return <div className="col-xs-12">
                    <div className={`alert alert-${this.alert.flag}`}>
                        <button className="close" data-dismiss="alert"><i className="pci-cross pci-circle"/>
                        </button>
                        {typeof this.alert.text === "string" && <div><strong>Thông báo!</strong> {this.alert.text}</div>}
                        {typeof this.alert.text !== "string" && <div>{this.alert.text}</div>}
                    </div>
                </div>;
            else return null;
        } catch (e) {
            console.error(e);
            Sentry.captureException(e);
            return null;
        }
    }
}