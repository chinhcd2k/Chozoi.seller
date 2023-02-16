import React from "react";
import {observer} from "mobx-react";
import {Input, Modal, Table, Button, Tag, Pagination, Radio} from "antd";
import {observable} from "mobx";
import {IResponseProduct} from "../manager-product/components/ManagerProductComponent";
import {getRequest, handlerRequestError} from "../../../common/services/BaseService";
import {css} from "@emotion/core";
import {getUrlDetailProductLive} from "../../Redirect";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {IResponseAuction} from "../../auctions/DetailAuction";
import {AppGlobal} from "../../../AppGlobal";
import ga from '../../../init-ga';

interface IProps {
	 onSkip: () => any
	 onFetch: (data: IResponseProduct | IResponseAuction) => any
}

@observer
export default class PopupFetchData extends React.Component<IProps, any> {
	 private static instance?: PopupFetchData;
	 @observable private searchValue: string = '';
	 @observable visiable: boolean = false;
	 @observable loading: boolean = false;
	 @observable categories: { id: number, name: string, count: number } [] = [];
	 @observable products: (IResponseProduct | IResponseAuction)[] = [];
	 @observable metadata: { page: number, total: number } = {page: 1, total: 0};
	 @observable categoryId?: number;
	 @observable triggerScrollGa: boolean = true;

	 constructor(props: IProps) {
			super(props);
			PopupFetchData.instance = this;
	 }


	 public static show(name: string) {
			const self = PopupFetchData.instance;
			if (self) {
				 self.searchValue = name;
				 self.visiable = true;
				 self.handlerOnSearch(1);
			}
	 }

	 async handlerOnSearch(page: number, categoryId?: number) {
			this.categoryId = categoryId;
			this.loading = true;
			const res = await getRequest(`/v1/search/products?q=${this.searchValue}${categoryId ? '&category=' + categoryId : ""}&page=${page - 1}&size=10`, false);
			this.loading = false
			if (res.status === 200) {
				 if (!this.categoryId) this.categories = res.body.aggs.categories;
				 this.products = res.body.products;
				 this.metadata = {total: res.body.metadata.total, page: page};
			} else handlerRequestError(res);
	 }

	 async handlerBtnOnClick(productId: number) {
			this.visiable = false;
			const res = await getRequest(`/v1/products/${productId}`, false);
			this.props.onFetch(res.body.product);
	 }

	 async handlerOnSkip() {
			this.visiable = false;
			this.props.onSkip();
	 }

	 render() {
			const columns = [
				 {
						title: 'Hình ảnh',
						render: (item: IResponseProduct) => {
							 return <img src={item.imageVariants[0].image65} alt={item.name}/>;
						}
				 },
				 {
						title: 'Thông tin sản phẩm',
						render: (item: IResponseProduct) => <Description data={item}/>
				 },
				 {
						title: 'Đăng bán',
						render: (item: IResponseProduct | IResponseAuction) => {
							 return <Button
									 type={"primary"}
									 onClick={() => {
											this.handlerBtnOnClick(item.id);
											ga.fcSendGaForSale(() => ga.pushEventGa('Popup_search_product', 'Click_samethisproduct'), () => ga.pushEventGa('Popup_search_auction_product', 'Click_samethisproduct'))
									 }}
									 style={{
											whiteSpace: "normal",
											width: "160px",
											height: "auto",
											fontSize: "15px",
											backgroundColor: "#1976d2",
											borderColor: "#1976d2"
									 }}>Tương tự sản phẩm này</Button>;
						}
				 },
			];

			const total = this.categories.reduce((previousValue: number, currentValue) => {
				 previousValue += currentValue.count;
				 return previousValue;
			}, 0);

			return <Modal title={<span style={{fontFamily: "OpenSans-Semibold"}}>Tìm kiếm sản phẩm trên sàn Chozoi</span>}
										width={"1200px"}
										onCancel={() => {
											 this.visiable = false;
											 ga.fcSendGaForSale(() => ga.pushEventGa('Popup_search_product', 'Click_close_popup'), () => ga.pushEventGa('Popup_search_auction_product', 'Click_close_popup'))
										}}
										footer={null}
										maskClosable={false}
										visible={this.visiable}>
				 <div className="row">
						<div className="col-xs-3">
							 <div>
									<label>Tên sản phẩm</label>
									<Input.Search placeholder="Nhập tên sản phẩm..."
																value={this.searchValue}
																autoFocus={true}
																onChange={e => this.searchValue = e.currentTarget.value || ''}
																style={{height: "40px"}}
																enterButton={<Button style={{height: "32px"}} type={"primary"}><i
																		className="fal fa-search"/></Button>}
																onSearch={() => {
																	 this.handlerOnSearch(1);
																	 ga.fcSendGaForSale(() => ga.pushEventGa('Popup_search_product', 'Click_search'), () => ga.pushEventGa('Popup_search_auction_product', 'Click_search'))
																	 this.triggerScrollGa = true;
																}}
									/>
									{this.products.length === 0 && <div className="text-end">
                            <span>Không tìm thấy sản phẩm bạn muốn?&nbsp;<label
                                style={{color: "#1976d2", cursor: "pointer"}}
                                onClick={() => {
																	 this.handlerOnSkip();
																	 ga.fcSendGaForSale(() => ga.pushEventGa('Popup_search_product', 'Click_add_new_product'), () => ga.pushEventGa('Popup_search_auction_product', 'Click_add_new_product'))
																}}>Tạo sản phẩm mới</label></span>
                  </div>}
							 </div>
							 <div>
									<div className={"mt-3"}><Tag color="#1976d2">Danh mục sản phẩm tìm thấy</Tag></div>
									<Radio.Group
											style={{marginTop: "4px"}}
											onChange={e => {
												 this.handlerOnSearch(1, e.target.value);
												 ga.fcSendGaForSale(() => ga.pushEventGa('Popup_search_product', 'Click_change_cate'), () => ga.pushEventGa('Popup_search_auction_product', 'Click_change_cate'));
											}}
											value={this.categoryId}>
										 <Radio value={undefined} style={{display: 'block'}}>Tất
												cả{total > 0 ? ` (${numberWithCommas(total)})` : ""}</Radio>
										 {this.categories.map((value, index) =>
												 <Radio style={{display: 'block'}}
																value={value.id}
																key={index}>{value.name} ({numberWithCommas(value.count)})</Radio>)}
									</Radio.Group>
							 </div>
						</div>
						<div className="col-xs-9" css={css`div.ant-table-content {
              overflow-y: auto;
              max-height: 500px;
            }`} onScroll={() => {
							 if (this.triggerScrollGa) {
									ga.fcSendGaForSale(() => ga.pushEventGa('Popup_search_product', 'Scroll'), () => ga.pushEventGa('Popup_search_auction_product', 'Scroll'));
									this.triggerScrollGa = false;
							 }
						}}>
							 <p style={{marginBottom: "4px"}}>Danh sách sản phẩm tìm thấy</p>
							 <Table columns={columns}
											size={"small"}
											dataSource={this.products}
											pagination={false}
											loading={this.loading}
							 />
							 {this.metadata.total > 0 && <div className="d-flex mt-4 justify-content-end">
                   <Pagination current={this.metadata.page}
                               total={this.metadata.total}
                               showSizeChanger={false}
                               defaultPageSize={10}
                               onChange={(page) => {
																	this.handlerOnSearch(page, this.categoryId);
																	ga.fcSendGaForSale(() => ga.pushEventGa('Popup_search_product', 'Click_change_page'), () => ga.pushEventGa('Popup_search_auction_product', 'Click_change_page'));
															 }}/>
               </div>}
						</div>
				 </div>
			</Modal>;
	 }
}

const Description: React.FC<{ data: IResponseProduct | IResponseAuction }> = (props) => {
	 const style = css`
     width: 480px;
     box-sizing: content-box;
     min-height: 65px;

     a {
       display: block;
       white-space: nowrap;
       max-width: 100%;
       text-overflow: ellipsis;
       overflow: hidden;
     }
	 `;
	 const {id, name, category, type, variants} = props.data;

	 const getProductType = () => {
			if (type === "NORMAL" || type === "CLASSIFIER")
				 return <Tag color="#1976d2">Sản phẩm thường</Tag>
			else return <Tag color="#ffb80f">Sản phẩm đấu giá</Tag>
	 }

	 const getPrice = () => {
			if (type === "NORMAL" || type === "CLASSIFIER")
				 return <label className="mb-0">Giá bán: {numberWithCommas(variants[0].salePrice)}</label>
			else if ((props.data as IResponseAuction).auction) {
				 const {auction} = props.data as IResponseAuction;
				 return <div className="row">
						<div className="col-xs-6">Giá khởi điểm: {numberWithCommas(auction.startPrice)}</div>
						<div className="col-xs-6">Bước giá: {numberWithCommas(auction.priceStep)}</div>
				 </div>
			} else return null;
	 }

	 const getCategory = () => {
			const {categories} = AppGlobal;
			try {
				 if (categories && categories[category.id]) {
						const style = css`
              margin-bottom: 0;
              color: black;
              font-family: "OpenSans-Semibold";

              span {
                font-family: "Open Sans";
                color: #1976d2;
              }
						`;
						let content = "";
						categories[category.id].map((value, index) => content += `${index > 0 ? " > " : ""}${value.name}`);
						return <p css={style}>Danh mục:&nbsp;<span>{content}</span></p>;
				 } else return null;
			} catch (e) {
				 console.error(e);
				 return null;
			}
	 }

	 const getListPropety = () => {
			if (props.data.attributes.length > 0)
				 return <ul style={{
						listStyle: "none",
						paddingLeft: 0,
						marginBottom: 0
				 }} className="row">
						{(props.data as IResponseProduct).attributes.map((value, index) => {
							 if (index < 3) {
									return <li className="col-xs-6" style={{padding: "0 10px"}}
														 key={index}>{value.name}: {value.value}</li>
							 } else return null;
						})}
				 </ul>;
			else return null;
	 }

	 return <div css={style}>
			<a href={`${getUrlDetailProductLive(category.id, id, name)}`}
				 target={"_blank"}
				 onClick={() => ga.fcSendGaForSale(() => ga.pushEventGa('Popup_search_product', 'Click_item_detail'), () => ga.pushEventGa('Popup_search_auction_product', 'Click_item_detail'))}>{name}</a>
			<div>{getProductType()}</div>
			<div>{getCategory()}</div>
			<div>{getPrice()}</div>
			<div>{getListPropety()}</div>
	 </div>;
}