import React from "react";

interface ITemplateActionsProps {
    OnSave: (target: 'DRAFT' | 'PUBLIC') => any
    OnCancer: () => any
}

export default class TemplateActions extends React.Component<ITemplateActionsProps, any> {
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="template-actions">
            <button className="btn btn-default" onClick={() => this.props.OnSave("DRAFT")}>Lưu
                nháp
            </button>
            <button className="btn btn-primary" onClick={() => this.props.OnSave("PUBLIC")}>Cập
                nhật ngay
            </button>
            <button className="btn btn-danger" onClick={() => this.props.OnCancer()}>Hủy</button>
        </div>;
    }
}
