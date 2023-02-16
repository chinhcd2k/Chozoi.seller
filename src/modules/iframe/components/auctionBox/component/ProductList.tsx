import {observer} from 'mobx-react';
import {Carousel} from "antd";
import * as React from "react";
import {Component} from "react";
import ProductItem from "./ProductItem";
import {iframeStore} from "../../../iframeStore";
import Slider from "react-slick";
import styled from "styled-components";

const responsive = {
  desktop: {
    breakpoint: {max: 3000, min: 1024},
    items: 5,
    slidesToSlide: 3// optional, default to 1.
  },
  tablet: {
    breakpoint: {max: 1024, min: 464},
    items: 5,
    slidesToSlide: 1// optional, default to 1.
  },
  mobile: {
    breakpoint: {max: 464, min: 0},
    items: 1,
    slidesToSlide: 1 // optional, default to 1.
  }
};
interface IProps{
  size:number
}

@observer
class ProductList extends Component <IProps,any>{
  private slider = React.createRef<Slider>();
  next = () => {
    if (this.slider.current) {
      this.slider.current.slickNext();
    }

  }
  previous = () => {
    if (this.slider.current) {
      this.slider.current.slickPrev()
    }

  }

  render() {
    const settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: this.props.size===1000?5: this.props.size===790?4:3,
      slidesToScroll: 1,
      arrows: false,
    };
    const ratioWidth = 1 / 2*(this.props.size/1000);
    const ratio = 1 / 2;
    if (iframeStore.listProductDemo) {
      return (
        <div style={{
          background: 'linear-gradient(281.35deg, #FF9900 21.5%, #FF5B00 66.8%)   ',
          paddingLeft: 2 * ratio,
          paddingRight: 2 * ratio,
          paddingBottom: 2 * ratio,
          width: 1000*ratioWidth
        }}>
          <div style={{
            width: '100%',
            height: 55 * ratio,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: 15 * ratio,
            paddingRight: 15 * ratio
          }}>
            <img style={{width: 264 * ratio}} src={'/assets/icons/Title.png'} alt=""/>
            <a className="d-flex " target="_blank">
                            <span style={{
                              fontSize: 12 * ratio,
                              color: 'white',
                              marginRight: 8 * ratio,
                              marginTop: 1 * ratio
                            }}>
                                Power by
                            </span>
              <img style={{width: 72 * ratio}} src={'/assets/icons/Logo.png'} alt=""/>
            </a>
          </div>
          <Slide style={{
            background: '#FFE8DB',
            padding: 15 * ratio, paddingBottom: 0,
            minHeight: `${385/2}px`
          }}>
            <Slider {...settings} ref={this.slider}>
              {iframeStore.listProductDemo.map((item: any, i: number) => {
                return (
                  <ProductItem item={item} key={i}/>
                )
              })}
            </Slider>
            {((iframeStore.listProductDemo.length > 5 && this.props.size===1000)||
              (iframeStore.listProductDemo.length > 4 && this.props.size===790)||
              (iframeStore.listProductDemo.length > 3 && this.props.size===600))&&
            <div className="btn-arrow" style={{textAlign: "center"}}>
                <button className="button left" onClick={this.previous}>
                    <i className="far fa-chevron-left"/>
                </button>
                <button className="button right" onClick={this.next}>
                    <i className="far fa-chevron-right"/>
                </button>
            </div>}
          </Slide>


        </div>
      );
    } else {
      return true
    }

  }
}

export default ProductList;

const Slide = styled.div`
  overflow: hidden;
  position: relative;

  .btn-arrow {
    button {
      width: 22px;
      height: 22px;
      position: absolute;
      border-radius: 50px;
      background-color: #FFE8DB;
      border: none;

      i {
        color: #FE540F;
      }
    }

    .button.left {
      top: 60px;
      left: 10px;
    }

    .button.right {
      top: 60px;
      right: 10px;
    }
  }

  .slick-track {
    display: flex !important;
  }

`
