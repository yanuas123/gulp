/* module Copy Text Element to Buffer ------------- */
import {performTooltip} from "./tooltip";

export function CopyTextToBuffer(trigger_id: string, text_el_selector: string, tooltip_msg: string = "The text was copied"): void {
	let trigger_el: NodeListOf<Element> = document.querySelectorAll(trigger_id);
	if(trigger_el && trigger_el.length) {
		for(let i = 0; i < trigger_el.length; i++) {
			let text_el: HTMLElement = trigger_el[i].querySelector(text_el_selector);
			(<HTMLElement> trigger_el[i]).onclick = (e) => {
			e.preventDefault();
			if(document.createRange) {
				let range = document.createRange();
				range.selectNodeContents(text_el);
				let selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
				document.execCommand("copy", false, null);
				selection.removeAllRanges();
				performTooltip(text_el, tooltip_msg);
			}
			};
		}
	}
}