import React from "react";

export const PopupGuide: React.FC = () => {
    return (<div className="modal fade" id="popup-guide-auction-flash-bids">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-body">
                    <ol>
                        <li>
                            Đấu giá chớp nhoáng là gì?
                            <ul>
                                <li>Đấu giá chớp nhoáng là hình thức đấu giá nhanh, thời gian cho 1 phiên đấu giá thường diễn ra từ 1 phút cho đến 10 phút</li>
                            </ul>
                        </li>
                        <li>
                            Tại sao nên áp dụng hình thức đấu giá chớp nhoáng?
                            <ul>
                                <li>Đấu giá chớp nhoáng giúp cho Nhà bán hàng dễ dàng tiếp cận đến Người mua hơn. Người mua có thể theo dõi toàn bộ 1 phiên đấu giá từ đó dễ dàng đưa ra quyết định của mình
                                    hơn
                                </li>
                            </ul>
                        </li>
                        <li>
                            Thời gian cuộc đấu giá thường diễn ra trong bao lâu?
                            <ul>
                                <li>Thời gian cuộc đấu giá sẽ phụ thuộc vào số lượng sản phẩm được sử dụng để đấu giá và thời gian của từng phiên đấu giá. Sau mỗi lần kết thúc một phiên đấu giá mà có
                                    người chơi giành chiến thắng, thì số lượng sản phẩm sẽ được giảm đi 1. Cuộc đấu giá sẽ kết thúc khi số lượng sản phẩm đấu giá về 0
                                </li>
                                <li>Người bán có thể chủ động bấm dừng đấu giá, khi đó cuộc đấu giá sẽ dừng ngay sau khi phiên đấu giá hiện tại kết thúc.</li>
                            </ul>
                        </li>
                    </ol>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-default" data-dismiss="modal">Đóng</button>
                </div>
            </div>
        </div>
    </div>)
}
export const PopupGuideReverseAuction: React.FC = () => {
    return (<div className="modal fade" id="popup-guide-auction-auction-reverse">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-body">
                    <ol>
                        <li>
                            Đấu giá ngược là gì?
                            <ul>
                                <li>Đấu giá ngược là hình thức đấu giá kín. Những người đấu giá không biết về mức giá mà người khác đã đặt. Người chiến thắng là người đạt mức giá thấp nhất và duy nhất</li>
                            </ul>
                        </li>
                        <li>
                            Tại sao nên áp dụng hình thức đấu giá ngược?
                            <ul>
                                <li>
                                    Với lượng tham gia đấu giá lớn, hình thức đấu giá ngược sẽ là một kênh quảng bá
                                    thương hiệu và sản phẩm rất tốt mà không tiins chị phí của Nhà bán gàng
                                </li>
                            </ul>
                        </li>
                        <li>
                            Thời gian phiên đấu giá thường diễn ra trong bao lâu?
                            <ul>
                                <li>Thời gian phiên đấu giá có thể chọn tùy ý từ 1h đến 30 ngày. Tuy nhiên việc lựa chọn
                                    thời gian 1 cách thích hợp sẽ tạo thuận lợi cho phiên đấu giá
                                </li>
                                <li>* Mẹo:Khi giá gốc cao nên tùy chỉnh thời gian dài hơn để sản phẩm tiếp cận được thật nhiều khách hàng</li>
                            </ul>
                        </li>
                    </ol>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-default" data-dismiss="modal">Đóng</button>
                </div>
            </div>
        </div>
    </div>)
}
export const PopupGuideAuctionGroup: React.FC = () => {
    return (<div className="modal fade" id="popup-guide-auction-group">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-body">
                    <ol>
                        <li>
                            Đấu giá mua chung là gì?
                            <ul>
                                <li>Đấu giá mau chung là hình thức đấu giá kín. Những người đấu giá không biết về mức giá mà người khác đã đặt. Dựa theo số lượng mở bán
                                sẽ chọn ra số người thắng cuộc có mức giá đấu cao nhất.
                                </li>
                                <li>Khi kết thúc phiên đấu, tất cả người thắng cuộc sẽ được mua với mức giá thấp nhất trong số các mức giá mà người thắng cuộc đã đấu.</li>
                            </ul>
                        </li>
                        <li>
                            Tại sao nên áp dụng hình thức đấu giá mua chung?
                            <ul>
                                <li>Với số lượng sản phẩm đăng bán nhiều và số lượng người tham gia lớn, tính năng đấu giá mua chung Seller bán nhiều sản phẩm cùng 1 lúc,
                                     từ đó giúp Seller có nhiều lợi thế như: Nhập sản phẩm với giá buôn, bán nhiều sản phẩm nhanh chóng, giảm chi phí tồn kho,...
                                </li>
                            </ul>
                        </li>
                        <li>
                            Thời gian phiên đấu giá thường diễn ra bao lâu?
                            <ul>
                                <li>Thời gian phiên đấu giá sẽ có thể chọn tùy ý từ 1h đến 30 ngày. Tuy nhiên việc lựa chọn thời gian một cách thích hợp sẽ tạo thuận lợi cho phiên đấu giá.
                                </li>
                            </ul>
                        </li>
                    </ol>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-default" data-dismiss="modal">Đóng</button>
                </div>
            </div>
        </div>
    </div>)
}