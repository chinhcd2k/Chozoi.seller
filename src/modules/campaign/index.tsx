import React from "react";
import {menu} from "../home/stores/HomeStore";
import {breadcrumb} from "../../common/breadcrumbs/BreadcrumbsService";
import ListCampaign from "./page/ListCampaign";
interface IProps {
    location: any
}
export default class CampaignPage extends React.Component<IProps> {
    render() {
        return <>
            {/*Danh sach truong trinh*/}
            <ListCampaign location={this.props.location}/>
        </>;
    }

    @breadcrumb([{title: "Chương trình Chozoi"}])
    @menu(6, 1)
    componentDidMount() {
    }
}
