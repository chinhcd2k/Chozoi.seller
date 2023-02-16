import React, {SyntheticEvent} from "react";
import {observer} from "mobx-react";
import * as Sentry from "@sentry/browser";
import {observable} from "mobx";
import {notify} from "../../../../common/notify/NotifyService";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import css from "@emotion/css";

interface IPriceAndStoreProps {
    type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK'|'CREATE_F_N'
  onChangeAuctionType: (type: 'NORMAL' | 'FLASH' | 'AUCTION_GROUP'|'AUCTION_INVERSE') => any
}

@observer
export default class PriceAndStore extends React.Component<IPriceAndStoreProps, object> {
  @observable type: 'NORMAL' | 'FLASH' | 'AUCTION_GROUP'|'AUCTION_INVERSE' = "NORMAL";
  @observable startPrice: number = 0;
  @observable priceStep: number = 0;
  @observable quantiy: number = 0;
  @observable buyNowPrice: number = 0;
  @observable isBuyNow: boolean = true;
  @observable betweenPrice: [number, number] = [0, 0];
  @observable disabledForm: boolean = false;
  @observable disabledChangeTypeAuction: boolean = false;
  @observable listedPrice: number = 0;
  @observable costPrice: number = 0;
  @observable marketPrice: number = 0;
  @observable costGroupPrice: number = 0;
  @observable amount: number = 0;
  protected handlerOnChangeType(type: 'NORMAL' | 'FLASH' | 'AUCTION_INVERSE'|'AUCTION_GROUP') {
    if (!this.disabledForm && !this.disabledChangeTypeAuction) {
      if (this.type !== type) {
        notify.show('Bạn đã thay đổi kiểu đấu giá. Vui lòng chọn lại thời gian diễn ra!', "warning", 5);
        this.isBuyNow = true;
        this.buyNowPrice = 0;
        this.priceStep = 0;
        this.startPrice = 0;
        this.props.onChangeAuctionType(type);
      }
      this.type = type;
    }
  }

  protected InputTypeNumberOnChange(evemt: SyntheticEvent<HTMLInputElement>, key: 'buy_now_price' | 'start_price' | 'price_step' | 'quantity' | 'begin-price' | 'end-price' | 'listed-price' | 'cost'|'market-price'|'cost-price'|'amount') {
    let value: string | number = evemt.currentTarget.value;
    value = value.replace(/[^0-9]/g, '');
    value = parseInt(value);
    const SET_VALUE = (value: number) => {
      switch (key) {
        case "buy_now_price":
          this.buyNowPrice = value;
          break;
        case "price_step":
          this.priceStep = value;
          break;
        case "quantity":
          this.quantiy = Math.min(999, value);
          break;
        case "start_price":
          this.startPrice = value;
          break;
        case "begin-price":
          this.betweenPrice[0] = value;
          break;
        case "end-price":
          this.betweenPrice[1] = value;
          break;
        case "listed-price":
          this.listedPrice = value;
          break;
        case "cost":
          this.costPrice = value;
          break;
        case "market-price":
          this.marketPrice=value
          break;
        case "cost-price":
          this.costGroupPrice=value;
          break;
        case "amount":
          this.amount=value;
          break;
        case "listed-price":
          this.listedPrice = value;
          break;
        case "cost":
          this.costPrice = value;
          break;
      }
    };
    if (!isNaN(value)) SET_VALUE(value)
    else SET_VALUE(0);
  }

  public hasValidate(): boolean {
    if (this.type === "AUCTION_INVERSE") {
      if (this.listedPrice === 0) {
        notify.show('Vui lòng nhập giá niêm yết', "error");
        return false;
      }
      if (this.costPrice === 0) {
        notify.show('Vui lòng nhập giá gốc', "error");
        return false;
      }
    } else {
      if (this.type !== "AUCTION_GROUP" && this.startPrice === 0) {
        notify.show('Vui lòng nhập giá khởi điểm', "error");
        return false;
      } //
      else if (this.type !== "AUCTION_GROUP" && this.startPrice < 1000) {
        notify.show('Giá khởi điểm tối thiểu 1.000 đ', "error");
        return false;
      }
      if (this.type !== "AUCTION_GROUP" && this.priceStep === 0) {
        notify.show('Vui lòng nhập bước giá', "error");
        return false;
      }
      if (this.type === "FLASH" && this.quantiy === 0) {
        notify.show('Vui lòng nhập số lượng sản phẩm đấu giá', "error");
        return false;
      }
      if (this.isBuyNow) {
        if (this.buyNowPrice === 0) {
          notify.show('Vui lòng nhập giá bán ngay', "error");
          return false;
        } else if (this.buyNowPrice < this.startPrice) {
          notify.show('Giá bán ngay phải lớn hơn hoặc bằng giá khởi điểm', "error");
          return false;
        }
      }
      if (this.type === "FLASH") {
        if (this.betweenPrice[0]===0){
          notify.show('Nhập giá khả bán', "error");
          return false;
        }else {
          if (this.betweenPrice[0]<this.startPrice){
            notify.show('Giá khả bán phải lơn hơn giá khởi điểm', "error");
            return false;
          }
        }
        // if (this.betweenPrice[0] > 0 && this.betweenPrice[1] > 0) {
        //   if (this.betweenPrice[0] <= this.startPrice) {
        //     notify.show('Khoảng giá mong muốn bắt đầu phải lớn hơn giá khởi điểm', "error");
        //     return false;
        //   } else if (this.betweenPrice[0] > this.betweenPrice[1]) {
        //     notify.show('Khoảng giá mong muốn không hợp lệ', "error");
        //     return false;
        //   } else if (this.isBuyNow && this.betweenPrice[1] > this.buyNowPrice) {
        //     notify.show('Khoảng giá mong muốn cao nhất chỉ được nhỏ hơn hoặc bằng giá bán ngay', "error");
        //     return false;
        //   }
        // } //
        // else if (this.betweenPrice[0] + this.betweenPrice[1] > 0) {
        //   notify.show('Vui lòng nhập đầy đủ khoảng giá', "error");
        //   return false;
        // }
      }
      if (this.type === "AUCTION_GROUP") {
        if (this.costGroupPrice === 0) {
          notify.show('Vui lòng nhập giá gốc sản phẩm', "error");
          return false;
        }
        if (this.amount === 0) {
          notify.show('Vui lòng nhập số lượng mở bán', "error");
          return false;
        }
        if (this.marketPrice!==0){
          if (this.marketPrice<this.costGroupPrice){
            notify.show('Giá thị trường phải lớn hơn giá gốc', "error");
            return false;
          }
        }
      }
    }
    return true;
  }

  componentDidMount() {
    if (/^(DETAIL)$/.test(this.props.type)) {
      this.disabledForm = true;
      this.disabledChangeTypeAuction = true;
    }
    if (/^(REPLAY|REPLAY_QUICK)$/.test(this.props.type))
      this.disabledChangeTypeAuction = true;
  }
  renderChoiceTypeAuction(type: 'NORMAL' | 'FLASH' | 'AUCTION_INVERSE'| 'AUCTION_GROUP') {
    switch (type) {
      case "NORMAL":
        return (
          <div className="row">
            {/*Giá khởi điểm*/}
            <div className="col-xs-12 col-lg-6">
              <div className="start-price">
                <label className="">Giá khởi điểm *</label>
                <div>
                  <input type="text"
                         className="form-control"
                         disabled={this.disabledForm}
                         value={this.startPrice > 0 ? numberWithCommas(this.startPrice) : ''}
                         onChange={e => this.InputTypeNumberOnChange(e, "start_price")}
                         required={true}
                  />
                </div>
              </div>
            </div>
            {/*Bước giá*/}
            <div className="col-xs-12 col-lg-6">
              <div className="steps-price">
                <label className="">Bước giá *</label>
                <div>
                  <input type="text"
                         className="form-control"
                         disabled={this.disabledForm}
                         value={this.priceStep > 0 ? numberWithCommas(this.priceStep) : ''}
                         onChange={e => this.InputTypeNumberOnChange(e, "price_step")}
                         required={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case "FLASH":
        return (
          <div className="row">
            {/*Giá khởi điểm*/}
            <div className="col-xs-12 col-lg-6">
              <div className="start-price">
                <label className="">Giá khởi điểm *</label>
                <div>
                  <input type="text"
                         className="form-control"
                         disabled={this.disabledForm}
                         value={this.startPrice > 0 ? numberWithCommas(this.startPrice) : ''}
                         onChange={e => this.InputTypeNumberOnChange(e, "start_price")}
                         required={true}
                  />
                </div>
              </div>
            </div>
            {/*Bước giá*/}
            <div className="col-xs-12 col-lg-6">
              <div className="steps-price">
                <label className="">Bước giá *</label>
                <div>
                  <input type="text"
                         className="form-control"
                         disabled={this.disabledForm}
                         value={this.priceStep > 0 ? numberWithCommas(this.priceStep) : ''}
                         onChange={e => this.InputTypeNumberOnChange(e, "price_step")}
                         required={true}
                  />
                </div>
              </div>
            </div>
          </div>

        )
      case "AUCTION_GROUP":
        return(
          <div className="row">
            {/*Giá thị trường*/}
            <div className="col-xs-12 col-lg-4">
              <div className="market-price">
                <label className="">Giá thị trường </label>
                <p>Mức giá bán khi không áp dụng bất kỳ hình thức khuyến mãi nào</p>
                <div>
                  <input type="text"
                         className="form-control"
                         disabled={this.disabledForm}
                         value={this.marketPrice > 0 ? numberWithCommas(this.marketPrice) : ''}
                         onChange={e => this.InputTypeNumberOnChange(e, "market-price")}
                         required={true}
                  />
                </div>
              </div>
            </div>
            {/*Giá gốc sản phẩm*/}
            <div className="col-xs-12 col-lg-4">
              <div className="cost-price">
                <label className="">Giá gốc sản phẩm *</label>
                <p>Là mức giá thấp nhất có thể bán cho khách hàng</p>
                <div>
                  <input type="text"
                         className="form-control"
                         disabled={this.disabledForm}
                         value={this.costGroupPrice > 0 ? numberWithCommas(this.costGroupPrice) : ''}
                         onChange={e => this.InputTypeNumberOnChange(e, "cost-price")}
                         required={true}
                  />
                </div>
              </div>
            </div>
            {/*Số lượng mở bán*/}
            <div className="col-xs-12 col-lg-4">
              <div className="amount">
                <label className="">Số lượng mở bán *</label>
                <p>Là số lượng sản phẩm đăng đấu giá trong 1 phiên</p>
                <div>
                  <input type="text"
                         className="form-control"
                         disabled={this.disabledForm}
                         value={this.amount > 0 ? numberWithCommas(this.amount) : ''}
                         onChange={e => this.InputTypeNumberOnChange(e, "amount")}
                         required={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case "AUCTION_INVERSE":
        return (
          <div className="row">
            <div className="col-xs-12 col-lg-6">
              <div className="listed-price">
                <label>Giá niêm yết *</label>
                <p>Giá niêm yết là mức giá neo của khách hàng. Được tham khảo từ sản phẩm hoặc sản phẩm tương tự</p>
                <div>
                  <input type="text"
                         className="form-control"
                         disabled={this.disabledForm}
                         value={this.listedPrice > 0 ? numberWithCommas(this.listedPrice) : ''}
                         onChange={e => this.InputTypeNumberOnChange(e, "listed-price")}
                         required={true}
                  />
                </div>
              </div>
            </div>
            <div className="col-xs-12 col-lg-6">
              <div className="cost">
                <label>Giá gốc sản phẩm *</label>
                <p>Là mức giá vốn được điều chỉnh mục tiêu lãi/lỗ của sản phẩm</p>
                <div>
                  <input type="text"
                         className="form-control"
                         disabled={this.disabledForm}
                         value={this.costPrice > 0 ? numberWithCommas(this.costPrice) : ''}
                         onChange={e => this.InputTypeNumberOnChange(e, "cost")}
                         required={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      default:
        break;


    }
  }
  renderLabelTitle(type: 'NORMAL' | 'FLASH' | 'AUCTION_GROUP'|'AUCTION_INVERSE'){
    switch (type) {
      case "FLASH":
        return(
          <div className="alert alert-success mb-2">
            <i className="fas fa-info-circle pr-3"/>
            Hãy đa dạng sản phẩm đấu giá bằng hình thức đấu giá chớp nhoáng.
            <strong
              className="cursor-pointer"
              data-toggle="modal"
              data-target="#popup-guide-auction-flash-bids"
              data-backdrop="static">Tìm hiểu thêm tại đây</strong>
          </div>
        )
      case "AUCTION_GROUP":
        return (
          <div className="alert alert-success mb-2">
            <i className="fas fa-info-circle pr-3"/>
            Hãy đa dạng sản phẩm đấu giá bằng hình thức đấu giá mua chung.
            <strong
              className="cursor-pointer"
              data-toggle="modal"
              data-target="#popup-guide-auction-group"
              data-backdrop="static">Tìm hiểu thêm tại đây</strong>
          </div>
        )
      case "AUCTION_INVERSE":
        return (
          <div className="AUCTION_INVERSE-auction">
            <div className="alert alert-success mb-2">
              <i className="fas fa-info-circle pr-3"/>
              Hãy đa dạng sản phẩm đấu giá bằng hình thức đấu giá ngược.
              <strong
                className="cursor-pointer"
                data-toggle="modal"
                data-target="#popup-guide-auction-auction-reverse"
                data-backdrop="static"> Tìm hiểu thêm tại đây</strong>
            </div>
          </div>
        )
    }
  }
  renderBuyNow(type: 'NORMAL' | 'FLASH' | 'AUCTION_GROUP'|'AUCTION_INVERSE'){
   if (type==="NORMAL"||type==="FLASH"){
     return(
       <div className="col-xs-12">
         {/*<p className="mb-0">Bạn muốn sản phẩm của mình được bán ngay ở mức giá mà bạn*/}
         {/*  mong muốn?*/}
         {/*  <b className={this.isBuyNow ? "pl-2 text-danger" : "pl-2 text-primary"}*/}
         {/*     css={css`{*/}
         {/*              cursor: pointer*/}
         {/*            }`}*/}
         {/*     onClick={() => {*/}
         {/*       if (!this.disabledForm) {*/}
         {/*         this.isBuyNow && (this.buyNowPrice = 0);*/}
         {/*         this.isBuyNow = !this.isBuyNow;*/}
         {/*       }*/}
         {/*     }}>{this.buyNowPrice > 0 ? 'Hủy bán ngay.' : 'Chọn giá bán ngay.'}</b>*/}
         {/*</p>*/}
         <div className="price-buy-now">
           {this.isBuyNow && <div className="mt-3">
               <label className="">Giá bán ngay *</label>
               <div>
                   <input type="text"
                          required={true}
                          disabled={this.disabledForm}
                          className="form-control"
                          value={this.buyNowPrice > 0 ? numberWithCommas(this.buyNowPrice) : ''}
                          onChange={e => this.InputTypeNumberOnChange(e, "buy_now_price")}
                   />
               </div>
           </div>}
         </div>
       </div>
     )
   }else return null
  }

  render() {
    try {
      return <div>
        <h5>Giá và kho hàng *</h5>
        <ul className="nav nav-tabs mb-3">
          <li className={this.type === "NORMAL" ? 'active' : ''}
              onClick={() => this.handlerOnChangeType("NORMAL")}
          >Đấu giá thường
          </li>
          <li className={this.type === "FLASH" ? 'active' : ''}
              onClick={() => this.handlerOnChangeType("FLASH")}
          >Đấu giá chớp nhoáng
          </li>
          <li className={this.type === "AUCTION_INVERSE" ? 'active' : ''}
              onClick={() => this.handlerOnChangeType("AUCTION_INVERSE")}
          >Đấu giá ngược
          </li>
          <li className={this.type === "AUCTION_GROUP" ? 'active' : ''}
              onClick={() => this.handlerOnChangeType("AUCTION_GROUP")}
          >Đấu giá mua chung
          </li>
        </ul>
        {this.renderLabelTitle(this.type)}
        {this.renderChoiceTypeAuction(this.type)}
        {this.type === "FLASH" && <div className="flash-bids">
            <div className="row mt-3">
                <div className="col-xs-12"><label>Số lượng sản phẩm đấu giá *(phiên đấu giá sẽ dừng khi số người
                    chiến thắng bằng với số lượng sản phẩm đấu giá)</label></div>
                <div className="col-xs-12 col-lg-6">
                    <input type="text"
                           className="form-control"
                           disabled={this.disabledForm}
                           value={this.quantiy > 0 ? numberWithCommas(this.quantiy) : ''}
                           onChange={e => this.InputTypeNumberOnChange(e, "quantity")}
                           required={true}
                    />
                </div>
            </div>
            <div className="row mt-3">
                {/*<div className="col-xs-12"><label>Giá mong muốn (việc đưa ra giá mong muốn có thể sẽ giúp sản*/}
                {/*    phẩm đấu giá của bạn đạt được mức giá kỳ vọng)</label></div>*/}
                <div className="col-xs-6">
                    <label className="">Giá khả bán *</label>
                    <input type="text"
                           className="form-control"
                           disabled={this.disabledForm}
                           value={this.betweenPrice[0] > 0 ? numberWithCommas(this.betweenPrice[0]) : ''}
                           onChange={e => this.InputTypeNumberOnChange(e, "begin-price")}
                           required={true}
                    />
                </div>
                {/*<div className="col-xs-6">*/}
                {/*    <label className="font-weight-bold">Đến</label>*/}
                {/*    <input type="text"*/}
                {/*           className="form-control"*/}
                {/*           disabled={this.disabledForm}*/}
                {/*           value={this.betweenPrice[1] > 0 ? numberWithCommas(this.betweenPrice[1]) : ''}*/}
                {/*           onChange={e => this.InputTypeNumberOnChange(e, "end-price")}*/}
                {/*           required={true}*/}
                {/*    />*/}
                {/*</div>*/}
            </div>
        </div>}
        <div className="row mt-3">
          {/*Giá bán ngay*/}
          {this.renderBuyNow(this.type)}
        </div>
      </div>;
    } catch (e) {
      console.error(e);
      Sentry.captureException(e);
      return null;
    }
  }
}