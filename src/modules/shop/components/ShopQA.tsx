import React from "react";
import {observer} from "mobx-react";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {store as ProfileStore} from "../../profile";
import {DGetProfile} from "../../../common/decorators/Auth";
import {css} from "@emotion/core";
import {store, IQuestion} from "../stores/ShopQAStore";
import {store as HomeStore} from "../../home/stores/HomeStore";
import {service} from "../ShopService";
import {PaginationComponent} from "../../../common/pagination";
import $ from "jquery";
import {notify} from "../../../common/notify/NotifyService";
import {Moment} from "../../../common/functions/Moment";
import {slug} from "../../../common/functions/FormatFunc";
import {Link} from "react-router-dom";

interface IShopQAProps {
    match: {
        params: {
            type: 'all' | 'noreply' | 'reply'
        }
    }
}

interface IShopQAState {
    currentState: 'all' | 'noreply' | 'reply'
    modalData: {
        questionId: number,
        answerId?: number,
        type: 'APPROVE' | 'REJECT' | 'DELETE',
        message: string
    }
    page: number
    size: number
    total: number
}

const DOMAIN_BUYER: string = (window as any).DOMAIN_BUYER || '';

@observer
export default class ShopQA extends React.Component<IShopQAProps, IShopQAState> {
    public state: any;
    private shopId: number = 0;

    constructor(props: IShopQAProps) {
        super(props);
        this.state = {
            currentState: 'all',
            modalData: {
                questionId: -1,
                answerId: -1,
                type: 'APPROVE',
                message: ''
            },
            page: 0,
            size: 10,
            total: 0
        };
        BreadcrumbsService.loadBreadcrumbs([{title: 'Hỏi đáp'}]);
        HomeStore.menuActive = [1, 5];
    }

    @DGetProfile
    public async componentDidMount() {
        this.setState({currentState: this.props.match.params.type});
        ProfileStore.profile && (this.shopId = ProfileStore.profile.shopId as number);
        this.setState({
            currentState: this.props.match.params.type
        }, () => this.getListQA());
    }

    async componentDidUpdate(prevProps: Readonly<IShopQAProps>, prevState: Readonly<IShopQAState>, snapshot?: any) {
        if (prevProps.match.params.type !== this.props.match.params.type) {
            this.setState({
                currentState: this.props.match.params.type
            }, () => this.getListQA());
        }
    }

    public async getListQA() {
        if (ProfileStore.profile) {
            const response = await service.getListQA(ProfileStore.profile.shopId as number, this.state.currentState, this.state.page, this.state.size);
            if (response.status === 200) {
                this.setState({total: response.body.metadata.total});
                store.qas = response.body.questions;
                window.scroll(0, 0);
            } else store.qas = [];
        }
    }

    public async paginationChange(page: number) {
        this.setState({page: page - 1});
        setTimeout(() => this.getListQA());
    }

    async handleFilterState(e: any, state: string) {
        this.state.currentState = state;
        this.setState({page: 0});
        setTimeout(() => this.getListQA());
    }

    async handleAnswer(e: any, qa: any) {
        const data = {
            questionId: qa.id,
            text: ($(e.target).prev().val() as string)
        };
        if (data.text.trim().length < 3) {
            notify.show('Câu trả phải có tối thiểu 3 ký tự', 'error');
            return false;
        }
        const response = await service.sendAnswer(this.shopId, data);
        if (response.status === 200) {
            qa.inputText = false;
            notify.show('Trả lời câu hỏi thành công', 'success');
            qa.answers = [response.body];
            qa.state = "PUBLIC";
        } else {
            notify.show('Trả lời câu hỏi thất bại', 'error');
        }
    }

    showModalConfirm(questionId: number, type: "APPROVE" | "REJECT" | "DELETE", message: string, answerId?: number) {
        this.setState({
            modalData: {
                questionId: questionId,
                type: type,
                message: message,
                answerId: answerId
            }
        });
        ($('#shop-qa .modal#shop-modal-confirm') as any).modal({show: true, backdrop: 'static'});
    }

    async handleQAReport() {
        const response = await service.transformStateQuestion(this.shopId, {
            ids: [this.state.modalData.questionId],
            state: 'REJECT'
        });
        if (response.status === 200 && response.body.idErrors && Array.isArray(response.body.idErrors) && response.body.idErrors.length === 0) {
            notify.show('Thao tác thực hiện thành công !', "success");
            const index = store.qas.findIndex(value => value.id === this.state.modalData.questionId);
            index !== -1 && (store.qas[index].state = "REJECT");
        } else {
            notify.show('Đã có lỗi xảy ra !', "error");
        }
        ($('#shop-qa .modal#shop-modal-confirm') as any).modal('hide');
    }

    async handleDeleteAnswer() {
        $('#shop-qa .modal#shop-modal-confirm').modal('hide');
        const index_question: number = store.qas.findIndex(value => value.id === this.state.modalData.questionId);
        if (index_question !== -1) {
            const index_answer: number = store.qas[index_question].answers.findIndex(value => value.id === this.state.modalData.answerId);
            if (index_answer !== -1) {
                const response = await service.deleteAnswer(this.state.modalData.answerId);
                if (response.status === 200) {
                    notify.show('Thao tác thành công!', "success");
                    store.qas[index_question].answers.splice(index_answer, 1);
                } else if (response.body.message && typeof response.body.message === "string") notify.show(response.body.message, 'error');
                else {
                    notify.show('Đã có lỗi xảy ra!', "error");
                }
            } else notify.show('Không tìm thấy câu trả lời!', 'error');
        } else notify.show('Không tìm thấy câu hỏi!', 'error');
    }

    async handleQAApprove() {
        const response = await service.transformStateQuestion(this.shopId, {
            ids: [this.state.modalData.questionId],
            state: 'PUBLIC'
        });
        if (response.status === 200 && response.body.idErrors && Array.isArray(response.body.idErrors) && response.body.idErrors.length === 0) {
            notify.show('Thao tác thực hiện thành công !', "success");
            const index = store.qas.findIndex(value => value.id === this.state.modalData.questionId);
            index !== -1 && (store.qas[index].state = "PUBLIC");
        } else if (response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, "error");
        else {
            notify.show('Đã có lỗi xảy ra !', "error");
        }
        ($('#shop-qa .modal#shop-modal-confirm') as any).modal('hide');
    }

    async handleActionModal() {
        if (this.state.modalData.type === "APPROVE") this.handleQAApprove();
        else if (this.state.modalData.type === "REJECT") this.handleQAReport();
        else if (this.state.modalData.type === "DELETE") this.handleDeleteAnswer();
    }

    async handleUpdateAnswer(elementDom: any, qa: IQuestion) {
        const text: any = $(elementDom.target).prev().val() || '';
        const response = await service.updateAnswer(qa.keyTextarea, text);
        if (response.status === 200) {
            qa.inputText = false;
            notify.show('Cập nhật thành công', 'success');
            qa.inputText = qa.editAnswer = false;
            const index: number = qa.answers.findIndex(value => value.id === qa.keyTextarea);
            index !== -1 && (qa.answers[index].text = text);
        } else {
            notify.show('Đã có lỗi xảy ra!', "error");
        }
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        const shopQACss = css`
          .btn-secondary {
            color: #FFF;
            background-color: #868e96;
            border-color: #868e96;
          }

          .btn-outline {
            color: #868e96;
            background-color: transparent;
            background-image: none;
          }

          .contact-actions {
            span {
              :hover {
                cursor: pointer;
              }
            }
          }

          .answer-box {
            border-top: 1px solid rgba(0, 0, 0, 0.125);
            display: flex;
          }
        `;
        return <div id="shop-qa">
            <div className='container' css={shopQACss}>
                <div className="tab-base">
                    <ul className="nav nav-tabs">
                        <li className={this.state.currentState === "all" ? "active" : ""}>
                            <Link to="/home/shop/qa/all">Tất cả</Link>
                        </li>
                        <li className={this.state.currentState === "noreply" ? "active" : ""}>
                            <Link to="/home/shop/qa/noreply">Chưa trả lời</Link>
                        </li>
                        <li className={this.state.currentState === "reply" ? "active" : ""}>
                            <Link to="/home/shop/qa/reply">Đã trả lời</Link>
                        </li>
                    </ul>

                    <div className="tab-content">
                        <div id="contents" className="tab-pane fade active in">
                            {/*List QA*/}
                            <div className="card-body">
                                {store.qas.map((qa: IQuestion, index: number) =>
                                    <div key={index} className="mb-3 qa-item">
                                        <div className="card">
                                            <div className="card-body pt-0">
                                                {/*Time created at*/}
                                                <h5 className="card-title">
                                            <span>{(qa.user) ? qa.user.name : ''} | <i
                                                className="fa fa-clock-o"/> {`${Moment.getDate(qa.createdAt, 'dd/mm/yyyy')} ${Moment.getTime(qa.createdAt, "hh:mm:ss")}`}</span>
                                                </h5>

                                                <div className="qa-content">
                                                    {/*Product name*/}
                                                    <div className="mb-2 product-name text-semibold">
                                                        <a className="text-info"
                                                           href={`${DOMAIN_BUYER}/${slug(qa.product.name)}.${qa.product.id}.html`}>{qa.product ? qa.product.name : ''}</a>
                                                    </div>
                                                    {/*Question*/}
                                                    <div className="text">
                                                        {qa.text}
                                                    </div>
                                                </div>

                                                {/*Action*/}
                                                <div className="contact-actions text-right">
                                                    {(qa && qa.answers.length <= 0 && qa.state !== "REJECT") &&
                                                    <span className="text-info"
                                                          onClick={(e: any) => qa.inputText = true}> Trả lời</span>}
                                                    {(qa && qa.state === "PENDING") &&
                                                    <span className="text-info"
                                                          onClick={(e: any) => this.showModalConfirm(qa.id, 'APPROVE', 'Bạn có chắc chắn muốn phê duyệt câu hỏi này ?')}> | Phê duyệt |</span>}
                                                    {(qa && qa.state === "PENDING") &&
                                                    <span className="text-info"
                                                          onClick={(e: any) => this.showModalConfirm(qa.id, 'REJECT', 'Bạn có chắc chắn muốn từ chối câu hỏi này ?')}> Từ chối</span>}
                                                </div>
                                                {/*Action cho câu trả lời của shop*/}
                                                {(qa && qa.answers) && qa.answers.map((ans: { id: number, questionId: number, text: string }, indexAns: number) =>
                                                    <div key={indexAns}
                                                         className="answer-box mt-3 pt-3 text-success d-flex justify-content-between">
                                                        <span>{ans.text}</span>
                                                        <div className="action" css={css`{
                                                          span {
                                                            cursor: pointer;
                                                          }
                                                        }`}>
                                                    <span className="text-info" onClick={() => {
                                                        qa.inputText = qa.editAnswer = true;
                                                        qa.defaultTextareaValue = ans.text;
                                                        qa.keyTextarea = ans.id;
                                                    }}><i className="far fa-edit"/></span> | <span
                                                            className="text-danger"
                                                            onClick={() => this.showModalConfirm(qa.id, 'DELETE', 'Bạn có chắc chắn muốn xóa câu trả lời này?', ans.id)}><i
                                                            className="fas fa-trash"/></span>
                                                        </div>
                                                    </div>
                                                )}
                                                {(qa && qa.inputText) &&
                                                <div className="answer-box mt-3 pt-3">
                                            <textarea key={qa.keyTextarea} defaultValue={qa.defaultTextareaValue}
                                                      className="form-control"/>
                                                    <button className="btn btn-success ml-3"
                                                            onClick={(e: any) => !qa.editAnswer ? this.handleAnswer(e, qa) : this.handleUpdateAnswer(e, qa)}>{!qa.editAnswer ? 'Trả lời' : 'Cập nhật'}
                                                    </button>
                                                </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {(!store.qas || store.qas.length <= 0) &&
                                <div className="text-center">Không tìm thấy câu hỏi nào</div>}
                            </div>
                            {/*Pagination*/}
                            <div className="">
                                <div className="row px-3 d-flex justify-content-end">
                                    <div className="d-flex justify-content-end">
                                        {this.state.total > 0 && <PaginationComponent
                                            total={this.state.total}
                                            number={this.state.size}
                                            defaultActive={this.state.page}
                                            emitOnChangePage={page => this.paginationChange(page)}
                                        />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*Modal Confirm*/}
            <div key={this.state.keyModal} className="modal fade in" id="shop-modal-confirm" role="dialog" tabIndex={-1}
                 aria-labelledby="demo-default-modal" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal"><i
                                className="pci-cross pci-circle"/></button>
                        </div>

                        <div className="modal-body" style={{minHeight: 'unset'}}>
                            <p className="text-center">{this.state.modalData.message}</p>
                        </div>

                        <div className="modal-footer">
                            <button data-dismiss="modal" className="btn btn-default" type="button">Hủy</button>
                            <button className="btn btn-primary"
                                    onClick={() => this.handleActionModal()}>Đồng
                                ý
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
