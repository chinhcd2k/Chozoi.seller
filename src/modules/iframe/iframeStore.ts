import {observable} from "mobx";
import {IProduct, IResProductAuction} from "../../api/auction/interfaces/response";

class IframeStore{
  @observable listProductAuction:IProduct[]=[]
  @observable listProductDemo:IProduct[]=[];
}
export const iframeStore=new IframeStore()