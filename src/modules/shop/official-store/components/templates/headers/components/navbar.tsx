import React from "react";
import {observer} from "mobx-react";

@observer
export default class Navbar extends React.Component<any, any> {
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <nav className="navbar navbar-default">
            <ul className="nav navbar-nav">
                <li className=""><a href="#">Trang chủ</a></li>
                {/*<li className="dropdown">
                    <a className="dropdown-toggle" data-toggle="dropdown" href="#">Sản phẩm
                        <span className="caret"/></a>
                    <ul className="dropdown-menu">
                        <li><a href="#">Page 1-1</a></li>
                        <li><a href="#">Page 1-2</a></li>
                        <li><a href="#">Page 1-3</a></li>
                    </ul>
                </li>*/}
                <li><a href="#">Top sản phẩm bán chạy</a></li>
                <li><a href="#">Nhận xét và đánh giá</a></li>
            </ul>
        </nav>;
    }
}
