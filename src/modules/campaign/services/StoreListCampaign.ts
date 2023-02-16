import {observable} from "mobx";
import {getRequest} from "../../../common/services/BaseService";
import {Moment} from "../../../common/functions/Moment";

export interface ICampaign {
    id: string,
    statusCampaign: 'UPCOMING' | 'FINISH' | 'HAPPENING',
    title: string,
    content: string,
    dateStart: string,
    dateEnd: string,
    notify: 'ELIGIBLE' | 'PENDING' | 'JOINED' | 'NONE',
    statusBtn: 'JOIN' | 'DETAILT',
    urlImg: string,
    onpenCampaign: string,
    briefContent: string
}

class StoreListCampaign {
    @observable listCampaign: ICampaign [] = [];
    @observable total: number = 0;
    private campaignItem: ICampaign = {
        id: 'none',
        statusCampaign: "UPCOMING",
        notify: "NONE",
        urlImg: '',
        statusBtn: "DETAILT",
        dateEnd: '',
        dateStart: '',
        content: '',
        title: '',
        onpenCampaign: 'OPENED',
        briefContent: ''
    };
    @observable arrayICampaign: ICampaign [] = [];

    async getListCampaign(shop_id: number, page: number, size: number, type: 'ALL' | 'PENDING' | 'APPROVED', name?: string) {
        let path: string = `/v1/shops/${shop_id}/campaign?page=${page}&size=${size}${name ? `&name=${name}` : ``}${(type && type !== 'ALL') ? `&type=${type}` : ``}`;
        let data = await getRequest(path);
        if (data.status === 200) {
            this.total = data.body.metadata.total;
            this.arrayICampaign = [];
            data.body.campaigns.forEach((value: any) => {
                this.campaignItem.id = value.id;
                if (value.status === 'finished') {
                    this.campaignItem.statusCampaign = "FINISH";
                } else if (value.status === 'processing') {
                    this.campaignItem.statusCampaign = "HAPPENING";
                } else this.campaignItem.statusCampaign = "UPCOMING";
                this.campaignItem.content = value.description;
                this.campaignItem.title = value.name;
                this.campaignItem.dateStart = Moment.getDate(value.timeStartStart, 'dd/mm/yyyy');
                this.campaignItem.dateEnd = Moment.getDate(value.timeStartEnd, 'dd/mm/yyyy');
                if (value.shopStatus === 'pending') {
                    this.campaignItem.notify = "PENDING";
                } else if (value.shopStatus === 'joined') {
                    this.campaignItem.notify = "JOINED";
                } else if (value.shopStatus === 'qualify') {
                    this.campaignItem.notify = "ELIGIBLE";
                } else this.campaignItem.notify = "NONE";

                if (value.shopCondition && value.status === "comingsoon" && value.shopStatus === 'qualify') {
                    this.campaignItem.statusBtn = "JOIN";
                } else {
                    this.campaignItem.statusBtn = "DETAILT";
                }

                this.campaignItem.urlImg = value.banner;

                this.campaignItem.briefContent = value.briefContent;
                this.arrayICampaign.push(this.campaignItem);
            })
            this.listCampaign = [...this.arrayICampaign];
        }
    }
}

export default new StoreListCampaign();
