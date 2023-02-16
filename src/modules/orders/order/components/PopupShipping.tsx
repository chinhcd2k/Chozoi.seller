import React from "react";
import {observer} from "mobx-react";
import {notify} from "../../../../common/notify/NotifyService";
import {convertBase64ToBlobUrl} from "../../../../common/functions/ConvertFunc";
import {observable} from "mobx";
import $ from "jquery";
import {uploadImage} from "../../../../common/functions/UpfileFunc";

interface IImage {
    src: string
    file: File
}

interface IPopupShippingProps {
    onSubmit: (data: { state: 'SHIPPING' | 'SHIPPED' | 'CANCELED', agencyName?: string, shippingCode?: string | null, proofImages?: string[] }) => any
}

const MAX_SIZE_MB: number = 2;
const DVVC: string[] = ['GHTK', 'GHN', 'J&T'];

@observer
export default class PopupShipping extends React.Component<IPopupShippingProps, any> {
    private ref = React.createRef<HTMLDivElement>();
    @observable type: 'SHIPPING' | 'SHIPPED' | 'CANCELED' = "SHIPPING";

    @observable images: IImage[] = [];

    @observable dvvc: string | undefined | 'other' = undefined;

    @observable code: string = '';

    @observable name?: string = undefined;

    @observable inputKey = Date.now();

    public show(type: 'SHIPPING' | 'SHIPPED' | 'CANCELED', dvvc?: string, code?: string) {
        this.type = type;
        this.images = [];
        this.dvvc = undefined;
        this.code = '';
        this.name = '';
        if (code) this.code = code;
        if (dvvc) {
            const index_search = DVVC.findIndex(value => value === dvvc);
            if (index_search !== -1) this.dvvc = dvvc;
            else {
                this.dvvc = "other";
                this.name = dvvc;
            }
        }
        $(this.ref.current as any).modal({show: true, backdrop: "static"});
    }

    public hidden() {
        $(this.ref.current as any).modal("hide");
    }

    protected async handlerOnUploadLocalImage(e: any) {
        const file_list: FileList = e.currentTarget.files;

        const func_validateImage = (file: File, warring: boolean = true): boolean => {
            if (file.size > MAX_SIZE_MB * (1000000)) {
                warring && notify.show(`Ảnh vượt quá dung lượng cho phép. Vui lòng tải lên ảnh <= ${MAX_SIZE_MB}MB`, "error");
                return false;
            }
            return true;
        };

        const func_to_base64 = (file: File): Promise<string> => {
            return new Promise<string>((resolve, reject) => {
                try {
                    const fr = new FileReader();
                    fr.onload = () => {
                        const img = new Image();
                        img.onload = () => {
                            resolve(img.src);
                        };
                        typeof fr.result === "string" && (img.src = fr.result);
                    };
                    fr.readAsDataURL(file);
                } catch (e) {
                    reject(e);
                }
            });
        }

        if (file_list.length === 1) {
            let file: File = file_list[0];
            file = new File([file], file.name, {type: file.type});
            if (func_validateImage(file)) {
                const local_url = convertBase64ToBlobUrl(await func_to_base64(file));
                this.images.push({
                    file: file,
                    src: local_url
                });
            }
        } //
        else if (file_list.length > 1) {
            const keys = Object.keys(file_list);
            keys.map(async (value: any) => {
                let file = new File([file_list[value]], file_list[value].name, {type: file_list[value].type});
                if (func_validateImage(file, false)) {
                    const local_url = convertBase64ToBlobUrl(await func_to_base64(file));
                    if (this.images.length < 5) {
                        this.images.push({
                            file: file,
                            src: local_url
                        });
                    }
                }
                return null;
            });
        }

        this.inputKey = Date.now();
    }

    protected handlerOnClose() {
        setTimeout(() => this.images = [], 400);
    }

    protected handlerOnRemoveImage(index: number) {
        this.images.splice(index, 1);
    }

    protected handlerOnChangeDvvc(e: any) {
        let value = e.currentTarget.value;
        if (value === "undefined") this.dvvc = undefined;
        else if (value === "other") this.dvvc = "other";
        else this.dvvc = value;
    }

    protected async handerOnSubmit() {
        if (this.type !== "CANCELED") {
            if (!this.dvvc) {
                notify.show('Vui lòng chọn đơn vị vận chuyển', "error");
                return
            } else if (this.dvvc === "other" && !this.name) {
                notify.show('Vui lòng nhập tên đơn vị vận chuyển', "error");
                return;
            }
        }
        const images_valid: IImage[] = [];
        this.images.map(value => value && images_valid.push(value));
        if (images_valid.length === 0) {
            notify.show('Vui lòng tải lên ít nhất 1 hình ảnh minh chứng', "error");
            return;
        } else {
            const upload_image_async: Promise<string>[] = [];
            images_valid.map(value => upload_image_async.push(new Promise<string>((resolve, reject) => {
                uploadImage(value.file, "uploadCover")
                    .then(next => resolve(next.url))
                    .catch(e => reject(e));
            })));
            const image_url: string[] = await Promise.all(upload_image_async);
            this.props.onSubmit({
                agencyName: this.dvvc === "other" ? this.name as string : this.dvvc as string,
                proofImages: image_url,
                shippingCode: this.code ? this.code : null,
                state: this.type
            });
        }
    }

    render() {
        return <div className="modal fade" id="popup-seller-shipping" ref={this.ref}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="font-weight-bold text-center">{this.getTitle}</h4>
                    </div>
                    <div className="modal-body">
                        {this.renderFormInput}
                        {this.renderImages}
                    </div>
                    <div className="modal-footer">
                        <p className="text-left">Lưu ý: Click xác nhận là đơn hàng sẽ đổi trạng thái và thông báo cho người mua hàng.</p>
                        <button className="btn btn-primary" onClick={() => this.handerOnSubmit()}>Xác nhận</button>
                        <button className="btn btn-default" data-dismiss="modal" onClick={() => this.handlerOnClose()}>Hủy</button>
                    </div>
                </div>
            </div>
        </div>;
    }

    protected get getTitle(): string | null {
        if (this.type === "SHIPPING")
            return "Đi giao hàng";
        else if (this.type === "CANCELED")
            return "Hủy giao hàng";
        else if (this.type === "SHIPPED")
            return "Đã giao hàng"
        return null //default;
    }

    protected get renderFormInput(): React.ReactNode {
        if (this.type !== "CANCELED")
            return <div>
                <div className="form-group">
                    <div>
                        <label>Bên trung gian VC</label>
                        {/*<p>(Nếu có)</p>*/}
                    </div>
                    <select className="form-control"
                            key={this.dvvc}
                            defaultValue={this.dvvc}
                            disabled={this.type !== "SHIPPING"}
                            onChange={e => this.handlerOnChangeDvvc(e)}
                    >
                        <option value="undefined">---Lựa chọn---</option>
                        {DVVC.map((value, index) => <option value={value} key={index}>{value}</option>)}
                        <option value="other">Khác</option>
                    </select>
                </div>
                {this.dvvc === "other" && <div className="form-group">
                    <label>Nhập tên ĐVVC</label>
                    <input
                        className="form-control"
                        type="text"
                        value={this.name || ''}
                        disabled={this.type !== "SHIPPING"}
                        onChange={e => this.name = e.currentTarget.value}
                    />
                </div>}
                <div className="form-group">
                    <label>Mã vận đơn</label>
                    <input
                        className="form-control"
                        type="text"
                        value={this.code}
                        disabled={this.type !== "SHIPPING"}
                        onChange={e => this.code = e.currentTarget.value}
                    />
                </div>
            </div>
        return null; //default
    }

    protected get renderImages(): React.ReactNode {
        return <div className="box-images">
            {this.type !== "CANCELED" && <p>Tải hình ảnh để chứng thực (Tối thiểu 01, tối đa 5 ảnh)</p>}
            {this.type === "CANCELED" && <p>Tải hình ảnh xác thực (dẫn chứng chứng thực ĐH bị hủy không do cửa hàng chủ định)</p>}
            <ul>
                {this.images.map((value, index) => <li key={index}>
                    <img src={value.src} alt={value.src}/>
                    <button onClick={() => this.handlerOnRemoveImage(index)}><i className="fas fa-trash"/></button>
                </li>)}
                {this.images.length < 5 && <li>
                    <input type="file"
                           accept='image/png,image/jpeg'
                           key={this.inputKey}
                           multiple={true}
                           onChange={e => this.handlerOnUploadLocalImage(e)}/>
                    <i className="fas fa-plus"/>
                </li>}
            </ul>
        </div>
    }
}