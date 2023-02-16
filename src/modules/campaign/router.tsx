import React from "react";
import {Switch, Route} from "react-router-dom";
import DetailCampaign from "./page/DetailCampaign";
import CampaignPage from "./index";

export const CampaignRoutes: React.FC = () => {
    return (<Switch>
        <Route exact path='/home/campaign' component={CampaignPage}/>
        <Route exact path="/home/campaign/:id" component={DetailCampaign}/>
    </Switch>)
}
