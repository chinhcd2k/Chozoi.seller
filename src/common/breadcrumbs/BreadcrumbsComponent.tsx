import {Link} from "react-router-dom";
import {store} from "./BreadcrumbsStore";
import * as React from "react";
import {observer} from "mobx-react";

@observer
export default class BreadcrumbsComponent extends React.Component {
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <ol className="breadcrumb p-0">
            <li><Link to="/home"><i className="fa fa-home" aria-hidden="true"/> </Link></li>
            {Array.isArray(store.breadcrumbs) && store.breadcrumbs.map((value, index) => {
                if (Array.isArray(store.breadcrumbs) && index === store.breadcrumbs.length - 1) {
                    return <li className="active" key={index}>{value.title}</li>
                } else if (Array.isArray(store.breadcrumbs)) {
                    return value.path || value.goBack ? <li key={index}>
                        {value.path && <Link to={value.path}>{value.title}</Link>}
                        {value.goBack && <Link to={'#'} onClick={() => value.goBack && value.goBack()}>{value.title}</Link>}
                    </li> : <li key={index}>{value.title}</li>
                }
                return null;
            })}
        </ol>;
    }
}
