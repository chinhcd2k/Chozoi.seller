import React, {SyntheticEvent} from "react";
import {observer} from "mobx-react";
import {ReactComponent as PicterSVG} from "./images.svg";
import * as Sentry from "@sentry/browser";
import $ from "jquery";
import {convertBase64ToBlobUrl} from "../../../../common/functions/ConvertFunc";
import {notify} from "../../../../common/notify/NotifyService";
import {observable} from "mobx";

export interface IImage {
    id?: number,
    src: string,
    file?: File,
    sort: number
}

const PRODUCT_IMAGE_MAX_DIMENSION: number = 1200;
const PRODUCT_IMAGE_DIMENSION: number = (window as any).PRODUCT_IMAGE_DIMENSION || 0;
const MAX_IMAGES = 10;

@observer
export default class Gallery extends React.Component<{ type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK'|'CREATE_F_N' }, object> {
    private static instance?: Gallery;
    @observable listImage: IImage[] = [];
    @observable keyInput: number = Date.now();
    @observable disabledForm: boolean = false;

    constructor(props: any) {
        super(props);
        Gallery.instance = this;
    }

    protected openFileImage() {
        $('#products-gallery input#input-image').trigger('click');
    }

    public async uploadLocalImage(evemt: SyntheticEvent<HTMLInputElement>) {
        const verifyDimensionImage = (file: File): Promise<{ name: string, image: any, width: number, height: number }> => {
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
        const autoCropImage = (value: { name: string, image: any, width: number, height: number }): Promise<any> => {
            return new Promise<any>(resolve => {
                const canvas: HTMLCanvasElement = document.createElement("CANVAS") as HTMLCanvasElement;
                const canvas1: HTMLCanvasElement = document.createElement("CANVAS") as HTMLCanvasElement;
                const ctx = canvas.getContext("2d");
                const ctx1 = canvas1.getContext("2d");
                if (ctx && ctx1) {
                    // if (ctx) {
                    let dx: number = 0;
                    let dy: number = 0;
                    /*Ảnh có 1 cạnh >= PRODUCT_IMAGE_DIMENSION*/
                    if (Math.max(value.width, value.height) >= PRODUCT_IMAGE_DIMENSION) {
                        if (value.width > value.height) dy = (value.width - value.height) / 2;
                        else if (value.width < value.height) dx = (value.height - value.width) / 2;
                        canvas.width = Math.max(value.width, value.height);
                        canvas.height = Math.max(value.width, value.height);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(value.image, 0, 0, value.width, value.height, dx, dy, value.width, value.height);
                    } else {
                        dx = (PRODUCT_IMAGE_DIMENSION - value.width) / 2;
                        dy = (PRODUCT_IMAGE_DIMENSION - value.height) / 2;
                        canvas.width = PRODUCT_IMAGE_DIMENSION;
                        canvas.height = PRODUCT_IMAGE_DIMENSION;
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(value.image, 0, 0, value.width, value.height, dx, dy, value.width, value.height);
                    }
                    canvas.toBlob(blob => {
                        if (blob) {
                            const file = new File([blob], value.name, {type: 'image/jpg'});
                            if (file.size / 1000000 > 3) {
                                canvas1.width = Math.max(PRODUCT_IMAGE_MAX_DIMENSION);
                                canvas1.height = Math.max(PRODUCT_IMAGE_MAX_DIMENSION);
                                ctx1.drawImage(canvas, 0, 0, Math.max(value.width, value.height), Math.max(value.width, value.height), 0, 0, PRODUCT_IMAGE_MAX_DIMENSION, PRODUCT_IMAGE_MAX_DIMENSION);
                                canvas1.toBlob(blob1 => {
                                    if (blob1) {
                                        const file1 = new File([blob1], value.name, {type: 'image/jpg'});
                                        resolve(file1);
                                    } else resolve();
                                });
                            } else
                                resolve(file);
                        } else resolve();
                    });
                } else resolve();
            });
        }
        const FUNC_PROCESS = (value: any, index: number): Promise<{}> => {
            return new Promise(async (resolve) => {
                let data = await verifyDimensionImage(value);
                if (data.width !== data.height || Math.max(data.width, data.height) < PRODUCT_IMAGE_DIMENSION) {
                    const file = await autoCropImage(data);
                    data = await verifyDimensionImage(file);
                    resolve({
                        file: file,
                        src: data.image.src,
                        preIndex: index
                    });
                } else {
                    resolve({
                        file: value,
                        src: data.image.src,
                        preIndex: index
                    });
                }
            });
        };
        if (this.listImage.length < MAX_IMAGES) {
            let files: any = evemt.currentTarget.files as FileList;
            files = Object.keys(files).reduce((previousValue: any[], currentValue: any, currentIndex) => {
                if (currentIndex < files.length)
                    previousValue.push(files[currentValue]);
                return previousValue;
            }, []);
            if (Array.isArray(files)) {
                if (files.length > 0) {
                    const asyncLoop: any[] = [];
                    const length = this.listImage.length;
                    files.map((value, index) => {
                        this.listImage.length < MAX_IMAGES && this.listImage.push(null as any);
                        asyncLoop.push(new Promise(async (resolve) => {
                            const response: any = await FUNC_PROCESS(value, index);
                            const position: number = length + response.preIndex;
                            if (position < MAX_IMAGES) {
                                this.listImage[position] = {
                                    file: response.file,
                                    src: convertBase64ToBlobUrl(response.src),
                                    sort: position
                                };
                            }
                            resolve();
                        }));
                        return asyncLoop;
                    });
                    await Promise.all(asyncLoop);
                }
            }
        } else
            notify.show('Chỉ có thể tối đa 10 ảnh', "error");
        this.keyInput = Date.now();
    }

    public setImageStore(images: { id: number, sort: number, imageUrl: string }[]) {
        this.listImage = [];
        images.map(value => {
            if (this.props.type === "CREATE" || this.props.type === "REPLAY"||this.props.type === "CREATE_F_N")
                this.listImage.push({sort: value.sort, src: value.imageUrl})
            else this.listImage.push({id: value.id, sort: value.sort, src: value.imageUrl});
            return value;
        });
    }

    public hasValidate(): boolean {
        if (this.listImage.length === 0) {
            notify.show('Sản phẩm phải có ít nhất 1 ảnh sản phẩm', "error");
            return false;
        }
        return true;
    }

    componentDidMount() {
        if (/^(DETAIL|REPLAY_QUICK)$/.test(this.props.type)) {
            this.disabledForm = true;
        }
    }

    render() {
        try {
            return (
                <div className="row" id="products-gallery">
                    <div className="col-xs-12 d-flex justify-content-between">
                        <h5>Ảnh sản phẩm</h5>
                        {!this.disabledForm && <div className="add-image">
                            <span className="btn btn-default fileinput-button"
                                  onClick={() => this.openFileImage()}>Thêm ảnh</span>
                            <input id="input-image" type="file"
                                   multiple={true}
                                   key={this.keyInput}
                                   accept={'image/jpeg, image/jpg, image/png'}
                                   onChange={e => this.uploadLocalImage(e)}/>
                        </div>}
                    </div>
                    <div className="col-xs-12 d-flex pr-0 justify-content-center">
                        <div className="image-container">
                            {this.listImage.length > 0 && this.listImage[0] && <div className="image-primary">
                                <img src={this.listImage[0].src} alt=""/>
                                {!this.disabledForm && <div className="action">
                                    <i className="fa fa-trash"
                                       onClick={() => this.listImage.splice(0, 1)}/>
                                </div>}
                            </div>}
                            {this.listImage.length > 0 && this.listImage[0] === null &&
                            <div className="image-primary"/>}
                            <ul className="images">
                                {this.listImage.map((value: IImage, index: number) => {
                                    if (index === 0) return null;
                                    if (value === null) return <li key={index} className="image"/>;
                                    else return <li key={index}
                                                    className="image">
                                        <img src={value.src} alt=""/>
                                        {!this.disabledForm && <div className="action">
                                            <i className="fa fa-trash"
                                               onClick={() => this.listImage.splice(index, 1)}/>
                                        </div>}
                                    </li>
                                })}
                            </ul>
                            {/*Không có dữ liệu*/}
                            {this.listImage.length === 0 &&
                            <div className="empty w-100 d-flex justify-content-center flex-wrap">
                                <PicterSVG/>
                            </div>}
                        </div>
                    </div>
                </div>
            );
        } catch (e) {
            console.error(e);
            Sentry.captureException(e);
            return null;
        }
    }

    static get getInstance(): Gallery | undefined {
        return Gallery.instance;
    }
}