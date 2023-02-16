import React from "react";
import {observer} from "mobx-react";
import {CATEGORY_CTRL} from "../control";

interface ICategoryViewProps {
    index: number
}

@observer
export default class CategoryView extends React.Component<ICategoryViewProps, any> {
    private store = CATEGORY_CTRL.store;

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        const temp_category = this.store.category[this.props.index];
        if (temp_category.web.category)
            return <div className="category-view">
                <h4>{temp_category.web.category.name}</h4>
                {temp_category.web.category.children.length > 0 && <ul>
                    {temp_category.web.category.children.map((value, index) => <li key={index}>{value.name}</li>)}
                </ul>}
            </div>;
        else return null;
    }
}
