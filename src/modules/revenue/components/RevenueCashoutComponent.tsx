import React from "react";
import {observer} from "mobx-react";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {store} from "../stores/RevenueCashoutStore";
import {service} from "../RevenueServices";
import {store as ProfileStore} from "../../profile";
import {DGetProfile} from "../../../common/decorators/Auth";
import {css} from "@emotion/core";
import {Link} from "react-router-dom";
import {store as HomeStore} from "../../home/stores/HomeStore";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {notify} from "../../../common/notify/NotifyService";

interface IRevenueCashoutComponentProps {
    history: { push: (path: string) => void }
}

interface IRevenueCashoutComponentState {
    step: number
    data: any
    balanceFormatted: any
    error: string
    disabledReSendOtp: boolean
    countDown: number
}

const DELAY_SEND_OTP_TIME: number = (window as any).DELAY_SEND_OTP_TIME || 15;

@observer
export default class RevenueCashoutComponent extends React.Component<IRevenueCashoutComponentProps, IRevenueCashoutComponentState> {
    public shopId: number = -1;

    constructor(props: IRevenueCashoutComponentProps) {
        super(props);
        this.state = {
            step: 1,
            data: [],
            balanceFormatted: 0,
            error: '',
            disabledReSendOtp: true,
            countDown: DELAY_SEND_OTP_TIME
        };
        BreadcrumbsService.loadBreadcrumbs([{
            title: 'Doanh thu',
            path: '/home/revenue'
        }, {title: 'Yêu cầu thanh toán'}]);
        HomeStore.menuActive = [4, 0];
    }

    @DGetProfile
    public async componentDidMount() {
        ProfileStore.profile && (this.shopId = ProfileStore.profile.shopId as number);
        await this.getShopPayment();
        if (store.banks.length <= 0) {
            this.props.history.push('/home/shop/card');
        }
    }

    public async getShopPayment() {
        const response = await service.getShopPayment();
        if (response.status === 200) {
            store.wallet = response.body.payment.wallet;
            store.banks = response.body.payment.bankCards;
            store.transactionFee = response.body.payment.transactionFee;
            this.setState({
                balanceFormatted: numberWithCommas(parseInt(store.wallet.balance)),
            });
        }
    }

    async handleBack(e: any) {
        this.setState({
            step: 1
        });
    }

    async sendRequest(e: any) {
        if (!this.state.data.bank) {
            this.setState({
                error: 'bank'
            });
            notify.show("Chọn một tài khoản ngân hàng để thực hiện thanh toán", "error");
        } else {
            if (!this.state.data.amount) {
                this.setState({
                    error: 'amount'
                });
                notify.show("Nhập số tiền yêu cầu thanh toán", "error");
            } else {
                const response = await service.getOTP();
                if (response.status === 200) {
                    const countDown = setInterval(() => {
                        const count: number = this.state.countDown - 1;
                        if (count > 0) {
                            this.setState({countDown: count});
                            !this.state.disabledReSendOtp && this.setState({disabledReSendOtp: true});
                        } else {
                            this.setState({disabledReSendOtp: false});
                            clearInterval(countDown);
                        }
                    }, 1000);
                    this.setState({
                        step: 2,
                        error: ''
                    });
                } else if (response.body.message) {
                    notify.show(response.body.message, "error");
                } else {
                    notify.show("Yêu cầu tạm thời không thể thực hiện. Vui lòng quay lại sau", "error");
                }
            }
        }
    }

    async confirmRequest(e: any) {
        if (ProfileStore.profile) {
            var data = {
                amount: this.state.data.amount,
                bankCardId: this.state.data.bank.id,
                otp: this.state.data.otp
            };
            const response = await service.confirmRequest(data);
            if (response.status === 200) {
                this.setState({
                    step: 3,
                });
            } else if (response.body.message) {
                notify.show(response.body.message, "error");
            } else {
                notify.show("Yêu cầu tạm thời không thể thực hiện. Vui lòng quay lại sau", "error");
            }
        }
    }

    async handleChangeData(e: any, key: string) {
        var data = this.state.data;
        if (key === 'bank') {
            var bank = store.banks[e.currentTarget.value];
            if (bank) {
                data[key] = bank;
            }
        } else if (key === 'amount') {
            var amount = e.currentTarget.value.replace(/[.]/g, "");
            if (amount) {
                var max = store.wallet.balance - store.transactionFee;
                if (amount > max) {
                    amount = max;
                }
                if (parseInt(amount) > 0) {
                    data[key] = parseInt(amount);
                }
            } else {
                data[key] = '';
            }
        } else {
            data[key] = e.currentTarget.value;
        }
        this.setState({
            data: data
        });
    }

    protected async reSendOtp() {
        this.setState({disabledReSendOtp: true});
        const response = await service.getOTP();
        if (response.status === 200) {
            notify.show('Mã OTP mới đã được gửi lại', "success");
            let count_node = 0;
            const countDown = setInterval(() => {
                const count: number = DELAY_SEND_OTP_TIME;
                count_node += 1;
                if (count - count_node > 0) {
                    this.setState({countDown: count - count_node});
                    !this.state.disabledReSendOtp && this.setState({disabledReSendOtp: true});
                } else {
                    count_node = 0;
                    this.setState({disabledReSendOtp: false}, () => clearInterval(countDown));
                }
            }, 1000);
        } else if (response.body && response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, "error");
        else
            notify.show('Đã có lỗi xảy ra!', "error");
    };

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        const walletCss = css`
      .form-control {
        border-radius: 0;
        font-size: 14px;
      }
      .form-control.otp {
        max-width: 200px;
      }
      .input-group-addon {
        border-radius: 0;
      }
      .cashout-confirm {
        font-size: 14px;
        .title {
          text-align: center;
          margin-bottom: 8px;
          @media (min-width: 1200px) {
            text-align: right;
          }
        }
        .value {
          margin-bottom: 8px;
        }
        .title.otp {
          line-height: 40px;
        }
      }
      .w-icon {
        position: relative;
        .form-control {
          padding-left: 34px;
        }
        i {
          position: absolute;
          top: 8px;
          left: 8px;
          font-size: 24px;
        }
      }
    `;
        return <>
            <div className="container" css={walletCss}>
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Yêu cầu thanh toán</h5>
                        <hr/>
                        {/*Create request*/}
                        {this.state.step === 1 &&
                        <div className="cashout-create-request">
                            <div className="row">
                                <div className="col-md-6 col-md-offset-3">
                                    <div className="form-group">
                                        <input type="text" className="form-control"
                                               value={" Số dư hiện tại: " + this.state.balanceFormatted + " đ"}
                                               readOnly={true}/>
                                    </div>

                                    <div
                                        className={"form-group w-icon" + (this.state.error === 'bank' ? ' has-error' : '')}>
                                        <i className="fa fa-credit-card"/>
                                        <select className="form-control" required
                                                onChange={(e: any) => this.handleChangeData(e, 'bank')}>
                                            <option value="">Thẻ ngân hàng thanh toán</option>
                                            {store.banks && store.banks.map((item: any, index: number) =>
                                                <option key={index}
                                                        value={index}>{item.name} - {item.accountNumber} - {item.bank.name} {item.branch} {item.province.provinceName} </option>
                                            )}
                                        </select>
                                    </div>

                                    <div className={"form-group" + (this.state.error === 'amount' ? ' has-error' : '')}>
                                        <div className="input-group">
                                            <input type="text" className="form-control"
                                                   onChange={(e: any) => this.handleChangeData(e, 'amount')}
                                                   value={(this.state.data.amount) ? numberWithCommas(parseInt(this.state.data.amount)) : ''}
                                                   pattern="[0-9]*"
                                                   placeholder="Nhập số tiền cân thanh toán"/>
                                            <div className="input-group-addon"> đ</div>
                                        </div>
                                    </div>

                                    <p>Giới hạn thanh toán 1 ngày là: <span
                                        className="text-semibold">300.000.000 đ</span></p>
                                    <p>Phí thanh toán: <span
                                        className="text-semibold text-danger">{numberWithCommas(parseInt(store.transactionFee), 'đ')}</span>
                                    </p>
                                    <p>Tổng tiền: <span className="text-semibold text-success">
                      {(this.state.data.amount) ? numberWithCommas(parseInt(this.state.data.amount) + parseInt(store.transactionFee), 'đ') : 0}
                      </span>
                                    </p>
                                </div>
                            </div>
                            <hr/>
                            <div className="form-group text-center">
                                <button className="btn btn-primary" type="submit"
                                        onClick={(e: any) => this.sendRequest(e)}>Gửi yêu cầu
                                </button>
                                <Link to="/home/revenue/history/type=all" className="btn btn-default ml-4">Lịch sử giao
                                    dịch</Link>
                            </div>
                        </div>
                        }

                        {/*OTP confirm*/}
                        {this.state.step === 2 &&
                        <div className="cashout-confirm">
                            <div className="row">
                                <div className="col-md-6 title">
                                    <span>Số dư hiện tại:</span>
                                </div>
                                <div className="col-md-6 value">
                                    <span className="text-semibold">{this.state.balanceFormatted} đ</span>
                                </div>

                                <div className="col-md-6 title">
                                    <span>Tài khoản ngân hàng:</span>
                                </div>
                                <div className="col-md-6 value">
                                    <div>{(this.state.data.bank) ? this.state.data.bank.name : ''}</div>
                                    <div>{(this.state.data.bank) ? this.state.data.bank.accountNumber : ''}</div>
                                    <div>{(this.state.data.bank) ? this.state.data.bank.bank.name + ' - Chi nhánh ' + this.state.data.bank.branch + ' - ' + this.state.data.bank.province.provinceName : ''}</div>
                                </div>

                                <div className="col-md-6 title">
                                    <span>Số tiền yêu cầu thanh toán:</span>
                                </div>
                                <div className="col-md-6 value">
                                    <span className="">{numberWithCommas(this.state.data.amount, 'đ')}</span>
                                </div>

                                <div className="col-md-6 title">
                                    <span>Phí thanh toán:</span>
                                </div>
                                <div className="col-md-6 value">
                                    <span
                                        className="text-danger">{numberWithCommas(parseInt(store.transactionFee), 'đ')}</span>
                                </div>

                                <div className="col-md-6 title">
                                    <span>Tổng tiền:</span>
                                </div>
                                <div className="col-md-6 value">
                                    <span
                                        className="text-semibold text-success">{(this.state.data.amount) ? numberWithCommas(parseInt(this.state.data.amount) + parseInt(store.transactionFee), 'đ') : 0}</span>
                                </div>

                                <div className="col-md-6 title">
                                    <span>Còn lại tạm tính:</span>
                                </div>
                                <div className="col-md-6 value">
                                    <span
                                        className="text-semibold">{(store.wallet) ? numberWithCommas(parseInt(store.wallet.balance) - parseInt(this.state.data.amount) - parseInt(store.transactionFee), 'đ') : 0}</span>
                                </div>

                                <div className="col-md-6 title otp">
                                    <span>Mã xác nhận OTP <span className="text-danger">*</span>:</span>
                                </div>
                                <div className="col-md-6 value d-flex">
                                    <input type="text" className="form-control otp mr-3"
                                           onChange={(e: any) => this.handleChangeData(e, 'otp')}/>
                                    <button className="btn btn-warning"
                                            disabled={this.state.disabledReSendOtp}
                                            onClick={() => this.reSendOtp()}>Gửi lại
                                        OTP {this.state.countDown > 1 ? '(' + this.state.countDown + 's)' : ''}
                                    </button>
                                </div>

                            </div>

                            <div className="text-center">
                                <i>Mã xác thực (OTP) đã được gửi đến số điện thoại của bạn. Vui lòng nhập OTP để hoàn
                                    thành giao dịch</i>
                            </div>

                            <hr/>
                            <div className="form-group text-center">
                                <button className="btn btn-primary" type="submit"
                                        onClick={(e: any) => this.confirmRequest(e)}>Xác nhận yêu cầu
                                </button>
                                <button className="btn btn-default ml-4" onClick={(e: any) => this.handleBack(e)}>Quay
                                    lại
                                </button>
                            </div>
                        </div>
                        }

                        {/*OTP confirm*/}
                        {this.state.step === 3 &&
                        <div className="cashout-notify">
                            <div className="text-center">
                                <p>Gửi yêu cầu thành công!</p>

                                <p><i className="fa fa-check fa-3x text-success"/></p>

                                <p className="text-semibold">
                                    Yêu cầu của bạn đã được tiếp nhận.
                                    Hệ thống sẽ tiến hành kiểm duyệt và thực hiện yêu cầu của bạn trong khoảng thời gian
                                    từ 2 đến 5 ngày làm việc.
                                    <br/>
                                    Bạn có thể kiểm tra lại yêu cầu của bạn <Link to="/home/revenue/history/type=all"
                                                                                  className="text-danger">tại đây</Link>
                                </p>

                                <i>Mọi thắc mắc, vui lòng liên hệ với chúng tôi tại support@chozoi.vn hoặc 19006094.
                                    Thời gian làm việc 8h - 20h, từ thứ hai đến thứ bảy</i>
                            </div>

                            <hr/>
                            <div className="form-group text-center">
                                <Link to="/home/revenue/history/type=all" className="btn btn-default ml-4">Lịch sử giao
                                    dịch</Link>
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </div>
        </>
    }
}
