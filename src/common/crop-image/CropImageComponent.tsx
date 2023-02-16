import * as React from "react";
import "./CropImageStyle.scss";
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import * as Sentry from "@sentry/browser";

interface ICropImageComponentProps {
    imageSrc: string,
    fileName: string,
    resultCrop: (files: any) => void,
    width: number,
    height: number
}

export default class CropImageComponent extends React.Component<ICropImageComponentProps> {
    public cropper: any = React.createRef();

    private async cropImage() {
        this.cropper.current.getCroppedCanvas({
            width: this.props.width,
            height: this.props.height,
            fillColor: '#fff'
        }).toBlob((blob: any) => this.props.resultCrop([new File([blob], this.props.fileName, {type: 'image/png'})]), 'image/png');
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            // @ts-ignore
            return <div id="utility-crop-image"><Cropper
                ref={this.cropper}
                src={this.props.imageSrc}
                toggleDragModeOnDblclick={false}
                aspectRatio={1}
                data={{width: 0, height: 0, x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1}}
                guides={true}
                cropBoxResizable={false}
                minContainerHeight={window.innerHeight}
                minContainerWidth={window.innerWidth}
                minCropBoxWidth={this.props.width}
                minCropBoxHeight={this.props.height}/>
                <div className="content">
                    <button type="button" className="btn btn-primary" data-dismiss="modal"
                            onClick={() => this.cropImage()}>Crop
                    </button>
                    <button className="btn btn-danger" data-dismiss="modal">Hủy</button>
                </div>
            </div>;
        } catch (e) {
            console.log(e);
            Sentry.captureException(e);
            return <div>Render Error</div>;
        }
    }
}
