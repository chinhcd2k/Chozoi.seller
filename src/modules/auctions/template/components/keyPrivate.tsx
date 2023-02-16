import React, {Component, createRef} from 'react';
import {observer} from "mobx-react";
import {observable} from "mobx";
import {notify} from "../../../../common/notify/NotifyService";
import * as Sentry from '@sentry/browser';
import {css} from "@emotion/core";

export interface IProps {
	 type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK'|'CREATE_F_N'
}

@observer
class KeyPrivate extends Component<IProps> {
	 keyPrivateRef = createRef<HTMLInputElement>();
	 @observable valueKeyPrivate: string = '';
	 @observable description: string = '';
	 @observable statusSeePass = false;
	 @observable statusBtnKeyPrivate: boolean = false;
	 @observable valueKeyPrivateDisable: string = '';
	 @observable valueDescriptionDisable: string = '';
	 private statusForm: boolean = this.props.type === 'CREATE' || this.props.type === 'UPDATE' || this.props.type === 'REPLAY' || this.props.type === 'REPLAY_QUICK';


	 private tooltipCopyRef = createRef<any>();
	 private copyKeyPrivate = () => {
			if (this.tooltipCopyRef.current) {
				 this.tooltipCopyRef.current.innerText = 'Đã sao chép';
				 setTimeout(() => {
						if (this.tooltipCopyRef.current) {
							 this.tooltipCopyRef.current.innerText = 'Sao chép';
						}
				 }, 1000);
			}
			if (this.keyPrivateRef.current) {
				 this.keyPrivateRef.current.disabled = false;
				 this.keyPrivateRef.current.select();
				 document.execCommand('copy');
				 this.keyPrivateRef.current.disabled = true;
			}
	 }

	 public hasValidate = (): boolean => {
			if (this.statusForm && this.statusBtnKeyPrivate) {
				 const regexp: any = /^[\w\d]{6}$/;
				 let validateDescription: boolean | null = (this.descriptionRef.current && this.descriptionRef.current.value.length >= 6 && this.descriptionRef.current.value.length <= 150);
				 if (this.keyPrivateRef.current && this.descriptionRef.current) {
						if (!regexp.test(this.keyPrivateRef.current.value)) {
							 notify.show('Mã riêng tư phải có độ dài là 6 kí tự.', 'error');
							 if (this.keyPrivateRef.current) {
									this.keyPrivateRef.current.focus();
							 }
						} else if (this.descriptionRef.current.value.length < 6 || this.descriptionRef.current.value.length > 150) {
							 notify.show('Mô tả đấu giá riêng tư gồm 6 tới 150 kí tự.', "error");
							 if (this.descriptionRef.current) {
									this.descriptionRef.current.focus();
							 }
						}
				 }
				 return regexp.test(this.keyPrivateRef.current && this.keyPrivateRef.current.value) && validateDescription ? true : false;
			} else return true;
	 }

	 private changeStatusKeyPrivate = (status: boolean) => {
			if (status) {
				 this.statusBtnKeyPrivate = !this.statusBtnKeyPrivate;
			}
	 }

	 validateInputPrivateKey = (e: any) => {
			const regexp: any = /^[\w\d]{0,6}$/;
			if (regexp.test(e.target.value)) {
				 this.valueKeyPrivate = e.target.value;
			} else {
				 if (this.keyPrivateRef.current) {
						this.keyPrivateRef.current.value = this.valueKeyPrivate;
				 }
			}
	 }

	 descriptionRef = React.createRef<HTMLInputElement>();
	 valideteInputDescription = (e: any) => {
			if (e.target.value.length > 150) {
				 this.description = e.target.value.slice(0, 150);
				 if (this.descriptionRef.current) {
						this.descriptionRef.current.value = this.description;
				 }
			} else {
				 this.description = e.target.value;
			}
	 }

	 render() {
			let {type} = this.props;
			try {
				 return (
						 <div className={"key-private"} css={styleKeyPrivate}>
								<div style={{display: "flex", alignItems: "center"}}>
									 {
											(this.statusBtnKeyPrivate) ?
													<i className="fal fa-toggle-on fa-2x"
														 onClick={() => this.changeStatusKeyPrivate(this.statusForm)}
														 style={{cursor: "pointer", color: "rgb(25, 118, 210)"}}/> :
													<i className="fal fa-toggle-off fa-2x"
														 onClick={() => this.changeStatusKeyPrivate(this.statusForm)} style={{cursor: "pointer"}}/>
									 }
									 <div style={{marginLeft: "10px"}}>Đấu giá riêng tư &nbsp;</div>
								</div>
								{
									 (this.statusBtnKeyPrivate || (type === "DETAIL" && this.valueKeyPrivateDisable !== null)) ?
											 <div>
													<div>
														 <div style={{marginTop: "15px"}}>Mã riêng tư * (Mã riêng tư cần 6 kí tự chữ và số).</div>
														 <div style={{fontSize: "13px", fontStyle: "italic", marginTop: "10px"}}>
																<span>Shop ơi, nhớ chia sẻ mã này cho người mua để họ có thể tham gia đấu giá sản phẩm nhé.</span>
																{/*<Link to={"#"}> Tìm hiểu thêm.</Link>*/}
														 </div>
														 <div style={{position: "relative"}}>
																<input className={"private-key"}
																			 type={`${this.statusSeePass ? `text` : `password`}`}
																			 onChange={event => {
																					this.validateInputPrivateKey(event)
																			 }}
																			 disabled={!this.statusBtnKeyPrivate || !this.statusForm}
																			 defaultValue={this.valueKeyPrivateDisable}
																			 ref={this.keyPrivateRef}
																/>
																<i className="far fa-unlock-alt icon-key"/>
																<div className={"wrapper-icon-copy"}>
																	 <div style={{position: "relative"}}>
																			{(type === 'DETAIL' && this.statusSeePass) ?
																					<i className="fas fa-copy icon-copy" onClick={() => {
																						 this.copyKeyPrivate()
																					}}/> : null}
																			<small className={"tooltip-icon-copy"} ref={this.tooltipCopyRef}>Sao chép</small>
																	 </div>
																</div>
																<i className={`${(this.statusSeePass) ? `fal fa-eye` : `fal fa-eye-slash`} icon-eye`}
																	 onClick={() => this.statusSeePass = !this.statusSeePass}/>
														 </div>
													</div>
													<div>
														 <div style={{marginTop: "15px"}}>Mô tả đấu giá riêng tư * (Mô tả đấu giá riêng tư gồm 6-150
																kí tự).
														 </div>
														 <div style={{fontSize: "13px", fontStyle: "italic", marginTop: "10px"}}>Shop hãy chia sẻ lý
																do áp
																dụng đấu giá riêng tư cho khách hàng nhé!
														 </div>
														 <div>
																<input
																		className={"description"} type="text"
																		onChange={event => this.valideteInputDescription(event)}
																		disabled={!this.statusBtnKeyPrivate || !this.statusForm}
																		defaultValue={this.valueDescriptionDisable}
																		style={(this.description.length === 150) ? {border: "1px solid red"} : {}}
																		ref={this.descriptionRef}
																/>
														 </div>
													</div>
											 </div> : null
								}
						 </div>
				 );
			} catch (e) {
				 console.log(e);
				 Sentry.captureException(e);
				 return null;
			}
	 }
}

const styleKeyPrivate = css`
		background-color: white;
    width: 827px;
    margin-top: 15px;
    padding: 12.5px;
    border: 1px solid rgba(0, 0, 0, 0.125);
    font-size: 14px;
    
    .private-key, .description{
        border: 1px solid rgba(0, 0, 0, 0.125);
        outline: none;
        width: 100%;
        padding: 5px 40px;
        margin: 5px 0;
    }
    .description{
        padding: 5px 5px;
    }
    .icon-key{
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 22px;
    }
    .wrapper-icon-copy{
    		position: absolute;
    		left: 100px;
        top: 7px;
        transform: rotate(0);
        
        &:hover .tooltip-icon-copy{
        	visibility: visible;
        }
        
    		.icon-copy{
        		font-size: 16px;
        		cursor: pointer;
    		}
    		
    		.tooltip-icon-copy{
    				position: absolute;
						transform: translate(-45%, -190%);
						width: 80px;
						background-color: white;
						display: flex;
						justify-content: center;
						align-items: center;
						border-radius: 2px;
						border: 1px solid rgba(0, 0, 0, 0.2);
    				padding: 3px 7px;
						visibility: hidden;
    		}
    }
    .icon-eye{
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 22px;
        cursor: pointer;
    }
`

export default KeyPrivate;
