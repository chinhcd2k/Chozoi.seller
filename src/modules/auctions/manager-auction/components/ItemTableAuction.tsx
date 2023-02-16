import React, {CSSProperties, SyntheticEvent, useState} from "react";
import "../styles/ItemTableAuctionStyle.scss";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import {Link} from "react-router-dom";
import * as Sentry from "@sentry/browser";
import {Moment} from "../../../../common/functions/Moment";
import {ItemAction} from "./ItemAction";
import {IResponseAuction} from "../../DetailAuction";
import {service, IRequestBodyDataUpdateProductWithStatePublic} from "../../../products/ProductServices";
import {notify} from "../../../../common/notify/NotifyService";
import {getUrlDetailProductLive} from "../../../Redirect";
import {css} from "@emotion/core";

interface IItemTableAuctionProps {
    data: IResponseAuction
    emitOnViewerImage: (src: string) => void
    onChangeState: (state: 'VIEW' | 'EDIT' | 'PENDING' | 'DRAFT' | 'BIDDING' | 'STOPPED' | 'REPLAY' | 'REPLAY_QUICK' | 'REMOVE'|'CREATE_N') => any
}

export const ItemTableAuction: React.FC<IItemTableAuctionProps> = (props: IItemTableAuctionProps) => {
    const [edit, setEdit] = useState(false);
    const [quantity, setQuantity] = useState(props.data.variants[0].inventory.remainingQuantity);

    const getStateAuction = (): React.ReactNode => {
        switch (props.data.auction.state) {
            case "WAITING":
                return <p className="mb-0 p-2 label label-warning text-white mt-2">Sắp diễn ra</p>;
            case "BIDING":
                return <p className="mb-0 p-2 mt-2 label label-success text-white">Đang đấu giá</p>;
            case "STOPPED":
                return <p className="mb-0 p-2 mt-2 label label-warning text-white">Đã kết thúc</p>
        }
    };

    const getDescriptionAuction = (): React.ReactNode => {
        if (props.data.auction.state === "BIDING") {
            let date: string = '';
            let hour: string = '';
            let minutes: string = '';
            let seconds: string = '';
            let timeEnd = new Date(props.data.auction.timeEnd as string);
            if (typeof props.data.auction.timeEnd === "string")
                timeEnd = new Date(Moment.LocalDatetime(props.data.auction.timeEnd) * 1000);
            let temp = Math.floor((timeEnd.getTime() - new Date().getTime()) / 1000);
            const total_second_minute = 60;
            const total_second_hour = total_second_minute * total_second_minute;
            const total_second_day = 24 * total_second_hour;
            if (temp >= total_second_day) {
                date = Math.floor(temp / total_second_day) + '';
                temp -= (total_second_day * parseInt(date));
            }
            if (temp >= total_second_hour) {
                hour = Math.floor(temp / total_second_hour) + '';
                hour = parseInt(hour) < 10 ? '0' + hour : hour;
                temp -= parseInt(hour) * total_second_hour;
            }
            if (temp >= total_second_minute) {
                minutes = Math.floor(temp / total_second_minute) + '';
                minutes = parseInt(minutes) < 10 ? '0' + minutes : minutes;
                temp -= parseInt(minutes) * total_second_minute;
            }
            seconds = temp > 0 ? temp.toString() : '';
            if (/^(AUCTION_INVERSE)$/.test(props.data.type)){
                return <div className="pl-3">
                    <div className="text-left">
                        <Link className="mb-1 text-info"
                              to={`/home/auction/detail/${props.data.id}`}>{props.data.name}</Link>
                        {props.data.isPublic &&
                        <a href={getUrlDetailProductLive(props.data.category.id, props.data.id, props.data.name)}
                           target={'_blank'} className="ml-2"><i className="fas fa-eye"/></a>}
                    </div>
                    <div className="text-left mb-0"><span
                      className="pr-3">{props.data.auction.result.bidsCount}</span>Lượt đấu
                    </div>
                    <p className="text-left mb-0">{`Còn lại ${date ? date + ' ngày ' : ''}${hour ? hour + ' giờ ' : ''}${minutes ? minutes + ' phút ' : ''}${seconds ? seconds + ' giây ' : ''}`}</p>
                </div>
            }else {
                return <div className="pl-3">
                    <div className="text-left">
                        <Link className="mb-1 text-info"
                              to={`/home/auction/detail/${props.data.id}`}>{props.data.name}</Link>
                        {props.data.isPublic &&
                        <a href={getUrlDetailProductLive(props.data.category.id, props.data.id, props.data.name)}
                           target={'_blank'} className="ml-2"><i className="fas fa-eye"/></a>}
                    </div>
                    <div className="text-left mb-0"><span
                      className="pr-3">{props.data.auction ? numberWithCommas(props.data.auction.startPrice, 'đ') : ''}</span>Giá
                        khởi điểm
                    </div>
                    <div className="text-left mb-0"><span
                      className="pr-3">{props.data.auction.result && props.data.auction.result ? numberWithCommas(props.data.auction.result.currentPrice, 'đ') : ''}</span>Giá
                        hiện tại
                    </div>
                    <p className="text-left mb-0">{`Còn lại ${date ? date + ' ngày ' : ''}${hour ? hour + ' giờ ' : ''}${minutes ? minutes + ' phút ' : ''}${seconds ? seconds + ' giây ' : ''}`}</p>
                </div>
            }

        } //
        else if (props.data.auction.state === "STOPPED") {
            if (/^(AUCTION_INVERSE)$/.test(props.data.type)){
                return <div className="pl-3">
                    <div className="text-left">
                        <Link className="mb-1 text-info"
                              to={`/home/auction/detail/${props.data.id}`}>{props.data.name}</Link>
                        {props.data.isPublic &&
                        <a href={getUrlDetailProductLive(props.data.category.id, props.data.id, props.data.name)}
                           target={'_blank'} className="ml-2"><i className="fas fa-eye"/></a>}
                    </div>
                    {/*<p className="text-left mb-0"><b*/}
                    {/*  className="pr-3">{numberWithCommas(props.data.auction.result.currentPrice, 'đ')}</b>Còn lại</p>*/}
                    <p className="text-left mb-0"><b
                      className="pr-3">{numberWithCommas(props.data.auction.result.bidsCount, 'đ')}</b>Lượt đấu</p>
                </div>
            }
            else
            return <div className="pl-3">
                <div className="text-left">
                    <Link className="mb-1 text-info"
                          to={`/home/auction/detail/${props.data.id}`}>{props.data.name}</Link>
                    {props.data.isPublic &&
                    <a href={getUrlDetailProductLive(props.data.category.id, props.data.id, props.data.name)}
                       target={'_blank'} className="ml-2"><i className="fas fa-eye"/></a>}
                </div>
                <p className="text-left mb-0"><b
                    className="pr-3">{numberWithCommas(props.data.auction.result.currentPrice, 'đ')}</b>Giá
                    hiện tại</p>
            </div>
        } //
        else if (props.data.auction.state === "WAITING") {
            return <div className="pl-3">
                <div className="text-left">
                    <Link className="mb-1 text-info"
                          to={`/home/auction/detail/${props.data.id}`}>{props.data.name}</Link>
                    {props.data.isPublic &&
                    <a href={getUrlDetailProductLive(props.data.category.id, props.data.id, props.data.name)}
                       target={'_blank'} className="ml-2"><i className="fas fa-eye"/></a>}
                </div>
                <div className="text-left mb-0"><span
                    className="pr-3">{numberWithCommas(props.data.auction.startPrice, 'đ')}</span>Giá khởi điểm
                </div>
            </div>;
        } //
        else if (/^(PUBLIC|READY)$/.test(props.data.state)) {
            if (props.data.auction.state !== "STOPPED") {
                if (/^(AUCTION_INVERSE)$/.test(props.data.type)){
                    return <div className="pl-3">
                        <div className="text-left">
                            <Link className="mb-1 text-info"
                                  to={`/home/auction/detail/${props.data.id}`}>{props.data.name}</Link>
                            {props.data.isPublic &&
                            <a href={getUrlDetailProductLive(props.data.category.id, props.data.id, props.data.name)}
                               target={'_blank'} className="ml-2"><i className="fas fa-eye"/></a>}
                        </div>
                        <div className="text-left mb-0"><span
                          className="pr-3">{numberWithCommas(props.data.auction.startPrice, 'đ')}</span>Còn lại
                        </div>
                        <div className="text-left mb-0"><span
                          className="pr-3">{numberWithCommas(props.data.auction.startPrice, 'đ')}</span>Lượt đấu
                        </div>
                    </div>;
                }else {
                    return <div className="pl-3">
                        <div className="text-left">
                            <Link className="mb-1 text-info"
                                  to={`/home/auction/detail/${props.data.id}`}>{props.data.name}</Link>
                            {props.data.isPublic &&
                            <a href={getUrlDetailProductLive(props.data.category.id, props.data.id, props.data.name)}
                               target={'_blank'} className="ml-2"><i className="fas fa-eye"/></a>}
                        </div>
                        <div className="text-left mb-0"><span
                          className="pr-3">{props.data.auction ? numberWithCommas(props.data.auction.startPrice, 'đ') : ''}</span>Giá
                            khởi điểm
                        </div>
                        <div className="text-left mb-0"><span
                          className="pr-3">{props.data.auction.result && props.data.auction.result ? numberWithCommas(props.data.auction.result.currentPrice, 'đ') : ''}</span>Giá
                            hiện tại
                        </div>
                    </div>
                }
            }
        } //
        else return null;
    };

    const getStateProduct = (): React.ReactNode => {
        /*
        * --- PRODUCT STATE ---
        * PUBLIC: Đã được duyệt và hiện ra trang chủ.
        * READY: Đã duyệt nhưng chưa được hiển thị.
        * PENDING: Đợi duyệt
        * DRAFT: Nháp
        * REJECT: Bị từ chối bởi admin
        *
        * --- AUCTION STATE ----
        * BIDING: Đang đấu giá.
        * WAITING: Sắp diễn ra đấu giá.
        * STOPPED: Đã kết thúc đấu giá.
        * */

        if (props.data.state === "REJECT") {
            return <span className="label label-danger p-2">Từ chối</span>;
        } else if (props.data.state === "DRAFT") {
            return <span className="label label-draft text-white p-2">Nháp</span>;
        } else if (props.data.state === "PENDING") {
            return <span className="label bg-yellow label-warning p-2">Đợi duyệt</span>;
        } else if (/^(PUBLIC|READY)$/.test(props.data.state)) {
            if (props.data.auction.state === "STOPPED") {
                return <span className="label label-danger p-2">Đã kết thúc</span>;
            } else {
                return <span className="label label-primary text-white p-2">Đã duyệt</span>;
            }
        }
    };

    const handlerOnChangeQuantity = (e: SyntheticEvent<HTMLInputElement>) => {
        let value: number | string = e.currentTarget.value;
        value.replace(/[^0-9]/g, '');
        value = parseInt(value);
        if (!isNaN(value)) setQuantity(Math.min(999, value));
        else setQuantity(0);
    }

    const execChangeQuantity = async () => {
        /*  if(quantity < props.data.variants[0].inventory.remainingQuantity) {

          }*/
        const request_body: IRequestBodyDataUpdateProductWithStatePublic = {
            id: props.data.id,
            packing_size: props.data.packingSize,
            images: props.data.images.reduce((previousValue: any[], currentValue) => {
                previousValue.push({id: currentValue.id, sort: currentValue.sort, image_url: currentValue.imageUrl});
                return previousValue;
            }, []),
            weight: props.data.weight,
            is_quantity_limited: true,
            free_ship_status: props.data.freeShipStatus,
            variants: [{
                id: props.data.variants[0].id,
                attributes: props.data.variants[0].attributes,
                price: props.data.variants[0].price,
                sale_price: props.data.variants[0].salePrice,
                sku: props.data.variants[0].sku,
                image_id: props.data.variants[0].imageId,
                inventory: {
                    in_quantity: quantity as number,
                }
            }]
        };
        const response = await service.PUT_UpdateProductWithOption(props.data.shop.id, props.data.id, request_body);
        if (response.status === 200) {
            notify.show('Thao tác thực hiện thành công', "success");
            setEdit(false);
        } //
        else {
            service.pushNotificationRequestError(response);
            setQuantity(props.data.variants[0].inventory.remainingQuantity);
            setEdit(false);
        }
    }
    const tooltipCopyRef = React.createRef<HTMLSpanElement>();
    const keyPrivateRef = React.createRef<HTMLInputElement>();
    const copyPrivateKey = () => {
        if (tooltipCopyRef.current) {
            tooltipCopyRef.current.innerText = "Đã sao chép";
            setTimeout(() => {
                if (tooltipCopyRef.current) {
                    tooltipCopyRef.current.innerText = "Sao chép";
                }
            }, 1000);
        }
        if (keyPrivateRef.current) {
            keyPrivateRef.current.disabled = false;
            keyPrivateRef.current.select();
            document.execCommand("copy");
            keyPrivateRef.current.disabled = true;
        }
    }

    try {
        return (<tr className="product-manager-auction-item text-center">
            {/*Sản phẩm*/}
            <td className="product">
                <div className="w-100 h-100 d-flex">
                    <div
                        className="p-1 d-flex flex-column justify-content-center align-items-center">
                        {props.data.imageVariants && Array.isArray(props.data.imageVariants) && props.data.imageVariants.length > 0 &&
                        <img src={props.data.imageVariants[0].image65}
                             onClick={() => props.emitOnViewerImage(props.data.images[0].imageUrl)}
                             className="cursor-pointer"
                             alt=""/>}
                        {getStateAuction()}
                    </div>
                    {getDescriptionAuction()}
                </div>
            </td>
            {/*key private auction*/}
            <td css={stylePrivateKey}>
                {
                    props.data.privateCode ?
                        <div style={{position: "relative"}}>
                            <i className="far fa-unlock-alt icon-key" style={{fontSize: "18px", cursor: "pointer"}}/>
                            <div className={"key-value"}
                                 style={{position: "absolute", top: "25px", left: "-30px", display: "none"}}>
                                <div style={styleTooltip}>
                                    <div style={square}/>
                                    <span><input type="text" value={props.data.privateCode}
                                                 style={{width: "45px", outline: "none", border: "none"}} disabled
                                                 ref={keyPrivateRef}/></span>
                                    <span className={"wrapper-copy-icon"} onClick={() => copyPrivateKey()}>
                                <i className="fas fa-copy ml-2" style={{cursor: "pointer"}}/>
                                <span className={"tooltip-copy"} ref={tooltipCopyRef}>Sao chép</span>
                            </span>
                                </div>
                            </div>
                        </div> : null
                }
            </td>
            {/*Loại đấu giá*/}
            <td>
                {/^(AUCTION|AUCTION_SALE)$/.test(props.data.type) && "Đấu giá thường"}
                {/^(AUCTION_FLASH_BID)$/.test(props.data.type) && "Đấu giá chớp nhoáng"}
                {/^(AUCTION_INVERSE)$/.test(props.data.type) && "Đấu giá ngược"}
                {/^(AUCTION_GROUP)$/.test(props.data.type) && "Đấu giá mua chung"}
            </td>
            {/*Số lượng*/}
            <td>
                {!edit && <div>
                    {numberWithCommas(quantity)}
                    {props.data.type === "AUCTION_FLASH_BID" &&
                    <i className="fas fa-pencil cursor-pointer ml-3" onClick={() => setEdit(true)}/>}
                </div>}
                {edit && <div className="input-group d-flex align-items-center">
                    <input className="form-control"
                           style={{width: '50px'}}
                           value={quantity > 0 ? numberWithCommas(quantity) : ''}
                           onChange={e => handlerOnChangeQuantity(e)}
                           type="text"/>
                    <button className="btn ml-3 btn-default" onClick={() => execChangeQuantity()}><i
                        className="fas fa-check cursor-pointer"/></button>
                </div>}
            </td>
            {/*Thời gian bắt đầu*/}
            <td>{props.data.auction.state !== "WAITING" ? `${Moment.getDate(props.data.auction.timeStart as string, "dd/mm/yyyy")} ${Moment.getTime(props.data.auction.timeStart as string, "hh:mm:ss")}` : null}</td>
            {/*Trạng thái*/}
            <td className="text-center">{getStateProduct()}</td>
            {/*Hành động*/}
            <td className="text-right">
                <ItemAction
                    type={props.data.type}
                    state={props.data.state}
                    auctionState={props.data.auction.state}
                    onChangeState={toState => props.onChangeState(toState)}/>
            </td>
        </tr>);
    } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        return null;
    }
};

const styleTooltip: CSSProperties = {
    position: "relative",
    width: "70px",
    height: "25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    margin: "3px",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    borderRadius: "2px", fontSize: "11px",
}
const square: CSSProperties = {
    position: "absolute",
    top: "-6px",
    left: "30px",
    height: "10px",
    width: "10px",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    transform: "rotate(45deg)",
    backgroundColor: "white",
    borderBottom: "none",
    borderRight: "none"
}
const stylePrivateKey = css`
    position: relative;
    &:hover .key-value{
        display: block !important;
    }
    .wrapper-copy-icon{
        position: relative;
        &:hover .tooltip-copy{
            display: block;
        }
        .tooltip-copy{
            position: absolute;
            top: 0px;
            left: 0px;
            background-color: white;
            width: 80px;
            transform: translate(-30%, -120%);
            border: 1px solid rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            padding: 3px 0;
            display: none;
            font-size: 11px;
        }
    }
`
