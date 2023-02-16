import React, {RefObject} from "react";
import {observer} from "mobx-react";
import Form from "../../../common/form/components/Form";
import {store as HomeStore} from "../../home";
import {BreadcrumbsService, BreadcrumbsComponent} from "../../../common/breadcrumbs";
import {DGetProfile} from "../../../common/decorators/Auth";
import {store as ProfileStore} from "../../profile";
import {Feedback, FormGroup, Input, Validations} from "../../../common/form";
import RowVariantComponent from "./RowVariantComponent";
import "./DetailStyle.scss"
import {Link} from "react-router-dom";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import ModalImageVariant from "./ModalImageVariant";
import {DETAIL_PRODUCT_CTRL} from "./DetailProductControl";
import DetailProductStore from "./DetailProductStore";
import {IResponseDetailProduct} from "../ProductServices";
import DetailTemplate from "../components/detail-template/DetailTemplate";
import {ConfirmEdit} from "../components/detail-template/ConfirmEdit";
import {ModalConfirmFreeShip} from "./ModalConfrimFreeShip";
import {DETAIL_TEMPLATE_CONTROL} from "../components/detail-template/DetailTemplateControl";

interface IDetailProductProps {
    match: {
        params: {
            id: string
        }
    }
    history: {
        push: (path: string) => void
    }
}

interface IDetailProductState {
    keyTableVariant: number
    defaultModalVariant: {
        id?: number
        image_id?: number
        price?: number
        sale_price: number
        quantity: number
        sku: string
    } | null
    disabledSubmit: boolean
    ONLY_FIELD_UPDATE: ('VARIANTS' | 'PRICE' | 'SALE_PRICE' | 'SKU' | 'IS_LIMITED_QUANTITY')[]
    FIELD_ENABLE: ('VARIANTS' | 'PRICE' | 'SALE_PRICE' | 'SKU' | 'IS_LIMITED_QUANTITY')[]
}

@observer
export default class DetailProduct extends React.Component<IDetailProductProps, IDetailProductState> {
    public shop_id: number = -1;
    public product_id: number = -1;
    public store = new DetailProductStore();

    public PriceRef = React.createRef<Input>();
    public SalePriceRef = React.createRef<Input>();
    public SkuRef = React.createRef<HTMLInputElement>();
    public QuantityRef = React.createRef<Input>();

    state = {
        keyTableVariant: Date.now(),
        defaultModalVariant: null,
        disabledSubmit: false,
        ONLY_FIELD_UPDATE: ['VARIANTS', 'PRICE', 'SALE_PRICE', 'SKU', 'IS_LIMITED_QUANTITY'] as any,
        FIELD_ENABLE: []
    };

    constructor(props: IDetailProductProps) {
        super(props);
        HomeStore.isShowBreadcrumbs = false;
        DETAIL_PRODUCT_CTRL.setView(this);
        DETAIL_PRODUCT_CTRL.setStore(this.store);
        HomeStore.menuActive = [3, 0];
        BreadcrumbsService.loadBreadcrumbs([{
            title: 'Danh sách sản phẩm',
            path: '/home/products/state=ALL'
        }, {title: 'Chi tiết sản phẩm'}]);
        this.props.match.params.id && (this.product_id = parseInt(this.props.match.params.id));
    }

    @DGetProfile
    async componentDidMount() {
        await DETAIL_PRODUCT_CTRL.getDetailProduct(this.shop_id, this.product_id);
        DETAIL_PRODUCT_CTRL.loadDefaultValue();
        window.scrollTo(0, 0);
    }

    componentWillUnmount(): void {
        HomeStore.isShowBreadcrumbs = true;
        this.store.product = undefined;
    }

    protected handlerOnChangeClassifierOnClick() {
        this.store.type = "CLASSIFIER";
        this.store.listClassifier = [{name: 'Màu sắc', values: []}];
        DETAIL_PRODUCT_CTRL.initTableVariantData();
    }

    protected get renderVariant(): React.ReactNode {
        if (this.store && this.store.product && this.store.product.type === "CLASSIFIER")
            return <div key={this.state.keyTableVariant}>
                <div className="panel-heading">
                    <div className="d-flex">
                        <p>Sản phẩm có nhiều lựa chọn theo màu sắc, kích cỡ, dung lượng...?</p>
                        {DETAIL_PRODUCT_CTRL.getIconEdit("VARIANTS") &&
                        <label><i className="ml-3 fas fa-pen cursor-pointer"
                                  onClick={e => DETAIL_PRODUCT_CTRL.handlerOnEditFormField(e, "VARIANTS")}/></label>}
                        {!DETAIL_PRODUCT_CTRL.getIconEdit("VARIANTS") &&
                        <ConfirmEdit className="ml-3"
                                     EmitOnConfirm={value => DETAIL_PRODUCT_CTRL.handlerOnConfirmEdit("VARIANTS", value)}/>}
                    </div>
                    {this.store.getType === "NORMAL" &&
                    <button className="btn btn-default" type="button"
                            disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                            onClick={() => this.handlerOnChangeClassifierOnClick()}>Thêm phân loại hàng
                    </button>}
                    {/* {this.store.getType === "CLASSIFIER" && <div>
                    <div className="w-100 d-flex align-items-center apply-value">
                        <input type="text" placeholder="Giá thị trường"/>
                        <input type="text" placeholder="Giá bán(*)"/>
                        <input type="text" placeholder="Kho hàng"/>
                        <input type="text" placeholder="SKU phân loại" name="sku"/>
                    </div>
                    <div className="checkbox">
                        <input id="apply-form-checkbox" className="magic-checkbox"
                               type="checkbox"/><label htmlFor="apply-form-checkbox">Áp dụng cho
                        tất cả phân loại hàng</label></div>
                </div>}*/}
                </div>
                <div className="panel-body">
                    {/*Form thêm*/}
                    {this.store.getType === "CLASSIFIER" && <div className="table-responsive">
                        <table className="classifier">
                            <thead>
                            <tr>
                                <th>Nhóm phân loại</th>
                                <th>Phân loại</th>
                                <th/>
                            </tr>
                            </thead>
                            <tbody>
                            {this.store.getListClassifier.map((item, index) => <tr key={index}>
                                <td><input type="text" className="form-control" autoFocus={true}
                                           placeholder="Tên phân loại"
                                           defaultValue={item.name}
                                           disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                                           required={true}
                                           onChange={(e: any) => item.name = e.currentTarget.value}/></td>
                                <td>
                                    <div>
                                        {item.values.length > 0 && <ul className="option-values">
                                            {item.values.map((name: string, index1: number) => <li key={index1}>
                                                <span>{name}</span>
                                                {!DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS") &&
                                                <i className="fal fa-times"
                                                   onClick={() => DETAIL_PRODUCT_CTRL.removeValueClassifier(item, index, index1)}/>}
                                            </li>)}
                                        </ul>}
                                        <input type="text" placeholder="Tùy chọn riêng biệt với dấu phẩy ',' hoặc Enter"
                                               disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                                               onKeyDown={(e: any) => {
                                                   const value: string = e.currentTarget.value || ''.trim();
                                                   /* Dấu phẩy hoặc Enter*/
                                                   if (e.keyCode === 13 || e.keyCode === 188) {
                                                       e.currentTarget.value && item.values.length < 10 && item.values.push(value);
                                                       e.currentTarget.value = "";
                                                       e.preventDefault();
                                                   }
                                               }}/>
                                    </div>
                                </td>
                                {/*Xóa nhóm phân loại*/}
                                <td>
                                    {!DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS") &&
                                    <button type="button" className="btn btn-default"
                                            onClick={() => DETAIL_PRODUCT_CTRL.removeClassifier(index)}>
                                        <i className="fa fa-trash"/></button>}
                                </td>
                            </tr>)}
                            </tbody>
                            {this.store.getListClassifier.length < 2 && <tfoot>
                            <tr>
                                <td>
                                    <button className="btn btn-primary" type="button"
                                            disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                                            onClick={() => this.store.getListClassifier.push({
                                                name: 'Kích cỡ',
                                                values: []
                                            })}>Thêm nhóm phân loại
                                    </button>
                                </td>
                            </tr>
                            </tfoot>}
                        </table>
                    </div>}

                    {/*Ap dung*/}
                    {this.store.getType === "CLASSIFIER" &&
                    <div className="mt-3 w-100 d-flex align-items-center apply-value">
                        <input type="text"
                               className="form-control"
                               placeholder="Giá thị trường"
                               disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                               defaultValue={DETAIL_PRODUCT_CTRL.variant_data.price ? numberWithCommas(DETAIL_PRODUCT_CTRL.variant_data.price) : ''}
                               onChange={e => DETAIL_PRODUCT_CTRL.handlerOnChangeDefaultValueVariant(e, "price")}
                        />
                        <input type="text"
                               className="ml-3 form-control"
                               placeholder="Giá bán(*)"
                               disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                               defaultValue={DETAIL_PRODUCT_CTRL.variant_data.sale_price ? numberWithCommas(DETAIL_PRODUCT_CTRL.variant_data.sale_price) : ''}
                               onChange={e => DETAIL_PRODUCT_CTRL.handlerOnChangeDefaultValueVariant(e, "sale_price")}
                        />
                        <input type="text"
                               className="ml-3 form-control"
                               placeholder="Kho hàng"
                               disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                               defaultValue={DETAIL_PRODUCT_CTRL.variant_data.quantity ? numberWithCommas(DETAIL_PRODUCT_CTRL.variant_data.quantity) : ''}
                               onChange={e => DETAIL_PRODUCT_CTRL.handlerOnChangeDefaultValueVariant(e, "quantity")}
                        />
                        <input type="text"
                               className="ml-3 form-control"
                               placeholder="SKU phân loại"
                               name="sku"
                               disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                               defaultValue={DETAIL_PRODUCT_CTRL.variant_data.sku}
                               onChange={e => DETAIL_PRODUCT_CTRL.handlerOnChangeDefaultValueVariant(e, "sku")}
                        />
                        <button className="ml-3 btn btn-dark"
                                type="button"
                                disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                                onClick={() => DETAIL_PRODUCT_CTRL.handlerApplyDefaultValueVariant()}>Áp dụng
                        </button>
                    </div>}

                    {/*Danh sách nhập dữ liệu cho variant*/}
                    {this.store.getType === "CLASSIFIER" && this.store.listClassifier.length > 0 && <div>
                        <div className="table-responsive">
                            <table className="table table-striped table-data-variant">
                                <thead>
                                <tr>
                                    <th>Phân loại</th>
                                    <th/>
                                    <th>Giá thị trường</th>
                                    <th>Giá</th>
                                    <th>Kho hàng</th>
                                    <th>Sku phân loại</th>
                                </tr>
                                </thead>
                                <tbody>
                                {/*Chi co 1*/}
                                {this.store.getListClassifier.length === 1 &&
                                this.store.getListClassifier.map((value, index) => value.values.map((value1: string, index1: number) =>
                                    <RowVariantComponent key={index1}
                                                         title={value1}
                                                         EmitImageOnClick={() => DETAIL_PRODUCT_CTRL.handlerOnShowModalImageVariant(this.store.tableVariantData[index1])}
                                                         value={this.store.tableVariantData[index1]}
                                    />
                                ))}
                                {/*Co 2*/}
                                {this.store.getListClassifier.length === 2 &&
                                this.store.getListClassifier[0].values.map((value, index) => this.store.getListClassifier[1].values.map((value1, index1) => {
                                    const index_temp: number = index * this.store.getListClassifier[1].values.length + index1;
                                    return <RowVariantComponent key={index_temp}
                                                                title={value + ' - ' + value1}
                                                                EmitImageOnClick={() => DETAIL_PRODUCT_CTRL.handlerOnShowModalImageVariant(this.store.tableVariantData[index_temp])}
                                                                value={this.store.tableVariantData[index_temp]}
                                    />;
                                }))}
                                </tbody>
                            </table>
                        </div>
                    </div>}
                </div>
            </div>;
        else return null;
    }

    protected get renderPriceAndStore(): React.ReactNode {
        if (this.store && this.store.product && this.store.product.type === "NORMAL") {
            return <div className="panel-body">
                <h5>Giá và kho hàng</h5>
                <div className="row">
                    <div className="col-xs-6">
                        <label>Giá thị trường</label>
                        <FormGroup className="form-group">
                            <Input
                                className="form-control"
                                name="price"
                                ref={this.PriceRef}
                                disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("PRICE")}
                                defaultValue={numberWithCommas(this.store.product.variants[0].price + '')}
                                placeholder="Giá gạch"
                                onChange={e => DETAIL_PRODUCT_CTRL.handlerOnChangePriceAndStore(e, "price")}
                            />
                            <Feedback invalid={"true"}/>
                            {DETAIL_PRODUCT_CTRL.getIconEdit("PRICE") && <i className="fas fa-pen"
                                                                            onClick={e => DETAIL_PRODUCT_CTRL.handlerOnEditFormField(e, "PRICE")}/>}
                            {!DETAIL_PRODUCT_CTRL.getIconEdit("PRICE") &&
                            <div className="mt-2 d-flex justify-content-end"><ConfirmEdit
                                EmitOnConfirm={value => DETAIL_PRODUCT_CTRL.handlerOnConfirmEdit("PRICE", value)}/>
                            </div>}
                        </FormGroup>
                    </div>
                    <div className="col-xs-6">
                        <label>Giá bán *</label>
                        <FormGroup className="form-group">
                            <Input
                                onChange={e => DETAIL_PRODUCT_CTRL.handlerOnChangePriceAndStore(e, "sale_price")}
                                className="form-control"
                                placeholder="Giá bán"
                                ref={this.SalePriceRef}
                                disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("SALE_PRICE")}
                                defaultValue={numberWithCommas(this.store.product.variants[0].salePrice + '')}
                                name={"sale_price"}
                                validations={[new Validations(Validations.greaterThanNumber(0), 'Giá bán phải lớn hơn 0')]}
                            />
                            <Feedback invalid={"true"}/>
                            {DETAIL_PRODUCT_CTRL.getIconEdit("SALE_PRICE") && <i className="fas fa-pen"
                                                                                 onClick={e => DETAIL_PRODUCT_CTRL.handlerOnEditFormField(e, "SALE_PRICE")}/>}
                            {!DETAIL_PRODUCT_CTRL.getIconEdit("SALE_PRICE") &&
                            <div className="mt-2 d-flex justify-content-end"><ConfirmEdit
                                EmitOnConfirm={value => DETAIL_PRODUCT_CTRL.handlerOnConfirmEdit("SALE_PRICE", value)}/>
                            </div>}
                        </FormGroup>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-6">
                        <label>Sku</label>
                        <div className="form-group">
                            <input className="form-control" type="text"
                                   disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("SKU")}
                                   defaultValue={this.store.product.variants[0].sku + ''}
                                   ref={this.SkuRef}
                                   onChange={e => DETAIL_PRODUCT_CTRL.handlerOnChangePriceAndStore(e, "sku")}
                                   placeholder="Mã sku"/>
                            {DETAIL_PRODUCT_CTRL.getIconEdit("SKU") && <i className="fas fa-pen"
                                                                          onClick={e => DETAIL_PRODUCT_CTRL.handlerOnEditFormField(e, "SKU")}/>}
                            {!DETAIL_PRODUCT_CTRL.getIconEdit("SKU") &&
                            <div className="mt-2 d-flex justify-content-end"><ConfirmEdit
                                EmitOnConfirm={value => DETAIL_PRODUCT_CTRL.handlerOnConfirmEdit("SKU", value)}/></div>}
                        </div>
                    </div>
                </div>
                {/*Tình trạng hàng*/}
                <div className="row">
                    <div className="col-xs-12 col-lg-6">
                        <p>Tình trạng hàng * {DETAIL_PRODUCT_CTRL.getIconEdit("IS_LIMITED_QUANTITY") &&
                        <i className="ml-3 fas fa-pen cursor-pointer"
                           onClick={e => DETAIL_PRODUCT_CTRL.handlerOnEditFormField(e, "IS_LIMITED_QUANTITY")}/>}
                        </p>
                        <div className="radio" key={this.store.getIsQuantityLimited + ''}>
                            <div>
                                <input id="demo-inline-form-radio-1"
                                       className="magic-radio" type="radio"
                                       disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("IS_LIMITED_QUANTITY")}
                                       onClick={() => this.store.isQuantityLimited = false}
                                       defaultChecked={!this.store.getIsQuantityLimited}
                                       name="inline-form-radio"/>
                                <label htmlFor="demo-inline-form-radio-1">Còn hàng</label>
                            </div>
                            <div className="mt-2">
                                <input id="demo-inline-form-radio-2"
                                       className="magic-radio" type="radio"
                                       disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("IS_LIMITED_QUANTITY")}
                                       onClick={() => this.store.isQuantityLimited = true}
                                       defaultChecked={this.store.getIsQuantityLimited}
                                       name="inline-form-radio"/>
                                <label htmlFor="demo-inline-form-radio-2">Quản lý kho</label>
                            </div>
                        </div>
                        {this.store.getIsQuantityLimited && <FormGroup className="form-group">
                            <label>Số lượng sản phẩm *</label>
                            <Input
                                className="form-control" placeholder="Số lượng"
                                disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("IS_LIMITED_QUANTITY")}
                                defaultValue={numberWithCommas(this.store.product.variants[0].inventory.remainingQuantity)}
                                onChange={e => DETAIL_PRODUCT_CTRL.handlerOnChangePriceAndStore(e, "quantity")}
                                ref={this.QuantityRef}
                                validations={[
                                    new Validations(Validations.greaterThanNumber(0), 'Tối thiểu phải có 1 sản phẩm'),
                                    new Validations(Validations.lessThanNumber(1000), 'Tối đa 999')
                                ]}
                            />
                            <Feedback invalid={"true"}/>
                        </FormGroup>}
                        {!DETAIL_PRODUCT_CTRL.getIconEdit("IS_LIMITED_QUANTITY") &&
                        <div className="mt-2 d-flex"><ConfirmEdit
                            EmitOnConfirm={value => DETAIL_PRODUCT_CTRL.handlerOnConfirmEdit("IS_LIMITED_QUANTITY", value)}/>
                        </div>}
                    </div>
                </div>
            </div>;
        } else
            return "";
    }

    protected get renderAlert(): React.ReactNode {
        if (this.state.FIELD_ENABLE.length > 0 && this.store.product && this.store.product.isPublic && this.store.product.state === "PUBLIC")
            return <div className="row mt-3">
                <div className="col-xs-8">
                    <div className="alert alert-warning mb-0">
                        <button className="close" data-dismiss="alert"><i className="pci-cross pci-circle"/></button>
                        <strong>Thông báo! Những trường dữ liệu có ký hiệu <i className="fas fa-clock"/>
                            sẽ được cập nhật sau khi hệ thống duyệt. Còn lại sẽ được cập nhật ngay sau khi người dùng
                            gửi yêu cầu lên hệ thống.</strong>
                    </div>
                </div>
            </div>;
        return "";
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        if (ProfileStore.profile) this.shop_id = ProfileStore.profile.shopId as number;
        if (this.store.getProduct && this.shop_id !== -1) {
            return <div id="create-product">
                {!this.store.GET_VALIDATE_SHIPPING &&
                <p className="text-center">Vui lòng bật đơn vị vận chuyển trước!</p>}
                {this.store.GET_VALIDATE_SHIPPING &&
                <Form className="container" id="product-form"
                      onSubmit={(e: any) => DETAIL_PRODUCT_CTRL.handlerOnSubmit(e)}>
                    <div className="row">
                        <div className="col-xs-12"><h2
                            className="mt-0">{this.store.getProduct.name}</h2></div>
                        <div className="col-xs-12"><BreadcrumbsComponent/></div>
                    </div>
                    {this.renderAlert}
                    <div className="row mt-3">
                        <div className="col-xs-12">
                            <button className="btn btn-default" type="button">
                                <Link to={'/home/product/add'}><i className="fal fa-plus"/> Thêm</Link>
                            </button>
                            <button className="btn btn-primary ml-3" type="button">
                                <Link className="text-white"
                                      to={`/home/product/update/${(this.store.product as IResponseDetailProduct).id}`}><i
                                    className="fal fa-edit"/> Sửa</Link>
                            </button>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <DetailTemplate
                            shopId={this.shop_id}
                            defaultValue={this.store.getProduct}
                            EmitInputOnChange={(e, key) => DETAIL_PRODUCT_CTRL.handlerOnChangeFormField(e, key)}>
                            {/*Thêm variant sản phẩm*/}
                            <div className="panel mt-3" id="panel-variants">{this.renderVariant}</div>
                            {/*Giá và kho*/}
                            {this.store.getType === "NORMAL" &&
                            <div className="panel mt-3" id="store-and-price">{this.renderPriceAndStore}</div>}
                        </DetailTemplate>
                    </div>
                    <button className="hidden" type="submit"/>
                </Form>}
                {this.state.defaultModalVariant &&
                <ModalImageVariant
                    defaultVariant={this.state.defaultModalVariant as any}
                    EmitOnChangeImage={image_id => DETAIL_PRODUCT_CTRL.handlerVariantOnChangeImage((this.state.defaultModalVariant as any).id, image_id)}
                />}
                <ModalConfirmFreeShip
                    OnApply={enable => DETAIL_TEMPLATE_CONTROL.handlerOnChangeFreeShip(enable)}
                    enable={DETAIL_PRODUCT_CTRL.store.getDataModalConfirmFreeShip}/>
            </div>;
        } else
            return "";
    }

    get getPriceRef(): RefObject<HTMLInputElement> | null {
        if (this.PriceRef.current) return this.PriceRef.current._ref;
        else return null;
    }

    get getSalePriceRef(): RefObject<HTMLInputElement> | null {
        if (this.SalePriceRef.current) return this.SalePriceRef.current._ref;
        else return null;
    }

    get getSkuRef(): RefObject<HTMLInputElement> | null {
        if (this.SkuRef.current) return this.SkuRef;
        else return null;
    }

    get getQuantityRef(): RefObject<HTMLInputElement> | null {
        if (this.QuantityRef.current) return this.QuantityRef.current._ref;
        else return null;
    }
}
