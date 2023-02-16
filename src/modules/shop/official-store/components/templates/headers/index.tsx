import React from "react";
import Logo from "./components/logo";
import Description from "./components/description";
import Navbar from "./components/navbar";
import PopupHeader from "./components/popup-logo";

export const TemplateHeader: React.FC = () => {
    return <div className="templates-header">
        <div className="row-0">
            <Logo/>
            <Description/>
        </div>
        <div className="row-1">
            <Navbar/>
        </div>
        <PopupHeader/>
    </div>;
};
