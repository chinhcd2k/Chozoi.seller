import React from "react";
import {observer} from "mobx-react";
import {uploadImage} from "../../../../common/functions/UpfileFunc";
import 'react-summernote/dist/react-summernote.css';
import {Feedback, FormGroup, Input, Textarea, Validations} from "../../../../common/form";
import {DETAIL_TEMPLATE_CONTROL} from "./DetailTemplateControl";
import DetailTemplateStore from "./DetailTemplateStore";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import {ReactComponent as PicterSVG} from "../images.svg";
import $ from "jquery";
import {IResponseDetailProduct} from "../../ProductServices";
import {DETAIL_PRODUCT_CTRL} from "../../detail-product/DetailProductControl";
import {store} from "./DetailTemplateStore";
import {ConfirmEdit} from "./ConfirmEdit";
import {Link} from "react-router-dom";
import {store as ShopInfoStore} from "../../../shop/stores/ShopInfomationStore";
import {IImage} from "../../../auctions/template/components/Gallery";

interface IDetailTemplateProps {
    defaultValue: IResponseDetailProduct
    shopId: number
    /*Emit*/
    EmitInputOnChange: (event: any, key: 'name' | 'condition' | 'description' | 'description_pickingout' | 'category' | 'weight' | 'C' | 'D' | 'R' | 'auto_public') => any
}

interface IDetailTemplateState {
    keyPropety: number
    keyInputFile: number
    ONLY_FIELD_UPDATE: ('WEIGHT' | 'D' | 'R' | 'C')[]
    FIELD_ENABLE: ('WEIGHT' | 'D' | 'R' | 'C')[]
}

export interface IReactSummernote {
    reset: () => any
    insertText: (text: string) => any
    insertNode: (node: HTMLElement) => any
}

const MAX_IMAGE: number = 10;
const ReactSummernote = require("react-summernote").default;

@observer
export default class DetailTemplate extends React.Component<IDetailTemplateProps, IDetailTemplateState> {
    public defaultCategoriesLv1Value: string = '';
    public defaultCategoriesLv2Value: string = '';
    public defaultCategoriesLv3Value: string = '';
    private store = new DetailTemplateStore();
    public WeightRef = React.createRef<Input>();
    public PackageSize_DRef = React.createRef<Input>();
    public PackageSize_RRef = React.createRef<Input>();
    public PackageSize_CRef = React.createRef<Input>();

    private reactSummernoteRef = React.createRef<any>();

    state = {
        keyPropety: Date.now(),
        keyInputFile: Date.now(),
        ONLY_FIELD_UPDATE: ['WEIGHT', 'D', 'R', 'C'] as any,
        FIELD_ENABLE: []
    };

    constructor(props: IDetailTemplateProps) {
        super(props);
        DETAIL_TEMPLATE_CONTROL.view = this;
        DETAIL_TEMPLATE_CONTROL.store = this.store;
    }

    async componentDidMount() {
        if (this.props.defaultValue.id !== store.product_id) {
            await DETAIL_TEMPLATE_CONTROL.getListCategories();
            await DETAIL_TEMPLATE_CONTROL.getListShipping();
            await DETAIL_TEMPLATE_CONTROL.loadDefaultCategories();
            store.listShipping = this.store.listShipping;
            store.listCategories = this.store.listCategories;
            store.listPropety = this.store.listPropety;
            store.product_id = this.props.defaultValue.id;
        } else {
            this.store.listCategories = store.listCategories;
            DETAIL_TEMPLATE_CONTROL.getListCategoriesLv1();
            this.store.listShipping = store.listShipping;
            DETAIL_PRODUCT_CTRL.setValidateShipping(this.store.listShipping.length > 0);
            await DETAIL_TEMPLATE_CONTROL.loadDefaultCategories(false);
            this.store.listPropety = store.listPropety;
            DETAIL_TEMPLATE_CONTROL.loadDefaultPropety();
        }
        DETAIL_TEMPLATE_CONTROL.loadDefaultImage();
        DETAIL_TEMPLATE_CONTROL.loadDefaultAutoPublic();
        $('.fa-clock').tooltip('enable');
        if (this.reactSummernoteRef.current) {
            const summernote = this.reactSummernoteRef.current;
            summernote.reset();
            const {descriptionPickingOut} = this.props.defaultValue;
            const divEl = document.createElement("div");
            divEl.innerHTML = descriptionPickingOut;
            summernote.insertNode(divEl);
        }
    }

    componentWillUnmount(): void {
        $('span.fileinput-button').off('click');
        $('#products-gallery p.text-input').off('click');
    }

    protected openFileImage() {
        $('#products-gallery input#input-image').trigger('click');
    }

    protected get renderStatusProduct(): React.ReactNode {
        const getStateProduct = (): string => {
            switch (this.props.defaultValue.state) {
                case "DRAFT":
                    return "DRAFT: Nh??p";
                case "PENDING":
                    return "PENDING: ?????i duy???t";
                case "PUBLIC":
                    return "PUBLIC: ??ang b??n";
                case "READY":
                    return "READY: ??ang ???n";
                case "REJECT":
                    return "REJECT: B??? t??? ch???i";
            }
        };

        const getVisiable = (): string => {
            if (this.props.defaultValue.isPublic === null)
                return "S???n ph???m ch??a ???????c b??n tr??n s??n";
            else if (this.props.defaultValue.isPublic)
                return "S???n ph???m ??ang ???????c b??n tr??n s??n";
            else if (!this.props.defaultValue.isPublic)
                return "Th??ng tin m???i c???a s???n ph???m sau khi s???a v?? g???i duy???t l???i s??? b??? ???n tr??n s??n ????? ch??? duy???t";
            else return "Ch??a x??c ?????nh";
        };

        return <div className="col-lg-4">
            <div className="row">
                <div className="col-xs-12">
                    <div className="panel">
                        <div className="panel-body pb-0">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">Ch?? ??</label>
                                <p>{getVisiable()}</p>
                            </div>
                            <div className="form-group">
                                <label className="control-label font-weight-bold">Tr???ng th??i</label>
                                <p>{getStateProduct()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }

    protected get renderDescriptionReject(): React.ReactNode {
        if (this.props.defaultValue.state === "REJECT" && this.props.defaultValue.reportIssues) {
            return <div className="col-lg-4">
                <div className="alert alert-danger mb-0">
                    <strong>L?? do b??? t??? ch???i!</strong> {this.props.defaultValue.reportIssues.description}
                </div>
                <div className="alert alert-success mb-0">
                    <strong>H?????ng gi???i quy???t!</strong> {this.props.defaultValue.reportIssues.solution}
                </div>
            </div>;
        }
        return "";
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="create-template">
            <div className="col-lg-8">
                {/*Th??ng tin c?? b???n*/}
                <div className="row">
                    <div className="col-xs-12">
                        <div className="panel">
                            <div className="panel-heading"><h3 className="panel-title font-weight-bold">Th??ng tin c??
                                b???n</h3>
                            </div>
                            <div className="panel-body">
                                <div className="form-group">
                                    <label className="control-label">{DETAIL_TEMPLATE_CONTROL.getIconLock &&
                                    <i className="fas fa-lock"/>} T??n s???n ph???m *
                                        {DETAIL_TEMPLATE_CONTROL.getIconCLock("NAME") &&
                                        <i className="ml-3 fas fa-clock text-warning cursor-pointer"
                                           data-toggle="tooltip"
                                           data-placement="right"
                                           data-original-title="T??n s???n ph???m s??? ???????c c???p nh???t l??n s??n sau khi h??? th???ng duy???t"
                                        />}
                                    </label>
                                    <FormGroup className="form-group">
                                        <Input type="text" className="form-control" autoFocus={true}
                                               name={"name"}
                                               disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("NAME")}
                                               defaultValue={this.props.defaultValue.name}
                                               validations={[new Validations(Validations.regexp(/^.{3,150}$/), 'Ph???i c?? t??? 3 ?????n 150 k?? t???')]}
                                               onChange={e => this.props.EmitInputOnChange(e, "name")}
                                        />
                                        <Feedback invalid={"true"}/>
                                    </FormGroup>
                                </div>
                                <div className="form-group">
                                    <label className="control-label">{DETAIL_TEMPLATE_CONTROL.getIconLock &&
                                    <i className="fas fa-lock"/>} T??nh tr???ng s???n ph???m *
                                        {DETAIL_TEMPLATE_CONTROL.getIconCLock("CONDITION") &&
                                        <i className="ml-3 fas fa-clock text-warning cursor-pointer"
                                           data-toggle="tooltip"
                                           data-placement="right"
                                           data-original-title="T??nh tr???ng s???n ph???m s??? ???????c c???p nh???t l??n s??n sau khi h??? th???ng duy???t"
                                        />}
                                    </label>
                                    <div className="condition">
                                        <div>
                                            <input id="infomation-radio-1" className="magic-radio" type="radio"
                                                   disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("CONDITION")}
                                                   defaultChecked={this.props.defaultValue.condition === "NEW"}
                                                   value="NEW"
                                                   name="inline-form-radio-condition"
                                                   onChange={e => this.props.EmitInputOnChange(e, "condition")}
                                            />
                                            <label
                                                htmlFor="infomation-radio-1">M???i</label>
                                        </div>
                                        <div className="mt-2">
                                            <input id="infomation-radio-2"
                                                   value="USED"
                                                   disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("CONDITION")}
                                                   defaultChecked={this.props.defaultValue.condition === "USED"}
                                                   className="magic-radio" type="radio"
                                                   name="inline-form-radio-condition"
                                                   onChange={e => this.props.EmitInputOnChange(e, "condition")}
                                            /><label
                                            htmlFor="infomation-radio-2">???? s??? d???ng</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group" key={this.store.getKeyCategories}>
                                    <label className="control-label">{DETAIL_TEMPLATE_CONTROL.getIconLock &&
                                    <i className="fas fa-lock"/>} Danh m???c *
                                        {DETAIL_TEMPLATE_CONTROL.getIconCLock("NAME") &&
                                        <i className="ml-3 fas fa-clock text-warning cursor-pointer"
                                           data-toggle="tooltip"
                                           data-placement="right"
                                           data-original-title="Danh m???c s???n ph???m s??? ???????c c???p nh???t l??n s??n sau khi h??? th???ng duy???t"
                                        />}
                                    </label>
                                    <div className="w-100 d-flex">
                                        {/*Lv1*/}
                                        {this.store.listCategoriesLv1.length > 0 &&
                                        <select className="form-control"
                                                key={this.store.getKeyCategoriesLv1}
                                                disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("CATEGORY")}
                                                defaultValue={this.defaultCategoriesLv1Value}
                                                onChange={e => DETAIL_TEMPLATE_CONTROL.getListCategoriesLv2(parseInt(e.currentTarget.value))}
                                                style={{width: '30%'}} required>
                                            <option value="" disabled>---L???a ch???n---</option>
                                            {this.store.listCategoriesLv1.map((value, index) =>
                                                <option key={index}
                                                        value={value.id}>{value.name}</option>)}
                                        </select>}
                                        {/*Lv2*/}
                                        {this.store.listCategoriesLv2.length > 0 &&
                                        <select className="form-control mx-3"
                                                disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("CATEGORY")}
                                                defaultValue={this.defaultCategoriesLv2Value}
                                                key={this.store.getKeyCategoriesLv2}
                                                onChange={e => DETAIL_TEMPLATE_CONTROL.getListCategoriesLv3(parseInt(e.currentTarget.value))}
                                                style={{width: '30%'}} required>
                                            <option value="" disabled>---L???a ch???n---</option>
                                            {this.store.listCategoriesLv2.map((value, index) =>
                                                <option key={index}
                                                        value={value.id}>{value.name}</option>)}
                                        </select>}
                                        {/*Lv3*/}
                                        {this.store.listCategoriesLv3.length > 0 &&
                                        <select className="form-control"
                                                disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("CATEGORY")}
                                                defaultValue={this.defaultCategoriesLv3Value}
                                                key={this.store.getKeyCategoriesLv3}
                                                onChange={e => DETAIL_TEMPLATE_CONTROL.getListPropety(parseInt(e.currentTarget.value))}
                                                style={{width: '30%'}} required>
                                            <option value="" disabled>---L???a ch???n---</option>
                                            {this.store.listCategoriesLv3.map((value, index) =>
                                                <option key={index}
                                                        value={value.id}>{value.name}</option>)}
                                        </select>}
                                    </div>
                                </div>
                                <div className="form-group" key={this.state.keyPropety}>
                                    <label className="control-label">{DETAIL_TEMPLATE_CONTROL.getIconLock &&
                                    <i className="fas fa-lock"/>} Thu???c t??nh s???n ph???m *
                                        {DETAIL_TEMPLATE_CONTROL.getIconCLock("CATEGORY") &&
                                        <i className="ml-3 fas fa-clock text-warning cursor-pointer"
                                           data-toggle="tooltip"
                                           data-placement="right"
                                           data-original-title="Thu???c t??nh s???n ph???m s??? ???????c c???p nh???t l??n s??n sau khi h??? th???ng duy???t"
                                        />}
                                    </label>
                                    <div className="d-flex justify-content-between flex-wrap">
                                        {this.store.listPropety.length > 0 && this.store.listPropety.map((value, index) =>
                                            <div className="w-50 form-group" key={index}>
                                                <label>{value.name}{value.isRequired ? ' *' : ''}</label>
                                                <select className="form-control"
                                                        defaultValue={value.selectValueId ? value.selectValueId.toString() : ''}
                                                        disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("CATEGORY")}
                                                        onChange={e => DETAIL_TEMPLATE_CONTROL.handlerOnChangePropety(e, value)}
                                                        style={{width: 'auto'}}
                                                        required={value.isRequired}>
                                                    <option value="" disabled={true}>---L???a ch???n---</option>
                                                    {value.values.map((value1, index1) =>
                                                        <option key={index1}
                                                                value={value1.id}>{value1.value}</option>)}
                                                </select>
                                            </div>)}
                                        {this.store.listPropety.length === 0 &&
                                        <p className="text-warning">Vui l??ng l???a ch???n danh m???c!</p>}
                                    </div>
                                </div>
                                <hr/>
                                <FormGroup className="form-group">
                                    <label>{DETAIL_TEMPLATE_CONTROL.getIconLock && <i className="fas fa-lock"/>} ?????c
                                        ??i???m n???i b???t (t???i thi???u 3 ??, m???i ?? m???t d??ng, kh??ng vi???t
                                        ??o???n
                                        d??i,
                                        kh??ng ch??n th??ng tin C???a h??ng) *
                                        {DETAIL_TEMPLATE_CONTROL.getIconCLock("DESCRIPTION") &&
                                        <i className="ml-3 fas fa-clock text-warning cursor-pointer"
                                           data-toggle="tooltip"
                                           data-placement="right"
                                           data-original-title="?????c ??i???m n???i b???t s???n ph???m s??? ???????c c???p nh???t l??n s??n sau khi h??? th???ng duy???t"
                                        />}
                                    </label>
                                    <Textarea
                                        name={"description"}
                                        disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("DESCRIPTION")}
                                        defaultValue={this.props.defaultValue.description}
                                        onChange={e => this.props.EmitInputOnChange(e, "description")}
                                        validations={[
                                            new Validations(Validations.minLength(15), 'Ph???i c?? t???i thi???u 15 k?? t???'),
                                            new Validations(Validations.maxLength(500), 'Ph???i ch??? c?? th??? t???i ??a 500 k?? t???')
                                        ]}
                                        className="form-control" css={{minHeight: "10em"}}/>
                                    <Feedback invalid={"true"}/>
                                </FormGroup>
                                <div className="form-group">
                                    <label className="control-label">{DETAIL_TEMPLATE_CONTROL.getIconLock &&
                                    <i className="fas fa-lock"/>} M?? t??? chi ti???t s???n ph???m *
                                        {DETAIL_TEMPLATE_CONTROL.getIconCLock("DESCRIPTION_PICKINGOUT") &&
                                        <i className="ml-3 fas fa-clock text-warning cursor-pointer"
                                           data-toggle="tooltip"
                                           data-placement="right"
                                           data-original-title="M?? t??? chi ti???t s???n ph???m s??? ???????c c???p nh???t l??n s??n sau khi h??? th???ng duy???t"
                                        />}
                                    </label>
                                    <ReactSummernote
                                        ref={this.reactSummernoteRef}
                                        disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("DESCRIPTION_PICKINGOUT")}
                                        options={{
                                            lang: 'vn',
                                            height: 200,
                                            dialogsInBody: true,
                                            toolbar: [
                                                ['font', ['bold', 'underline', 'clear']],
                                                ['fontsize', ['fontsize']],
                                                ['fontname', ['fontname']],
                                                ['para', ['ul', 'ol', 'paragraph']],
                                                ['view', ['fullscreen', 'codeview']],
                                                ['color', ['color']],
                                                ['insert', ['link', 'picture', 'video']],
                                            ]
                                        }}
                                        onImageUpload={(files: any[]) => {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                uploadImage((files as any) as FileList, "uploadCover").then((response: any) => ReactSummernote.insertImage(response.url))
                                            };
                                            reader.readAsDataURL(files[0]);
                                        }}
                                        onChange={(e: any) => this.props.EmitInputOnChange(e, "description_pickingout")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*???nh s???n ph???m*/}
                <div className="row mt-3">
                    <div className="col-xs-12">
                        <div className="panel">
                            <div className="panel-body">
                                <div className="row" id="products-gallery">
                                    <div className="col-xs-12 d-flex justify-content-between">
                                        <h5>
                                            {DETAIL_TEMPLATE_CONTROL.getIconLock && <i className="fas fa-lock"/>} ???nh
                                            s???n ph???m
                                            {DETAIL_TEMPLATE_CONTROL.getIconCLock("IMAGES") &&
                                            <i className="ml-3 fas fa-clock text-warning cursor-pointer"
                                               data-toggle="tooltip"
                                               data-placement="right"
                                               data-original-title="???nh s???n ph???m s??? ???????c c???p nh???t l??n s??n sau khi h??? th???ng duy???t"
                                            />}
                                        </h5>
                                        {this.store.listImage.length <= MAX_IMAGE && !DETAIL_TEMPLATE_CONTROL.getDisabledFormField("IMAGES") &&
                                        <div className="add-image">
                                            <span className="btn btn-default fileinput-button"
                                                  onClick={() => this.openFileImage()}>Th??m ???nh</span>
                                            <input id="input-image" key={this.state.keyInputFile} type="file"
                                                   multiple={true}
                                                   accept={'image/jpeg, image/jpg, image/png'}
                                                   onChange={(e: any) => DETAIL_TEMPLATE_CONTROL.uploadLocalImage(e.currentTarget.files)}/>
                                        </div>}
                                    </div>
                                    <div className="col-xs-12 d-flex pr-0 justify-content-center">
                                        <div className="image-container">
                                            {this.store.listImage.length > 0 && <div className="image-primary">
                                                <img src={this.store.listImage[0].src} alt=""/>
                                                {this.store.listImage.length > 1 && !DETAIL_TEMPLATE_CONTROL.getDisabledFormField("IMAGES") &&
                                                <div className="action">
                                                    <i className="fa fa-trash"
                                                       onClick={() => this.store.listImage.splice(0, 1)}/>
                                                </div>}
                                            </div>}
                                            <ul className="images">
                                                {this.store.listImage.map((value: IImage, index: number) => {
                                                    if (index === 0) return null;
                                                    else if (!value) return <li key={index} className="image"/>;
                                                    else
                                                        return <li key={index}
                                                                   className="image">
                                                            <img src={value.src} alt=""/>
                                                            {this.store.listImage.length > 1 && !DETAIL_TEMPLATE_CONTROL.getDisabledFormField("IMAGES") &&
                                                            <div className="action">
                                                                <i className="fa fa-trash"
                                                                   onClick={() => this.store.listImage.splice(index, 1)}/>
                                                            </div>}
                                                        </li>
                                                })}
                                            </ul>
                                            {/*Kh??ng c?? d??? li???u*/}
                                            {this.store.listImage.length === 0 &&
                                            <div className="empty w-100 d-flex justify-content-center flex-wrap">
                                                <PicterSVG/>
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*Childer*/}
                {this.props.children}
                {/*V???n chuy???n*/}
                <div className="row mt-3">
                    <div className="col-xs-12">
                        <div className="panel">
                            <div className="panel-heading"><h3 className="panel-title font-weight-bold">V???n chuy???n</h3>
                            </div>
                            <div className="panel-body">
                                <div className="row">
                                    <div className="weight col-xs-12 col-lg-6">
                                        <label>C??n n???ng *</label>
                                        <FormGroup className="weight-form">
                                            <Input
                                                className="form-control"
                                                name={"weight"}
                                                ref={this.WeightRef}
                                                disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("WEIGHT")}
                                                defaultValue={this.props.defaultValue.weight + ''}
                                                placeholder={"gram"}
                                                validations={[new Validations(Validations.greaterThanNumber(0), 'C??n n???ng ph???i l???n h??n 0')]}
                                                onChange={e => this.props.EmitInputOnChange(e, "weight")}
                                            />
                                            <Feedback invalid={"true"}/>
                                            {DETAIL_TEMPLATE_CONTROL.getIconEdit("WEIGHT") && <i className="fas fa-pen"
                                                                                                 onClick={e => DETAIL_TEMPLATE_CONTROL.handlerOnEditFormField(e, "WEIGHT")}/>}
                                            {!DETAIL_TEMPLATE_CONTROL.getIconEdit("WEIGHT") &&
                                            <div className="mt-2 d-flex justify-content-end"><ConfirmEdit
                                                EmitOnConfirm={value => DETAIL_TEMPLATE_CONTROL.handlerOnConfirmEdit("WEIGHT", value)}/>
                                            </div>}
                                        </FormGroup>
                                    </div>
                                    <div className="package-size col-xs-12 col-lg-6"><label>K??ch th?????c ????ng g??i
                                        *</label>
                                        <div className="d-flex">
                                            <FormGroup className="form-group">
                                                <Input
                                                    className="form-control"
                                                    name={"D"}
                                                    ref={this.PackageSize_DRef}
                                                    disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("D")}
                                                    defaultValue={numberWithCommas(this.props.defaultValue.packingSize[0]) + ''}
                                                    placeholder={"cm"}
                                                    validations={[new Validations(Validations.greaterThanNumber(0), 'Ph???i l???n h??n 0')]}
                                                    onChange={e => this.props.EmitInputOnChange(e, "D")}
                                                />
                                                <Feedback invalid={"true"}/>
                                                {DETAIL_TEMPLATE_CONTROL.getIconEdit("D") && <i className="fas fa-pen"
                                                                                                onClick={e => DETAIL_TEMPLATE_CONTROL.handlerOnEditFormField(e, "D")}/>}
                                                {!DETAIL_TEMPLATE_CONTROL.getIconEdit("D") &&
                                                <div className="mt-2 d-flex justify-content-end"><ConfirmEdit
                                                    EmitOnConfirm={value => DETAIL_TEMPLATE_CONTROL.handlerOnConfirmEdit("D", value)}/>
                                                </div>}
                                            </FormGroup>
                                            <FormGroup className="form-group mx-5">
                                                <Input
                                                    className="form-control"
                                                    name={"R"}
                                                    ref={this.PackageSize_RRef}
                                                    placeholder={"cm"}
                                                    disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("R")}
                                                    defaultValue={numberWithCommas(this.props.defaultValue.packingSize[1]) + ''}
                                                    validations={[new Validations(Validations.greaterThanNumber(0), 'Ph???i l???n h??n 0')]}
                                                    onChange={e => this.props.EmitInputOnChange(e, "R")}
                                                />
                                                <Feedback invalid={"true"}/>
                                                {DETAIL_TEMPLATE_CONTROL.getIconEdit("R") && <i className="fas fa-pen"
                                                                                                onClick={e => DETAIL_TEMPLATE_CONTROL.handlerOnEditFormField(e, "R")}/>}
                                                {!DETAIL_TEMPLATE_CONTROL.getIconEdit("R") &&
                                                <div className="mt-2 d-flex justify-content-end"><ConfirmEdit
                                                    EmitOnConfirm={value => DETAIL_TEMPLATE_CONTROL.handlerOnConfirmEdit("R", value)}/>
                                                </div>}
                                            </FormGroup>
                                            <FormGroup className="form-group">
                                                <Input
                                                    className="form-control"
                                                    name={"C"}
                                                    ref={this.PackageSize_CRef}
                                                    defaultValue={numberWithCommas(this.props.defaultValue.packingSize[2]) + ''}
                                                    placeholder={"cm"}
                                                    disabled={DETAIL_TEMPLATE_CONTROL.getDisabledFormField("C")}
                                                    validations={[new Validations(Validations.greaterThanNumber(0), 'Ph???i l???n h??n 0')]}
                                                    onChange={e => this.props.EmitInputOnChange(e, "C")}
                                                />
                                                <Feedback invalid={"true"}/>
                                                {DETAIL_TEMPLATE_CONTROL.getIconEdit("C") && <i className="fas fa-pen"
                                                                                                onClick={e => DETAIL_TEMPLATE_CONTROL.handlerOnEditFormField(e, "C")}/>}
                                                {!DETAIL_TEMPLATE_CONTROL.getIconEdit("C") &&
                                                <div className="mt-2 d-flex justify-content-end"><ConfirmEdit
                                                    EmitOnConfirm={value => DETAIL_TEMPLATE_CONTROL.handlerOnConfirmEdit("C", value)}/>
                                                </div>}
                                            </FormGroup>
                                        </div>
                                        <label>Chi???u d??i (D) * chi???u r???ng (R) * chi???u cao (C) cm.</label></div>
                                </div>
                                <hr/>
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">????n v??? v???n chuy???n</label>
                                    {this.store.listShipping.length > 0 && <ol>
                                        {this.store.listShipping.map((value, index) =>
                                            <li key={index}>
                                                <p>{value.name}</p>
                                                <ul>
                                                    <li>C??n n???ng t???i ??a: {numberWithCommas(value.maxWeight)} gram</li>
                                                    <li>K??ch c??? t???i ??a: {value.maxSize[0]}cm x {value.maxSize[1]}cm
                                                        x {value.maxSize[2]}cm
                                                    </li>
                                                    <li>Thu h??? t???i ??a: {numberWithCommas(value.maxValue)} ??</li>
                                                </ul>
                                            </li>)}
                                    </ol>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*Mi???n ph?? v???n chuy???n*/}
                {(ShopInfoStore.shopProfile && ShopInfoStore.shopProfile.freeShipStatus === "ON") &&
                <div className="row mt-3">
                    <div className="col-12">
                        <div className="card freeship">
                            <div className="card-header">
                                Mi???n ph?? v???n chuy???n
                            </div>
                            <div className="card-body">
                                <i>M???o: Th??ng th?????ng hi???u qu??? b??n h??ng t??ng 20% khi MI???N PH?? V???N CHUY???N. H??y ??p d???ng ?????
                                    gia t??ng doanh s??? c???a b???n</i>
                                <div className="dash">
                                    <div className="btn-switch">
                                        ??p d???ng mi???n ph?? v???n chuy???n cho s???n ph???m
                                        {!this.store.freeShip && <i className="fal fa-toggle-off fa-2x"
                                                                    onClick={() => DETAIL_PRODUCT_CTRL.showModalConfirmFreeShip(true)}/>}
                                        {this.store.freeShip && <i className="fal fa-toggle-on fa-2x"
                                                                   onClick={() => DETAIL_PRODUCT_CTRL.showModalConfirmFreeShip(false)}/>}
                                    </div>
                                    <i>Khi ??p d???ng mi???n ph?? v???n chuy???n: Sau khi ph??t sinh ????n h??ng, ti???n ph?? v???n chuy???n
                                        s??? ???????c t??nh v??o ph?? b??n h??ng c???a Nh?? b??n h??ng. ????? ?????m b???o quy???n l???i, h??y tham
                                        kh??o ch??nh s??ch: Nh?? b??n h??ng mi???n ph?? v???n chuy???n <Link to="#">t???i
                                            ????y</Link>.</i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
            {this.renderStatusProduct}
            {this.renderDescriptionReject}
        </div>
    }
}
