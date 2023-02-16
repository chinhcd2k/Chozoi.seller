import React from "react";
import {Link} from "react-router-dom";

export const RankNormal: React.FC = () => {
    return (<div className="rank">
        <Link to="/home/shop/rank"> <i className="fas fa-store"/> Chưa xếp hạng</Link>
    </div>);
};

export const RankPositive: React.FC = () => {
    return (<div className="rank positive">
        <Link to="/home/shop/rank"> <i className="fas fa-thumbs-up"/> Shop tích cực</Link>
    </div>);
};

export const RankFavourite: React.FC = () => {
    return (<div className="rank favourite">
        <Link to="/home/shop/rank"> <i className="fas fa-heart"/> Shop yêu thích</Link>
    </div>);
};