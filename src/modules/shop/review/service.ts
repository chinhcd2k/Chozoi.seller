import {BaseService} from "../../../common/services/BaseService";
import {observable} from "mobx";
import {notify} from "../../../common/notify/NotifyService";

export interface IReview {
    id: number
    createdAt: number
    images: string[] | null
    rating: number
    reply: string | null
    text: string
    replyCount: number
    product: {
        id: number
        name: string
        images: {
            imageUrl: string
        }[]
        type: "NORMAL" | "AUCTION"
    }
    user: {
        id: number
        avatarUrl: string | null
        name: string
    }
    evaluate: number | null
    shopOrderCode: number | null
    orderLineId: number | null
    shopOrderId: number | null
}

export class ShopReviewService extends BaseService {
    private static _service: ShopReviewService;

    @observable productName: string = '';
    @observable buyerName: string = '';
    @observable date?: [string, string];
    @observable status: 'reply' | 'unreply' | '' = '';
    @observable rate: '' | 1 | 2 | 3 | 4 | 5 = '';
    @observable page: number = 0;
    @observable size: number = 5;
    @observable total: number = 0;
    @observable listReview: IReview[] = [];
    @observable loading: boolean = true;

    private constructor() {
        super();
    }

    public static get service(): ShopReviewService {
        if (!this._service) this._service = new ShopReviewService();
        return this._service;
    }

    public async getListReview(shop_id: number) {
        let queryString = '?';
        if (this.rate) queryString += `&rating=${this.rate}`;
        if (this.status) queryString += `&status=${this.status.toUpperCase()}`;
        if (this.buyerName) queryString += `&buyerName=${this.buyerName}`;
        if (this.productName) queryString += `&productName=${this.productName}`;
        if (this.date) queryString += `&timeFrom=${this.date[0]}&timeTo=${this.date[1]}`;
        queryString += `&page=${this.page}&size=${this.size}`;
        queryString = queryString.replace(/\?&/, "?");
        this.loading = true;
        const response = await this.getRequest(`/v1/reviews/sellers/${shop_id}${queryString}`, true);
        this.loading = false;
        if (response.status === 200) {
            this.total = response.body.metadata.total;
            this.listReview = response.body.reviews;
        } else this.pushNotificationRequestError(response);
    }

    public async updateReply(id: number, text: string, callback?: (success: boolean) => any) {
        const response = await this.putRequest('/v1/reviews/reply', {id: id, text: text}, true);
        if (response.status === 200) {
            notify.show('Phản hồi thành công', "success");
            callback && callback(true);
        } else {
            callback && callback(false);
            this.pushNotificationRequestError(response);
        }
    }
}