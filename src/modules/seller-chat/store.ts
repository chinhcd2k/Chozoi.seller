import {observable} from 'mobx';
import {Moment} from "../../common/functions/Moment";
import {BaseService} from "../../common/services/BaseService";

export interface IPerson {
	 avatar: string | null,
	 online: boolean,
	 name: string,
	 date: string,
	 lastMessage: string,
	 unreadMessage: number,
	 location: string,
	 id: string, /*id room*/
	 pin: boolean,
	 personId: string, /*id buyer*/
	 lock: boolean,
	 sellerDeletedAt: string,
	 from: string,
	 datePin: string,
	 dateChatNew: string
}

export interface IMessage {
	 id_mes: string,
	 lastMessageCreatedAt: string,
	 status: 'req' | 'res' | 'date',
	 content: string,
	 isSeen?: boolean
}

export interface Message {
	 room_id: string,
	 from: string,
	 to: string,
	 type: 'TEXT' | 'IMAGE' | 'EMOJI',
	 content: string,
	 client_message_id: string
}

export interface ISeenMes {
	 room_id: string,
	 from: string,
	 to: string,
	 last_message_id: string,
	 last_message_created_at: string
}

class StoreChat extends BaseService {
	 socket: any = null;
	 defaultPerson: IPerson = {
			unreadMessage: 0,
			lastMessage: "",
			date: "",
			name: "default",
			online: false,
			avatar: null,
			location: "",
			id: "0",
			pin: false,
			personId: '',
			lock: false,
			sellerDeletedAt: "",
			from: "",
			datePin: "",
			dateChatNew: ""
	 }

	 /*state list chat*/
	 @observable personChatting: IPerson = {
			unreadMessage: 0,
			lastMessage: "",
			date: "",
			name: "default",
			online: false,
			avatar: null,
			location: "",
			id: "0",
			pin: false,
			personId: '',
			lock: false,
			sellerDeletedAt: "",
			from: "",
			datePin: "",
			dateChatNew: ""
	 };
	 @observable listPerson: IPerson [] = [];
	 @observable listPersonChat: IPerson [] = [];
	 @observable idShowOptionPerson: string = "fake id";
	 @observable statusIconSelect: boolean = true;
	 @observable listPersonIdTyping: string [] = [];
	 @observable option: 'Tất cả' | 'Chưa đọc' | 'Đã ghim' = 'Tất cả';
	 listPersonPin: IPerson [] = [];
	 listPersonUnread: IPerson [] = [];
	 listPersonOn: IPerson [] = [];
	 listPersonOff: IPerson [] = [];
	 listChatNew: IPerson [] = [];
	 @observable statusScrollListChatToTop: boolean = false;

	 /*end*/
	 /*state win chat*/
	 @observable listMessage: IMessage [] = [];
	 @observable timeEndMessage: string = '';
	 @observable statusOpenWinChat: boolean = false;
	 @observable statusOpenInfo: boolean = false;
	 @observable statusGetMessage: boolean = false;
	 @observable statusWinChat: boolean = true;
	 @observable statusLoadMes: boolean = false;
	 @observable statusLoadWinMes: boolean = false;
	 @observable statusConnectSocket: boolean = false;
	 /*end*/
	 /*state app chat*/
	 @observable statusChatBox: boolean = false;
	 @observable allUnreadMessage: number = 0;
	 /*end*/

	 setAllUnreadMessage = (message_seen: number) => {
			if (this.allUnreadMessage <= 0) {
				 this.allUnreadMessage = 0;
			} else this.allUnreadMessage = this.allUnreadMessage - message_seen;

	 }

	 closeAllOption = () => {
			this.statusOpenInfo = false;
			this.statusIconSelect = true;
			this.idShowOptionPerson = '0';
	 }

	 /*control win chat*/
	 handleNewMessage = (id_mes: string, id: string, from: string, seller_id: string, content: string, date: string, last_message_created_at: string) => {
			// format last mes and update new mes
			this.listPerson.map(value => {
				 if (value.id === id) {
						value.lastMessage = content.slice(0, 30);
						value.date = date;
				 }
			})
			// check buyer mes to push mes
			// console.log(this.listMessage[0]);
			if (from !== seller_id && id === this.personChatting.id) {
				 if (this.listMessage.length>0){
						if (Math.abs(new Date(last_message_created_at).getTime() - new Date(this.listMessage[this.listMessage.length - 1].lastMessageCreatedAt).getTime()) > 5*60*1000 && this.listMessage[this.listMessage.length-1].status !== "date") {
							 this.listMessage.push({
									id_mes: "",
									lastMessageCreatedAt: '',
									status: "date",
									content: `${Moment.getDate(last_message_created_at, 'dd thg mm')}, ${Moment.getTime(last_message_created_at, 'hh:mm')}`
							 })
						}
				 }
				 if (content) {
						this.listMessage.push({
							 id_mes: id_mes,
							 lastMessageCreatedAt: last_message_created_at,
							 status: "res",
							 content: content
						});
						this.listPerson.map(value => {
							 if (value.id === id) {
									value.unreadMessage = value.unreadMessage + 1;
							 }
						})
						this.clearSeenMes();
				 }
				 this.getListPersonChat(this.listPerson);
			} else if (from !== seller_id && id !== this.personChatting.id) {
				 this.listPerson.map(value => {
						if (value.id === id) {
							 value.unreadMessage = value.unreadMessage + 1;
						}
				 })
				 this.getListPersonChat(this.listPerson);
			} else if (from === seller_id) {
				 if (content) {
						this.listMessage.push({
							 id_mes: id_mes,
							 lastMessageCreatedAt: last_message_created_at,
							 status: "req",
							 content: content
						});
				 }
			}
	 }

	 onSeenMes(id_mes: string) {
			this.listMessage.forEach(value => {
				 if (value.isSeen) {
						value.isSeen = false;
				 }
			})
			this.listMessage.forEach(value => {
				 if (value.id_mes === id_mes) {
						value.isSeen = true;
				 }
			})
	 }

	 clearSeenMes() {
			this.listMessage.forEach(value => {
				 if (value.isSeen) {
						value.isSeen = false;
				 }
			})
	 }

	 // pushMessage = (content: string) => {
	 // 	if (content) {
	 // 		 this.listMessage.push({
	 // 				id_mes: localStorage.getItem("uuid") as string,
	 // 				lastMessageCreatedAt: `${new Date()}`,
	 // 				status: "req",
	 // 				content: content
	 // 		 });
	 // 	}
	 // }

	 cleanMessage = () => {
			this.listMessage = [];
	 }

	 /*end*/

	 /*control form list rooms*/ /*person === room*/
	 searchNamePerson = (name: string) => {
			let result: IPerson[] = this.listPerson.filter((person) => {
				 return person.name.toLowerCase().indexOf(name.toLowerCase()) !== -1;
			})
			this.listPersonChat = result;
	 }

	 filterPersonUnreadMessage = () => {
			let result = this.listPerson.filter((person) => {
				 return person.unreadMessage !== 0;
			})
			this.listPersonChat = result;
	 }

	 filterAllPerson = () => {
			this.listPersonChat = this.listPerson;
			this.getListPersonChat(this.listPerson);
	 }

	 filterPin = () => {
			let result: IPerson[] = this.listPerson.filter((person) => {
				 return person.pin === true;
			})
			this.listPersonChat = result;
	 }

	 async pinAndUnpin(id: string, option: 'pin' | 'unpin', seller_id: string) {
			let url = `/v1/conversations/rooms/${id}/pin`;
			if (option === 'pin') {
				 let response = await this.postRequest(url, {"user_id": seller_id, "role": "SELLER"}, true);
				 if (response.status === 200 && response.body.status) {
						this.listPerson.map((value => {
							 if (value.id === id) {
									value.pin = true;
									value.datePin = Date().toString();
							 }
						}))
						this.getListPersonChat(this.listPerson);
				 }
			} else {
				 let response = await this.deleteRequest(url, {"user_id": seller_id, "role": "SELLER"}, true);
				 if (response.status === 200 && response.body.status) {
						this.listPerson.map((value => {
							 if (value.id === id) value.pin = false;
						}))
						this.getListPersonChat(this.listPerson);
				 }
			}
	 }

	 setListPersonChatNew = (id: string) => {
			this.listPerson.map((value => {
				 if (value.id === id) {
						value.dateChatNew = Date().toString();
				 }
			}))
			this.getListPersonChat(this.listPerson);
	 }

	 getListPersonChat = (list_person: IPerson []) => {
			let listPerson: IPerson [] = [...list_person];
			this.listPersonPin = listPerson.filter((person) => person.pin === true);
			this.listPersonPin.sort(function (a, b) {
				 let firstEle: any = new Date(b.datePin);
				 let lastEle: any = new Date(a.datePin);
				 return firstEle - lastEle;
			})
			this.listChatNew = listPerson.filter((person) => person.pin === false && person.dateChatNew !== "");
			this.listChatNew.sort(function (a, b) {
				 let firstEle: any = new Date(b.dateChatNew);
				 let lastEle: any = new Date(a.dateChatNew);
				 return firstEle - lastEle;
			})
			this.listPersonUnread = listPerson.filter((person) => person.pin === false && person.dateChatNew === "" && person.unreadMessage !== 0);
			this.listPersonOn = listPerson.filter((person) => person.pin === false && person.dateChatNew === "" && person.unreadMessage === 0 && person.online === true);
			this.listPersonOff = listPerson.filter((person) => person.pin === false && person.dateChatNew === "" && person.unreadMessage === 0 && person.online === false);
			if (this.option === "Tất cả") {
				 this.listPersonChat = this.listPersonPin.concat(this.listChatNew).concat(this.listPersonUnread).concat(this.listPersonOn).concat(this.listPersonOff);
			} else if (this.option === "Đã ghim") {
				 this.listPersonChat = this.listPersonPin
			} else if (this.option === 'Chưa đọc') this.listPersonChat = this.listPersonUnread;

			this.allUnreadMessage = 0;
			this.listPerson.map(value => {
				 if (value.unreadMessage > 0) this.allUnreadMessage = this.allUnreadMessage + 1
			})
	 }

	 setPersonChatting = (id: string) => {
			let person: IPerson | undefined = this.listPerson.find((element) => element.id === id);
			if (person) {
				 this.personChatting = person;
			}
	 }

	 setSeenMesPerson = (id: string, unread_mes: number) => {
			this.listPersonChat.map(((value, index) => {
				 if (value.id === id && value.unreadMessage > 0) {
						this.setAllUnreadMessage(1);
						value.unreadMessage = 0;
				 }
			}));
	 }

	 readMessage = (id: string, seller_id: string, buyer_id: string, unread_mes: number) => {
			this.setSeenMesPerson(id, unread_mes);
			this.getListPersonChat(this.listPerson);
			this.seenMes(id, seller_id, buyer_id, unread_mes);
	 }

	 onClickPersonToChat = (id: string, seller_id: string, buyer_id: string, unread_mes: number, from: string, to: string) => {
			// close 3 tooltip
			this.statusIconSelect = true;
			this.statusOpenInfo = false;
			this.idShowOptionPerson = 'fake id';

			// open win chat
			this.statusOpenWinChat = false;

			this.cleanMessage();
			this.setPersonChatting(id);
			this.GET_message(id, seller_id, from, to, true);
			this.readMessage(id, seller_id, buyer_id, unread_mes);
	 }
	 /*end*/

	 /*get data*/
	 async GET_dataListPerson(seller_id: string | number) {
			const url: string = `/v1/conversations/rooms?user_id=${seller_id}&role=SELLER`;
			const response = await this.getRequest(url, true);

			this.listPerson = [];

			if (response.status === 200) {
				 response.body.rooms.map((value: any, i: number) => {
						let person: IPerson = {
							 unreadMessage: value.sellerUnseenMessages || 0,
							 lastMessage: (value.sellerLastMessage && value.sellerLastMessage.content) ? value.sellerLastMessage.content.slice(0, 30) : "",
							 date: (value.updatedAt) ? Moment.getDate(value.updatedAt, "dd thg mm") : "",
							 name: value.buyerInfo.name || "",
							 online: false,
							 avatar: value.buyerInfo.avatar || null,
							 location: "",
							 id: value.id,
							 pin: (value.pinnedBySeller) ? true : false,
							 personId: value.buyer,
							 lock: false,
							 sellerDeletedAt: (value.sellerDeletedAt) ? value.sellerDeletedAt : "",
							 from: (value.createdAt) ? value.createdAt : "",
							 datePin: (value.pinnedBySeller) ? value.pinnedBySeller : '',
							 dateChatNew: ""
						}
						if (value.sellerUnseenMessages > 0) {
							 this.allUnreadMessage = this.allUnreadMessage + 1;
						}
						this.listPerson.push(person);
				 })
				 this.getListPersonChat(this.listPerson);
				 return true;
			} else {
				 console.log("error get list room");
			}
	 }

	 async seenMes(id: string, seller_id: string, buyer_id: string, unread_mes: number) {
			if (unread_mes) {
				 let url: string = `/v1/conversations/messages?room_id=${id}&limit=${1}&created_at=-1`;
				 let lastMessageId: string = "";
				 let lastMessageCreatedAt: string = "";
				 let response = await this.getRequest(url, true);
				 if (response.status === 200) {
						response.body.data.map((value: any) => {
							 lastMessageId = value.id;
							 lastMessageCreatedAt = value.createdAt;
						})

						let listMesSeen: ISeenMes = {
							 room_id: id,
							 from: seller_id,
							 to: buyer_id,
							 last_message_id: lastMessageId,
							 last_message_created_at: lastMessageCreatedAt
						}

						this.socket.emit('seen_messages', listMesSeen);
				 }
			}
	 }

	 async DELETE_deletePerson(id: string) {
			if (this.statusConnectSocket) {
				 if (id === this.personChatting.id) this.cleanMessage();
				 let response = await this.deleteRequest(`/v1/conversations/rooms/${id}`, {}, true);
				 if (response.status === 200) {
						let index: number = this.listPerson.findIndex((element) => {
							 return element.id === id;
						});

						this.listPerson.splice(index, 1);
						this.personChatting.id = '0';

						this.getListPersonChat(this.listPerson);
				 }
			}
	 }

	 async reEnableRoom(id: string) {
			let res = await this.putRequest(`/v1/conversations/rooms/${id}/enable`, {"role": "SELLER"}, true);
			return res;
	 }

	 async GET_message(person_id: string, seller_id: string, from ?: string, to ?: string, status_seen?: boolean) {
			let url: string = `/v1/conversations/messages?room_id=${person_id}${(from) ? `&from=${from}` : ''}${(to) ? `&to=${to}` : ''}&limit=50`;

			if (!from) {
				 this.statusLoadWinMes = true;
			}
			if (from) {
				 this.statusWinChat = false;
			}

			let response = await this.getRequest(url, true);

			if (response.status === 200) {
				 for (let i = 0; i < response.body.data.length; i++) {
						let message: IMessage = {
							 id_mes: response.body.data[i].id,
							 lastMessageCreatedAt: response.body.data[i].createdAt,
							 content: response.body.data[i].content || "",
							 status: (response.body.data[i].from === seller_id) ? 'req' : 'res',
						}
						this.listMessage.unshift(message);
						if (i < response.body.data.length - 1) {
							 // if (Moment.getDate(response.body.data[i].createdAt || "2020-10-11T00:13:35.390Z", 'dd/mm/yyyy') !== Moment.getDate(response.body.data[i + 1].createdAt || "2020-10-11T00:13:35.390Z", 'dd/mm/yyyy')) {
							 // 	this.listMessage.unshift({
							 // 		 id_mes: "id_mes",
							 // 		 lastMessageCreatedAt: '',
							 // 		 status: 'date',
							 // 		 content: `${Moment.getDate(response.body.data[i].createdAt, 'dd thg mm')}, ${Moment.getTime(response.body.data[i].createdAt, 'hh:mm')}`
							 // 	})
							 // }
							 if (Math.abs(new Date(response.body.data[i].createdAt || "2020-10-11T00:13:35.390Z").getTime() - new Date(response.body.data[i + 1].createdAt || "2020-10-11T00:13:35.390Z").getTime()) > 60 * 5 * 1000) {
									this.listMessage.unshift({
										 id_mes: "id_mes",
										 lastMessageCreatedAt: '',
										 status: 'date',
										 content: `${Moment.getDate(response.body.data[i].createdAt, 'dd thg mm')}, ${Moment.getTime(response.body.data[i].createdAt, 'hh:mm')}`
									})
							 }
						}

						this.timeEndMessage = response.body.data[i].createdAt;
				 }
				 if (this.listMessage[0].lastMessageCreatedAt) {
						this.listMessage.unshift({
							 id_mes: "id_mes",
							 lastMessageCreatedAt: '',
							 status: 'date',
							 content: `${Moment.getDate(this.listMessage[0].lastMessageCreatedAt, 'dd thg mm')}, ${Moment.getTime(this.listMessage[0].lastMessageCreatedAt, 'hh:mm')}`
						})
				 }

				 if (status_seen) {
						if (response.body.data[0].isSeen && response.body.data[0].from === seller_id) {
							 this.listMessage[this.listMessage.length - 1].isSeen = response.body.data[0].isSeen
						}
				 }

				 this.statusLoadMes = false;
				 if (!from) {
						this.statusLoadWinMes = false;
				 }
				 if (from) {
						this.statusWinChat = true;
				 }

			} else {
				 console.log("error get message")
			}
	 }

	 /*end*/
}

export default new StoreChat();