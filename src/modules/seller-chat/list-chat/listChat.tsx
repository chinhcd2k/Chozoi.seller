import React, {Component, createRef} from 'react';
import {observer} from 'mobx-react';
import {observable} from 'mobx';
import Store, {IPerson} from '../store';
import * as Sentry from '@sentry/browser';
import ListChatItem from "./listChatItem";

export interface IProps {
    sellerId: string | number,
    listPersonChat: IPerson []
}

@observer
class ListChat extends Component<IProps> {
    private listChatBody = createRef<HTMLDivElement>();
    @observable statusNotifyMessage: boolean = true;

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any) {
        if (Store.statusScrollListChatToTop) {
            this.scrollListChatToTop()
        }
    }

    scrollListChatToTop = () => {
        if (this.listChatBody.current) {
            this.listChatBody.current.scrollTop = 0;
        }
        Store.statusScrollListChatToTop = false;
    }

    activeOption = () => {
        Store.statusIconSelect = !Store.statusIconSelect;
        Store.statusOpenInfo = false;
        Store.idShowOptionPerson = 'fake id';
    }
    handleSearch = (e: any) => {
        Store.searchNamePerson(e.target.value);
    }
    renderSelectOption = () => {
        return (
            <div className={"select-option"}>
                <div className={"select"}
                     onClick={() => {
                         this.activeOption()
                     }}>
                    <span style={{marginRight: "3px", color: "#F54B24"}}>{Store.option}</span>
                    {
                        (!Store.statusIconSelect) ? <i className="fal fa-chevron-up" style={{color: "#F54B24"}}/> :
                            <i className="fal fa-chevron-down" style={{color: "#F54B24"}}/>
                    }
                </div>
                <div className={"wrapper-option"}
                     style={(Store.statusIconSelect) ? {display: "none"} : {display: "block"}}>
                    <div onClick={() => {
                        Store.option = 'Tất cả';
                        this.activeOption();
                        Store.filterAllPerson();
                    }} className={"option"}>Tất cả
                    </div>
                    <div onClick={() => {
                        Store.option = 'Chưa đọc';
                        this.activeOption();
                        Store.filterPersonUnreadMessage();
                    }} className={"option"}>Chưa đọc
                    </div>
                    <div onClick={() => {
                        Store.option = 'Đã ghim';
                        this.activeOption();
                        Store.filterPin();
                    }} className={"option"}>Đã ghim
                    </div>
                </div>
            </div>
        )
    }
    renderListChat = (listPerson: IPerson [], status_load: boolean): React.ReactNode => {
        return (
            <div className={"list-person-chat"}>
                {
                    listPerson.map((person: IPerson, index: number) => <React.Fragment key={index}><ListChatItem
                        person={person} sellerId={this.props.sellerId.toString()}/></React.Fragment>)
                }
                <div className={"list-person-chat__load"} style={{display: "flex", justifyContent: "center"}}>
                    {
                        (status_load) ? <i className="fal fa-spinner fa-spin" style={{color: "#F54B24"}}/> : null
                    }
                </div>
            </div>
        )
    }
    renderNotifyListChat = (status: boolean): React.ReactNode => {
        if (status) {
            return (
                <div className={"notify-chat"}>
                    <div className={"list-chat__notify-icon"}>
                        <i className="fal fa-info-circle"/>
                    </div>
                    <div className={"list-chat__content"}>Để bảo vệ chính bạn, hãy bảo đảm bạn hoàn thành tất cả các
                        giao
                        dịch của bạn thông qua Chozoi.
                    </div>
                    <div className={"list-chat__close"}>
                        <i onClick={() => {
                            this.statusNotifyMessage = false
                        }} className="fal fa-times"/>
                    </div>
                </div>
            )
        } else return null
    }
    renderFormSearch = (): React.ReactNode => {
        return (
            <div className={"form-search-chat"}>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "11px",
                    backgroundColor: "#F4F5F6",
                    borderRadius: "4px"
                }}>
                    <i className="fal fa-search" style={{margin: "0 4px"}}/>
                    <input type="text" placeholder={"Tìm kiếm"} onChange={(e) => {
                        this.handleSearch(e)
                    }}/>
                </div>

                {this.renderSelectOption()}
            </div>
        )
    }

    renderNoChat = (): React.ReactNode => {
        return (
            <div>
                {this.renderFormSearch()}
                <div className={"no-chat"}>
                    <div>
                        <div className={"img-no-chat"}/>
                        <div style={{fontSize: "13px", padding: "0 40px", textAlign: "center"}}>Không tìm thấy cuộc hội
                            thoại nào
                        </div>
                    </div>
                </div>
            </div>

        )
    }

    render() {
        let {listPersonChat} = this.props;
        try {
            return (
                <div className={"list-chat"}>
                    {
                        (Store.listPersonChat.length === 0) ? this.renderNoChat() :
                            <div>
                                {this.renderFormSearch()}

                                <div className={"list-chat__body"} ref={this.listChatBody}>
                                    {this.renderNotifyListChat(this.statusNotifyMessage)}
                                    {this.renderListChat(listPersonChat, false)}
                                </div>
                            </div>
                    }
                </div>
            )
        } catch (err) {
            console.log(err);
            Sentry.captureException(err);
            return null;
        }

    }
}

export default ListChat;
