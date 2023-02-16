import React, {SyntheticEvent} from "react";
import {observer} from "mobx-react";
import "./style.scss";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {css} from "@emotion/core";
import {service} from "../ShopService";
import {store, IDataWarning} from "../stores/ShopInfomationStore";
import {store as ProfileStore} from "../../profile";
import {getImageSrcWithFile, uploadImage} from "../../../common/functions/UpfileFunc";
import {notify} from "../../../common/notify/NotifyService";
import {store as HomeStore} from "../../home/stores/HomeStore";
import {FormGroup, Feedback, Form, Input, Validations} from "../../../common/form";
import NotifyWarning from "./component/NotifyWarning";
import {Form as FormAntd, Input as InputAntd, Button as ButtonAntd, Switch} from "antd";
import {observable} from "mobx";
import {handlerRequestError, putRequest} from "../../../common/services/BaseService";
import {Link} from "react-router-dom";
import FormAdvancedCompany from "./component/FormAdvancedCompany";
import {IInfoAdvancedNormal} from "../../../api/shop/interfaces/response";
import {IResProfile} from "../../../api/auth/interfaces/response";
import {getShopProfile, getStats, sendUnActiveShop} from "../../../api/shop";
import {IResShopProfile} from "../../../api/shop/interfaces/response";
import CreateIframe from "../../iframe/index"
import {getListAuction} from "../../../api/auction";
import {iframeStore} from "../../iframe/iframeStore";
const URL_HOME: string = ((window as any).DOMAIN_BUYER || 'https://dev.chozoi.com') + '/shop/overview';

interface IUploadImg {
  IFrontUploadImg: {
    fileImage: any,
    arrImage: any
  },
  IBackUploadImg: {
    fileImage: any,
    arrImage: any
  },
  keyDefault: number,
  keyToggle:number
}

@observer
export default class ShopInformation extends React.Component<IUploadImg,any> {
  @observable keyInput: number = Date.now();
  @observable images: { file?: File, src?: string }[] = [];
  @observable disabledShopProfile: boolean = false;

  constructor(props: any) {
    super(props);
    this.state = {
      IFrontUploadImg: {
        fileImage: "",
        arrImage: []
      },
      IBackUploadImg: {
        fileImages: "",
        arrImages: []
      },
      shopProfile: {
        shopAvatarUrl: '/assets/images/seller/avatar.png',
        shopCoverUrl: '/assets/images/seller/cover.png',
        imgDescriptionUrls: [],
        name: '',
        description: '',
      },
      keyDefault: 0,
      keyToggle:Math.random()
    };
    this.FrontUploadImage = this.FrontUploadImage.bind(this);
    this.BackUploadImage = this.BackUploadImage.bind(this);
    BreadcrumbsService.loadBreadcrumbs([{title: 'Quản lý thông tin'}]);
    HomeStore.menuActive = [1, 0];
    this.getShopProfile = this.getShopProfile.bind(this);
  }

  public async componentDidMount() {
    this.getDataWarnig().then();
    if (store.shopProfile) {
      await store.getShopInfoAdvancedNow(store.shopProfile.shopType);
      await this.getProductAuction(store.shopProfile.id)
      let imgDescriptionUrls: any = [];
      if (store.shopProfile.imgDescriptionUrls && store.shopProfile.imgDescriptionUrls.length > 0) {
        imgDescriptionUrls = store.shopProfile.imgDescriptionUrls.map((img: string) => {
          if (img) {
            return {
              offsetLeft: 0,
              src: img,
              ref: React.createRef()
            };
          } else {
            return null;
          }
        });
      }
      this.setState({
        shopProfile: {
          shopAvatarUrl: store.shopProfile.imgAvatarUrl,
          shopCoverUrl: store.shopProfile.imgCoverUrl,
          imgDescriptionUrls: imgDescriptionUrls,
          name: store.shopProfile.name,
          phoneNumber: store.shopProfile.phoneNumber,
          email: store.shopProfile.email,
          contactName: store.shopProfile.contactName,
          description: store.shopProfile.description,
          change: false,
        },
      });
      // pass value image
      if (store.shopProfile && Array.isArray(store.shopProfile.imgDescriptionUrls)) {
        store.shopProfile.imgDescriptionUrls.map(value => this.images.push({src: value}))
      }
    }
  }
  getProductAuction =async (shopId:number)=>{
    const response=await getListAuction(shopId);
    if (response.status===200){
      iframeStore.listProductAuction=response.body.products
    }
  }


  public IRequestInformation: IInfoAdvancedNormal = {
    name: '',
    idCard: '',
    frontPhotoIdCardUrl: '',
    backPhotoIdCardUrl: '',
  } as IInfoAdvancedNormal;

  public async getShopProfile() {
    if (ProfileStore.profile) {
      const response = await getShopProfile(ProfileStore.profile.shopId as number, ProfileStore.profile.user.id as number);
      if (response.status === 200) {
        store.shopProfile = response.body;
        let imgDescriptionUrls: any = [];
        const {shopProfile} = store;
        if (shopProfile && shopProfile.imgDescriptionUrls && shopProfile.imgDescriptionUrls.length > 0) {
          imgDescriptionUrls = shopProfile.imgDescriptionUrls.map((img: string) => {
            if (img) {
              return {
                offsetLeft: 0,
                src: img,
                ref: React.createRef()
              };
            } else {
              return null;
            }
          });
        }

        if (shopProfile) {
          this.setState({
            shopProfile: {
              shopAvatarUrl: shopProfile.imgAvatarUrl,
              shopCoverUrl: shopProfile.imgCoverUrl,
              imgDescriptionUrls: imgDescriptionUrls,
              name: shopProfile.name,
              phoneNumber: shopProfile.phoneNumber,
              email: shopProfile.email,
              contactName: shopProfile.contactName,
              description: shopProfile.description,
              change: false,
            },
          });
        }
      }
      const responseStats = await getStats(ProfileStore.profile.shopId as number);
      if (responseStats.status === 200) {
        store.shopStats = responseStats.body;

      }
    }
  }

  public async uploadImageAvatar(e: SyntheticEvent<HTMLInputElement>) {
    const file: File = (e.currentTarget.files as any)['0'];
    const {url} = await uploadImage(file, "uploadProfile");
    if (url) {
      const {
        id,
        name,
        contactName,
        imgCoverUrl,
        email,
        phoneNumber,
        description,
        imgDescriptionUrls
      } = store.shopProfile as IResShopProfile;
      const body = {
        name: name,
        contact_name: contactName,
        img_avatar_url: url,
        img_cover_url: imgCoverUrl,
        email: email,
        phone_number: phoneNumber,
        description: description,
        img_description_urls: imgDescriptionUrls
      };
      if (!body.img_cover_url) delete body.img_cover_url;
      const res = await putRequest(`/v1/shops/${id}`, body);
      if (res.status === 200) {
        const shopProfile = this.state.shopProfile;
        shopProfile.shopAvatarUrl = url;
        (store.shopProfile as IResShopProfile).imgAvatarUrl = url;
        shopProfile.change = true;
        this.setState({shopProfile: shopProfile});
      } else handlerRequestError(res);
    }
  };

  public async uploadImageCover(e: SyntheticEvent<HTMLInputElement>) {
    const file: File = (e.currentTarget.files as any)['0'];
    const {url} = await uploadImage(file, "uploadCover");
    if (url) {
      const {
        id,
        name,
        contactName,
        imgAvatarUrl,
        email,
        phoneNumber,
        description,
        imgDescriptionUrls
      } = store.shopProfile as IResShopProfile;
      const body = {
        name: name,
        contact_name: contactName,
        img_cover_url: url,
        img_avatar_url: imgAvatarUrl,
        email: email,
        phone_number: phoneNumber,
        description: description,
        img_description_urls: imgDescriptionUrls
      };
      if (!body.img_avatar_url) delete body.img_avatar_url;
      const res = await putRequest(`/v1/shops/${id}`, body);
      if (res.status === 200) {
        const shopProfile = this.state.shopProfile;
        shopProfile.shopCoverUrl = url;
        (store.shopProfile as IResShopProfile).imgCoverUrl = url;
        shopProfile.change = true;
        this.setState({shopProfile: shopProfile});
      } else handlerRequestError(res);
    }
  };

  public onChangeShopProfile(e: any, param: string) {
    const shopProfile = this.state.shopProfile;
    shopProfile[param] = e.currentTarget.value;
    shopProfile.change = true;
    this.setState({
      shopProfile: shopProfile
    });
  };

  @observable isUnactiveMode: boolean = false;
  @observable typeToggle: string = ''
  handleCheckedUnActiveMode = (checked: any) => {
    if (checked) {
      this.typeToggle = "on"
    } else this.typeToggle = "off"
  }
  handleConfirmUnActiveMode=async(status:'ON'|'OFF')=>{
    const response =  await sendUnActiveShop(status)
    if (response.status===200){
      if ( store.shopProfile){
        store.shopProfile.status=status;
        this.typeToggle='';
        this.isUnactiveMode=false
      }
    }else {
      notify.show(response.body.message,'warning',3)
      this.typeToggle='';
      this.setState({keyToggle:Math.random()})
    }
  }
  handleCancel(status:'ON'|'OFF'){
    if ( store.shopProfile){
      store.shopProfile.status=status;
      this.typeToggle='';
      this.setState({keyToggle:Math.random()})
    }
  }

  handleShopPopupUnactiveMode() {
    this.isUnactiveMode = !this.isUnactiveMode
  }

  private get renderShopInfo(): React.ReactNode {
    const {name, id, contactName, email, description, phoneNumber,status} = store.shopProfile as IResShopProfile;
    return <div className="position-relative" style={{padding: "0 32px"}}>
      <FormAntd onFinish={(data: any) => this.handlerOnUpdateShopProfile(data)}>
        <div className="row">
          <div className="col-xs-6">
            <label>Tên cửa hàng</label>
            <FormAntd.Item name="name"
                           initialValue={name}
                           rules={name ? [
                             {required: true, message: "Không được bỏ trống"},
                             {pattern: /^.{6,50}$/i, message: "Phải có từ 6 - 50 kí tự"}
                           ] : undefined}>
              <InputAntd/>
            </FormAntd.Item>
          </div>
          <div className="col-xs-6">
            <label>Tên người bán</label>
            <FormAntd.Item name="contact_name"
                           initialValue={contactName}
                           rules={contactName ? [
                             {required: true, message: "Không được bỏ trống"},
                             {pattern: /^.{6,50}$/i, message: "Phải có từ 6 - 50 kí tự"}
                           ] : undefined}>
              <InputAntd/>
            </FormAntd.Item>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-6">
            <label>Email</label>
            <FormAntd.Item name="email"
                           initialValue={email}
                           rules={email ? [{required: true, message: "Không được bỏ trống"}] : undefined}>
              <InputAntd type={"email"}/>
            </FormAntd.Item>
          </div>
          <div className="col-xs-6">
            <label>Số điện thoại</label>
            <FormAntd.Item
              name={"phone_number"}
              initialValue={phoneNumber}
              rules={phoneNumber ? [
                {required: true, message: "Không được bỏ trống"},
                {pattern: /^\d{10}$/i, message: "Phải có 10 chữ số"}
              ] : [{required: false},
                {pattern: /^\d{10}$/i, message: "Phải có 10 chữ số"}]}>
              <InputAntd/>
            </FormAntd.Item>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <Link to="/home/change-password">Thay đổi mật khẩu</Link>
            <p>(Để bảo mật tài khoản vui lòng không chia sẻ mật khẩu cho người khác)</p>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-6">
            <label>Mô tả cửa hàng</label>
            <FormAntd.Item name="description"
                           initialValue={description}
                           rules={[{max: 255, message: "Tối đa 255 ký tự"}]}>
              <InputAntd.TextArea/>
            </FormAntd.Item>
          </div>
          <div className="col-xs-6">
            <p className="mb-0">Website</p>
            <a href={`${URL_HOME}/${id}.html`} target={"_blank"}>{URL_HOME}/{id}.html</a>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            {this.renderUploadImage}
          </div>
        </div>
        <FormAntd.Item>
          <div className="text-center">
            <ButtonAntd
              disabled={this.disabledShopProfile}
              style={{
                height: "34px",
                backgroundColor: "#1b7ee0",
                borderColor: "#1b7ee0"
              }} type={"primary"} htmlType={"submit"}>Cập nhật</ButtonAntd>
          </div>
        </FormAntd.Item>
      </FormAntd>
      <div className=" position-absolute"
           onClick={() => this.handleShopPopupUnactiveMode()}
           style={{
             top: "-35px",
             right: "30px",
             border: `1px solid ${status==='ON'?'#0ab1fc':'#1976d2'}`,
             padding: "6px 8px",
             backgroundColor:`${status==='ON'?'#0ab1fc':'#1976d2'}`,
             cursor: "pointer",
             borderRadius:"4px"
           }}>
        <p style={{marginBottom: "0", color: "#FFFFFF"}}><i className="fal fa-clock"/> Chế độ tạm nghỉ{status==='ON'?" (Bật)":" (Tắt)"}</p>
      </div>
      <div className=" position-absolute"
                  style={{
                    top: "-39px",
                    right: "300px",
                    padding: "6px 8px",
                    cursor: "pointer",
                    borderRadius:"4px"
                  }}>
        <CreateIframe shopId={id}/>
    </div>
    </div>
  }

  private verifyDimensionImg(file: any): Promise<{ image: any, width: number, height: number }> {
    return new Promise(resolve => {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          resolve({image: img, width: img.width, height: img.height});
        };
        typeof fr.result === "string" && (img.src = fr.result);
      };
      fr.readAsDataURL(file);
    });
  }

  private async BackUploadImage(files: any[]) {
    if (files.length > 0) {
      const data = await this.verifyDimensionImg(files[0]);
      let arr = this.state.IBackUploadImg.arrImages;
      arr.push(data.image.src);
      if (arr.length <= 1) {
        this.setState({
          IBackUploadImg: {
            arrImages: arr,
            fileImages: files
          }
        });
      }
    }

  }

  private async FrontUploadImage(files: any[]) {
    if (files.length > 0) {
      const data = await this.verifyDimensionImg(files[0]);
      let arr = this.state.IFrontUploadImg.arrImage;
      arr.push(data.image.src);
      if (arr.length <= 1) {
        this.setState({
          IFrontUploadImg: {
            arrImage: arr,
            fileImage: files
          }
        });
      }
    }
  }

  private async updateInformation() {
    let BackImg = this.state.IBackUploadImg.fileImages;
    let FrontImg = this.state.IFrontUploadImg.fileImage;
    if (ProfileStore.profile && store.shopProfile && store.infoAdvancedNormal) {
      if (store.infoAdvancedNormal.frontPhotoIdCardUrl && store.infoAdvancedNormal.backPhotoIdCardUrl) {
        this.IRequestInformation.frontPhotoIdCardUrl = store.infoAdvancedNormal.frontPhotoIdCardUrl;
        this.IRequestInformation.backPhotoIdCardUrl = store.infoAdvancedNormal.backPhotoIdCardUrl;
        const response = await service.updateInformationAdvanced(ProfileStore.profile.shopId as number, this.IRequestInformation, store.shopProfile.shopType);
        if (response.status === 200) {
          store.infoAdvancedNormal = response.body;
          await store.getShopInfoAdvancedNow(store.shopProfile.shopType);
          notify.show("Đã gửi yêu cầu xác minh", 'success');
        } else if (response.body.message && typeof response.body.message === "string")
          notify.show(response.body.message, 'error');
        else
          notify.show('Đã có lỗi xảy ra!', "error");
      } else if (!store.infoAdvancedNormal.backPhotoIdCardUrl && store.infoAdvancedNormal.frontPhotoIdCardUrl) {
        if (!BackImg) {
          notify.show('Vui lòng tải ảnh lên!', "error");
        } else {
          const BackResponse: { url: string } = await uploadImage(BackImg, "uploadCover") as any;
          this.IRequestInformation.backPhotoIdCardUrl = BackResponse.url;
          this.IRequestInformation.frontPhotoIdCardUrl = store.infoAdvancedNormal.frontPhotoIdCardUrl;
          const response = await service.updateInformationAdvanced(ProfileStore.profile.shopId as number, this.IRequestInformation, store.shopProfile.shopType);
          if (response.status === 200) {
            store.infoAdvancedNormal = response.body;
            await store.getShopInfoAdvancedNow(store.shopProfile.shopType);
            notify.show("Đã gửi yêu cầu xác minh", 'success');
          } else if (response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, 'error');
          else
            notify.show('Đã có lỗi xảy ra!', "error");
        }
      } else if (!store.infoAdvancedNormal.frontPhotoIdCardUrl && store.infoAdvancedNormal.backPhotoIdCardUrl) {
        if (!FrontImg) {
          notify.show('Vui lòng tải ảnh lên!', "error");
        } else {
          const FrontResponse: { url: string } = await uploadImage(FrontImg, "uploadCover") as any;
          this.IRequestInformation.frontPhotoIdCardUrl = FrontResponse.url;
          this.IRequestInformation.backPhotoIdCardUrl = store.infoAdvancedNormal.backPhotoIdCardUrl;
          const response = await service.updateInformationAdvanced(ProfileStore.profile.shopId as number, this.IRequestInformation, store.shopProfile.shopType);
          if (response.status === 200) {
            await store.getShopInfoAdvancedNow(store.shopProfile.shopType);
            store.infoAdvancedNormal = response.body;
            notify.show("Đã gửi yêu cầu xác minh", 'success');
          } else if (response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, 'error');
          else
            notify.show('Đã có lỗi xảy ra!', "error");
        }
      } else {
        if (!BackImg || !FrontImg) {
          notify.show('Vui lòng tải ảnh lên!', "error");
        } else {
          const FrontResponse: { url: string } = await uploadImage(FrontImg, "uploadCover") as any;
          const BackResponse: { url: string } = await uploadImage(BackImg, "uploadCover") as any;
          this.IRequestInformation.frontPhotoIdCardUrl = FrontResponse.url;
          this.IRequestInformation.backPhotoIdCardUrl = BackResponse.url;
          const response = await service.updateInformationAdvanced(ProfileStore.profile.shopId as number, this.IRequestInformation, store.shopProfile.shopType);
          if (response.status === 200) {
            await store.getShopInfoAdvancedNow(store.shopProfile.shopType);
            store.infoAdvancedNormal = response.body;
            notify.show("Đã gửi yêu cầu xác minh", 'success');
          } else if (response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, 'error');
          else notify.show('Đã có lỗi xảy ra!', "error");
        }
      }

    }
  }

  FrontRemoveImage(id: number) {
    const arr = this.state.IFrontUploadImg.arrImage;
    arr.map((item: any, i: any) => {
      if (i === id) {
        arr.splice(i, 1);
        this.setState({
          IFrontUploadImg: {arrImage: arr}
        });
      }
    })
  }

  BackRemoveImage(id: number) {
    const arr = this.state.IBackUploadImg.arrImages;
    arr.map((item: any, i: any) => {
      if (i === id) {
        arr.splice(i, 1);
        this.setState({
          IBackUploadImg: {arrImages: arr}
        });

      }
    })
  }

  deleteFrontImgNormal() {
    if (store.infoAdvancedNormal)
      store.infoAdvancedNormal.frontPhotoIdCardUrl = ''
  }

  deleteBackImgNormal() {
    if (store.infoAdvancedNormal)
      store.infoAdvancedNormal.backPhotoIdCardUrl = '';
  }

  async handlerOnCancerRequest() {
    const {id} = (store.shopProfile as IResShopProfile);
    const response = await putRequest(`/v1/shops/${id}/profile/state`, {state: "canceled"});
    if (response.status === 200) {
      notify.show("Hủy yêu cầu xác minh thành công!", "success");
      if (store.infoAdvancedNormal)
        store.infoAdvancedNormal.state = "CANCELED";
    } else handlerRequestError(response);
  }

  async getDataWarnig() {
    if (ProfileStore.profile) {
      const response = await service.getDataWarning(ProfileStore.profile.shopId + '');
      if (response.status === 200) {
        let data: IDataWarning [] = [];
        data.push(response.body.bankCardMap);
        data.push(response.body.contact);
        data.push(response.body.description);
        data.push(response.body.email);
        data.push(response.body.idCard);
        data.push(response.body.phone);
        store.dataWarning = data;
      }
    }
  }

  getContentNotifyWarning = (data_warning: IDataWarning [], type: 'description' | 'email' | 'idCard' | 'phone'): string => {
    let result: string = "";
    data_warning.map((value) => {
      if (value !== undefined) {
        if ((value.type === type && !value.status)) {
          result = result + value.description;
        }
      }
    })
    return result;
  }

  async handlerOnUpdateShopProfile(formData: any) {
    Object.keys(formData).map(key => !formData[key] && delete formData[key]);
    let imagesSrc: string[] | null = null;
    if (this.images.length > 0) {
      const asyncUpload: Promise<string>[] = [];
      this.images.map(value => asyncUpload.push(new Promise<string>((resolve, reject) => {
        if (!value.file) resolve(value.src);
        else uploadImage(value.file, "uploadCover").then(next => resolve(next.url)).catch(e => reject(e));
      })));
      imagesSrc = await Promise.all(asyncUpload);
    }
    const {imgAvatarUrl, imgCoverUrl} = store.shopProfile as IResShopProfile;
    const body = {
      ...formData,
      img_description_urls: imagesSrc ? imagesSrc : undefined,
      img_avatar_url: imgAvatarUrl,
      img_cover_url: imgCoverUrl
    }
    !body.img_description_urls && delete body.img_description_urls;
    const {shopId} = ProfileStore.profile as IResProfile;
    if (store.shopProfile?.description) {
      if (body.description) {
        this.disabledShopProfile = true;
        const response = await putRequest(`/v1/shops/${shopId}`, body);
        this.disabledShopProfile = false;
        if (response.status === 200) {
          notify.show("Cập nhật thành công", "success");
          await store.getShopProfileNow();
        } else handlerRequestError(response);
      } else notify.show("Vui lòng nhập mô tả cửa hàng!", "error");
    } else {
      const response = await putRequest(`/v1/shops/${shopId}`, body);
      this.disabledShopProfile = false;
      if (response.status === 200) {
        notify.show("Cập nhật thành công", "success");
        await store.getShopProfileNow();
      } else handlerRequestError(response);
    }
  }

  get renderStatus(): React.ReactNode {
    const {user: {state}} = (ProfileStore.profile as IResProfile);
    switch (state) {
      case "PENDING":
        return <span className="text-bold text-warning text-uppercase">
                    <i className="fa fa-ellipsis-h"
                       aria-hidden="true"/> Chờ duyệt</span>;
      case "REJECT":
        return <span className="text-bold text-danger text-uppercase">
                    <i className="fa fa-ban"
                       aria-hidden="true"/> Bị từ chối</span>;
      case "APPROVED":
        return <span className="text-bold text-success text-uppercase">
                    <i className="fa fa-check-circle"
                       aria-hidden="true"/> Đã duyệt</span>;
      default:
        return null;
    }
  }

  get renderFormAdvancedNormal(): React.ReactNode {
    const {shopType} = (store.shopProfile as IResShopProfile);
    if (store.infoAdvancedNormal && (shopType === "NORMAL" || shopType === "HOUSEHOLD")) {
      const {state, name, idCard, frontPhotoIdCardUrl, backPhotoIdCardUrl} = store.infoAdvancedNormal;
      const detailFlag = /^(VERIFIED|WAIT_CONFIRMED)$/.test(state);
      return <Form id="senior_information_manage" onSubmit={() => this.updateInformation()}>
        <div className="title d-flex">
          <div className="w-50 top-left">
            <h4 className="card-body__title">
              <i className="fa fa-info mr-2">
              </i> Quản lý thông tin nâng cao</h4>
            <span>Để đăng bán đấu giá bạn cần phải thêm đầy đủ thông tin xác minh cá nhân/doanh nghiệp</span>
          </div>
          <div className="verification w-50 text-right">
            {
              state === 'WAIT_CONFIRMED' &&
              <div className="WAIT_CONFIRMED">
                  <span>Chờ xác minh</span>
              </div>
            }
            {
              state === "NON_VERIFIED" &&
              <div className="non_verified">
                  <span>Chưa xác minh</span>
                  <p>Thông tin hình ảnh không rõ ràng, đề nghị quý cửa hàng cập nhập lại hình ảnh</p>
              </div>
            }
            {
              state === "VERIFIED" &&
              <div className="verified">
                  <i className="fa fa-check">
                  </i>
                  <span>Đã xác minh</span>
              </div>
            }
          </div>
        </div>
        <div className="personal_account_verification">
          <div className="d-flex">
            <FormGroup className="name">
              <div className="_label">
                <p>Họ và tên</p>
              </div>
              {
                detailFlag &&
                <div className="form-input">
                    <Input type="text" className="form-control"
                           disabled={true}
                           defaultValue={name}/>
                </div>
              }
              {
                !detailFlag &&
                <div className="form-input">
                    <Input type="text"
                           defaultValue={name}
                           onChange={(e: any) => this.IRequestInformation.name = e.currentTarget.value}
                           className="form-control"
                           validations={[new Validations(Validations.minLength(1), 'Vui lòng nhập họ và tên'),]}/>
                    <Feedback className="error" invalid={"true"}/>
                </div>
              }
            </FormGroup>
            <FormGroup className="tax_code">
              <div className="_label">
                <p>Số CMND hoặc thẻ căn cước</p>
              </div>
              {
                detailFlag &&
                <div className="form-input">
                    <Input type="text"
                           className="form-control"
                           disabled={true}
                           defaultValue={idCard}/>
                </div>
              }
              {
                !detailFlag &&
                <div className="form-input">
                    <Input type="text"
                           className="form-control"
                           defaultValue={store.infoAdvancedNormal ? store.infoAdvancedNormal.idCard : ''}
                           onChange={(e: any) => this.IRequestInformation.idCard = e.currentTarget.value}
                           validations={[new Validations(Validations.minLength(1), 'Vui lòng nhập số CMND hoặc thẻ căn cước'),]}/>
                    <Feedback className="error" invalid={"true"}/>
                </div>
              }
            </FormGroup>
          </div>
          <FormGroup className="update">
            <div className="_label">
              <p>Cập nhập chứng minh nhân dân hoặc thẻ căn cước</p>
            </div>
            <div className="content w-100 d-flex">
              {
                detailFlag &&
                <div className="mr-5 w-50">
                    <div className="image p-3 d-flex justify-content-center align-items-center">
                        <img className="w-100"
                             src={frontPhotoIdCardUrl}
                             alt=""/>
                    </div>
                </div>
              }
              {
                !detailFlag &&
                <div className="upload-img mr-5 w-50">
                  {
                    frontPhotoIdCardUrl &&
                    <div className="image p-3 d-flex justify-content-center align-items-center">
                        <img className="w-100"
                             src={frontPhotoIdCardUrl}
                             alt=""/>
                        <div onClick={() => this.deleteFrontImgNormal()}
                             className="delete position-absolute justify-content-center text-center btn">
                            <i className="fa fa-trash-o" aria-hidden="true"/>
                            <span>Xóa bỏ</span>
                        </div>
                    </div>
                  }
                  {
                    this.state.IFrontUploadImg.arrImage.map((value: any, key: any) =>
                      <div key={key}
                           className="image p-3 d-flex justify-content-center align-items-center">
                        <img src={value} alt=""/>
                        <div onClick={() => this.FrontRemoveImage(key)}
                             className="delete position-absolute justify-content-center text-center btn">
                          <i className="fa fa-trash-o" aria-hidden="true"/>
                          <span>Xóa bỏ</span>
                        </div>
                      </div>
                    )
                  }
                    <div className="input-file pr-3">
                        <input type="file" className="my-file"
                               onChange={(e: any) => this.FrontUploadImage(e.currentTarget.files)}/>
                        <label htmlFor="my-file" className="upload-image text-center">
                            <i className="fa fa-upload">
                            </i>
                            <p>Tải lên mặt trước của CMND hoặc thẻ căn cước</p>
                            <span>Tối đa 1 file ảnh và có dung lượng tối đa 1 MB</span>
                        </label>
                    </div>
                </div>
              }
              {
                detailFlag &&
                <div className="ml-5 w-50">
                    <div className="image p-3 d-flex justify-content-center align-items-center">
                        <img className="w-100"
                             src={backPhotoIdCardUrl}
                             alt=""/>
                    </div>
                </div>
              }
              {
                !detailFlag &&
                <div className="upload-img w-50 ml-5">
                  {
                    backPhotoIdCardUrl &&
                    <div className="image p-3 d-flex justify-content-center align-items-center">
                        <img className="w-100"
                             src={backPhotoIdCardUrl}
                             alt=""/>
                        <div onClick={() => this.deleteBackImgNormal()}
                             className="delete position-absolute justify-content-center text-center btn">
                            <i className="fa fa-trash-o" aria-hidden="true"/>
                            <span>Xóa bỏ</span>
                        </div>
                    </div>
                  }
                  {this.state.IBackUploadImg.arrImages.map((value: any, key: any) =>
                    <div key={key}
                         className="image p-3 d-flex justify-content-center align-items-center">
                      <img src={value} alt=""/>
                      <div onClick={() => {
                        this.BackRemoveImage(key)
                      }}
                           className="delete position-absolute justify-content-center text-center btn">
                        <i className="fa fa-trash-o" aria-hidden="true"/>
                        <span>Xóa bỏ</span>
                      </div>
                    </div>
                  )}
                    <div className="input-file">
                        <input type="file" className="file"
                               onChange={(e: any) => this.BackUploadImage(e.currentTarget.files)}/>
                        <label htmlFor="file" className="upload-image text-center">
                            <i className="fa fa-upload">
                            </i>
                            <p>Tải lên mặt sau của CMND hoặc thẻ căn cước</p>
                            <span>Tối đa 1 file ảnh và có dung lượng tối đa 1 MB</span>
                        </label>
                    </div>
                </div>
              }
            </div>
          </FormGroup>

          {
            state === "WAIT_CONFIRMED" &&
            <FormGroup className="send_require text-center">
                <button onClick={() => this.handlerOnCancerRequest()}
                        type="button"
                        className="btn">Hủy yêu cầu
                    xác minh
                </button>
            </FormGroup>
          }
          {
            !detailFlag &&
            <FormGroup className="send_require text-center">
                <button type={"submit"} className="btn">Gửi yêu cầu xác minh</button>
            </FormGroup>
          }
        </div>
      </Form>
    } else return null;
  }

  render(): React.ReactNode {
    const profileCss = css`
      .cover {
        width: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
      }

      .cover::after {
        content: "";
        display: block;
        padding-top: 25%;
      }

      .avatar {
        position: absolute;
        bottom: 0;
        max-width: 120px;
        margin: 5px;
        border: 4px solid #fff;
        border-radius: 100%;
      }

      .card-body__title {
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 1rem;
        font-weight: 400;
      }

      .form-control[readonly] {
        background-color: #fff;
        border: none;
      }

      .profile__img__edit {
        position: absolute;
        font-size: 1.5rem;
        bottom: 20px;
        left: 47px;
        background-color: rgba(0, 0, 0, .4);
        width: 35px;
        height: 35px;
        line-height: 35px;
        border-radius: 50%;
        color: #FFF;
        display: flex;
        opacity: 0;
      }

      .profile__img__edit:hover {
        cursor: pointer;
      }

      .profile__img__edit:focus {
        outline: 0;
      }

      .profile__img__edit:before {
        text-align: center;
      }

      .profile__img__edit input {
        position: absolute;
        z-index: -1;
        opacity: 0;
      }

      .cover:hover .profile__img__edit {
        opacity: 1;
      }

      .cover__img__edit {
        position: absolute;
        background-color: rgba(0, 0, 0, .6);
        font-size: 1.5rem;
        height: 30px;
        line-height: 30px;
        color: #FFF;
        top: 45%;
        left: 40%;
        padding: 0 10px;
        display: flex;
        opacity: 0;
      }

      .cover__img__edit input {
        opacity: 0;
        width: 100%;
        margin-left: -10px;
        position: absolute;
      }

      .cover__img__edit:before {
        margin-right: 5px;
        font-size: 2rem;
      }

      .cover__img__edit input:hover {
        cursor: pointer;
      }

      .cover:hover .cover__img__edit {
        opacity: 1;
        border: 1px solid;
      }

      .unactive-mode {
        position: fixed;
        top: 40%;
        left: 40%;
        background-color: #FFFFFF;
        width: 500px;
        height: 200px;
        padding: 20px 15px;
        z-index: 1000;

        .exit {
          top: -15px;
          right: 0;
          font-size: 20px;
          cursor: pointer;
        }

        .content {
          .popup-confirm {
            top: 0px;
            left: 80px;
            background-color: #FFFFFF;
            border: 1px solid #FFFFFF;
            box-shadow: 0px 3px 8px 4px #e1e1e1;
            border-radius: 4px;
            width: 300px;
            height: 200px;
            z-index: 1001;
            .title{
              margin-top: 30px;
            }
            .btn-unactive{
              button{
                background-color: #FFFFFF;
                border: 1px solid #0ab1fc;
                color: #0ab1fc;
                margin-right: 20px;
                border-radius: 4px;
                &:hover{
                  background-color:#0ab1fc ;
                  color: #FFFFFF;
                }
              }
            }
          }
        }
        .image{
          img{
            width: 250px;
          }
        }
      }

      .nen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 1000px;
        background-color: #ecf0f5a3;
        z-index: 1000;
      }

      img {
        max-width: 100%;
      }`;
    const {status}=(store.shopProfile as IResShopProfile);
    return <>
      <div className="container" css={profileCss}>
        <NotifyWarning style={{
          marginBottom: "20px"
        }} content1={this.getContentNotifyWarning(store.dataWarning, "description")}
                       content2={this.getContentNotifyWarning(store.dataWarning, "email")}
                       content3={this.getContentNotifyWarning(store.dataWarning, "idCard")}
                       content4={this.getContentNotifyWarning(store.dataWarning, "phone")}
        />
        {/*Header*/}
        <div className="card mb-2">
          <div className="cover"
               style={{backgroundImage: `URL(${this.state.shopProfile.shopCoverUrl ? this.state.shopProfile.shopCoverUrl : '/assets/images/seller/cover.png'})`}}>
            <img className="avatar"
                 src={this.state.shopProfile.shopAvatarUrl ? this.state.shopProfile.shopAvatarUrl : '/assets/images/seller/avatar.png'}
                 alt={this.state.shopProfile ? this.state.shopProfile.name : ''}/>
            <input className="fa fa-camera profile__img__edit" type="file"
                   onChange={(e: any) => this.uploadImageAvatar(e)}/>
            <span className="fa fa-camera cover__img__edit">
              <input type="file" onChange={(e: any) => this.uploadImageCover(e)}/>
              Cập nhật ảnh bìa
            </span>
          </div>
          <div className="p-3 d-flex justify-content-between">
            <div><i className="text-sm">Ảnh đại diện có kích thước tối đa là 500x500 và ảnh bìa là 1248x312
              - định dạng jpg, gif, png</i></div>
            <div>{this.renderStatus}</div>
          </div>
        </div>
        {/*Body*/}
        <div className="card mb-2 py-3">
          <div className="card-body p-0">
            <h4 className="card-body__title" style={{padding: `0 14px 10px`}}>
              <i className="fa fa-shopping-cart mr-1">
              </i> Thông tin cửa hàng
            </h4>
            {this.renderShopInfo}
            {this.isUnactiveMode && <div className="nen"/>}
            {this.isUnactiveMode && <div className="unactive-mode">
                <div className="position-relative">
                    <div className="exit position-absolute" onClick={() => this.handleShopPopupUnactiveMode()}>
                        <i className="far fa-times"/>
                    </div>
                    <div>
                        <h2>Chế độ tạm nghỉ</h2>
                        <div className="content d-flex position-relative" key={this.state.keyToggle}>
                            <p style={{marginRight: "12px"}}>Chế độ tạm nghỉ khiến khách hàng không thể đặt hàng mới
                                trong shop của bạn. Đơn hàng vẫn đang tiến hành hoạt động.</p>
                            <Switch defaultChecked={status==="ON"?true:false} onChange={this.handleCheckedUnActiveMode}/>
                          {this.typeToggle === "on" &&<div>
                              <div className="nen"/>
                              <div className="popup-confirm position-absolute">
                                  <div className="title text-center">
                                      <p>Người mua sẽ không thể đặt hàng nếu bạn tạm nghỉ bán.</p>
                                      <p> Bạn có muốn thực hiện thao tác này?</p>
                                  </div>
                                  <div className="btn-unactive d-flex justify-content-center">
                                      <button onClick={() => this.handleCancel("OFF")}>Hủy</button>
                                      <button onClick={()=>this.handleConfirmUnActiveMode('ON')}>Đồng ý</button>
                                  </div>
                              </div>
                          </div>}
                          {this.typeToggle === "off" && <div>
                              <div className="nen"/>
                              <div className="popup-confirm position-absolute">
                                  <div className="title text-center">
                                      <p>Nếu tắt chế độ tạm nghỉ, bạn chỉ có thể kích hoạt lại sau 4 giờ.</p>
                                      <p> Bạn có muốn thực hiện thao tác này?</p>
                                  </div>
                                  <div className="btn-unactive d-flex justify-content-center">
                                      <button onClick={() => this.handleCancel("ON")}>Hủy</button>
                                      <button onClick={()=>this.handleConfirmUnActiveMode('OFF')}>Đồng ý</button>
                                  </div>
                              </div>
                          </div>}

                        </div>
                        {/*<div className="image d-flex justify-content-center">*/}
                        {/*    <img src="/assets/images/seller/sleep.png"/>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>}
          </div>
        </div>
        {this.renderFormAdvancedNormal}
        <FormAdvancedCompany/>
      </div>
    </>
  }

  get renderUploadImage(): React.ReactNode {
    const style = css`
      list-style: none;
      display: flex;
      padding-left: 0;
      margin-left: -16px;

      li {
        margin-left: 16px;

        div.loading {
          width: 80px;
          height: 80px;
          border: solid 1px #1976d2;
          color: #1976d2;
        }

        div.box-add {
          width: 80px;
          height: 80px;
          border: dashed 1px #1976d2;
          cursor: pointer;

          i {
            color: #1976d2;
          }

          input {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
          }
        }

        div.img {
          position: relative;
          cursor: pointer;

          img {
            max-height: 80px;
          }

          div.del {
            position: absolute;
            background-color: rgba(0, 0, 0, .25);
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none;
            cursor: pointer;
          }

          &:hover div.del {
            display: flex;

            .fa-trash {
              color: red;
              padding: 8px;
              background-color: white;
            }
          }
        }
      }
    `;

    const handlerOnChange = (event: SyntheticEvent<HTMLInputElement>) => {
      const {files} = event.currentTarget as { files: FileList };
      Object.values(files).map((file) => this.images.length < 4 && this.images.push({file: new File([file], file.name, {type: "image/png"})}));
      this.images.map((value, index) => {
        value.file && getImageSrcWithFile(value.file).then(src => {
          if (src) value.src = src;
          else this.images.splice(index, 1);
        });
      });
      this.keyInput = Date.now();
    };

    return <>
      <label>Hình ảnh mô tả (tối đa 4 ảnh)</label>
      <ul css={style}>
        {this.images.map((value, index) => <li key={index}>
          {!value.src &&
          <div className="loading d-flex flex-column justify-content-center align-items-center"><i
              className="fal fa-spinner fa-spin"/></div>}
          {value.src && <div className="img">
              <img src={value.src} alt={'img-' + index}/>
              <div className="del flex-column justify-content-center align-items-center">
                  <i className="fas fa-trash" onClick={() => this.images.splice(index, 1)}/>
              </div>
          </div>}
        </li>)}
        {this.images.length < 4 && <li>
            <div
                className="position-relative box-add d-flex flex-column justify-content-center align-items-center">
                <input type="file"
                       key={this.keyInput}
                       onChange={e => handlerOnChange(e)}
                       multiple={true}
                       accept={"image/jpeg, image/png"}/>
                <i className="fal fa-upload"/>
            </div>
        </li>}
      </ul>
    </>;
  }
}
