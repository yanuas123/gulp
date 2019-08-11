/* module Popup */

/* In order to manage popups using default properties with interface PopupProp (below) or pass your properties to constructor. This module by itself opens popup after trigger on an element with the attribute using value of attributes trigger and popup. Also it close popup after trigger on element with close attribute. You can by yourself open and close popups using methods open and close. You should to pass argument - value of data attribute of popup. After module initialization run method launchModule. */

export interface PopupProp {
	// class for open element
	readonly body_class: string;
	readonly container_class: string;
	readonly container_animate_class: string;
	readonly popup_class: string;

	readonly container_id: string;
	readonly wrap_selector?: string;
	// names of data attributes that controls popup
	readonly popup_data_attr: string;
	readonly init_data_attr: string;
	// this without value
	readonly close_data_attr: string;
}
interface PopupData {
	[item: string]: HTMLElement;
}


/* An initial trigger element must to contain 'data-popup-init' attribute with string that contain a target popup block in the attribute 'data-popup-targ'
*/
const POPUP_DEF_PROP: PopupProp = {
	body_class: "noscroll",
	container_class: "display-popup",
	container_animate_class: "animate-popup",
	popup_class: "display-popup",
	container_id: "popups",
	wrap_selector: ".popups-frame_wrap",
	popup_data_attr: "data-popup-targ",
	init_data_attr: "data-popup-init",
	close_data_attr: "data-popup-close"
};

export class PopupTrigger {
	readonly prop: PopupProp;
	readonly init_El: NodeList;
	readonly close_El: NodeList;
	readonly targ_El: PopupData;
	private _active_title: string | false;
	private _active_callback?: Function;
	readonly body_El: HTMLElement;
	readonly container: HTMLElement;
	readonly wrap_El?: HTMLElement;

	constructor(prop: PopupProp = POPUP_DEF_PROP) {
		this.prop = prop;
		this.body_El = document.body;
		this.container = document.getElementById(this.prop.container_id);
		if(prop.wrap_selector) {
			let wrap_El: HTMLElement = document.querySelector(prop.wrap_selector);
			if(wrap_El) this.wrap_El = wrap_El;
		}
		this.init_El = document.querySelectorAll("[" + this.prop.init_data_attr + "]");
		this.close_El = document.querySelectorAll("[" + this.prop.close_data_attr + "]");
		let targ_El = document.querySelectorAll("[" + this.prop.popup_data_attr + "]");
		this.targ_El = {};
		for(let i = 0; i < targ_El.length; i++) {
			let title = (<HTMLElement> targ_El[i]).getAttribute(this.prop.popup_data_attr);
			this.targ_El[title] = <HTMLElement> targ_El[i];
		}
		this._active_title = "cart";
	}

	open(title: string, callback?: Function): void {
		if(this._active_title) this.close(this._active_title);
		this.container.classList.add(this.prop.container_class);
		this.body_El.classList.add(this.prop.body_class);
		let target = this.targ_El[title];
		target.classList.add(this.prop.popup_class);
		this._active_title = title;
		if(callback) this._active_callback = callback;
	}
	close(title?: string | false): void {
		let active_title = title || this._active_title;
		let target: HTMLElement;
		if(active_title) {
			target = this.targ_El[active_title];
			this._active_title = false;
			if(title) target.classList.remove(this.prop.popup_class);
		}
		if(!title) {
			this.container.classList.remove(this.prop.container_animate_class);
			setTimeout((() => {
				this.container.classList.remove(this.prop.container_class);
				this.body_El.classList.remove(this.prop.body_class);
				target.classList.remove(this.prop.popup_class);
				this.container.classList.add(this.prop.container_animate_class);
				if(this._active_callback) {
					this._active_callback();
					this._active_callback = null;
				}
			}).bind(this), 400);
		}
	}
	launchModule(): void {
		for(let i = 0; i < this.init_El.length; i++) {
			this.init_El[i].addEventListener("click", ((e: Event) => {
				e.preventDefault();
				let title: string = (<HTMLElement> e.currentTarget).getAttribute(this.prop.init_data_attr);
				this.open(title);
			}).bind(this));
		}
		for(let j = 0; j < this.close_El.length; j++) {
			this.close_El[j].addEventListener("click", ((e: Event) => {
				e.preventDefault();
				this.close();
			}).bind(this));
		}
		if(this.wrap_El) {
			this.wrap_El.addEventListener("click", ((e: Event) => {
				if(e.currentTarget == e.target) {
					this.close();
				}
			}).bind(this));
		}
	}
}