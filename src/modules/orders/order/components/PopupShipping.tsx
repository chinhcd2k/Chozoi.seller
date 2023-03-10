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
                warring && notify.show(`???nh v?????t qu?? dung l?????ng cho ph??p. Vui l??ng t???i l??n ???nh <= ${MAX_SIZE_MB}MB`, "error");
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
                notify.show('Vui l??ng ch???n ????n v??? v???n chuy???n', "error");
                return
            } else if (this.dvvc === "other" && !this.name) {
                notify.show('Vui l??ng nh???p t??n ????n v??? v???n chuy???n', "error");
                return;
            }
        }
        const images_valid: IImage[] = [];
        this.images.map(value => value && images_valid.push(value));
        if (images_valid.length === 0) {
            notify.show('Vui l??ng t???i l??n ??t nh???t 1 h??nh ???nh minh ch???ng', "error");
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
                        <p className="text-left">L??u ??: Click x??c nh???n l?? ????n h??ng s??? ?????i tr???ng th??i v?? th??ng b??o cho ng?????i mua h??ng.</p>
                        <button className="btn btn-primary" onClick={() => this.handerOnSubmit()}>X??c nh???n</button>
                        <button className="btn btn-default" data-dismiss="modal" onClick={() => this.handlerOnClose()}>H???y</button>
                    </div>
                </div>
            </div>
        </div>;
    }

    protected get getTitle(): string | null {
        if (this.type === "SHIPPING")
            return "??i giao h??ng";
        else if (this.type === "CANCELED")
            return "H???y giao h??ng";
        else if (this.type === "SHIPPED")
            return "???? giao h??ng"
        return null //default;
    }

    protected get renderFormInput(): React.ReactNode {
        if (this.type !== "CANCELED")
            return <div>
                <div className="form-group">
                    <div>
                        <label>B??n trung gian VC</label>
                        {/*<p>(N???u c??)</p>*/}
                    </div>
                    <select className="form-control"
                            key={this.dvvc}
                            defaultValue={this.dvvc}
                            disabled={this.type !== "SHIPPING"}
                            onChange={e => this.handlerOnChangeDvvc(e)}
                    >
                        <option value="undefined">---L???a ch???n---</option>
                        {DVVC.map((value, index) => <option value={value} key={index}>{value}</option>)}
                        <option value="other">Kh??c</option>
                    </select>
                </div>
                {this.dvvc === "other" && <div className="form-group">
                    <label>Nh???p t??n ??VVC</label>
                    <input
                        className="form-control"
                        type="text"
                        value={this.name || ''}
                        disabled={this.type !== "SHIPPING"}
                        onChange={e => this.name = e.currentTarget.value}
                    />
                </div>}
                <div className="form-group">
                    <label>M?? v???n ????n</label>
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
            {this.type !== "CANCELED" && <p>T???i h??nh ???nh ????? ch???ng th???c (T???i thi???u 01, t???i ??a 5 ???nh)</p>}
            {this.type === "CANCELED" && <p>T???i h??nh ???nh x??c th???c (d???n ch???ng ch???ng th???c ??H b??? h???y kh??ng do c???a h??ng ch??? ?????nh)</p>}
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