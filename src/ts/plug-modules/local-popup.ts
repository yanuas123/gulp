/* module Local Popup perform ------------- */

/* Main class - LocPopup
 * Methods of the module described below */


interface loc_popup {
	setPopup(id: string): void;
	openWithMouse(id: string, e: MouseEvent): void; // event for devaulate mouse coordinates
	open(id: string, top: number, left: number): void;
	close(id: string): void;
}

export class LocPopup implements loc_popup {
	items: {
		[item: string]: HTMLElement
	};
	parent_el: HTMLElement;
	style: string;
	open_state: boolean;

	constructor(parent_id: string, style?: string) {
		this.parent_el = document.getElementById(parent_id);
		this.style = style || "hidden";
		this.items = {};
		this.open_state = false;

		window.addEventListener("click", (e) => {
			if((<Element> e.target).closest(parent_id) || this.open_state) {
				this.open_state = false;
				return;
			}
			for(let key in this.items) {
				this.close(key);
			}
		});
	}

	public setPopup(id: string): void {
		let el = document.getElementById(id);
		this.items[id] = el;
	}
	public openWithMouse(id: string, e: MouseEvent): void {
		let window_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		let click_x = e.clientX;
		let click_y = e.clientY;
		let position_side = "left";
		let position_noside = "right";
		this.items[id].style.top = click_y + "px";
		this.items[id].classList.remove(this.style);

		let el_width = this.items[id].getBoundingClientRect().width;
		if(click_x + el_width > window_width) {
			position_side = "right";
			position_noside = "left";
			click_x = window_width - click_x;
		}
		this.items[id].style[<"left" | "right"> position_side] = click_x + "px";
		this.items[id].style[<"left" | "right"> position_noside] = "auto";
		this.open_state = true;
	}
	public open(id: string, top: number, left: number): void {
		let window_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		let position = left;
		let position_side = "left";
		let position_noside = "right";
		this.items[id].style.top = top + "px";
		this.items[id].classList.remove(this.style);

		let el_width = this.items[id].getBoundingClientRect().width;
		if(left + el_width > window_width) {
			position_side = "right";
			position_noside = "left";
			position = window_width - position;
		}
		this.items[id].style[<"left" | "right"> position_side] = position + "px";
		this.items[id].style[<"left" | "right"> position_noside] = "auto";
		this.open_state = true;
	}
	public close(id: string): void {
		this.items[id].classList.add(this.style);
	}
}