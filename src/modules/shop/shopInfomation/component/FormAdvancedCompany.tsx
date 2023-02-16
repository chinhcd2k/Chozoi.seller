import {observer} from "mobx-react";
import React, {SyntheticEvent} from "react";
import {observable} from "mobx";
import {getImageSrcWithFile, uploadImage} from "../../../../common/functions/UpfileFunc";
import {store} from "../../stores/ShopInfomationStore";
import {handlerRequestError, putRequest} from "../../../../common/services/BaseService";
import {notify} from "../../../../common/notify/NotifyService";
import {Button as ButtonAntd, Form as FormAntd, Input as InputAntd} from "antd";
import {css} from "@emotion/core";
import {Input} from "../../../../common/form";
import {IResShopProfile} from "../../../../api/shop/interfaces/response";

@observer
export default class FormAdvancedCompany extends React.Component<any, any> {
    @observable disabled: boolean = false;
    @observable images: [{ file?: File, src?: string }, { file?: File, src?: string }] = [{}, {}];
    @observable keyInput: number = Date.now();

    async handlerOnSubmit(data: any) {
        this.disabled = true;
        const srcImage = {
            frontPhotoBusinessLicenseUrl: "",
            backPhotoBusinessLicenseUrl: ""
        }
        const asyncUpload: Promise<string>[] = [];
        this.images.map((value, index) => {
            if (value.file) {
                asyncUpload.push(new Promise<string>((resolve, reject) => {
                    uploadImage(value.file as File, "uploadCover").then(next => {
                        if (!index) srcImage.frontPhotoBusinessLicenseUrl = next.url;
                        else srcImage.backPhotoBusinessLicenseUrl = next.url;
                        resolve();
                    }).catch(e => {
                        console.error(e);
                        reject(e);
                    })
                }));
                value.file = undefined;
            }
        });
        await Promise.all(asyncUpload);
        data.frontPhotoBusinessLicenseUrl = srcImage.frontPhotoBusinessLicenseUrl;
        data.backPhotoBusinessLicenseUrl = srcImage.backPhotoBusinessLicenseUrl;
        const {id} = store.shopProfile as IResShopProfile;
        const res = await putRequest(`/v1/shops/${id}/advancedInfo?type=company`, data);
        this.disabled = false;
        if (res.status === 200) {
            notify.show("Cập nhật thông tin thành công", "success");
            await store.getShopInfoAdvancedNow("COMPANY");
        } else handlerRequestError(res);
    }

    async handlerOnUpload(event: SyntheticEvent<HTMLInputElement>, index: 0 | 1) {
        const file = (event.currentTarget.files as any)[0];
        this.images[index] = {
            file: new File([file], file.name, {type: "image/png"}),
            src: await getImageSrcWithFile(file) as string
        };
        this.keyInput = Date.now();
    }

    render() {
        const {Item} = FormAntd;
        const uploadImageStyle = css`
            div.add {
                border: dashed 1px #1976d2;
                min-height: 300px;
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                
                i.fa-upload {
                    color: #1976d2;
                }
                
                input {
                    opacity: 0;
                    position: absolute;
                    top: 0; right: 0; bottom: 0; left: 0;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }
            }
            div.image {
                border: solid 1px #1976d2;
                height: 300px;
                position: relative;
                
                img {
                    max-width: 100%;
                    max-height: 100%;
                }
                
                div.action {
                    position: absolute;
                    top: 0; right: 0; bottom: 0; left: 0;
                    display: none;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background-color: rgba(0,0,0,.25);
                    cursor: pointer;
                    
                    i {
                        background-color: white;
                        color: red;
                        padding: 8px;
                    }
                }
                
                &:hover div.action {
                    display: flex;
                }
            }
        `;
        const {shopType} = store.shopProfile as IResShopProfile;
        if (shopType === "COMPANY" && store.infoAdvancedCompany) {
            const {name, businessOwnerName, taxCode, state} = store.infoAdvancedCompany;
            return <div id="senior_information_manage">
                <div className="title d-flex">
                    <div className="w-50 top-left">
                        <h4 className="card-body__title">
                            <i className="fa fa-info mr-2">
                            </i> Quản lý thông tin nâng cao</h4>
                        <span>Để đăng bán đấu giá bạn cần phải thêm đầy đủ thông tin xác minh cá nhân/doanh nghiệp</span>
                    </div>
                    <div className="verification w-50 text-right">
                        {state === 'WAIT_CONFIRMED' &&
                        <div className="wait_confirmed">
                            <span>Chờ xác minh</span>
                        </div>}
                        {state === "NON_VERIFIED" &&
                        <div className="non_verified">
                            <span>Chưa xác minh</span>
                            <p>Thông tin hình ảnh không rõ ràng, đề nghị quý cửa hàng cập nhập lại hình ảnh</p>
                        </div>}
                        {state === 'VERIFIED' &&
                        <div className="verified">
                            <i className="fa fa-check"></i>
                            <span>Đã xác minh</span>
                        </div>}
                    </div>
                </div>
                <div className="pt-3">
                    <FormAntd onFinish={(data: any) => this.handlerOnSubmit(data)}>
                        <div style={{margin: "0 32px"}}>
                            <div className="row">
                                <div className="col-xs-6">
                                    <label>Tên công ty trên giấy ĐKKD</label>
                                    <Item name={"name"}
                                          initialValue={name}
                                          rules={[
                                              {required: true, message: "Không được bỏ trống"},
                                              {pattern: /^.{6,150}$/, message: "6-150 ký tự"}
                                          ]}>
                                        <InputAntd disabled={!this.isUpdate}/>
                                    </Item>
                                </div>
                                <div className="col-xs-6">
                                    <label>Số đăng ký kinh doanh</label>
                                    <Item name="taxCode"
                                          initialValue={taxCode}
                                          rules={[
                                              {required: true, message: "Không được bỏ trống"},
                                              {pattern: /^.{6,20}$/, message: "6-20 ký tự"}
                                          ]}>
                                        <InputAntd disabled={!this.isUpdate}/>
                                    </Item>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xs-6">
                                    <label>Tên đại diện theo pháp luật</label>
                                    <Item name={"businessOwnerName"}
                                          initialValue={businessOwnerName}
                                          rules={[
                                              {required: true, message: "Không được bỏ trống"},
                                              {pattern: /^.{6,150}$/, message: "6-150 ký tự"}
                                          ]}>
                                        <InputAntd disabled={!this.isUpdate}/>
                                    </Item>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xs-12">
                                    <label>Bản scan giấy đăng ký kinh doanh</label>
                                    <p>(Đủ các mặt)</p>
                                </div>
                            </div>
                            <div className="row" css={uploadImageStyle} key={this.keyInput}>
                                <div className="col-xs-6">
                                    {!this.images[0].file && !this.images[0].src && <div className="add">
                                        <input type="file"
                                               accept={"image/jpeg, image/png"}
                                               onChange={e => this.handlerOnUpload(e, 0)}/>
                                        <i className="fal fa-upload fa-2x"/>
                                        <Item name={"frontPhotoBusinessLicenseUrl"}
                                              rules={[{required: true, message: "Không được bỏ trống"}]}>
                                            <Input type={"file"}/>
                                        </Item>
                                    </div>}
                                    {this.images[0].src && <div className="image">
                                        <img src={this.images[0].src} alt="img-1"/>
                                        {this.isUpdate && <div className="action">
                                            <i className="fas fa-trash fa-2x" onClick={() => this.images[0] = {}}/>
                                        </div>}
                                    </div>}
                                </div>
                                <div className="col-xs-6">
                                    {!this.images[1].file && !this.images[1].src && <div className="add">
                                        <input type="file"
                                               accept={"image/jpeg, image/png"}
                                               onChange={e => this.handlerOnUpload(e, 1)}/>
                                        <i className="fal fa-upload fa-2x"/>
                                        <Item name={"backPhotoBusinessLicenseUrl"}
                                              rules={[{required: true, message: "Không được bỏ trống"}]}>
                                            <Input type={"file"}/>
                                        </Item>
                                    </div>}
                                    {this.images[1].src && <div className="image">
                                        <img src={this.images[1].src} alt="img-1"/>
                                        {this.isUpdate && <div className="action">
                                            <i className="fas fa-trash fa-2x" onClick={() => this.images[1] = {}}/>
                                        </div>}
                                    </div>}
                                </div>
                            </div>
                        </div>
                        {this.isUpdate && <div className="row mt-5">
                            <Item>
                                <div className="text-center">
                                    <ButtonAntd
                                        disabled={this.disabled}
                                        style={{
                                            height: "34px",
                                            backgroundColor: "#1b7ee0",
                                            borderColor: "#1b7ee0"
                                        }} type={"primary"} htmlType={"submit"}>Cập nhật</ButtonAntd>
                                </div>
                            </Item>
                        </div>}
                    </FormAntd>
                </div>
            </div>;
        } else return null;
    }

    get isUpdate(): boolean {
        if (store.infoAdvancedCompany) {
            const {state} = store.infoAdvancedCompany;
            return /^(NONE|NON_VERIFIED|REJECT)$/.test(state);
        } else return false;
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        if (!this.images[0].file && !this.images[0].src && !this.images[1].file && !this.images[1].src && store.infoAdvancedCompany) {
            const {
                frontPhotoBusinessLicenseUrl,
                backPhotoBusinessLicenseUrl
            } = store.infoAdvancedCompany;
            if (frontPhotoBusinessLicenseUrl && backPhotoBusinessLicenseUrl) {
                this.images[0].src = frontPhotoBusinessLicenseUrl;
                this.images[1].src = backPhotoBusinessLicenseUrl;
            }
        }
    }
}