import React from "react";

interface IBadgeProps {
    cur: number
    des: number
}

export const Badge: React.FC<IBadgeProps> = (props: IBadgeProps) => {
    if (props.cur >= props.des) return <span className="badge badge-success"><i className="fal fa-check"/></span>;
    else return <span className="badge badge-danger"><i className="fal fa-times"/></span>;
};