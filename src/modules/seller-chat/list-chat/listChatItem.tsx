import React, {Component} from 'react';
import Store, {IPerson} from "../store";
import {observer} from "mobx-react";

interface IProps {
    sellerId: string,
    person: IPerson
}

@observer
class ListChatItem extends Component<IProps> {
    activeOption = () => {
        Store.statusOpenInfo = false;
        Store.statusIconSelect = true;
        if (Store.idShowOptionPerson === this.props.person.id) Store.idShowOptionPerson = 'fake id';
        else Store.idShowOptionPerson = this.props.person.id;

    }

    styleItem = () => {
        if (Store.personChatting.id === this.props.person.id) return {backgroundColor: "#F4F5F6"};
        if (this.props.person.pin) return {backgroundColor: "#F4F5F6"};
    }

    renderUnreadMesAndLockPerson = (person: IPerson, sellerId: string): React.ReactNode => {
        if (person.lock) return (
            <div style={{
                fontSize: "9px",
                backgroundColor: "#F6DBCB",
                color: "#F54B24",
                padding: "0 8px",
                borderRadius: "50px"
            }}>lock</div>);
        else if (person.unreadMessage > 0) return (
            <div className={"list-person-chat__person__detail__unread-message"}
                 onClick={() => {
                     Store.onClickPersonToChat(person.id, sellerId, person.personId, person.unreadMessage, '', person.sellerDeletedAt);
                 }}>{(person.unreadMessage <= 9) ? person.unreadMessage : '9+'}</div>
        )
    }


    render() {
        let {person, sellerId} = this.props;
        return (
            <div className={"list-person-chat__person"}
                 style={this.styleItem()}
                 onClick={() => {
                 }}
            >
                {/*avatar*/}
                <div className={"list-person-chat__person__avatar"}
                     onClick={() => {
                         Store.onClickPersonToChat(person.id, sellerId, person.personId, person.unreadMessage, '', person.sellerDeletedAt);
                     }}>
                    {
                        person.avatar ?
                            <img src={person.avatar} alt=""/> :
                            <div className={"letter-first-of-name"}>{person.name.slice(0, 1).toUpperCase()}</div>
                    }
                    <div className={"list-person-chat__person__avatar__online"}
                         style={(!person.online) ? {background: "#F54B24"} : {}}
                    />
                </div>
                {/*end avatar*/}
                {/*person detail*/}
                <div className={"list-person-chat__person__detail"}>
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <div className={"list-person-chat__person__detail__name"}
                             onClick={() => {
                                 Store.onClickPersonToChat(person.id, sellerId, person.personId, person.unreadMessage, '', person.sellerDeletedAt);
                             }}
                        >
                            {(person.name.length >= 30) ? person.name.slice(0, 30) : person.name}
                        </div>
                        <div className={"list-person-chat__person__detail__date"}>{person.date}</div>
                        <div
                            className={"list-person-chat__person__detail__date list-person-chat__person__detail__option"}
                            onClick={() => {
                                this.activeOption()
                            }}> ...
                        </div>

                        <div className={"list-person-chat__person__detail__option-detail"}
                             style={(Store.idShowOptionPerson === person.id) ? {display: "block"} : {display: "none"}}>
                            {
                                (person.pin === true) ?
                                    <div className={"detail"}
                                         onClick={() => {
                                             this.activeOption();
                                             Store.pinAndUnpin(person.id, 'unpin', sellerId)
                                         }}><i className="fal fa-thumbtack"/><span>Gỡ ghim</span>
                                    </div> :
                                    <div className={"detail"}
                                         onClick={() => {
                                             this.activeOption();
                                             Store.pinAndUnpin(person.id, 'pin', sellerId)
                                         }}><i className="fal fa-thumbtack"/><span>Ghim tin nhắn</span>
                                    </div>
                            }
                            <div className={"detail"}
                                 onClick={() => {
                                     this.activeOption();
                                     Store.readMessage(person.id, sellerId, person.personId, person.unreadMessage);
                                 }}><i className="fal fa-comment-check"/><span>Đánh dấu đã đọc</span>
                            </div>
                            <div className={"detail"}
                                 onClick={() => {
                                     this.activeOption();
                                     Store.DELETE_deletePerson(person.id);
                                 }}><i className="fal fa-trash-alt"/><span>Xóa hội thoại</span>
                            </div>
                        </div>

                    </div>
                    <div style={{display: "flex"}}>
                        <div className={"list-person-chat__person__detail__last-message"}
                             onClick={() => {
                                 Store.onClickPersonToChat(person.id, sellerId, person.personId, person.unreadMessage, '', person.sellerDeletedAt);
                             }}>{person.lastMessage}</div>
                        {
                            this.renderUnreadMesAndLockPerson(person, sellerId)
                        }
                    </div>
                </div>
                {/*end person detail*/}
            </div>
        )
    }
}

export default ListChatItem;


