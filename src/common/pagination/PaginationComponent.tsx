import {observer} from "mobx-react";
import React from "react";
import {PaginationStore} from "./PaginationStore";

interface IPaginationComponentProps {
    total: number
    number: number
    defaultActive?: number
    /*Emit action*/
    emitOnChangePage: (page: number) => void
}

@observer
export default class PaginationComponent extends React.Component<IPaginationComponentProps> {
    public store = new PaginationStore();

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(props: IPaginationComponentProps) {
        super(props);
        this.initRender();
    }

    componentDidUpdate(prevProps: Readonly<IPaginationComponentProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (prevProps.total !== this.props.total) {
            this.initRender();
        }
    }

    componentWillUnmount(): void {
        this.store.pages = [];
    }

    public initRender() {
        this.store.pages = [];
        this.store.data = {
            total: this.props.total,
            number: this.props.number
        };

        if (this.store.getTotalPage > 0) {
            if (this.props.defaultActive) {
                if (this.props.defaultActive > this.store.getTotalPage)
                    this.store.active = this.store.getTotalPage;
                else this.store.active = this.props.defaultActive + 1;
            } else
                this.store.active = 1;
        }

        for (let i = 0; i < this.store.getTotalPage; i++) {
            if (i < this.store.getTotalPage && i < 6) {
                this.store.pages.push(i + 1);
            }
        }
    }

    public preClick() {
        const index = this.store.getPages.indexOf(this.store.getActive);
        if (index === 0) {
            this.moreLeftClick();
        } else {
            this.store.active -= 1;
            this.props.emitOnChangePage(this.store.getActive);
        }
    }

    public nextClick() {
        const index = this.store.getPages.indexOf(this.store.getActive);
        if (index === 5) {
            this.moreRightClick();
        } else {
            this.store.active += 1;
            this.props.emitOnChangePage(this.store.getActive);
        }
    }

    public moreRightClick() {
        const last_pages = this.store.getPages[5];
        this.store.pages = [];
        for (let i = last_pages + 1, j = 0; i <= this.store.getTotalPage && j < 6; i++, j++) {
            this.store.pages.push(i);
        }
        this.store.active = this.store.getPages[0];
        this.props.emitOnChangePage(this.store.getActive);
    }

    public moreLeftClick() {
        const first_pages = this.store.getPages[0];
        this.store.pages = [];
        for (let i = 6; i > 0; i--) {
            this.store.pages.push(first_pages - i);
        }
        this.store.active = this.store.getPages[0];
        this.props.emitOnChangePage(this.store.getActive);
    }

    public render() {
        return <ul className="pagination m-0 p-0">
            {/*Pre*/}
            {this.store.getTotalPage > 1 && this.store.active > 1 &&
            <li onClick={(e: any) => this.preClick()}><a className="cursor-pointer"><i
                className="fa fa-chevron-left"/> </a></li>}
            {/*More Left*/}
            {this.store.getTotalPage > 6 && this.store.getPages[0] > 6 &&
            <li onClick={(e: any) => this.moreLeftClick()}><a className="cursor-pointer">...</a></li>}
            {this.store.getPages.map((number: any, index: number) =>
                <li key={index}
                    onClick={(e: any) => {
                        if (this.store.getActive !== number) {
                            this.props.emitOnChangePage(number);
                        }
                        this.store.active = number;
                    }}
                    className={this.store.getActive === number ? 'active' : ''}><a
                    className="cursor-pointer">{number}</a>
                </li>)}
            {/*More Right*/}
            {this.store.getTotalPage > 6 && this.store.getPages.length >= 6 && this.store.getPages[5] < this.store.getTotalPage &&
            <li onClick={(e: any) => this.moreRightClick()}><a className="cursor-pointer">...</a></li>}
            {/*Next*/}
            {this.store.getTotalPage > 1 && this.store.active < this.store.getTotalPage &&
            <li onClick={(e: any) => this.nextClick()}><a className="cursor-pointer">
                <i className="fa fa-chevron-right"/> </a>
            </li>}
        </ul>;
    }
}