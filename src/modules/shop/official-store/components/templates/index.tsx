import React from "react";
import {TemplateHeader} from "./headers";
import TemplateBannerPrimary from "./baner-primary";
import TemplateCategory from "./category";
import TemplateBanner from "./banner";
import PopupManager from "../popup-manager";
import PopupUpload from "../popup-upload";
import PopupCategory from "../popup-category";
import {POPUP_MANAGER_CTRL} from "../popup-manager/control";
import {TemplateStore} from "./store";
import {BANNER_CTRL} from "./banner/control";
import {BANNER_PRIMARY_CTRL} from "./baner-primary/control";
import {CATEGORY_CTRL} from "./category/control";
import TemplateActions from "./actions/TemplateActions";
import * as Sentry from "@sentry/browser";

interface ITemplateComponentProps {
    OnSave: (target: 'DRAFT' | 'PUBLIC') => any
    OnCancer: () => any
}

export default class TemplateComponent extends React.Component<ITemplateComponentProps, any> {
    protected handlerOnSavePopupManager() {
        switch (TemplateStore.currentTarget) {
            case "BANNER":
                BANNER_CTRL.handlerOnSaveBanner();
                break;
            case "BANNER_PRIMARY":
                BANNER_PRIMARY_CTRL.handlerOnSaveBanner();
                break;
            case "CATEGORY":
                CATEGORY_CTRL.handlerOnSaveCategory();
                break;
        }
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            return <div className="templates">
                <div className="container">
                    {/*Header*/}
                    <TemplateHeader/>
                    {/*Banner Primary*/}
                    <TemplateBannerPrimary/>
                    {/*Category*/}
                    {<TemplateCategory/>}
                    {/*Banner*/}
                    <TemplateBanner/>
                    {/*Template Actions*/}
                    <TemplateActions
                        OnSave={target => this.props.OnSave(target)}
                        OnCancer={this.props.OnCancer}
                    />
                </div>

                {/*Popup*/}
                <PopupManager OnSave={() => this.handlerOnSavePopupManager()}/>
                <PopupUpload OnSave={() => POPUP_MANAGER_CTRL.handlerOnSaveImage()}/>
                <PopupCategory OnSave={() => POPUP_MANAGER_CTRL.handlerOnSaveCategory()}/>
            </div>;
        } catch (e) {
            console.log(e);
            Sentry.captureException(e);
            return null;
        }
    }
}
