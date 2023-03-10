import React, {SyntheticEvent} from "react";
import {observer} from "mobx-react";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import {observable} from "mobx";
import {store as ProfileStore} from "../../../profile";
import {BaseService} from "../../../../common/services/BaseService";
import {Link} from "react-router-dom";
import {notify} from "../../../../common/notify/NotifyService";
import {IResProfile} from "../../../../api/auth/interfaces/response"

export interface IShipping {
    id: number,
    name: string,
    code: string,
    maxValue: number,
    maxWeight: number
    maxSize: number[]
    service: {
        id: number,
        serviceName: string,
        status: 'ENABLED' | 'DISABLED'
    }[]
}

@observer
export default class Shipping extends React.Component<{ type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK'|'CREATE_F_N' }, object> {
    private static instance?: Shipping;
    private service = new BaseService();
    @observable listShipping: IShipping[] = [];
    @observable weight: number = 0;
    @observable size: [number, number, number] = [0, 0, 0];
    @observable disabledForm: boolean = false;

    constructor(props: any) {
        super(props);
        Shipping.instance = this;
    }


    handlerChangeInput(key: 'weight' | 'size_D' | 'size_R' | 'size_C', event: SyntheticEvent<HTMLInputElement> | number) {
        const SET_VALUE = (value: number) => {
            if (key === "weight") this.weight = value;
            else if (key === "size_D") this.size[0] = value;
            else if (key === "size_R") this.size[1] = value;
            else this.size[2] = value;
        }
        if (typeof event === "number") SET_VALUE(event);
        else {
            let value: string | number = event.currentTarget.value;
            value = value.replace(/[^0-9]/g, '');
            value = parseInt(value);
            SET_VALUE(!isNaN(value) ? value : 0);
        }
    }

    protected get renderWarring(): React.ReactNode {
        if (this.listShipping.length === 0)
            return <div>
                <label className="text-danger">B???n ch??a c??i ?????t ????n v??? v???n chuy???n n??o!</label>
                <Link className="text-info ml-3" style={{textDecoration: 'underline'}}
                      to="/home/profile/setting-shipping">C??i ?????t v???n
                    chuy???n</Link>
            </div>;
        return null; //default
    }

    public hasValidate(): boolean {
        if (this.weight === 0) {
            notify.show('Vui l??ng nh???p c??n n???ng', "error");
            return false;
        }
        if (this.size[0] === 0 || this.size[1] === 0 || this.size[2] === 0) {
            notify.show('Vui l??ng nh???p k??ch th?????c', "error");
            return false;
        }
        // check Weight
        const listValidWeight: IShipping[] = this.listShipping.reduce((previousValue: IShipping[], currentValue: IShipping) => {
            if (this.weight <= currentValue.maxWeight) {
                previousValue.push(currentValue);
            }
            return previousValue;
        }, []);
        if (listValidWeight.length === 0) {
            notify.show('C??n n???ng kh??ng h???p l???!', "error");
            return false;
        }
        // Check Package Size
        const listValidPackageSize: IShipping[] = listValidWeight.reduce((previousValue: IShipping[], currentValue: IShipping) => {
            let tempSize: number[] = this.size;
            tempSize = tempSize.sort();
            tempSize = tempSize.reverse();
            currentValue.maxSize = currentValue.maxSize.sort();
            currentValue.maxSize = currentValue.maxSize.reverse();
            if (tempSize[0] <= currentValue.maxSize[0] &&
                tempSize[1] <= currentValue.maxSize[1] &&
                tempSize[2] <= currentValue.maxSize[2]) {
                previousValue.push(currentValue);
            }
            return previousValue;
        }, []);
        if (listValidPackageSize.length === 0) {
            notify.show('K??ch th?????c kh??ng h???p l???!', "error");
            return false;
        }
        return true;
    }

    /*Life cycle*/
    async componentDidMount() {
        if (/^(DETAIL|REPLAY_QUICK)$/.test(this.props.type)) {
            this.disabledForm = true;
        }
        const shop_id = (ProfileStore.profile as IResProfile).shopId;
        const response = await this.service.getRequest(`/v1/shippings/shops/${shop_id}`);
        if (response.status === 200) {
            this.listShipping = Array.isArray(response.body.selectList) ? response.body.selectList.reduce((pre: IShipping[], current: IShipping) => {
                const index: number = current.service.findIndex(value => value.status === "ENABLED");
                index !== -1 && pre.push(current);
                return pre;
            }, []) : [];
        } else this.service.pushNotificationRequestError(response);
    }

    render() {
        return <div id="products-shipping">
            <h5>V???n chuy???n *</h5>
            <div className="row">
                {/*C??n n???ng*/}
                <div className="weight col-xs-12 col-lg-6">
                    <label>C??n n???ng *</label>
                    <div className="weight-form form-group">
                        <input
                            className="form-control"
                            type="text"
                            disabled={this.disabledForm}
                            onChange={e => this.handlerChangeInput("weight", e)}
                            value={this.weight > 0 ? numberWithCommas(this.weight) : ''}
                        />
                    </div>
                </div>
                {/*K??ch th?????c*/}
                <div className="package-size col-xs-12 col-lg-6">
                    <p>K??ch th?????c ????ng g??i *</p>
                    <div className="form">
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="text"
                                disabled={this.disabledForm}
                                onChange={e => this.handlerChangeInput("size_D", e)}
                                value={this.size[0] > 0 ? numberWithCommas(this.size[0]) : ''}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="text"
                                disabled={this.disabledForm}
                                onChange={e => this.handlerChangeInput("size_R", e)}
                                value={this.size[1] > 0 ? numberWithCommas(this.size[1]) : ''}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="text"
                                disabled={this.disabledForm}
                                onChange={e => this.handlerChangeInput("size_C", e)}
                                value={this.size[2] > 0 ? numberWithCommas(this.size[2]) : ''}
                            />
                        </div>
                    </div>
                    <label>Chi???u d??i (D) * chi???u r???ng (R) * chi???u cao (C) cm.</label>
                </div>
            </div>
            <div className="list-shipping">
                <label>????n v??? v???n chuy???n *</label>
                <div>
                    {this.renderWarring}
                    {/*Danh s??ch ????n v??? v???n chuy???n*/}
                    {this.listShipping.length > 0 && this.listShipping.map((item: IShipping, index: number) =>
                        <div key={index} className="list d-flex justify-content-between align-items-center">
                            <div>
                                <label>{item.name}</label>
                                <ul>
                                    <li>C??n n???ng t???i
                                        ??a: <b>{numberWithCommas(item.maxWeight)} gram</b>
                                    </li>
                                    <li>K??ch c??? t???i
                                        ??a: <b>{`${numberWithCommas(item.maxSize[0])}cm x ${numberWithCommas(item.maxSize[1])}cm x ${numberWithCommas(item.maxSize[2])}cm`}</b>
                                    </li>
                                    <li>Thu h??? t???i
                                        ??a: <b>{`${numberWithCommas(item.maxValue)} ??`}</b>
                                    </li>
                                </ul>
                            </div>
                        </div>)}
                </div>
            </div>
        </div>;
    }

    static get getInstance(): Shipping | undefined {
        return Shipping.instance;
    }
}
