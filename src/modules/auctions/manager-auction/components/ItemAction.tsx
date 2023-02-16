import React from "react";

interface IItemActionProps {
    type: "AUCTION" | "AUCTION_SALE" | "AUCTION_FLASH_BID"|"AUCTION_GROUP"|"AUCTION_INVERSE"
    state: "PUBLIC" | "READY" | "REJECT" | "DRAFT" | "PENDING"
    auctionState: "BIDING" | "WAITING" | "STOPPED"
    onChangeState: (toState: 'VIEW' | 'EDIT' | 'PENDING' | 'DRAFT' | 'BIDDING' | 'STOPPED' | 'REPLAY' | 'REPLAY_QUICK' | 'REMOVE'|'CREATE_N') => any
}

export const ItemAction: React.FC<IItemActionProps> = (props: IItemActionProps) => {
    return (<div className="btn-group dropdown">
        <button className="btn btn-primary" onClick={() => props.onChangeState("VIEW")}>Xem chi tiết</button>
        <button className="btn btn-default dropdown-toggle dropdown-toggle-icon" data-toggle="dropdown"
                type="button" aria-expanded="false">
            <i className="dropdown-caret"/>
        </button>
        <ul className="dropdown-menu">
            {(/^(DRAFT|REJECT)$/.test(props.state)) && <li onClick={() => props.onChangeState("EDIT")}><a>Chỉnh sửa chi tiết</a></li>}
            {/^(DRAFT)$/.test(props.state) && <li onClick={() => props.onChangeState("PENDING")}><a>Yêu cầu phê duyệt</a></li>}
            {/^(PENDING)$/.test(props.state) && <li onClick={() => props.onChangeState("DRAFT")}><a>Hủy yêu cầu</a></li>}
            {/^(READY)$/.test(props.state) && <li onClick={() => props.onChangeState("BIDDING")}><a>Bắt đầu đấu giá</a></li>}
            {/^(BIDING)$/.test(props.auctionState) && (props.type === "AUCTION_FLASH_BID"||props.type==="AUCTION_INVERSE") && <li onClick={() => props.onChangeState("STOPPED")}><a>Kết thúc đấu giá</a></li>}
            {/^(STOPPED)$/.test(props.auctionState) && <li onClick={() => props.onChangeState("REPLAY")}><a>Đấu giá lại</a></li>}
            {/^(STOPPED)$/.test(props.auctionState) && <li onClick={() => props.onChangeState("REPLAY_QUICK")}><a>Đấu giá lại - Nhanh</a></li>}
            {/^(DRAFT|READY|REJECT)$/.test(props.state) && <li onClick={() => props.onChangeState("REMOVE")}><a>Xóa</a></li>}
            {/*<li onClick={() => props.onChangeState("CREATE_N")}><a>Chuyển sang bán thường</a></li>*/}
        </ul>
    </div>)
}