import React, {SyntheticEvent} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {uploadImage} from "../../../../common/functions/UpfileFunc";
import {BaseService} from "../../../../common/services/BaseService";
import * as Sentry from "@sentry/browser";
import {notify} from "../../../../common/notify/NotifyService";
import {AppGlobal} from "../../../../AppGlobal";
import $ from "jquery";

interface IProperty {
    id: number
    name: string
    isRequired: boolean
    selectedId?: number
    values: {
        id: number
        value: string
    }[]
}

const ReactSummernote = require("react-summernote").default;

@observer
export default class InfomationBasic extends React.Component<{ type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK'|'CREATE_F_N' }, object> {
    private static instance?: InfomationBasic;
    private service = new BaseService();
    public category_id?: number;
    @observable name: string = '';
    @observable description: string = '';
    @observable condition: 'NEW' | 'USED' | '' = '';
    @observable listProperty: IProperty[] = [];
    @observable description_pickingout: string = '';
    @observable categories: any[] = [];
    @observable categoriesLv1: any[] = [];
    @observable categoriesLv2: any[] = [];
    @observable categoriesLv3: any[] = [];
    @observable categoriesLv1Value: number | undefined;
    @observable categoriesLv2Value: number | undefined;
    @observable categoriesLv3Value: number | undefined;
    @observable attributes: {
        id: number
        valueId: number
        name: string
        value: string
    }[] = [];
    @observable disabledForm: boolean = false;

    constructor(props: { type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK' }) {
        super(props);
        InfomationBasic.instance = this;
    }

    private async getAllCategories() {
        this.categories = AppGlobal.categoriesRes;
        this.filterCategoriesLv1();
    }

    public filterCategoriesLv1() {
        this.categoriesLv2 = this.categoriesLv3 = [];
        this.listProperty = [];
        this.categoriesLv1 = this.categories.reduce((previousValue: any[], currentValue) => {
            if (currentValue.level === 1) {
                previousValue.push(currentValue);
            }
            return previousValue;
        }, []);
        this.categoriesLv1 = this.categoriesLv1.slice().sort((a, b) => {
            if (a.sort > b.sort) return 1;
            else if (a.sort < b.sort) return -1;
            return 0;
        });
    }

    public getcategoriesLevel2(event: SyntheticEvent<HTMLSelectElement> | number) {
        this.categoriesLv1Value = typeof event === "number" ? event : parseInt(event.currentTarget.value);
        this.categoriesLv2 = this.categoriesLv3 = [];
        this.listProperty = [];
        this.categoriesLv2 = this.categories.reduce((previousValue: any[], currentValue) => {
            if (currentValue.parentId === this.categoriesLv1Value) {
                previousValue.push(currentValue);
            }
            return previousValue;
        }, []);
        this.categoriesLv2 = this.categoriesLv2.sort((a, b) => {
            if (a.sort > b.sort) return 1;
            else if (a.sort < b.sort) return -1;
            return 0;
        });
        if (this.categoriesLv2.length === 0) {
            this.getPropertycategories(this.categoriesLv1Value).finally();
        }
    }

    public getcategoriesLevel3(event: SyntheticEvent<HTMLSelectElement> | number) {
        this.categoriesLv2Value = typeof event === "number" ? event : parseInt(event.currentTarget.value);
        this.categoriesLv3 = [];
        this.listProperty = [];
        this.categoriesLv3 = this.categories.reduce((previousValue: any[], currentValue) => {
            if (currentValue.parentId === this.categoriesLv2Value) {
                previousValue.push(currentValue);
            }
            return previousValue;
        }, []);
        this.categoriesLv3 = this.categoriesLv3.sort((a, b) => {
            if (a.sort > b.sort) return 1;
            else if (a.sort < b.sort) return -1;
            return 0;
        });
        if (this.categoriesLv3.length === 0) {
            this.getPropertycategories(this.categoriesLv2Value).finally();
        }
    }

    async getPropertycategories(event: SyntheticEvent<HTMLSelectElement> | number) {
        this.category_id = typeof event === "number" ? event : parseInt(event.currentTarget.value);
        this.categoriesLv3Value = this.category_id;
        const response = await this.service.getRequest(`/v1/categories/${this.category_id}`, false);
        if (response.status === 200) {
            this.listProperty = response.body.category.attributes;
            if (this.attributes.length > 0) {
                this.attributes.map(value => {
                    const index_search = this.listProperty.findIndex(value1 => value.id === value1.id);
                    if (index_search !== -1) this.listProperty[index_search].selectedId = value.valueId;
                    return null;
                })
            }
        } else this.service.pushNotificationRequestError(response);
    }

    public async setStoreCategories(categories: { id: number, name: string, level: number, parentId: number | null }[]) {
        categories = categories.sort((a, b) => {
            if (a.level < b.level) return -1;
            else if (a.level > b.level) return 1;
            else return 0;
        });
        const FUNC = () => {
            this.getcategoriesLevel2(categories[0].id);
            this.getcategoriesLevel3(categories[1].id);
            if (categories.length === 3) {
                this.categoriesLv3Value = categories[2].id;
                this.getPropertycategories(categories[2].id);
            }
        }
        if (this.categories.length > 0) FUNC();
        else {
            const wait5s = new Promise<boolean>(resolve => {
                let s = 0;
                const interval = setInterval(() => {
                    s += 1;
                    if (this.categories.length > 0) {
                        clearInterval(interval);
                        resolve(true);
                    }
                    if (s > 5) {
                        clearInterval(interval);
                        resolve(false);
                    }
                }, 1000);
            });
            const result = await wait5s;
            result && FUNC();
        }
    }

    public hasValidate(): boolean {
        if (!this.name) {
            notify.show('Vui lòng nhập tên sản phẩm', "error");
            return false;
        }
        if (!this.condition) {
            notify.show('Vui lòng chọn tình trạng sản phẩm', "error");
            return false;
        }
        if (!this.category_id) {
            notify.show('Vui lòng chọn danh mục sản phẩm', "error");
            return false;
        } //
        else {
            let isRequired = 0;
            let checked = 0;
            this.listProperty.map(value => {
                if (value.isRequired) isRequired += 1;
                if (value.selectedId !== undefined) checked += 1;
                return null;
            });
            if (checked < isRequired) {
                notify.show('Vui lòng chọn hết các thuộc tính bắt buộc "*"', "error");
                return false;
            }
        }
        if (!this.description) {
            notify.show('Vui lòng nhập đặc điểm nổi bật', "error");
            return false;
        } //
        else if (this.description.length < 15) {
            notify.show('Đặc điểm nổi bật phải có tối thiểu 15 ký tự. (Không tính dấu "-")', "error");
            return false;
        }//
        else {
            const re = new RegExp(/^./, 'gm');
            const lines = this.description.match(re);
            if (lines === null || lines.length < 3) {
                notify.show('Phải có ít nhất 3 đặc điểm nổi bật', "error");
                return false;
            }
        }
        if (!this.description_pickingout) {
            notify.show('Vui thêm mô tả chi tiết sản phẩm', "error");
            return false;
        }
        return true; //default
    }

    render() {
        try {
            return <div id="products-infomation">
                <h5>Thông tin cơ bản *</h5>
                {/*Ten san pham*/}
                <div className="row">
                    <label className="col-xs-12">Tên sản phẩm *</label>
                    <div className="col-xs-12">
                        <input type="text"
                               autoFocus={true}
                               className="form-control"
                               disabled={this.disabledForm}
                               value={this.name}
                               onChange={e => this.name = e.currentTarget.value}
                               required={true}
                        />
                    </div>
                </div>
                {/*Tình trạng sản phẩm*/}
                <div className="codition mt-2">
                    <p>Tình trạng sản phẩm *</p>
                    <div className="condition">
                        <div>
                            <input id="infomation-radio-1"
                                   onClick={() => this.condition = "NEW"}
                                   readOnly={true}
                                   disabled={this.disabledForm}
                                   checked={this.condition === "NEW"}
                                   className="magic-radio" type="radio"
                                   name="inline-form-radio-condition"/>
                            <label htmlFor="infomation-radio-1">Mới</label>
                        </div>
                        <div className="mt-2">
                            <input id="infomation-radio-2"
                                   readOnly={true}
                                   onClick={() => this.condition = "USED"}
                                   checked={this.condition === "USED"}
                                   className="magic-radio" type="radio"
                                   disabled={this.disabledForm}
                                   name="inline-form-radio-condition"/>
                            <label htmlFor="infomation-radio-2">Đã sử dụng</label>
                        </div>
                    </div>
                </div>
                <hr/>
                {/*Danh muc*/}
                <div className="row mt-2">
                    <label className="col-xs-2">Danh mục *
                        <a href="https://chozoi.vn/help-center/quy-dinh-dang-san-pham.18" target="_blank" style={{color:"#7a878e",paddingLeft:"8px"}}>
                            <i className="fa fa-info-circle"
                               data-toggle="tooltip"
                               data-placement="top"
                               title="Xem chiết khấu ngành hàng."
                            />
                        </a></label>
                    <div className="col-xs-12 d-md-flex">
                        {this.categoriesLv1.length > 0 && <div>
                            <select className="form-control"
                                    key={this.categoriesLv1Value}
                                    value={this.categoriesLv1Value ? this.categoriesLv1Value : ''}
                                    disabled={this.disabledForm}
                                    required={true}
                                    onChange={e => this.getcategoriesLevel2(e)}>
                                <option value="" disabled={true}>---- Lựa chọn ----</option>
                                {this.categoriesLv1.map((item, index) =>
                                    <option key={index} value={item.id}>{item.name}</option>)}
                            </select>
                        </div>}
                        {this.categoriesLv2.length > 0 && <div className="ml-3">
                            <select className="form-control"
                                    key={this.categoriesLv2Value}
                                    disabled={this.disabledForm}
                                    value={this.categoriesLv2Value ? this.categoriesLv2Value : ''}
                                    required={true}
                                    onChange={e => this.getcategoriesLevel3(e)}>
                                <option value="" disabled={true}>---- Lựa chọn ----</option>
                                {this.categoriesLv2.map((item, index) =>
                                    <option key={index} value={item.id}>{item.name}</option>)}
                            </select>
                        </div>}
                        {this.categoriesLv3.length > 0 && <div className="ml-3">
                            <select className='form-control'
                                    key={this.categoriesLv3Value}
                                    disabled={this.disabledForm}
                                    value={this.categoriesLv3Value ? this.categoriesLv3Value : ''}
                                    required={true}
                                    onChange={e => this.getPropertycategories(e)}>
                                <option value="" disabled={true}>---- Lựa chọn ----</option>
                                {this.categoriesLv3.map((item, index) =>
                                    <option key={index} value={item.id}>{item.name}</option>)}
                            </select>
                        </div>}
                    </div>
                </div>
                {/*Thuoc tinh san pham*/}
                <div className="row mt-3 mx-0">
                    <h5>Thuộc tính sản phẩm *</h5>
                    {this.listProperty.length === 0 && <p>Vui lòng lựa chọn danh mục</p>}
                    {this.listProperty.length > 0 && <div className="col-xs-12 px-0">
                        <div className="row">
                            {this.listProperty.length > 0 && this.listProperty.map((item, index) =>
                                <div key={index} className="col-xs-12 col-lg-6">
                                    <div className="form-group">
                                        <label>{`${item.name} `}{item.isRequired ? '*' : ''}</label>
                                        <select className="form-control"
                                                disabled={this.disabledForm}
                                                key={item.selectedId}
                                                value={item.selectedId ? item.selectedId : ''}
                                                onChange={e => {
                                                    const value: number = parseInt(e.currentTarget.value);
                                                    if (!isNaN(value)) item.selectedId = value;
                                                    else delete item.selectedId;
                                                }}
                                                required={item.isRequired}>
                                            <option value="" disabled={item.isRequired}>---- Lựa chọn ----</option>
                                            {item.values.map((item1, index1) =>
                                                <option key={index1} value={item1.id}>{item1.value}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>}
                </div>
                <hr/>
                {/*Dac diem noi bat*/}
                <div className="row mt-3">
                    <div className="col-xs-12">
                        <label>Đặc điểm nổi bật * (tối thiểu 3 ý, mỗi ý một dòng, không viết đoạn dài, không chèn thông
                            tin Cửa hàng)</label>
                        <textarea className="form-control"
                                  disabled={this.disabledForm}
                                  css={{minHeight: "10em"}}
                                  value={((): string => {
                                      let value1 = this.description;
                                      value1 = value1.replace(/^(?=.+)/gm, "- ");
                                      return value1;
                                  })()}
                                  onChange={e => {
                                      let value1 = e.currentTarget.value;
                                      value1 = value1.replace(/^-\s/gm, '');
                                      value1 = value1.replace(/-$/gm, '');
                                      value1.length <= 500 && (this.description = value1);
                                  }}
                        />
                    </div>
                </div>
                {/*Mo ta chi tiet sp*/}
                <div className="rơw mt-3">
                    <div className="col-12 px-0">
                        <label>Mô tả chi tiết sản phẩm *</label>
                        <ReactSummernote
                            value={this.description_pickingout}
                            options={{
                                lang: 'vn',
                                height: 200,
                                dialogsInBody: true,
                                toolbar: [
                                    ['font', ['bold', 'underline', 'clear']],
                                    ['fontsize', ['fontsize']],
                                    ['fontname', ['fontname']],
                                    ['para', ['ul', 'ol', 'paragraph']],
                                    ['view', ['fullscreen', 'codeview']],
                                    ['color', ['color']],
                                    ['insert', ['link', 'picture', 'video']],
                                ]
                            }}
                            disabled={this.disabledForm}
                            onImageUpload={(files: FileList) => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    uploadImage(files, "uploadCover").then((response: any) => ReactSummernote.insertImage(response.url))
                                };
                                reader.readAsDataURL(files[0]);
                            }}
                            onChange={(e: string) => this.description_pickingout = e}
                        />
                    </div>
                </div>
            </div>;
        } catch (e) {
            console.error(e);
            Sentry.captureException(e);
            return null;
        }
    }

    // life cycle
    async componentDidMount() {
        if (/^(DETAIL|REPLAY_QUICK)$/.test(this.props.type)) {
            this.disabledForm = true;
        }
        await this.getAllCategories();
        $('[data-toggle="tooltip"]').tooltip();
    }

    public static get getInstance(): InfomationBasic | undefined {
        return InfomationBasic.instance;
    }

}