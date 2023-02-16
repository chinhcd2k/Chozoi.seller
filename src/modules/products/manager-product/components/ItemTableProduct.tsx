import React, {useEffect, useState} from "react";
import {IResponseProduct} from "./ManagerProductComponent";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import "../containers/ItemTableProductStyle.scss";
import {Link} from "react-router-dom";
import * as Sentry from '@sentry/browser';
import $ from "jquery";
import {getUrlDetailProductLive} from "../../../Redirect";
import InfomationBasic from "../../../auctions/template/components/InfomationBasic";
import {useHistory} from "react-router-dom";
import {store as managerProductStore} from "../stores/ManagerProductStore";

interface IItemTableProductProps {
  key?: number
  index: number
  data: IResponseProduct
  confirmChangeQuantity: (product: IResponseProduct, variantId: number | undefined, quantity: number, callback: (variantId?: number) => void) => void
  confirmChangeState?: (toState: 'PENDING' | 'PUBLIC' | 'READY' | 'DELETE') => void
  emitViewerImage: (src: string) => void
}

const HOST_DOMAIN_SHARE_TOKEN: string = (window as any).HOST_DOMAIN_SHARE_TOKEN || '';

export const ItemTableProduct: React.FC<IItemTableProductProps> = (props: IItemTableProductProps) => {

  const [keyTr, setKeyTr] = useState(Math.random());
  const [quantity, setQuantity] = useState(props.data.type === "NORMAL" && props.data.variants[0].inventory.remainingQuantity ? props.data.variants[0].inventory.remainingQuantity : 0);

  useEffect(() => {
    $('[data-toggle="tooltip"]').tooltip();
  });

  const openDetailProduct = () => {
    window.open(getUrlDetailProductLive(props.data.category.id, props.data.id, props.data.name));
  };

  const generateState = (): React.ReactNode => {
    switch (props.data.state) {
      case "PUBLIC":
        if (props.data.isPublic) return <span className="label label-success p-2 text-white">Đang bán</span>;
        else return <span className="label label-default p-2 text-white">Không xác định</span>;
      case "READY":
        return <span className="label label-primary p-2 text-white">Đã duyệt</span>;
      case "PENDING":
        return <span className="label label-warning p-2">Đợi duyệt</span>;
      case "DRAFT":
        return <span className="label label-default p-2 text-white">Nháp</span>;
      case "REJECT":
        return <span className="label label-danger p-2 text-white cursor-pointer"
                     data-toggle="tooltip"
                     data-placement="top"
                     data-original-title={props.data.reportIssues ? props.data.reportIssues.description : ''}
        >Từ chối</span>;
      default:
        return "";
    }
  };

  const generateClassifier = (): React.ReactNode => {
    return (<td className="td-variants" colSpan={3}>
      {props.data.variants.map((item: {
        id?: number,
        attributes: { name: string, value: string | number }[],
        price: number | "",
        salePrice: number,
        sku: string,
        inventory: {
          initialQuantity: number,
          inQuantity: number,
          outQuantity: number,
          quantity: number,
          remainingQuantity?: number
        },
        input?: boolean
      }, index: number) => {
        if (index < props.data.showVariants) {
          return <div key={index} className="row classifier">
            <div
              className="col-xs-4">{Array.isArray(item.attributes) && item.attributes.reduce((pre: string, item1: { name: string, value: string | number }) => pre += (pre === "" ? item1.value : `, ${item1.value}`), "")}</div>
            <div className="col-xs-4">{numberWithCommas(item.salePrice, 'đ')}</div>
            <div className="col-xs-4">
              {!item.input && <div>
                  <span>{numberWithCommas(item.inventory.remainingQuantity)}</span>
                {props.data.state === "PUBLIC" && !props.data.input &&
                <span style={{cursor: 'pointer', marginLeft: '10px'}} onClick={() => {
                  item.input = true;
                  setQuantity(item.inventory.remainingQuantity ? item.inventory.remainingQuantity : 0);
                  setKeyTr(Math.random());
                }}><i className="fa fa-pencil"/></span>}
              </div>}
              {item.input && <div className="change-quantity">
                  <input className="form-control" autoFocus={true}
                         defaultValue={item.inventory.remainingQuantity ? item.inventory.remainingQuantity.toString() : '0'}
                         onChange={e => handlerOnChangeQuantity(e)}
                         required={true}/>
                  <i className="text-success fa fa-check p-2"
                     onClick={() => props.confirmChangeQuantity && props.confirmChangeQuantity(props.data, item.id ? item.id : undefined, quantity, responseUpdateQuantity)}
                  />
                  <i className="text-danger fa fa-times p-2" onClick={() => {
                    item.input = false;
                    setKeyTr(Math.random());
                  }}/>
              </div>}
            </div>
          </div>
        } else {
          return "";
        }
      })}
      {/*Xem thêm*/}
      {props.data.showVariants < props.data.variants.length && <div className="row mx-0 my-2">
          <div className="col-xs-12"><p
              onClick={(e: any) => {
                props.data.showVariants = props.data.variants.length;
                setKeyTr(Math.random());
              }}
              className="text-info more" style={{cursor: 'pointer'}}>Xem
              thêm {props.data.variants.length - props.data.showVariants} phân loại hàng khác <i
                  className="fa fa-angle-down"/></p>
          </div>
      </div>}
      {/*Thu gọn*/}
      {props.data.showVariants === props.data.variants.length && <div className="row mx-0 my-2">
          <div className="col-xs-12"><p
              onClick={(e: any) => {
                props.data.showVariants = 5;
                setKeyTr(Math.random());
              }}
              className="text-info more" style={{cursor: 'pointer'}}>Thu lại <i
              className="fa fa-angle-up"/></p>
          </div>
      </div>}
    </td>);
  };

  const responseUpdateQuantity = (variantId?: number) => {
    if (props.data.type === "NORMAL") {
      props.data.variants[0].inventory.remainingQuantity = quantity;
      props.data.input = false;
    } else if (variantId) {
      const index = props.data.variants.findIndex(value => value.id === variantId);
      if (index !== -1) {
        props.data.variants[index].inventory.remainingQuantity = quantity;
        props.data.variants[index].input = false;
      }
    }
    setKeyTr(Math.random());
  };

  const handlerOnChangeQuantity = (e: any) => {
    let value: string = e.currentTarget.value || ''.trim();
    value = value.replace(/([^0-9]|^0)/g, '');
    if (parseInt(value) < 1000) {
      setQuantity(parseInt(value));
      e.currentTarget.value = value;
    } else if (parseInt(value) > 0) {
      setQuantity(999);
      e.currentTarget.value = 999;
    } else {
      setQuantity(0);
      e.currentTarget.value = 0;
    }
  };
  const history = useHistory()
  const handleCreateAuction = () => {
    managerProductStore.dataCreateAuction = props.data
    history.push('/home/auction/createFromNormal')
  }

  try {
    return (<tr className="product-manager-product-item" key={keyTr}>
      {/*checkbox*/}
      {/* <td>
                <div><input
                    defaultChecked={props.data.selected}
                    onChange={(e: any) => {
                        props.data.selected = !props.data.selected;
                        props.checkboxOnClick();
                    }}
                    id={'remember-me-' + props.index} className="magic-checkbox"
                    type="checkbox"/>
                    <label htmlFor={'remember-me-' + props.index}/>
                </div>
            </td>*/}
      {/*Sản phẩm*/}
      <td className="td-product">
        <div className="d-flex align-items-center">
          <div className="d-flex flex-column align-items-center">
            <div className="image">
              <img className="img-fluid cursor-pointer"
                   src={props.data.imageVariants[0].image65}
                   onClick={() => props.emitViewerImage(props.data.images[0].imageUrl)}
                   alt=""/>
            </div>
            {/*{generateStateProduct()}*/}
          </div>
          <div className="name">
            <Link className="text-info"
                  to={`/home/product/detail/${props.data.id}`}>{props.data.name}</Link>
            {props.data.state === "PUBLIC" &&
            <span className="ml-3" style={{cursor: 'pointer'}} data-toggle="tooltip" data-placement="top"
                  data-original-title={`Xem trên ${HOST_DOMAIN_SHARE_TOKEN}`}
                  onClick={() => openDetailProduct()}
            ><i className="fas fa-eye"/>
                        </span>}
          </div>
        </div>
      </td>
      {props.data.type !== "CLASSIFIER" && <td className="td-variants" colSpan={3}>
          <div className="row mx-0">
            {/*Phân loại sản phẩm thường*/}
              <div className="col-xs-4"><p className="m-0">─</p></div>
            {/*Giá bán sản phẩm thường*/}
              <div className="col-xs-4">
                {numberWithCommas(props.data.variants[0].salePrice, 'đ')}{/*{props.data.currency}*/}</div>
            {/*Số lượng sản phẩm thường*/}
              <div className="col-xs-4 td-quantity">
                {/*Quản lý số lượng*/}
                {(props.data.type === "NORMAL" || props.data.type === "PROMOTION") && props.data.isQuantityLimited &&
                <div>
                  {props.data.input && <div className="change-quantity">
                      <input className="form-control" autoFocus={true}
                             defaultValue={props.data.variants[0].inventory.remainingQuantity ? props.data.variants[0].inventory.remainingQuantity.toString() : '0'}
                             onChange={e => handlerOnChangeQuantity(e)}
                             required={true}/>
                      <i className="text-success fa fa-check p-2"
                         onClick={() => props.confirmChangeQuantity && props.confirmChangeQuantity(props.data, props.data.variants[0] ? props.data.variants[0].id : undefined, quantity, responseUpdateQuantity)}
                      />
                      <i className="text-danger fa fa-times p-2" onClick={() => {
                        props.data.input = false;
                        setKeyTr(Math.random());
                      }}/>
                  </div>}
                  {/* Hiển thị */}
                  {!props.data.input && <div>
                      <span>{numberWithCommas(props.data.variants[0].inventory.remainingQuantity)}</span>
                    {props.data.state === "PUBLIC" && !props.data.input &&
                    <span style={{cursor: 'pointer', marginLeft: '10px'}}
                          onClick={() => {
                            props.data.input = true;
                            setKeyTr(Math.random());
                          }}><i className="fa fa-pencil"/></span>}
                  </div>}
                </div>}
                {/*Không quản lý số lượng*/}
                {!props.data.isQuantityLimited && <span className="text-success">Sẵn hàng</span>}
              </div>
          </div>
      </td>}
      {/*Phân loại, giá bán, số lượng: Sản phẩm có nhiều variants*/}
      {props.data.type === "CLASSIFIER" && generateClassifier()}
      {/*Thời gian khuyển mại*/}
      <td className="text-center td-promotion">
        {/*{props.data.type === "PROMOTION" && props.data.promotion &&
                <span>Từ: {convertIsoTime(new Date(props.data.promotion.dateStart).getTime())}
                    <br/>Đến: {convertIsoTime(new Date(props.data.promotion.dateEnd).getTime())}</span>}*/}
        {/*Không có dữ liệu*/}
        {props.data.type !== "PROMOTION" && <p>Chưa có khuyến mại</p>}
      </td>
      {/*Trang thai*/}
      <td className="text-center td-state">{generateState()}</td>
      {/*Hành động*/}
      <td className="td-action">
        <div className="d-flex align-items-center">
          {/* => PUBLIC*/}
          {props.data.state === "READY" &&
          <button className="btn btn-default" data-toggle="tooltip" data-placement="top"
                  onClick={() => props.confirmChangeState && props.confirmChangeState('PUBLIC')}
                  data-original-title="Yêu cầu hiển thị"><i className="fa fa-upload"/></button>}

          {/* => READY*/}
          {props.data.state === "PUBLIC" &&
          <button className="btn btn-default" data-toggle="tooltip" data-placement="top"
                  onClick={() => props.confirmChangeState && props.confirmChangeState("READY")}
                  data-original-title="Ẩn khỏi sàn"><i className="fas fa-download"/></button>}
          {/* => EDIT*/}
          <Link
            data-toggle="tooltip" data-placement="top" data-original-title="Sửa cần đợi Chozoi duyệt"
            type="button" to={`/home/product/update/${props.data.id}`}>
            <button className="btn btn-default"><i className="fa fa-pencil"/></button>
          </Link>
          {/* => PENDING*/}
          {props.data.state === "DRAFT" &&
          <button className="btn btn-default" data-toggle="tooltip" data-placement="top"
                  onClick={() => props.confirmChangeState && props.confirmChangeState('PENDING')}
                  data-original-title="Yêu cầu duyệt"><i className="fa fa-check"/></button>}
          {/* => DELETE*/}
          {props.data.state !== "PENDING" && !props.data.isPublic &&
          <button className="btn btn-default" data-toggle="tooltip" data-placement="top"
                  onClick={() => props.confirmChangeState && props.confirmChangeState('DELETE')}
                  data-original-title="Xóa sản phẩm"><i className="fas fa-trash"/></button>}
          {/* => CONVERT*/}
          {
            // <Link data-toggle="tooltip" data-placement="top" data-original-title="Chuyển sang đấu giá"
            //       type="button"  onClick={()=>handleCreateAuction()}>
            //     <button className="btn btn-default"><i className="fas fa-gavel"/></button>
            // </Link>}
            <button className="btn btn-default" data-toggle="tooltip" data-placement="top"
                    onClick={() => handleCreateAuction()}
                    data-original-title="Chuyển sang đấu giá"><i className="fas fa-gavel"/></button>}
        </div>
      </td>
      {/*Trên sàn*/}
      <td className="flag">{props.data.isPublic && <i className="fad fa-flag-alt"/>}</td>
    </tr>);
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    return (<tr>
      <td colSpan={9}>Exception: {e.message} | ProductID: {props.data.id}</td>
    </tr>);
  }
};