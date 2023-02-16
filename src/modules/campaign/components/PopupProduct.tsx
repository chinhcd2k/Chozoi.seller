import React from "react";
import {observer} from "mobx-react";
import {computed, observable} from "mobx";
import {Modal, Button, Row, Col, Empty, Tag} from "antd";
import Search from "antd/lib/input/Search";
import {getRequest, handlerRequestError} from "../../../common/services/BaseService";
import {store as ProfileStore} from "../../profile/stores/ProfileStore";
import {IResponseProduct} from "../../products/manager-product/components/ManagerProductComponent";
import {css} from "@emotion/core";
import {notify} from "../../../common/notify/NotifyService";
import {IRuleProduct} from "./ListProduct";
import {IResProfile} from "../../../api/auth/interfaces/response";

interface IProductData extends IResponseProduct {
    selected: boolean
}

interface IProps {
    onChange: (data: { id: number, name: string, src: string, price: number | [number, number] | null, remainingQuantity: number }[]) => any
}

@observer
export default class PopupProduct extends React.Component<IProps, any> {
    private static instance?: PopupProduct;
    private productContentRef = React.createRef<HTMLDivElement>();
    public productIdsAdded: number[] = [];
    public limited?: number;

    @observable visiable: boolean = false;
    @observable textSearch?: string;
    @observable categoryId?: number;
    @observable products: IProductData[] = [];
    @observable ruleProduct?: IRuleProduct;
    @observable categories: { id: number, name: string }[] = [];

    @computed get countSelected(): number {
        return this.products.reduce((previousValue, currentValue) => {
            if (currentValue.selected) previousValue++;
            return previousValue;
        }, 0);
    }

    metadata = {page: 0, size: 24, total: 0, totalPage: 0};

    constructor(props: IProps) {
        super(props);
        PopupProduct.instance = this;
    }

    handlerOnCancer() {
        this.visiable = false;
        this.products.map(value => value.selected = false);
    }

    handlerOnSubmit() {
        const data: { id: number, name: string, src: string, price: number | [number, number] | null, remainingQuantity: number }[] = [];
        this.products.map(value => {
            if (value.selected) {
                if (/^(NORMAL|CLASSIFIER)$/.test(value.type)) {
                    if (value.variants.length === 1) {
                        const {salePrice, inventory: {remainingQuantity}} = value.variants[0];
                        data.push({
                            id: value.id,
                            name: value.name,
                            src: value.imageVariants[0].image65,
                            remainingQuantity: value.isQuantityLimited ? remainingQuantity : 999,
                            price: salePrice
                        });
                    }//
                    else if (value.variants.length > 1) {
                        let minSalePrice = value.variants[0].salePrice;
                        let maxSalePrice = value.variants[0].salePrice;
                        let sumRemainingQuantity = 0;
                        value.variants.map(value => {
                            if (value.salePrice < minSalePrice) minSalePrice = value.salePrice;
                            if (value.salePrice > maxSalePrice) maxSalePrice = value.salePrice;
                            sumRemainingQuantity += value.inventory.remainingQuantity;
                            return value;
                        });
                        data.push({
                            id: value.id,
                            name: value.name,
                            src: value.imageVariants[0].image65,
                            remainingQuantity: value.isQuantityLimited ? sumRemainingQuantity : 999,
                            price: [minSalePrice, maxSalePrice]
                        });
                    }
                } //
                else if (/^(AUCTION|AUCTION_SALE|AUCTION_FLASH_BID)$/.test(value.type)) {
                    const {inventory: {remainingQuantity}} = value.variants[0];
                    data.push({
                        id: value.id,
                        name: value.name,
                        src: value.imageVariants[0].image65,
                        remainingQuantity: value.isQuantityLimited ? remainingQuantity : 999,
                        price: null
                    });
                }
            }
            return value;
        });
        this.visiable = false;
        this.props.onChange(data);
    }

    handlerOnScroll() {
        if (this.productContentRef.current) {
            const el = this.productContentRef.current;
            el.addEventListener("scroll", () => {
                if (el.scrollTop + el.offsetHeight === el.scrollHeight && this.metadata.page < this.metadata.totalPage - 1) {
                    this.metadata.page++;
                    this.handlerOnSearch(undefined, this.categoryId);
                }
            });
        }
    }

    handlerCategoryOnClick(id: number) {
        this.categoryId = id;
        this.handlerOnSearch(undefined, id);
    }

    /* Get API */
    async handlerOnSearch(searchStr?: string, categoryId?: number) {
        if (searchStr || categoryId) {
            this.metadata.page = 0;
        }
        const {page, size} = this.metadata;
        const textSearch = this.textSearch || "";
        const {shopId} = ProfileStore.profile as IResProfile;
        const res = await getRequest(`/v1/shops/${shopId}/products?collection=search${categoryId ? "&categoryId=" + categoryId : ""}${textSearch ? "&key_word=" + textSearch : ""}&page=${page}&size=${size}`);
        if (res.status === 200) {
            const temp: IProductData[] = [];
            res.body.products.map((value: IProductData) => {
                if (this.productIdsAdded.findIndex(value1 => value1 === value.id) !== -1)
                    value.selected = true;
                if (this.products.findIndex(value1 => value1.id === value.id) === -1)
                    temp.push(value);
                return value;
            });
            if (searchStr || categoryId) this.products = res.body.products;
            else this.products = this.products.concat(...temp);
            if (this.categories.length === 0) this.categories = res.body.categories;
            this.metadata.total = res.body.metadata.total;
            this.metadata.totalPage = res.body.metadata.totalPages;
        } else handlerRequestError(res);
    }

    /* Render */

    get renderFooter(): React.ReactNode {
        const style = {
            container: {
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center"
            },
            span: {
                height: "32px",
                padding: "0 16px",
                color: "#ffb80f",
                border: "solid 1px #ffb80f",
                lineHeight: "32px"
            }
        };
        return <div style={style.container}>
            <div>
                <Button onClick={() => this.handlerOnCancer()}>Hủy</Button>
                <Button type={"primary"}
                        onClick={() => this.handlerOnSubmit()}>Xác nhận</Button>
            </div>
        </div>
    }

    get renderGridProduct(): React.ReactNode {
        const cssStyle = css`
          max-height: 430px;
          overflow: hidden auto;
          padding-right: 8px;
          margin-top: 8px;

          div.product {
            border: solid 1px #d9d9d9;
            margin: 8px;
            border-radius: 4px;
            padding: 8px 4px;
            display: flex;
            justify-content: center;
            cursor: pointer;
            position: relative;

            img {
              width: 65px;
              height: 65px;
            }

            div.desc {
              display: none;
              position: absolute;
              right: 0;
              left: 0;
              bottom: 0;
              height: 48px;
              padding: 4px;
              background-color: rgba(217, 217, 217, .45);
              font-size: 13px;
              overflow: hidden;
              text-overflow: ellipsis;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            &:hover div.desc {
              display: -webkit-box;
            }

            &.active {
              border-color: #f55145;

              div.desc {
                display: -webkit-box;
                background-color: rgba(245, 81, 69, .35);
                color: #fff;
              }
            }

            &.disabled {
              cursor: not-allowed;

              div.desc {
                display: -webkit-box;
              }
            }
          }
        `;
        const handlerOnClick = (item: IProductData) => {
            if (item.selected) {
                const addedFlag = this.productIdsAdded.findIndex(value => value === item.id) !== -1;
                if (addedFlag) notify.show("Sản phẩm này không thể bỏ chọn! Vui lòng xóa.", "error");
                else item.selected = false;
            } else if (this.countSelected < (this.limited as number)) item.selected = true;
            else notify.show('Bạn đã chọn tối đa sản phẩm cho phép', "warning");
        };
        const isValid = (item: IProductData): boolean => {
            const {categories, condition, priceMin, priceMax, typeProduct} = this.ruleProduct as IRuleProduct;
            let valid = true;
            if (categories.length > 0) valid = categories.findIndex(value => parseInt(value + "") === item.category.id) !== -1; // Danh mục sản phẩm
            if (valid && typeProduct.toLowerCase() !== "all") valid = item.type.toLowerCase() === typeProduct.toLowerCase(); // Loại sản phẩm
            if (valid && condition.toLowerCase() !== "all") valid = item.condition.toLowerCase() === condition.toLowerCase(); // Tình trạng sản phẩm
            // Sản phẩm chỉ có 1 variant
            if (valid && item.variants.length === 1) {
                if (valid) valid = item.variants[0].salePrice >= priceMin; // Giá tối thiểu của sản phẩm
                if (valid) valid = item.variants[0].salePrice <= priceMax; // Giá tối đa của sản phẩm
            }
            // Sản phẩm có nhiều variant
            if (valid && item.variants.length > 1) {
                let minSalePrice = item.variants[0].salePrice;
                let maxSalePrice = item.variants[0].salePrice;
                item.variants.map(value => {
                    if (value.salePrice < minSalePrice) minSalePrice = value.salePrice;
                    if (value.salePrice > maxSalePrice) maxSalePrice = value.salePrice;
                    return value;
                });
                valid = (minSalePrice >= priceMin && maxSalePrice <= priceMax);
            }
            if (valid && /^(AUCTION|AUCTION_SALE|AUCTION_FLASH_BID)$/.test(item.type))
                valid = item.state === "READY";
            else if (valid) valid = item.state === "PUBLIC";
            return valid;
        }
        return (<>
            <div className="products-content"
                 ref={this.productContentRef}
                 css={cssStyle}>
                {
                    this.products.length === 0 &&
                    <Empty style={{marginTop: "32px"}} description={<span>Không tìm thấy sản phẩm</span>}/>
                }
                {
                    this.products.length > 0 &&
                    <Row style={{margin: "0 -8px"}}>{this.products.map(value => {
                        if (isValid(value))
                            return <Col xs={6} key={value.id}>
                                <div className={`product${value.selected ? " active" : ""}`}
                                     onClick={() => handlerOnClick(value)}>
                                    <img src={value.imageVariants[0].image65} alt={value.name}/>
                                    <div className="desc">{value.name}</div>
                                </div>
                            </Col>;
                        else
                            return <Col xs={6} key={value.id}>
                                <div className="product disabled">
                                    <img src={value.imageVariants[0].image65} alt={value.name}/>
                                    <div className="desc">Sản phẩm không thỏa mãn điều kiện của chương trình</div>
                                </div>
                            </Col>;
                    })}</Row>
                }
            </div>
        </>);
    }

    get renderCategory(): React.ReactNode {
        if (this.categories.length > 0) {
            return <div>
                <hr/>
                <h3>Danh mục sản phẩm</h3>
                <ul style={styleCategories.ul}>
                    {this.categories.map(value =>
                        <li key={value.id}
                            onClick={() => this.handlerCategoryOnClick(value.id)}
                            style={{
                                ...styleCategories.li,
                                color: this.categoryId === value.id ? "#ffb80f" : "inherit"
                            }}>{value.name}</li>)}
                </ul>
            </div>;
        } else return null;
    }

    get renderTag(): React.ReactNode {
        const onClose = () => {
            this.categoryId = undefined;
            this.handlerOnSearch();
        };
        if (this.categoryId) {
            const category = this.categories.find(value => value.id === this.categoryId);
            if (category) return <Tag style={{marginTop: "8px"}}
                                      closable
                                      color={"green"}
                                      onClose={() => onClose()}>{category.name}</Tag>;
            else return null;
        } else return null;
    }

    render() {
        if (this.ruleProduct) {
            return <Modal title={null}
                          width={"1200px"}
                          visible={this.visiable}
                          onCancel={() => this.handlerOnCancer()}
                          maskClosable={false}
                          footer={this.renderFooter}>
                <div className="row">
                    <div className="col-xs-3 category" style={{
                        borderRight: "solid 1px #cccccc",
                        minHeight: "500px"
                    }}>
                        <h5>Sản phẩm đã chọn ({this.countSelected}/{this.limited})</h5>
                        {this.renderCategory}
                    </div>
                    <div className="col-xs-9 products">
                        <div className="search mt-5">
                            <div className="row">
                                <div className="col-xs-7">
                                    <Search placeholder="Nhập tên sản phẩm"
                                            onChange={event => this.textSearch = event.currentTarget.value}
                                            onSearch={(value, event) => this.handlerOnSearch(value, this.categoryId)}/>
                                    {this.renderTag}
                                </div>
                            </div>
                        </div>
                        {this.renderGridProduct}
                    </div>
                </div>
            </Modal>;
        } else return null;
    }

    static async show(productIdsAdded: number[], rule: IRuleProduct, limitedProduct: number) {
        if (PopupProduct.instance) {
            const self = PopupProduct.instance;
            self.productIdsAdded = productIdsAdded;
            self.ruleProduct = rule;
            self.textSearch = undefined;
            self.metadata = {page: 0, size: 24, total: 0, totalPage: 0};
            self.categoryId = undefined;
            self.products = [];
            self.limited = limitedProduct;
            await self.handlerOnSearch();

            self.visiable = true;
            self.handlerOnScroll();
        } else {
            console.error("Not found instance Popup Product");
        }
    }
}

const styleCategories = {
    ul: {
        listStyle: "none",
        paddingLeft: 0
    },
    li: {
        cursor: "pointer",
        padding: "4px 0",
        borderBottom: 'dashed 1px #d9d9d9'
    }
};
