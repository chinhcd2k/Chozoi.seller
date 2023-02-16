import React from "react";
import {css} from "@emotion/core";

interface IConfirmEditProps {
    className?: string
    EmitOnConfirm: (value: boolean) => any
}

export const ConfirmEdit: React.FC<IConfirmEditProps> = (props: IConfirmEditProps) => {
    const style = css(`
        color: red;
        button {
            width: 27px;
            height: 22px;
            border: solid 1px #cccccc;
            cursor: pointer;
            background-color: white; 
            i.fa-check {
                color: green;
            }
            i.fa-times {
                color: red;
            }
        }
    `);

    return (<span className={props.className ? props.className : ''} css={style}>
                <button className="mr-2" type="submit" onClick={() => props.EmitOnConfirm(true)}><i className="far fa-check"/></button>
                <button type="button" onClick={() => props.EmitOnConfirm(false)}><i className="far fa-times"/></button>
        </span>);
};