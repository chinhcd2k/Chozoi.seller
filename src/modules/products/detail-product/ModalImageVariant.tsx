import React from "react";
import {observer} from "mobx-react";
import {DETAIL_TEMPLATE_CONTROL} from "../components/detail-template/DetailTemplateControl";

interface IModalImageVariantProps {
    defaultVariant: {
        id?: number
        image_id?: number
        price?: number
        sale_price: number
        quantity: number
        sku: string
    }

    /*Emit*/
    EmitOnChangeImage: (image_id: number) => any
}

interface IModalImageVariantState {
    image_id: number | null
}

@observer
export default class ModalImageVariant extends React.Component<IModalImageVariantProps, IModalImageVariantState> {
    public DETAIL_TEMPLATE_STORE = DETAIL_TEMPLATE_CONTROL.store;

    state = {
        image_id: null
    };

    componentDidMount(): void {
        this.props.defaultVariant.image_id && this.setState({image_id: this.props.defaultVariant.image_id});
    }

    componentDidUpdate(prevProps: Readonly<IModalImageVariantProps>, prevState: Readonly<any>, snapshot?: any): void {
        if (prevProps !== this.props) {
            this.props.defaultVariant.image_id && this.setState({image_id: this.props.defaultVariant.image_id});
        }
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="modal fade" id="product-modal-popup-container-image">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal"><i
                            className="pci-cross pci-circle"/></button>
                    </div>
                    <div className="modal-body">
                        {this.DETAIL_TEMPLATE_STORE && <ul>
                            {this.DETAIL_TEMPLATE_STORE && this.DETAIL_TEMPLATE_STORE.listImage.map((value, index) => !isNaN(parseInt(value.id + '')) &&
                                <li key={index} className={this.state.image_id === value.id ? 'active' : ''}>
                                    <img src={value.src} onClick={() => {
                                        value.id && this.setState({image_id: value.id});
                                    }} alt="variant-image"/></li>)}
                        </ul>}
                    </div>
                    <div className="modal-footer">
                        <button data-dismiss="modal" className="btn btn-default" type="button">Đóng</button>
                        <button data-dismiss="modal" className="btn btn-primary"
                                onClick={() => {
                                    this.state.image_id !== null && this.props.EmitOnChangeImage(this.state.image_id as any);
                                    this.setState({image_id: null});
                                }}>Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>;
    }
};