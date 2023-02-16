import React, {Component, createRef} from 'react';
import {observer} from "mobx-react";
import Store, {IMessage, Message} from '../store';
import * as Sentry from "@sentry/browser";
import {getUrlPassport} from "../../Redirect";
import {notify} from "../../../common/notify/NotifyService";
import {observable} from "mobx";

export interface IProps {
    sellerId: string
}

@observer
class WindowChat extends Component<IProps> {
    private sendMessage = createRef<HTMLInputElement>();
    public refListMessage = createRef<HTMLDivElement>();
    @observable statusIconSend: boolean = false;

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any) {
        if (Store.statusWinChat && Store.listPersonChat !== prevState) {
            this.scrollBottomMessage();
        }

        if (!Store.statusWinChat) {
            this.scrollToMessage();
        }

        if (Store.statusWinChat && this.sendMessage.current) {
            this.sendMessage.current.focus();
        }
    }

    handleScroll = () => {
        if (this.refListMessage.current) {
            if (this.refListMessage.current.scrollTop === 0) {
                Store.GET_message(Store.personChatting.id, this.props.sellerId, Store.timeEndMessage, Store.personChatting.sellerDeletedAt);
            }
        }
    }

    scrollBottomMessage = () => {
        setTimeout(() => {
            if (this.refListMessage.current) {
                this.refListMessage.current.scrollTop = this.refListMessage.current.scrollHeight
            }
        })
    }

    scrollToMessage = () => {
        let eleMes = document.getElementById('50');
        let offsetTopMes: number;
        if (eleMes) {
            offsetTopMes = eleMes.offsetTop;
        }
        setTimeout(() => {
            if (this.refListMessage.current) {
                this.refListMessage.current.scrollTop = offsetTopMes;
            }
        })
    }

    sendMessageOnSocket = (msg: Message) => {
        msg.client_message_id = localStorage.getItem("uuid") as string;
        Store.socket.emit('new_message', msg);
    }


    onTyping = (room_id: string, from: string, to: string, status: boolean) => {
        if (Store.statusConnectSocket && status) {
            Store.socket.emit('typing', {
                room_id: room_id,
                from: from,
                to: to
            });
        } else {
            Store.socket.emit('stop_typing', {
                room_id: room_id,
                from: from,
                to: to
            });
        }
    }

    private seenMes() {
        let unreadMes: number = 0;
        for (let i = Store.listMessage.length - 1; i >= 0; i--) {
            if (Store.listMessage[i].status === 'res') unreadMes = unreadMes + 1; else break;
        }
        Store.seenMes(Store.personChatting.id, this.props.sellerId, Store.personChatting.personId, unreadMes);
        Store.setSeenMesPerson(Store.personChatting.id, unreadMes);
    }

    async handleSendMessage(e: any) {
        // render icon send mes
        this.statusIconSend = true;
        // typing
        if (e.target.value.length === 0) {
            this.onTyping(Store.personChatting.id, this.props.sellerId, Store.personChatting.personId, false);
        } else if (e.target.value.length === 1) {
            this.onTyping(Store.personChatting.id, this.props.sellerId, Store.personChatting.personId, true);
        }
        //send mes
        if (Store.statusConnectSocket) {
            if (e.key === 'Enter') {
                //scroll list chat to top
                Store.statusScrollListChatToTop = true;
                // push person chat to top
                Store.setListPersonChatNew(Store.personChatting.id);
                // hide send icon
                this.statusIconSend = false;
                // stop typing
                this.onTyping(Store.personChatting.id, this.props.sellerId, Store.personChatting.personId, false);
                // read mes
                let unreadMes: number = 0;
                for (let i = Store.listMessage.length - 1; i >= 0; i--) {
                    if (Store.listMessage[i].status === 'res') unreadMes = unreadMes + 1; else break;
                }
                Store.seenMes(Store.personChatting.id, this.props.sellerId, Store.personChatting.personId, unreadMes);
                Store.setSeenMesPerson(Store.personChatting.id, unreadMes);
                // send mes
                if (this.sendMessage.current && this.sendMessage.current.value.length !== 0 && this.refListMessage.current) {
                    this.sendMessageOnSocket({
                        type: 'TEXT',
                        client_message_id: '',
                        from: this.props.sellerId,
                        to: Store.personChatting.personId,
                        room_id: Store.personChatting.id,
                        content: this.sendMessage.current.value
                    });
                    // Store.pushMessage(this.sendMessage.current.value);
                    this.sendMessage.current.value = '';
                    this.scrollBottomMessage();
                }
            }
        }
    }

    handleOnClickSendMes = () => {
        // hide send icon
        this.statusIconSend = false;
        // stop typing
        this.onTyping(Store.personChatting.id, this.props.sellerId, Store.personChatting.personId, false);
        // read mes
        let unreadMes: number = 0;
        for (let i = Store.listMessage.length - 1; i >= 0; i--) {
            if (Store.listMessage[i].status === 'res') unreadMes = unreadMes + 1; else break;
        }
        Store.seenMes(Store.personChatting.id, this.props.sellerId, Store.personChatting.personId, unreadMes);
        Store.setSeenMesPerson(Store.personChatting.id, unreadMes);
        if (this.sendMessage.current && this.sendMessage.current.value.length !== 0 && this.refListMessage.current) {
            this.sendMessageOnSocket({
                type: 'TEXT',
                client_message_id: '',
                from: this.props.sellerId,
                to: Store.personChatting.personId,
                room_id: Store.personChatting.id,
                content: this.sendMessage.current.value
            });
            // Store.pushMessage(this.sendMessage.current.value);
            this.sendMessage.current.value = '';
            this.scrollBottomMessage();
        }
    }

    renderWindowEmptyChat = (status: boolean): React.ReactNode => {
        if (status) {
            return (
                <div className={"win-chat__empty"}>
                    <div className={"win-chat__empty__avatar"}/>
                    <div className={"win-chat__empty__content"}>Chào mừng bạn đến với tính năng chat</div>
                </div>
            )
        } else return null;
    }

    renderMessage = (status: 'req' | 'res' | 'date', content: string, index: string, seen?: boolean): React.ReactNode => {
        if (status === 'req') {
            return (
                <div>
                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        paddingTop: "4px",
                        paddingBottom: "4px",
                        position: "relative"
                    }}
                         id={index}>
                        <div style={{backgroundColor: "rgba(246, 219, 203, .3)"}}
                             className={"message-chat"}>{content}</div>
                    </div>
                    <div>{seen &&
                    <div style={{fontSize: "11px", color: "#999999", textAlign: "end"}}>Đã xem</div>}</div>
                </div>
            )
        } else if (status === "res") {
            return (
                <div style={{paddingTop: "1px", paddingBottom: "1px"}} id={index}>
                    <div style={{backgroundColor: "#F4F5F6"}} className={"message-chat"}>{content}</div>
                </div>
            )
        } else return (
            <span style={{
                color: "#999999",
                display: "flex",
                justifyContent: "center",
                paddingTop: "3px",
                paddingBottom: "3px"
            }}
                  id={index}
                  className={"message-chat"}>{content}</span>
        )
    }

    renderWindowChat = (status: boolean): React.ReactNode => {
        if (status) {
            return (
                <React.Fragment>
                    {
                        (Store.statusLoadWinMes) ? this.renderLoading(true) :
                            <div className={"win-chat__normal"}>
                                <div className={"win-chat__normal__info"}>
                                    <div className={"win-chat__normal__info__name"}>{Store.personChatting.name}</div>
                                    {
                                        (!Store.statusOpenInfo) ?
                                            <i onClick={() => {
                                                Store.statusOpenInfo = !Store.statusOpenInfo;
                                                Store.idShowOptionPerson = 'fake id';
                                                Store.statusIconSelect = true;
                                            }}
                                               className="fal fa-chevron-down"/> :
                                            <i onClick={() => Store.statusOpenInfo = !Store.statusOpenInfo}
                                               className="fal fa-chevron-up"/>
                                    }
                                    {
                                        (Store.statusOpenInfo) ?
                                            <div className={"win-chat__normal__info__detalt"}>
                                                <div className={"info"}>
                                                    <div className={"avatar"}>
                                                        {
                                                            (Store.personChatting.avatar) ?
                                                                <img src={Store.personChatting.avatar} alt=""/> : null
                                                        }
                                                    </div>
                                                    <div className={"name-location"}>
                                                        <div className={"name"}>{Store.personChatting.name}</div>
                                                        {
                                                            (Store.personChatting.location) ?
                                                                <div className={"location"}>
                                                                    <i className="fad fa-map-marker-alt"/> &nbsp;
                                                                    <span>{Store.personChatting.location}</span>
                                                                </div> : null
                                                        }
                                                    </div>
                                                </div>
                                                <a href={getUrlPassport(parseInt(Store.personChatting.personId))}
                                                   target={"_blank"}>
                                                    <div className={"link-passport"}>Xem trang passport</div>
                                                </a>
                                                <div onClick={() => {
                                                    Store.closeAllOption();
                                                    notify.show('Chức năng đang phát triển', "warning")
                                                }} className={"block"}>Chặn người dùng
                                                </div>
                                                <div onClick={() => {
                                                    Store.closeAllOption()
                                                    notify.show('Chức năng đang phát triển', "warning")
                                                }} className={"report"}>Báo cáo
                                                </div>
                                            </div> : null
                                    }
                                </div>
                                <div className={"win-chat__normal__message"} id={"win-chat"} ref={this.refListMessage}
                                     onClick={() => this.scrollBottomMessage()}
                                     onScroll={() => this.handleScroll()}>
                                    <div>
                                        {this.renderLoading(Store.statusLoadMes)}
                                        {Store.listMessage.map((message: IMessage, index) => <React.Fragment
                                            key={index}>{this.renderMessage(message.status, message.content, index.toString(), message.isSeen)}</React.Fragment>)}
                                        {
                                            (undefined !== Store.listPersonIdTyping.find((element) => {
                                                return element === Store.personChatting.id
                                            })) ?
                                                <div className="loading">
                                                    <span className="one" style={{fontSize: "30px"}}>.</span><span
                                                    className="two"
                                                    style={{fontSize: "30px"}}>.</span><span
                                                    className="three" style={{fontSize: "30px"}}>.</span>
                                                </div> : null
                                        }
                                    </div>
                                </div>
                                <div className={"win-chat__normal__input-message"}
                                     onClick={() => Store.closeAllOption()}>
                                    <input type="text" placeholder={"Nhập tin nhắn..."}
                                           onInput={(event) => {
                                               this.handleSendMessage(event)
                                           }}
                                           onKeyPress={((event: any) => {
                                               this.handleSendMessage(event)
                                           })}
                                           onClick={() => this.seenMes()}
                                           ref={this.sendMessage}/>
                                    {
                                        (this.statusIconSend) ? <i className="fad fa-paper-plane icon-send-mes"
                                                                   style={{
                                                                       position: "absolute",
                                                                       top: "15px",
                                                                       right: "10px",
                                                                       color: "#F54B24"
                                                                   }}
                                                                   onClick={(event) => {
                                                                       this.handleOnClickSendMes();
                                                                   }}/> : null
                                    }

                                    <div style={{display: "flex"}}>
                                        <div style={{marginLeft: "4px"}}>
                                            <i className="fas fa-smile"
                                               onClick={() => notify.show('Chức năng đang phát triển', "warning")}/>
                                            <div className={"wrapper-stickers"}>
                                                <div className={"stickers"}>
                                                    <div>Stickers</div>
                                                    <i className="fas fa-sort-down cursor-pointer"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <i className="fas fa-image"
                                               onClick={() => notify.show('Chức năng đang phát triển', "warning")}/>
                                            <div className={"wrapper-send-img"}>
                                                <div className={"send-img"}>
                                                    <div>Đính kèm ảnh</div>
                                                    <i className="fas fa-sort-down cursor-pointer"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    }
                </React.Fragment>
            )
        } else return null
    }

    renderLoading = (status: boolean): React.ReactNode => {
        if (status)
            return (
                <div style={{display: "flex", justifyContent: "center", padding: "4px"}}>
                    <i className="fal fa-spinner fa-spin" style={{color: "#F54B24"}}/>
                </div>
            )
    }

    render() {
        try {
            return (
                <div className={"win-chat"}>
                    {this.renderWindowEmptyChat(Store.personChatting.id === "0")}
                    {this.renderWindowChat(Store.personChatting.id !== "0")}
                </div>
            );
        } catch (err) {
            console.log(err);
            Sentry.captureException(err);
            return null;
        }
    }
}

export default WindowChat;
