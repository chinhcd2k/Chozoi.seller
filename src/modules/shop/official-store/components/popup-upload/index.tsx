import React from "react";
import {observer} from "mobx-react";
import {PopupUploadStore} from "./store";
import {convertBase64ToBlobUrl} from "../../../../../common/functions/ConvertFunc";

interface IPopupUploadProps {
    OnSave: () => any
}

@observer
export default class PopupUpload extends React.Component<IPopupUploadProps, any> {
    public store = PopupUploadStore;

    private verifyDimensionImage(file: File): Promise<{ name: string, image: any, width: number, height: number }> {
        return new Promise((resolve, reject) => {
            try {
                const fr = new FileReader();
                fr.onload = () => {
                    const img = new Image();
                    img.onload = () => {
                        resolve({name: file.name, image: img, width: img.width, height: img.height});
                    };
                    typeof fr.result === "string" && (img.src = fr.result);
                };
                fr.readAsDataURL(file);
            } catch (e) {
                reject(e);
            }
        });
    }

    protected async handlerOnUploadImage(event: any) {
        if (event.currentTarget.files.length === 1) {
            let files_save: File = event.currentTarget.files[0];
            const file_image = await this.verifyDimensionImage(event.currentTarget.files[0]);
            if (this.store.device === "web") {
               /* if ((file_image.width + file_image.height) !== (this.store.getSizeWeb.width + this.store.getSizeWeb.height)) {
                    notify.show(`Ảnh không đúng kích thước ${this.store.getSizeWeb.width} x ${this.store.getSizeWeb.height} (pixel)`, "error");
                    return;
                }*/
                this.store.data = {
                    url: await convertBase64ToBlobUrl(file_image.image.src) as string,
                    file: files_save as File
                };
            } else if (this.store.device === "app") {
               /* if ((file_image.width + file_image.height) !== (this.store.getSizeApp.width + this.store.getSizeApp.height)) {
                    notify.show(`Ảnh không đúng kích thước ${this.store.getSizeApp.width} x ${this.store.getSizeApp.height} (pixel)`, "error");
                    return;
                }*/
                this.store.data = {
                    url: await convertBase64ToBlobUrl(file_image.image.src) as string,
                    file: files_save as File
                };
            }
        }
    }

    protected handlerOnRemoveImage() {
        this.store.data = null;
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="modal fade" id="popup-upload">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header pb-0">
                        <h4 className="text-primary text-center">
                            {this.store.device === "web" && "Chọn ảnh hiển thị cho WEB"}
                            {this.store.device === "app" && "Chọn ảnh hiển thị cho App"}
                        </h4>
                    </div>
                    <div className="modal-body pt-0">
                        {this.store.device === "web" && <label>Vui lòng sử dụng ảnh có độ phân
                            giải {this.store.sizeWeb.width}x{this.store.sizeWeb.height} (pixel)</label>}
                        {this.store.device === "app" && <label>Vui lòng sử dụng ảnh có độ phân
                            giải {this.store.sizeApp.width}x{this.store.sizeApp.height} (pixel)</label>}
                        {!this.store.data && <div className="add">
                            <div><i className="fas fa-camera"/> Tải ảnh lên</div>
                            <p>Chỉ nhận định dạng .png, .jpg</p>
                            <input type="file" accept="image/png, image/jpeg" value=""
                                   onChange={e => this.handlerOnUploadImage(e)}/>
                        </div>}
                        {this.store.data &&
                        <div className="image">
                            <img src={this.store.data.url} alt="img"/>
                            <div className="remove">
                                <i className="fas fa-trash fa-2x" onClick={() => this.handlerOnRemoveImage()}/>
                            </div>
                        </div>}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-danger" data-dismiss="modal">Hủy</button>
                        <button className="btn btn-primary" onClick={() => this.props.OnSave()}>Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>;
    }
}
