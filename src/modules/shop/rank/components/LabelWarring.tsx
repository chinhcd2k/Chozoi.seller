import React from "react";

interface ILabelWarringProps {
    shopName: string
    tag: 'NORMAL' | 'FAVOURITE' | 'POSITIVE'
}

export const LabelWarring: React.FC<ILabelWarringProps> = (props: ILabelWarringProps) => {
    switch (props.tag) {
        case "NORMAL":
            return <label className="positive-warning">Cố lên <b>{props.shopName}</b> bạn sắp đạt được shop tích cực rồi!</label>;
        case "POSITIVE":
            return <label className="positive-warning">Cố lên <b>{props.shopName}</b> bạn sắp đạt được shop yêu thích rồi!</label>;
        default:
            return null;
    }
};