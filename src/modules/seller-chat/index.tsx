import React, {Component} from 'react';
import {observer} from 'mobx-react'
import './style.scss';
import Store from './store';
import ListChat from "./list-chat/listChat";
import WindowChat from "./window-chat/windowChat";
import * as Sentry from '@sentry/browser';
import io from 'socket.io-client';
import {Moment} from '../../common/functions/Moment';

interface IMyChatProps {
    sellerId: string,
    token: string
}

@observer
export default class MyChat extends Component<IMyChatProps> {
    renderCloseChat = (status: boolean): React.ReactNode => {
        if (!status) return (
            <div onClick={() => {
                Store.statusChatBox = true;
            }} className={"seller-chat__box-close"}>
                <i className="fas fa-comments-alt"/>
                <span className={"header-title"}>Trò chuyện</span>
                {Store.allUnreadMessage > 0 ? <div
                    className={"unread-messages"}>{(Store.allUnreadMessage <= 9) ? Store.allUnreadMessage : '9+'}</div> : null}
            </div>
        ); else return null
    }

    render() {
        try {
            return (
                <React.Fragment>
                    <div className={"seller-chat"}>
                        {
                            (Store.statusOpenInfo === true || Store.statusIconSelect === false || (Store.idShowOptionPerson !== 'fake id' && Store.idShowOptionPerson !== '0')) ?
                                <div onClick={() => Store.closeAllOption()} className={"mask-chat"}/> : null
                        }
                        {/*when close chat*/}
                        {this.renderCloseChat(Store.statusChatBox)}
                        {/*end*/}
                        {/*when open chat*/}
                        {
                            Store.statusChatBox ?
                                <div style={Store.statusOpenWinChat ? {width: "242px"} : {}}
                                     className={"seller-chat__box-open"}>
                                    {/*header*/}
                                    <div className={"seller-chat__box-open__header"}>
                                        <div style={{display: "flex"}}>
                                            <i className="fas fa-comments-alt"/>
                                            <span className={"header__title"}>Trò chuyện</span>
                                            {
                                                (Store.allUnreadMessage > 0) ? <span
                                                    className={"header__unread-messages"}>{(Store.allUnreadMessage <= 9) ? Store.allUnreadMessage : '9+'}</span> : null
                                            }
                                        </div>
                                        <div style={{display: "flex", position: "relative"}}>
                                            {
                                                (Store.statusOpenWinChat) ?
                                                    <i onClick={() => {
                                                        Store.statusOpenWinChat = false;
                                                    }} className="fal fa-chevron-right cursor-pointer"/> :
                                                    <i onClick={() => Store.statusOpenWinChat = true}
                                                       className="fal fa-chevron-left cursor-pointer"/>
                                            }
                                            <i className="fal fa-window-minimize cursor-pointer"
                                               onClick={() => Store.statusChatBox = false}
                                            />
                                            <div className={"minimize"}>
                                                <div className={"minisize-chat"}>Ẩn chat</div>
                                                <i className="fas fa-sort-down cursor-pointer"/>
                                            </div>

                                            <div className={"window-chat-close"}>
                                                <div>Thu gọn</div>
                                                <i className="fas fa-sort-down cursor-pointer"/>
                                            </div>
                                        </div>
                                    </div>
                                    {/*end*/}
                                    {/*body chat*/}
                                    <div className={"wrapper-body-chat"}>
                                        <div className={"window-list-chat"}>
                                            <ListChat sellerId={this.props.sellerId}
                                                      listPersonChat={Store.listPersonChat}/>
                                        </div>
                                        <div style={Store.statusOpenWinChat ? {display: "none"} : {}}
                                             className={"window-chat"}>
                                            <WindowChat sellerId={this.props.sellerId}/>
                                        </div>
                                    </div>
                                    {/*end*/}
                                </div> : null
                        }
                        {/* end*/}
                    </div>
                </React.Fragment>
            );
        } catch (err) {
            console.error(err);
            Sentry.captureException(err);
            return null;
        }
    }

    async getRoom(id: string) {
        let rs = await Store.reEnableRoom(id);
        if (rs.status === 200) {
            let res = await Store.GET_dataListPerson(this.props.sellerId);
            if (res) {
                Store.listPersonChat.map((value => {
                    if (value.id === id) {
                        value.online = true;
                    }
                }))
                Store.getListPersonChat(Store.listPerson);
            }
        }
    }

    componentDidMount() {
        Store.GET_dataListPerson(this.props.sellerId);
        Store.getListPersonChat(Store.listPerson);
        /*connect socket*/
        const URL_API: string = (window as any).URL_API;
        Store.socket = io(`${URL_API}/v1/conversations/events`, {
            path: '/v1/conversations/sockets',
            transports: ['websocket'],
            query: {
                token: this.props.token,
                user_id: this.props.sellerId,
                user_role: 'SELLER'
            }
        });
        /*end connect socket*/
        /*check and look after connect*/
        Store.socket.on('connect', () => {
            Store.statusConnectSocket = true;
            Store.socket.on('new_message', (data: any) => {
                let id = Store.listPerson.findIndex((element: any) => {
                    return element.id === data.room_id;
                });
                if (id === -1) {
                    this.getRoom(data.room_id);
                } else {
                    Store.handleNewMessage(data._id, data.room_id, data.from, this.props.sellerId, data.content, Moment.getDate(data.created_at, 'dd thg mm'), data.created_at);
                }
            })
            Store.socket.on('active_user_list', (data: any) => {
                data.rooms.map((element: any) => {
                    Store.listPerson.map((value => {
                        if (value.id === element.room_id) {
                            value.online = element.status;
                        }
                    }))
                })
                Store.getListPersonChat(Store.listPerson);
            })

            Store.socket.on('user_status_change', (data: any) => {
                Store.listPersonChat.map((value => {
                    if (value.id === data.room_id) {
                        value.online = data.status;
                    }
                }))
                Store.getListPersonChat(Store.listPerson);
            })

            Store.socket.on('typing', (data: any) => {
                if (Store.listPersonIdTyping.find((element) => {
                    return element === data.room_id
                }) === undefined) Store.listPersonIdTyping.push(data.room_id);
            })

            Store.socket.on('stop_typing', (data: any) => {
                let index: number = Store.listPersonIdTyping.findIndex((element) => {
                    return element === data.room_id;
                });
                Store.listPersonIdTyping.splice(index, 1);
            })

            Store.socket.on('seen_messages', (data: any) => {
                if (Store.personChatting.id === data.room_id) {
                    Store.onSeenMes(data.last_message_id)
                }
            })

            Store.socket.on('disconnect', () => {
                Store.statusConnectSocket = false;
            })
        })
        /*end check and look after connect*/
    }
}
