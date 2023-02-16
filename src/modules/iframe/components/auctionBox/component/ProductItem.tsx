import React, {Component} from 'react';
import {IProduct} from "../../../../../api/auction/interfaces/response";

interface IProps {
  item: IProduct,
  hostname?: string,
  campaignId?: number,
  isFullCard?: boolean
}

class ProductItem extends Component<IProps, any> {
  render() {
    const item = this.props.item;
    return (
      <div>
        <div style={styles.container}>
          <div style={{position: "relative"}}>
            <img style={styles.image}
                 src={item.imageVariants[0].image350}/>
            {item.type === "AUCTION_FLASH_BID" ?
              <img style={{width: 64, position: "absolute", zIndex: 1, bottom: 0, right: 0}}
                   src={'/assets/icons/dgst.png'}/>
              :
              <img style={{width: 98, position: "absolute", zIndex: 1, bottom: 0, right: 0}}
                   src={'/assets/icons/hot-bid-brand.png'}/>
            }
          </div>

          {item.type === "AUCTION_FLASH_BID" ?
            <div style={{paddingLeft: 8, paddingRight: 8, paddingTop: 5, width: '100%', backgroundColor: 'white'}}>
              <p style={{
                maxWidth: "169px",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                overflow: "hidden",
                // -webkit-line-clamp: 2,
                color: "rgb(44, 44, 44)",
                fontSize: "12px",
                height: "30px",
                lineHeight: "15px",
              }}>{item.name}</p>
              <div style={{display: 'flex', height: 15, marginBottom: 5}}>
                <p style={{opacity: item.auction.buyNowPrice ? 1 : 0, color: '#6A6A6A', fontSize: 11}}>Mua ngay:</p>
                <p style={{
                  fontFamily: "OpenSans-Bold",
                  marginLeft: 6,
                  color: '#6A6A6A',
                  fontSize: 11,
                  opacity: item.auction.buyNowPrice ? 1 : 0
                }}>{item.auction.buyNowPrice ? item.auction.buyNowPrice : "Không có"}</p>
              </div>
              {/*<AuctionTimeLine onFinish={() => this.changeState()}*/}
              {/*                 state={item.auction.state}*/}
              {/*                 timeStart={item.auction.timeStart}*/}
              {/*                 timeEnd={item.auction.timeEnd} />*/}
              <div style={{display: 'flex', marginBottom: 6, alignItems: 'center', justifyContent: 'space-between'}}>
                {/*<AuctionTimeRemaining timeEnd={item.auction.timeEnd} />*/}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: 75}}>
                  <img style={{width: 15, height: 15, marginRight: 4}} src={'/assets/icons/icoBid.png'}/>
                  <p style={{
                    color: '#F14A26',
                    fontSize: 12,
                    fontFamily: "OpenSans-Bold"
                  }}>{item.auction.result.currentPrice}</p>
                </div>
              </div>
              {/*<BidBtn timeEnd={item.auction.timeEnd} />*/}
            </div>
            :
            <div style={styles.info}>
              <div style={{display: 'flex', marginBottom: 9, alignItems: 'center', justifyContent: 'space-between'}}>
                {/*<AuctionTimeRemaining timeEnd={item.auction.timeEnd} />*/}
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <img style={{width: 9, marginRight: 4}} src={'/assets/icons/bidturn.png'}/>
                  <p style={{
                    color: '#6D6D6D',
                    fontSize: 10,
                    fontFamily: "OpenSans-Medium"
                  }}>{item.auction.result.bidsCount}</p>
                </div>
              </div>
              <p style={{
                maxWidth: `${169 * ratio}px`,
                textOverflow: "ellipsis",
                display: "-webkit-box",
                overflow: "hidden",
                // -webkit-line-clamp: 2,
                color: "rgb(44, 44, 44)",
                fontSize: `${12 * ratio}px`,
                height: `${30 * ratio}px`,
                lineHeight: `${15 * ratio}px`,
              }}>{item.name}</p>
              <div style={{display: 'flex', marginBottom: 5}}>
                <p style={{opacity: item.auction.buyNowPrice ? 1 : 0, color: '#474747', fontSize: 11}}>Mua ngay:</p>
                <p style={{
                  fontFamily: "OpenSans-Bold",
                  marginLeft: 3,
                  color: '#474747',
                  fontSize: 11,
                  opacity: item.auction.buyNowPrice ? 1 : 0
                }}>{item.auction.buyNowPrice ? item.auction.buyNowPrice : "Không có"}</p>
              </div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <img style={{width: 17, height: 17, marginRight: 4}} src={'/assets/icons/icoBid.png'}/>
                  <p style={{
                    color: '#F14A26',
                    fontSize: 13,
                    fontFamily: "OpenSans-Bold"
                  }}>{item.auction.result.currentPrice}</p>
                </div>
                <div style={{
                  width: 63,
                  height: 24,
                  backgroundColor: '#F14A26',
                  borderRadius: 4,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <p style={{color: '#FFFFFF', fontSize: 11, fontFamily: "OpenSans-Bold"}}>ĐẤU GIÁ</p>
                </div>
              </div>

            </div>
          }
        </div>
      </div>

    );

  }
}

const ratio = 1 / 2
const styles = {
  container: {
    width: 185 * ratio,
    borderRadius: 4 * ratio, border: '0.5px solid #C6C6C6',
    marginBottom: 13 * ratio, overflow: 'hidden', height: 300 * ratio, backgroundColor: 'white', cursor: 'pointer'
  },
  image: {
    width: 185 * ratio, height: 185 * ratio
  },
  info: {
    width: 185 * ratio, backgroundColor: 'white', paddingTop: 5 * ratio, paddingLeft: 8 * ratio, paddingRight: 8 * ratio
  },
  actionContainer: {
    borderRadius: 4 * ratio, overflow: "hidden"
  },
  actionBtnOn: {
    width: "100%", height: 75 * ratio, backgroundColor: "#0070E8", justifyContent: "center", alignItems: "center"
  },
  actionBtnOff: {
    width: "100%", height: 75 * ratio, backgroundColor: "#CFD0D3", justifyContent: "center", alignItems: "center"
  },
  actionTxt: {
    color: "#FFFFFF", fontSize: 18 * ratio, fontFamily: "OpenSans-Bold"
  },
  timeLine: {
    width: "100%", height: 10 * ratio, backgroundColor: "rgba(207, 208, 211,0.5)", position: "relative"
  },
  infoContainer: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", position: "relative"
  },
  infoLabel: {
    color: "#6A6A6A", fontSize: 9 * ratio, lineHeight: 13 * ratio
  },
  infoValue: {
    color: "#474747", fontSize: 11 * ratio, lineHeight: 13 * ratio, fontFamily: "OpenSans-Semibold"
  },
  line: {
    height: 12 * ratio,
    width: ratio,
    backgroundColor: "#E2E2E2",
    left: 86 * ratio,
    top: 8 * ratio,
    position: "absolute"
  },
  flashBid: {
    width: 71 * ratio, height: 28 * ratio, position: "absolute", zIndex: 1, bottom: 0, right: 0
  },
  stoppedContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    backgroundColor: "rgba(71, 71, 71,0.5)"
  },
  stoppedIcon: {
    width: 135 * ratio, height: 97 * ratio
  }
};

export default ProductItem;