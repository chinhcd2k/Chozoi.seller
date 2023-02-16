import * as React from 'react';
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import './App.scss';
import {HomeComponent} from "./modules/home/index";
import {observer} from "mobx-react";
import NotifyComponent from "./common/notify/NotifyComponent";
import {getCookie} from "./common/functions/CookieFunc";
import LandingPage from "./modules/landing-page";
import {getRequest} from "./common/services/BaseService";
import {observable} from "mobx";
import {AppGlobal, IResCategory} from "./AppGlobal";
import AppDownload from "./modules/AppDownload";
import {ICategorise} from "./modules/auctions/manager-auction";

interface IHistory {
    push: (path: string, state?: any) => any,
    goBack: () => any
}

const COOKIE_NAME: string = (window as any).COOKIE_NAME || '';
const COOKIE_RECEIVER_NAME: string = (window as any).COOKIE_RECEIVER_NAME || '';
const LoadingBar: any = require('react-top-loading-bar').default;

export let LoadingTopBarService: {
    staticStart: () => any,
    complete: () => any
} | undefined = undefined;

@observer
class App extends React.Component {
    public LoadingBarRef = React.createRef<any>();
    @observable isRender: boolean = false;
    static history: IHistory;

    constructor(props: any) {
        super(props);
        try {
            if (getCookie(COOKIE_RECEIVER_NAME)) {
                localStorage.setItem(COOKIE_NAME, getCookie(COOKIE_RECEIVER_NAME) || '');
                if (window.location.pathname === "/")
                    window.location.href = "/home";
            }
            this.loadRequiredData();
            if (window.location.pathname === '/download-app') {
                if (navigator.userAgent.match(/Mac/i) || navigator.userAgent.match(/IOS/i)) window.location.href='https://apps.apple.com/vn/app/chozoi-seller-center/id1495609377?l=vi';
                else window.location.href='https://play.google.com/store/apps/details?id=com.chozoi.sellercenter';
            }
        } catch (e) {
            console.error(e);
        }
    }

    async loadRequiredData() {
        /*
        * Lưu đường dẫn router chi tiết sản phẩm live(production)
        * */
        const res = await getRequest("/v1/categories/", false);
        if (res.status === 200) {
            Object.assign(AppGlobal.categoriesRes, res.body.categories);
            await AppGlobal.createCategoriesTreeReverse(res.body.categories);
        }
        /*END*/


        // Load success
        this.isRender = true;
    }



    componentDidMount(): void {
        if (this.LoadingBarRef.current) {
            LoadingTopBarService = {
                staticStart: this.LoadingBarRef.current.staticStart.bind(this),
                complete: this.LoadingBarRef.current.complete.bind(this)
            };
        }
    }

    public render() {
        return this.isRender ? (
            <div id="router">
                <LoadingBar height={3} color='#f54b24' ref={this.LoadingBarRef}/>
                <NotifyComponent/>
                <BrowserRouter ref={(instance: any) => App.history = instance.history}>
                    <Switch>
                        <Redirect exact path="/" to='/login'/>
                        <Route path="/login" exact component={LandingPage}/>
                        <Route path="/create-shop" exact={true}/>
                        <Route path="/home" component={HomeComponent}/>
                        <Route path="/landing-page" component={LandingPage}/>
                        <Route path="/download" component={AppDownload}/>
                    </Switch>
                </BrowserRouter>
            </div>
        ) : null;
    }
}

export default App;
