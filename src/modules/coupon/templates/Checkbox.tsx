import React from "react";

interface ICheckboxProps {
    defaultChecked: boolean
    onChange?: (checked: boolean) => any
}

export const Checkbox: React.FC<ICheckboxProps> = (props: ICheckboxProps) => {
    return (<div className="my-checkbox">
        <input
            defaultChecked={props.defaultChecked}
            onChange={e => props.onChange && props.onChange(e.currentTarget.checked)}
            type="checkbox"/>
        <label/>
    </div>);
}