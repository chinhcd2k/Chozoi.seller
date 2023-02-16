import ReactGa from "react-ga";

ReactGa.initialize((window as any).GA);
class GoogleAnalytic {
	 pushEventGa (event_category: string, event_action: string, event_label?: string, event_value?: number, result?: 'success' | 'error') {
			let objRs = {};
			let obj = {
				 eventCategory: event_category,
				 eventAction: event_action,
			};
			if (event_label){
				 obj = Object.assign(obj, {eventLabel: event_label});
			}
			if (event_value){
				 obj = Object.assign(obj, {eventValue: event_value});
			}
			if (result){
				 obj = Object.assign(obj, {result: result});
			}
			objRs={...obj};
			ReactGa.ga('send', 'event', objRs);
	 }

	 fcSendGaForSale (fcProduct: () => any, fcAuction: () => any) {
	 	 if (window.location.pathname === '/home/auction/add') fcAuction(); else
	 	 	 if (window.location.pathname === '/home/product/add') fcProduct();
	 }
}

export default new GoogleAnalytic();
