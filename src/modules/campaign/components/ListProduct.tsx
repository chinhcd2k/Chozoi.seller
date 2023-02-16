import React, {SyntheticEvent} from "react";
import {observer} from "mobx-react";
import {Tabs, Table, Switch, Button, Empty} from "antd";
import {observable} from "mobx";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {css} from "@emotion/core";
import PopupProduct from "./PopupProduct";
import {notify} from "../../../common/notify/NotifyService";
import {
    deleteRequest,
    handlerRequestError,
    IApiResponse,
    postRequest,
    putRequest
} from "../../../common/services/BaseService";
import {store as ProfileStore} from "../../profile";
import {IResProduct} from "../page/DetailCampaign";

interface INewProduct {
    id: number,
    name: string,
    src: string,
    price: number | [number, number] | null,
    remainingQuantity: number,
    quantity?: number
    percent?: number
}

export interface IRuleProduct {
    categories: number[]
    condition: string
    donatePercent: number
    priceMax: number
    priceMin: number
    productRuleContent: string
    statusProduct: string
    typeProduct: string
}

const {TabPane} = Tabs;

@observer
export default class ListProduct extends React.Component<any, any> {
    public static instance?: ListProduct;
    public static campaignId?: number;
    public static limited?: number;

    public currentPage: number = 1;

    private columnsDetail = [
        {
            title: "Sản phẩm",
            render: (item: IResProduct): React.ReactNode => {
                const {div, img, p} = styleTr.td_0;
                return <div style={div}>
                    <img style={img} src={item.images} alt=""/>
                    <p style={p}>{item.name}</p>
                </div>;
            }
        },
        {
            title: "Giá bán",
            render: (item: IResProduct): React.ReactNode => {
                if (item.variantPrice === null)
                    return <span style={{color: "#d9d9d9"}}>Sản phẩm đấu giá</span>;
                else if (item.variantPrice.length === 1)
                    return <span>{numberWithCommas(item.variantPrice[0])}</span>;
                else if (item.variantPrice.length > 1) {
                    const minPrice = Math.min(...item.variantPrice);
                    const maxPrice = Math.max(...item.variantPrice);
                    return <span>{numberWithCommas(minPrice)} - {numberWithCommas(maxPrice)}</span>;
                } else return null;
            }
        },
        {
            title: "Số tiền quyên góp (%)",
            render: (item: INewProduct) => <span>{item.percent}</span>
        },
        {
            title: "Số lượng đăng ký",
            render: (item: INewProduct) => {
                return item.quantity ? <span>{numberWithCommas(item.quantity)}</span> : null;
            }
        },
        {
            title: "Trạng thái",
            render: (item: IResProduct) => {
                const {span, wating, reject, approve} = styleTr.td_4;
                switch (item.status) {
                    case "pending":
                        return <i className="fas fa-clock-o" style={wating}>&nbsp;<span
                            style={{...span}}>Chờ duyệt</span></i>;
                    case "rejected":
                        return <i className="fas fa-ban" style={reject}>&nbsp;<span style={span}>Từ chối</span></i>;
                    case "approved":
                        return <i className="fas fa-check-circle" style={approve}>&nbsp;<span
                            style={span}>Phê duyệt</span></i>;
                    default:
                        return null;
                }
            }
        },
        {
            title: "Bật / tắt",
            render: (item: IResProduct): React.ReactNode => {
                const onClick = async (checked: boolean) => {
                    const res = await putRequest(`/v1/shops/${ProfileStore.shopId}/campaign/${ListProduct.campaignId}/${item.id}`, {status: checked});
                    if (res.status === 200) {
                        notify.show("Thao tác thực hiện thành công", "success");
                        item.visible = checked;
                        this.keyTableAdded = Date.now();
                    } else handlerRequestError(res);
                };
                return <Switch checked={item.visible}
                               onClick={() => onClick(!item.visible)}/>;
            }
        },
        {
            title: "Xóa",
            render: (item: IResProduct): React.ReactNode => {
                const onClick = async () => {
                    const {campaignId} = ListProduct;
                    const res = await deleteRequest(`/v1/shops/${ProfileStore.shopId}/campaign/${campaignId}/${item.id}`, {});
                    if (res.status === 200) {
                        notify.show("Thao tác thực hiện thành công!", "success");
                        const index = ListProduct.products.findIndex(value => value.id === item.id);
                        ListProduct.products.splice(index, 1);
                        this.keyTableAdded = Date.now();
                    } else handlerRequestError(res);
                };
                if (item.status !== "approved")
                    return <i className="fas fa-trash cursor-pointer"
                              style={{color: "#f55145"}}
                              onClick={() => onClick()}/>;
                else return null;
            }
        }
    ]
    private columnsNewProduct = [
        {
            title: "Tên sản phẩm",
            render: (value: INewProduct): React.ReactNode => {
                const {div, img, p} = styleTr.td_0;
                return <div style={div}>
                    <img style={img} src={value.src} alt={value.name}/>
                    <p style={p}>{value.name}</p>
                </div>;
            }
        },
        {
            title: "Giá bán",
            render: (data: INewProduct): React.ReactNode => {
                if (typeof data.price === "number")
                    return <span>{numberWithCommas(data.price)}</span>;
                else if (typeof data.price === "object" && data.price !== null)
                    return <span>{numberWithCommas(data.price[0])} - {numberWithCommas(data.price[1])}</span>;
                else return <span style={{color: "#d9d9d9"}}>Sản phẩm đấu giá</span>;
            }
        },
        {
            title: "Số tiền quyên góp (%)",
            render: (data: INewProduct) => {
                const product = this.newProducts.find(value => value.id === data.id) as INewProduct;
                const onBlur = (event: SyntheticEvent<HTMLInputElement>) => {
                    let percent: number = parseFloat(event.currentTarget.value) || 0;
                    percent = parseFloat(percent.toFixed(1));
                    if (percent > 100) percent = 100;
                    else if (percent < 0) percent = 0;
                    event.currentTarget.value = percent.toString();
                    product.percent = percent;
                    this.keyTable = Date.now();
                };
                return <div key={data.id}>
                    <input className="form-control"
                           defaultValue={data.percent ? data.percent.toString() : ""}
                           onBlur={(e) => onBlur(e)}
                           style={{width: "100px"}}
                           type="text"/>
                    {
                        (product.percent !== undefined && product.percent > 0 && typeof product.price === "number") &&
                        <span style={{
                            fontSize: "12px",
                            color: "#1976d2",
                            fontStyle: "italic"
                        }}>~{numberWithCommas(product.price * product.percent / 100)} đ</span>
                    }
                    {
                        (product.percent !== undefined && product.percent > 0 && product.price !== null && typeof product.price === "object") &&
                        <span style={{
                            fontSize: "12px",
                            color: "#1976d2",
                            fontStyle: "italic"
                        }}>~{numberWithCommas(product.price[0] * product.percent / 100)} - ~{numberWithCommas(product.price[1] * product.percent / 100)} (đ)</span>
                    }
                </div>;
            }
        },
        {
            title: "Số lượng đăng ký",
            render: (data: INewProduct) => {
                const product = this.newProducts.find(value => value.id === data.id) as INewProduct;
                if (!product.quantity) product.quantity = data.remainingQuantity;
                const onBlur = (event: SyntheticEvent<HTMLInputElement>) => {
                    let quantity: number = parseInt(event.currentTarget.value) || data.remainingQuantity;
                    if (quantity > data.remainingQuantity) quantity = data.remainingQuantity;
                    event.currentTarget.value = quantity.toString();
                    product.quantity = quantity;
                };
                return <input className="form-control"
                              defaultValue={data.remainingQuantity.toString()}
                              onBlur={(e) => onBlur(e)}
                              style={{width: "100px"}}
                              type="text"/>;
            }
        },
        {
            title: "Tồn kho hiện tại",
            render: (data: INewProduct) => <span>{numberWithCommas(data.remainingQuantity)}</span>
        },
        {
            title: "Xóa",
            render: (data: INewProduct) => {
                const handlerOnRemove = () => {
                    const index = this.newProducts.findIndex(value => value.id === data.id);
                    this.newProducts.splice(index, 1);
                    this.keyTable = Date.now();
                };
                return <i className="fas fa-trash-alt cursor-pointer p-4" onClick={() => handlerOnRemove()}/>;
            }
        }
    ];
    public static ruleProduct: IRuleProduct | null = null;

    @observable tab: "join" | "waiting" = "join";
    @observable loading: boolean = false;
    @observable static products: IResProduct[] = [];
    @observable static productsWaiting: IResProduct[] = [];
    @observable newProducts: INewProduct[] = [];
    @observable keyTable: number = Date.now();
    @observable keyTableAdded: number = Date.now();
    @observable disabledSubmit: boolean = false;
    @observable static campaignStatus?: "finished" | "processing" | "comingsoon" | string;

    constructor(props: any) {
        super(props);
        ListProduct.instance = this;
    }

    handlerOnChangeTab(value: "join" | "waiting") {
        if (value !== this.tab) this.newProducts = [];
        this.tab = value;
        if (value === "waiting") {
            ListProduct.productsWaiting = [];
            ListProduct.products.map(value1 => value1.status === "pending" && ListProduct.productsWaiting.push(value1));
        }
        this.keyTable = Date.now();
    }

    handlerOnShowPopupNewProduct() {
        let ids: number[] = [];
        this.newProducts.map(value => ids.push(value.id));
        ListProduct.products.map(value => ids.push(value.id));
        PopupProduct.show(
            ids,
            ListProduct.ruleProduct as IRuleProduct,
            ListProduct.limited as number
        );
    }

    handlerPopupNewProduct(data: { id: number, name: string, src: string, price: number | [number, number] | null, remainingQuantity: number }[]) {
        const temp: { id: number, name: string, src: string, price: number | [number, number] | null, remainingQuantity: number }[] = [];
        data.map(value => {
            const newProductFlag = this.newProducts.findIndex(value1 => value1.id === value.id);
            const productAddedFlag = ListProduct.products.findIndex(value1 => value1.id === value.id);
            if (newProductFlag === -1 && productAddedFlag === -1)
                temp.push(value);
            return value;
        });
        this.newProducts = [...this.newProducts, ...temp];
    }

    async handlerOnSubmitNewProduct() {
        let invalid: boolean = false;
        for (let i = 0; i < this.newProducts.length; i++) {
            if (!this.newProducts[i].percent || !this.newProducts[i].quantity) {
                invalid = true;
                break;
            }
        }
        if (invalid) notify.show("Vui lòng nhập đủ thông tin", "error");
        else {
            this.disabledSubmit = true;
            const bodyData = this.newProducts.reduce((previousValue: { id: number, percent: number, quantity: number }[], currentValue) => {
                previousValue.push({
                    id: currentValue.id,
                    percent: currentValue.percent as number,
                    quantity: currentValue.quantity as number
                });
                return previousValue;
            }, []);
            let response: IApiResponse = undefined as any;
            // Join campaign and add product
            if (ListProduct.products.length === 0) {
                response = await postRequest(`/v1/shops/${ProfileStore.shopId}/campaign/${ListProduct.campaignId}`, {productDTOs: bodyData});
            }
            // Append product
            else {
                response = await putRequest(`/v1/shops/${ProfileStore.shopId}/campaign/${ListProduct.campaignId}`, {productDTOs: bodyData});
            }
            this.disabledSubmit = false;
            if (response.status === 200) {
                notify.show("Thêm sản phẩm thành công", "success");
                this.newProducts.map(value => ListProduct.products.push({
                    id: value.id,
                    visible: true,
                    status: "pending",
                    variantPrice: ((): number[] | null => {
                        if (typeof value.price === "number") return [value.price];
                        else if (typeof value.price === "object") return value.price;
                        else return null;
                    })(),
                    percent: value.percent as number,
                    quantity: value.quantity as number,
                    name: value.name,
                    images: value.src
                }));
                this.newProducts = [];
                this.keyTable = Date.now();
                this.keyTableAdded = Date.now();
            } else handlerRequestError(response);
        }
    }

    render() {
        return <div>
            <Tabs activeKey={this.tab} onChange={value => this.handlerOnChangeTab(value as ("join" | "waiting"))}>
                <TabPane tab="Đã đăng ký" key="join"/>
                <TabPane tab="Chờ xác nhận" key="waiting"/>
            </Tabs>
            <div className="row align-items-center mb-3">
                <div className="col-lg-6">
                    {
                        ListProduct.ruleProduct &&
                        <p>Đăng ký tối đa <b>{ListProduct.limited}</b> sản phẩm. Đã đăng
                            ký <b>{numberWithCommas(ListProduct.products.length)}</b> sản
                            phẩm</p>
                    }
                </div>
                <div className="col-lg-6 d-flex justify-content-end"
                     css={css`button:not(:first-of-type){margin-left: 8px;}`}>
                    {
                        ListProduct.campaignStatus === "comingsoon" &&
                        <Button type="primary"
                                disabled={this.disabledSubmit}
                                onClick={() => this.handlerOnShowPopupNewProduct()}>Thêm sản phẩm</Button>
                    }
                    {
                        this.newProducts.length > 0 &&
                        <Button type="primary"
                                loading={this.disabledSubmit}
                                disabled={this.disabledSubmit}
                                onClick={() => this.handlerOnSubmitNewProduct()}>Lưu và gửi</Button>
                    }
                    {
                        this.newProducts.length > 0 && <Button onClick={() => this.newProducts = []}>Hủy</Button>
                    }
                </div>
            </div>
            {/*View*/}
            {this.newProducts.length === 0 && <div className="view-product" key={this.keyTableAdded}>
                <Table
                    size={"small"}
                    columns={this.columnsDetail}
                    loading={this.loading}
                    dataSource={this.tab === "join" ? ListProduct.products : ListProduct.productsWaiting}
                    pagination={{
                        pageSize: 5
                    }}
                    locale={{emptyText: () => <Empty description={"Không có dữ liệu"}/>}}
                />
            </div>}
            {/*  Add Product  */}
            {this.newProducts.length > 0 && <div className="add-product" key={this.keyTable}>
                <Table
                    size={"small"}
                    columns={this.columnsNewProduct}
                    pagination={{
                        pageSize: 5,
                        defaultCurrent: this.currentPage,
                        onChange: (page?: number) => {
                            this.currentPage = page as number
                        }
                    }}
                    dataSource={this.newProducts}
                    locale={{emptyText: () => <Empty description={"Không có dữ liệu"}/>}}
                />
            </div>}

            <PopupProduct onChange={data => this.handlerPopupNewProduct(data)}/>
        </div>;
    }

    static show(campaignId: number, campaignStatus: string, products: IResProduct[], rule: IRuleProduct, limitedProduct: number) {
        ListProduct.ruleProduct = rule;
        ListProduct.campaignId = campaignId;
        ListProduct.campaignStatus = campaignStatus;
        ListProduct.products = products;
        ListProduct.limited = limitedProduct;
    }
}

const styleTr = {
    td_0: {
        div: {
            display: "flex"
        },
        img: {
            width: "65px",
            height: "65px",
            minWidth: "65px",
            minHeight: "65px"
        },
        p: {
            paddingLeft: "8px"
        }
    },
    td_4: {
        span: {fontFamily: "Open Sans", fontWeight: 400},
        wating: {color: "#ffb80f"},
        reject: {color: "#f55145"},
        approve: {color: "#92c755"}
    }
}
