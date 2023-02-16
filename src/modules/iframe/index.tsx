import * as React from "react";
import {useObserver} from "mobx-react";
import {useEffect, useState} from "react";
import styled from "styled-components";
import ProductList from "./components/auctionBox/component/ProductList";
import {iframeStore} from "./iframeStore";
import {Checkbox} from 'antd';
import Draggable from 'react-draggable';
import {IProduct} from "../../api/auction/interfaces/response";
import {notify} from "../../common/notify/NotifyService";
import Link from "react-csv/components/Link";
import {Link as Router} from "react-router-dom";

interface IProp {
  shopId: number
}

const CreateIframe: React.FC<IProp> = ({shopId}) => {
  const domainURL: string = 'https://dev.chozoi.com';
  useEffect(() => {
    // const domainURL: string = (window as any).DOMAIN_BUYER;

    var $html = $(`<iframe width="1000" height="385" src=${domainURL}/sdk-auction-method/${shopId}\ title="Chozoi mua sam tuyet voi" frameBorder="0"></iframe>`);
    var str = $html.prop('outerHTML');
    setIframe(str);
    // let arr:string[]=[...plainOptions];
    // iframeStore.listProductAuction.map((value,i)=>{
    //     arr.push(value.id.toString())
    // })
    // setPlainOptions(arr)
  }, [])

  const [showPopup, setShowPopup] = useState(false);
  const [iframe, setIframe] = useState('');
  const [isCopy, setIsCopy] = useState<boolean>(false);
  const [listChecked, setListChecked] = useState<number[]>([]);
  const [typeSize, setTypeSize] = useState<string>("large");
  const [size, setSize] = useState<number>(1000)
  const handleCheckBox = (e: any) => {
    const arrID: number[] = e as number[];
    let arrProduct: IProduct[] = [];
    setListChecked(arrID);
    arrID.map((value) => {
      iframeStore.listProductAuction.map((items) => {
        if (items.id === value) {
          arrProduct.push(items)
        }
      })
    })
    // console.log(arrProduct)
    iframeStore.listProductDemo = arrProduct;
  }
  const onCheckAllChange = (e: any) => {
    let listCheck: number[] = [];
    if (e.target.checked) {
      iframeStore.listProductAuction.map((value, i) => {
        listCheck.push(value.id);
      })
      setListChecked(listCheck);
      iframeStore.listProductDemo = iframeStore.listProductAuction;
    } else {
      iframeStore.listProductDemo = [];
      setListChecked([]);
    }
  };
  const handleCopyClipboard = () => {
    try {
      navigator.clipboard.writeText(iframe)
      notify.show('Đã copy vào clipboard', 'success')
    } catch (e) {
      console.log(e)
    }
  }
  const disableCpoy = () => {
    return false
  }
  const changeSizeIframe = (type: "large" | "middle" | "small") => {
    switch (type) {
      case "large":
        setTypeSize(type);
        setSize(1000)
        var $html = $(`<iframe width="1000" height="385" src=${domainURL}/sdk-auction-method/${shopId}\ title="Chozoi mua sam tuyet voi" frameBorder="0"></iframe>`);
        var str = $html.prop('outerHTML');
        setIframe(str);
        break;
      case "middle":
        setTypeSize(type);
        setSize(790)
        var $html = $(`<iframe width="790" height="385" src=${domainURL}/sdk-auction-method/${shopId}\ title="Chozoi mua sam tuyet voi" frameBorder="0"></iframe>`);
        var str = $html.prop('outerHTML');
        setIframe(str);
        break;
      case "small":
        setSize(600)
        setTypeSize(type);
        var $html = $(`<iframe width="600" height="385" src=${domainURL}/sdk-auction-method/${shopId}\ title="Chozoi mua sam tuyet voi" frameBorder="0"></iframe>`);
        var str = $html.prop('outerHTML');
        setIframe(str);
        break;
    }
  }
  try {
    return useObserver(() =>
      <div className="position-absolute">
        <button onClick={() => setShowPopup(true)}
                style={{width: '80px', borderRadius: '4px', border: 'none', padding: '6px 8px'}}>
          Nhúng {'<>'}
        </button>
        <div>
          {showPopup && <div className="nen"/>}
          {showPopup &&
                  <DipCodeStyle className="dip-code">
                      <div className="position-relative d-flex">
                          <div className="exit position-absolute" onClick={() => setShowPopup(false)}>
                              <i className="far fa-times"/>
                          </div>
                          <div style={{width: "550px", height: "400px"}}>
                              <div className="size-of-iframe">
                                  <h2>Kích thước</h2>
                                  <div className="change-size d-flex justify-content-between">
                                      <button className={`${typeSize === "large" && "active"}`}
                                              onClick={() => changeSizeIframe("large")}>1000x385
                                      </button>
                                      <button className={`${typeSize === "middle" && "active"}`}
                                              onClick={() => changeSizeIframe("middle")}>790x385
                                      </button>
                                      <button className={`${typeSize === "small" && "active"}`}
                                              onClick={() => changeSizeIframe("small")}>600x385
                                      </button>
                                  </div>

                              </div>
                              <div className="product-iframe">
                                  <div className="preview-product d-flex justify-content-center">
                                      <ProductList size={size}/>
                                  </div>
                              </div>
                          </div>
                          <div className="code-iframe">
                              <div>
                                  <h2>Mã nhúng</h2>
                                  <div className="position-relative" onMouseOver={() => setIsCopy(true)}
                                       onMouseLeave={() => setIsCopy(false)}>
                                    {iframeStore.listProductAuction.length !== 0 ? <textarea readOnly={true} value={iframe}/> :
                                      <textarea readOnly={true} value={iframe} onCopy={(e) => {
                                        e.preventDefault()
                                        return false;
                                      }}/>}
                                    {(isCopy && iframeStore.listProductAuction.length !== 0) &&
                                    <div className="btn-copy" onClick={() => handleCopyClipboard()}>
                                        <p>Copy</p>
                                    </div>}
                                  </div>
                              </div>
                              <div>
                                {iframeStore.listProductAuction.length === 0 ? <div>
                                    <p>Bạn chưa có sản phẩm để đấu giá</p>
                                    <Router to={"/home/auction/add"}>Đăng sản phẩm ngay</Router>
                                  </div> :
                                  <div>
                                    <div className="d-flex">
                                      <p style={{marginRight: "12px"}}>Danh sách sản phẩm</p>
                                      <Checkbox onChange={onCheckAllChange}
                                                checked={listChecked.length === iframeStore.listProductAuction.length}>
                                        Chọn tất cả
                                      </Checkbox>
                                    </div>
                                    <div className="list-product-auction ">
                                      <Checkbox.Group onChange={handleCheckBox} value={listChecked}>
                                        {iframeStore.listProductAuction.map((value, i) => {

                                          return (
                                            <div className="d-flex product-auction-iframe">
                                              <div className="checked d-flex align-items-center">
                                                <Checkbox value={value.id}/>
                                              </div>
                                              <div className="image"><img src={value.images[0].imageUrl}/></div>
                                              <div className="product-name">{value.name}</div>
                                            </div>
                                          )

                                        })}
                                      </Checkbox.Group>
                                    </div>
                                  </div>}
                              </div>
                          </div>
                      </div>
                  </DipCodeStyle>
          }
        </div>
      </div>)
  } catch (e) {
    console.log(e)
    return null
  }
}
export default CreateIframe;

const DipCodeStyle = styled.div`
  position: fixed;
  top: 30%;
  left: 30%;
  background-color: #FFFFFF;
  width: 1000px;
  //height: 350px;
  padding: 20px 15px;
  z-index: 1000;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
  border-radius: 8px;

  textarea {
    width: 400px;
    min-height: 100px;
    resize: none;
    border: none;
  }

  .size-of-iframe {
    border-bottom: 1px solid #E1E1E1;
    padding: 12px;

    button {
      border-radius: 8px;
      background-color: #FFFFFF;
      border: 1px solid #0ab1fc;
    }

    .active {
      background-color: #0ab1fc;
      color: #FFFFFF;
    }

    h2 {
      color: #7a878e;
      font-family: "Open Sans", SemiBold;
    }
  }

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

      .title {
        margin-top: 30px;
      }

      .btn-unactive {
        button {
          background-color: #FFFFFF;
          border: 1px solid #0ab1fc;
          color: #0ab1fc;
          margin-right: 20px;
          border-radius: 4px;

          &:hover {
            background-color: #0ab1fc;
            color: #FFFFFF;
          }
        }
      }
    }
  }

  .image {
    img {
      width: 250px;
    }
  }


  .product-iframe {
    margin-right: 8px;
    padding-right: 8px;


    .preview-product {
      margin-top: 50px;
      margin-bottom: 50px;
    }

    h2 {
      font-size: 26px;
      margin-bottom: 20px;
    }

    .product-auction-iframe {
      margin-bottom: 12px;
      margin-right: 16px;

      .image {
        margin-right: 20px;

        img {
          width: 50px;
          height: 50px;
        }
      }

      &:nth-child(2n) {
        margin-right: 0px;
      }

      &:hover {
        background-color: #0ab1fc26;
        border: 1px solid #0ab1fc26;
      }
    }
  }

  .code-iframe {
    border-left: 1px solid #E1E1E1;
    padding-left: 20px;

    h2 {
      margin-bottom: 20px;
      color: #7a878e;
      font-family: "Open Sans", SemiBold;
    }

    .btn-copy {
      position: absolute;
      top: 0px;
      right: 0;
      background-color: #ECECEC;
      padding: 4px 8px;
      border-radius: 8px;

      p {
        margin: 0;
      }
    }

    .list-product-auction {
      height: 200px;
      overflow-y: scroll;

      .image {
        width: 50px;
        height: 50px;
      }

      ::-webkit-scrollbar {
        width: 4px;
      }
    }
  }

`

