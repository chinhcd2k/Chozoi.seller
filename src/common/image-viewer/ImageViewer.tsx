import React from "react";
import $ from "jquery";

export default class ImageViewer extends React.Component<any, { src: string }> {
    constructor(props: any) {
        super(props);
        this.state = {src: ''};
    }

    public show(src: string) {
        this.setState({src: src});
        $('div#images-viewer div.modal').modal('show');
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div id="images-viewer">
            <div className="modal fade">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="cursor-pointer close text-danger" data-dismiss="modal"><i className="fa fa-times-circle p-3"/></button>
                        </div>
                        <div className="modal-body">
                            <img className="w-100 h-100" src={this.state.src} alt=""/>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
};