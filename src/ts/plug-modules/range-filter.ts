/* module Range Filter ----------------- */
/* 
 * This module requires for its execution three types of data:
 * - wrapper id - you must to pass it via first argument in class
 * - properties - min, max, initial top and bottom values -
 * you can to pass this values in two ways: in object with interface RangeProp as second argument
 * and in an attributes in the wrap container.
 * This 'data-' attributes describes below in object rangeDefQuerySelectors.
 * - DOM elements - it configures performing of module on HTML.
 * You can to pass the attributes via third argument or use attribute names from object rangeDefQuerySelectors.
 * 
 *  There are three public functions:
 *  - launchModule - you must to run this function after initialization
 *  - getValues - it serves the values using interface RangeValues
 *  - setTopValue(number) - it sets top value
 *  - setBottomValue(number) - it sets bottom value */

import {getAttrVal} from "./DOM_services";
export interface RangeProp {
	readonly limit_top: number;
	readonly limit_bottom: number;
	value_top: number;
	value_bottom: number;
	readonly precision: number;
}
export interface RangeValues {
	top: number;
	bottom: number;
}
interface RangeWorkProp {
	readonly values: number;
	pixel_top: number;
	pixel_bottom: number;
	pixel_per_value: number;
	percent_per_pixel: number;
	wrap_space_width: number;
	wrap_space_x: number;
	space_width: number;
	width_lab_t: number;
	width_lab_b: number;
}
interface RangeDefValues {
	readonly percent_top: number;
	readonly percent_bottom: number;
	readonly absolute_side: string;
	readonly transform_top: string;
	readonly transform_bottom: string;
}
export interface RangeErrMsg {
	readonly limit_top: string;
	readonly limit_bottom: string;
	readonly value_top: string;
	readonly value_bottom: string;
}
interface RangeDOM {
	readonly range_space: HTMLElement;
	readonly range_inner_space: HTMLElement;
	readonly top_label: HTMLElement;
	readonly top_lb_parent: HTMLElement;
	readonly top_point: HTMLElement;
	readonly bottom_label: HTMLElement;
	readonly bottom_lb_parent: HTMLElement;
	readonly bottom_point: HTMLElement;
	readonly top_input: HTMLInputElement;
	readonly bottom_input: HTMLInputElement;
	readonly invalid_msg: HTMLElement;
}
export interface rangeDQS {
	range_space: string;
	range_inner_space: string;
	top_label: string;
	bottom_label: string;
	top_input: string;
	bottom_input: string;
	top_point: string;
	bottom_point: string;
	invalid_msg: string;
	limit_top?: string;
	limit_bottom?: string;
	value_top?: string;
	value_bottom?: string;
	precision?: number;
}
const rangeDefQuerySelectors: rangeDQS = {
	range_space: ".range_space",
	range_inner_space: ".range_inner-space",
	top_label: ".range_end-number",
	bottom_label: ".range_start-number",
	top_input: "#price_range_top_field",
	bottom_input: "#price_range_bottom_field",
	top_point: ".range_end-point",
	bottom_point: ".range_start-point",
	invalid_msg: ".range-invalid-msg",
	limit_top: "data-range-max-val",
	limit_bottom: "data-range-min-val",
	value_top: "data-range-top-val",
	value_bottom: "data-range-bottom-val",
	precision: 10
};
const RANGE_ERROR_MSG: RangeErrMsg = {
	limit_top: "Maximum value can not be higher ",
	limit_bottom: "Minimum value can not be lower ",
	value_top: "Maximum value can not be lower than minimum",
	value_bottom: "Minimum value can not be higher than maximum"
};
const RANGE_DEFAULTS: RangeDefValues = {
	percent_top: 100,
	percent_bottom: 0,
	absolute_side: "50%",
	transform_top: "translateX(50%)",
	transform_bottom: "translateX(-50%)"
};

export class RangeFilter {
	wrap_el: HTMLElement;
	private _prop: RangeProp;
	private _work_prop: RangeWorkProp;
	readonly error_msg: RangeErrMsg;
	DOM: RangeDOM;
	readonly default_val: RangeDefValues;
	private _temp_val_top: number;
	private _temp_val_bottom: number;
	private _active_top_point: boolean;
	private _active_bottom_point: boolean;

	callback_func?: Function;

	constructor(block_id: string, properties?: RangeProp, callback?: Function, err_msg?: RangeErrMsg, DOM_selectors?: rangeDQS) {
		this.wrap_el = document.getElementById(block_id);
		this.default_val = RANGE_DEFAULTS;

		let prop: RangeProp = {
			limit_top: +getAttrVal(this.wrap_el, rangeDefQuerySelectors.limit_top),
			limit_bottom: +getAttrVal(this.wrap_el, rangeDefQuerySelectors.limit_bottom),
			value_top: +getAttrVal(this.wrap_el, rangeDefQuerySelectors.value_top),
			value_bottom: +getAttrVal(this.wrap_el, rangeDefQuerySelectors.value_bottom),
			precision: rangeDefQuerySelectors.precision
		};
		this._prop = properties || prop;
		if(callback) this.callback_func = callback;

		this.DOM = {
			range_space: this.wrap_el.querySelector((DOM_selectors && DOM_selectors.range_space) || rangeDefQuerySelectors.range_space),
			range_inner_space: this.wrap_el.querySelector((DOM_selectors && DOM_selectors.range_inner_space) || rangeDefQuerySelectors.range_inner_space),
			top_label: this.wrap_el.querySelector((DOM_selectors && DOM_selectors.top_label) || rangeDefQuerySelectors.top_label),
			bottom_label: this.wrap_el.querySelector((DOM_selectors && DOM_selectors.bottom_label) || rangeDefQuerySelectors.bottom_label),
			top_input: this.wrap_el.querySelector((DOM_selectors && DOM_selectors.top_input) || rangeDefQuerySelectors.top_input),
			bottom_input: this.wrap_el.querySelector((DOM_selectors && DOM_selectors.bottom_input) || rangeDefQuerySelectors.bottom_input),
			top_point: this.wrap_el.querySelector((DOM_selectors && DOM_selectors.top_point) || rangeDefQuerySelectors.top_point),
			bottom_point: this.wrap_el.querySelector((DOM_selectors && DOM_selectors.bottom_point) || rangeDefQuerySelectors.bottom_point),
			invalid_msg: this.wrap_el.querySelector((DOM_selectors && DOM_selectors.invalid_msg) || rangeDefQuerySelectors.invalid_msg),
			top_lb_parent: this.wrap_el.querySelector((DOM_selectors && DOM_selectors.top_label) || rangeDefQuerySelectors.top_label).parentElement,
			bottom_lb_parent: this.wrap_el.querySelector((DOM_selectors && DOM_selectors.bottom_label) || rangeDefQuerySelectors.bottom_label).parentElement
		};

		let values: number = this._prop.limit_top - this._prop.limit_bottom;
		let wrap_space_clientRect = this.DOM.range_space.getBoundingClientRect();
		let pixel_per_value: number = +(wrap_space_clientRect.width / values).toFixed(2);
		let percent_per_pixel: number = +(this.default_val.percent_top / wrap_space_clientRect.width).toFixed(2);
		this._work_prop = {
			values: values,
			pixel_top: +((this._prop.value_top - this._prop.limit_bottom) * pixel_per_value).toFixed(2),
			pixel_bottom: +((this._prop.value_bottom - this._prop.limit_bottom) * pixel_per_value).toFixed(2),
			pixel_per_value: pixel_per_value,
			percent_per_pixel: percent_per_pixel,
			wrap_space_width: wrap_space_clientRect.width,
			wrap_space_x: wrap_space_clientRect.left,
			space_width: this.DOM.range_inner_space.getBoundingClientRect().width,
			width_lab_t: this.DOM.top_lb_parent.getBoundingClientRect().width,
			width_lab_b: this.DOM.bottom_lb_parent.getBoundingClientRect().width
		};
		this.error_msg = {
			limit_top: ((err_msg && err_msg.limit_top) || RANGE_ERROR_MSG.limit_top) + this._prop.limit_top,
			limit_bottom: ((err_msg && err_msg.limit_bottom) || RANGE_ERROR_MSG.limit_bottom) + this._prop.limit_bottom,
			value_top: (err_msg && err_msg.value_top) || RANGE_ERROR_MSG.value_top,
			value_bottom: (err_msg && err_msg.value_bottom) || RANGE_ERROR_MSG.value_bottom
		};
		this._temp_val_top = this._prop.value_top;
		this._temp_val_bottom = this._prop.value_bottom;
		this._active_top_point = false;
		this._active_bottom_point = false;
	}

	private setValue(el: HTMLInputElement, val: number): void {
		el.value = val.toString();
	}
	private setText(el: HTMLElement, text: number): void {
		el.innerHTML = text.toString();
	}
	private changeSpaceWidth(): void {
		this._work_prop.space_width = this.DOM.range_inner_space.getBoundingClientRect().width;
		this._work_prop.width_lab_t = this.DOM.top_lb_parent.getBoundingClientRect().width;
		this._work_prop.width_lab_b = this.DOM.bottom_lb_parent.getBoundingClientRect().width;
		let between_label: number = (this._work_prop.width_lab_t + this._work_prop.width_lab_b) / 2;
		if(between_label > this._work_prop.space_width) {
			this.DOM.top_lb_parent.style.right = "auto";
			this.DOM.top_lb_parent.style.left = this.default_val.absolute_side;
			this.DOM.top_lb_parent.style.transform = "translateX(" + (-(this._work_prop.space_width / 2 - 2) + "px") + ")";
			this.DOM.bottom_lb_parent.style.left = "auto";
			this.DOM.bottom_lb_parent.style.right = this.default_val.absolute_side;
			this.DOM.bottom_lb_parent.style.transform = "translateX(" + (this._work_prop.space_width / 2 - 2) + "px" + ")";
		} else {
			this.DOM.top_lb_parent.style.right = this.default_val.absolute_side;
			this.DOM.top_lb_parent.style.left = "auto";
			this.DOM.top_lb_parent.style.transform = this.default_val.transform_top;
			this.DOM.bottom_lb_parent.style.left = this.default_val.absolute_side;
			this.DOM.bottom_lb_parent.style.right = "auto";
			this.DOM.bottom_lb_parent.style.transform = this.default_val.transform_bottom;
		}
	}
	private setPadding(side: string): void {
		let value: number;
		if(side == "top") {
			value = +((this._work_prop.wrap_space_width - this._work_prop.pixel_top) * this._work_prop.percent_per_pixel).toFixed();
			this.DOM.range_space.style.paddingRight = value + "%";
		} else if(side == "bottom") {
			value = +(this._work_prop.pixel_bottom * this._work_prop.percent_per_pixel).toFixed();
			this.DOM.range_space.style.paddingLeft = value + "%";
		}
		this.changeSpaceWidth();
	}
	private setTop(val: number): void {
		this._prop.value_top = val;
		this._work_prop.pixel_top = +((this._prop.value_top - this._prop.limit_bottom) * this._work_prop.pixel_per_value).toFixed(2);
		this.setText(this.DOM.top_label, this._prop.value_top);
		this.setPadding("top");
	}
	private setBottom(val: number): void {
		this._prop.value_bottom = val;
		this._work_prop.pixel_bottom = +((this._prop.value_bottom - this._prop.limit_bottom) * this._work_prop.pixel_per_value).toFixed(2);
		this.setText(this.DOM.bottom_label, this._prop.value_bottom);
		this.setPadding("bottom");
	}
	private setPointTop(): void {
		this.setText(this.DOM.top_label, this._prop.value_top);
		this.setPadding("top");
	}
	private setPointBottom(): void {
		this.setText(this.DOM.bottom_label, this._prop.value_bottom);
		this.setPadding("bottom");
	}
	applyResize(e: Event): void {
		let wrap_space_clientRect = this.DOM.range_space.getBoundingClientRect();
		this._work_prop.wrap_space_width = wrap_space_clientRect.width;
		this._work_prop.wrap_space_x = wrap_space_clientRect.left;
		this._work_prop.pixel_per_value = +(wrap_space_clientRect.width / this._work_prop.values).toFixed(2);
		this._work_prop.percent_per_pixel = +(this.default_val.percent_top / wrap_space_clientRect.width).toFixed(2);
		this._work_prop.pixel_top = +((this._prop.value_top - this._prop.limit_bottom) * this._work_prop.pixel_per_value).toFixed(2);
		this._work_prop.pixel_bottom = +((this._prop.value_bottom - this._prop.limit_bottom) * this._work_prop.pixel_per_value).toFixed(2);
		let tem = this._work_prop;
	}
	initOnInput(e: Event): void {
		let el = e.target;
		let el_input: HTMLInputElement = <HTMLInputElement> el;
		let value: string = el_input.value;
		let num_val: number, side: string;
		const reg_number: RegExp = /^[0-9]+$/;
		if(el_input.name == this.DOM.top_input.name) {
			side = "top";
		} else if(el_input.name == this.DOM.bottom_input.name) {
			side = "bottom";
		}
		if(value !== "" && !reg_number.test(value)) {
			if(side == "top") {
				el_input.value = this._temp_val_top.toString();
			} else if(side == "bottom") {
				el_input.value = this._temp_val_bottom.toString();
			}
		} else {
			if(side == "top") {
				this._temp_val_top = parseInt(value);
			} else if(side == "bottom") {
				this._temp_val_bottom = parseInt(value);
			}
		}
	}
	initOnChange(e: Event): void {
		let el = e.target;
		let el_input: HTMLInputElement = <HTMLInputElement> el;
		let value: string = el_input.value;
		let num_val: number, side: string, valid_bool: boolean = true, valid_msg: string;
		if(el_input.name == this.DOM.top_input.name) {
			side = "top";
		} else if(el_input.name == this.DOM.bottom_input.name) {
			side = "bottom";
		}
		if(value == "" || isNaN(parseInt(value))) {
			valid_bool = false;
		} else {
			num_val = parseInt(value);
			if(side == "top") {
				if(num_val > this._prop.limit_top) {
					valid_bool = false;
					valid_msg = this.error_msg.limit_top;
				} else if(num_val < (this._prop.value_bottom + this._prop.precision * 2)) {
					valid_bool = false;
					valid_msg = this.error_msg.value_bottom;
				} else {
					this.setTop(num_val);
					this.callback_func();
				}
			} else if(side == "bottom") {
				if(num_val < this._prop.limit_bottom) {
					valid_bool = false;
					valid_msg = this.error_msg.limit_bottom;
				} else if(num_val > (this._prop.value_top - this._prop.precision * 2)) {
					valid_bool = false;
					valid_msg = this.error_msg.value_top;
				} else {
					this.setBottom(num_val);
					this.callback_func();
				}
			}
		}
		if(!valid_bool) {
			if(valid_msg) {
				this.DOM.invalid_msg.innerHTML = valid_msg;
				this.DOM.invalid_msg.classList.remove("hidden");
				setTimeout(() => {
					this.DOM.invalid_msg.classList.add("hidden");
				}, 3500);
			}
			if(side == "top") {
				el_input.value = this._prop.value_top.toString();
			} else if(side == "bottom") {
				el_input.value = this._prop.value_bottom.toString();
			}
		}
	}
	selectInput(e: Event): void {
		let el = e.target;
		let el_input: HTMLInputElement = <HTMLInputElement> el;
		el_input.select();
	}
	mouseDownTop(e: MouseEvent): void {
		if(e.target == e.currentTarget) {
			this.wrap_el.onmousemove = this.mouseMoveTop.bind(this);
			this.wrap_el.onmouseleave = this.mouseEndTop.bind(this);
			this._active_top_point = true;
		}
	}
	mouseMoveTop(e: MouseEvent): void {
		let mouseX: number = e.clientX;
		let pixel_top: number = mouseX - this._work_prop.wrap_space_x;
		let value_top: number = ~~(pixel_top / this._work_prop.pixel_per_value);
		if(value_top < this._prop.limit_top && value_top > (this._prop.value_bottom + this._prop.precision * 2)) {
			this._prop.value_top = Math.ceil(value_top / this._prop.precision) * this._prop.precision;
			this._work_prop.pixel_top = pixel_top;
			this.setPointTop();
		}
	}
	mouseEndTop(e: MouseEvent) {
		if(this._active_top_point) {
			this.setValue(this.DOM.top_input, this._prop.value_top);
			this.wrap_el.onmousemove = undefined;
			this.wrap_el.onmouseleave = undefined;
			this._active_top_point = false;
			this.callback_func();
		}
	}
	mouseDownBottom(e: MouseEvent): void {
		if(e.target == e.currentTarget) {
			this.wrap_el.onmousemove = this.mouseMoveBottom.bind(this);
			this.wrap_el.onmouseleave = this.mouseEndBottom.bind(this);
			this._active_bottom_point = true;
		}
	}
	mouseMoveBottom(e: MouseEvent): void {
		let mouseX: number = e.clientX;
		let pixel_bottom: number = mouseX - this._work_prop.wrap_space_x;
		let value_bottom: number = ~~(pixel_bottom / this._work_prop.pixel_per_value);
		if(value_bottom > this._prop.limit_bottom && value_bottom < (this._prop.value_top - this._prop.precision * 2)) {
			this._prop.value_bottom = Math.floor(value_bottom / this._prop.precision) * this._prop.precision;
			this._work_prop.pixel_bottom = pixel_bottom;
			this.setPointBottom();
		}
	}
	mouseEndBottom(e: MouseEvent) {
		if(this._active_bottom_point) {
			this.setValue(this.DOM.bottom_input, this._prop.value_bottom);
			this.wrap_el.onmousemove = undefined;
			this.wrap_el.onmouseleave = undefined;
			this._active_bottom_point = false;
			this.callback_func();
		}
	}
	public launchModule(): void {
		this.setTop(this._prop.value_top);
		this.setBottom(this._prop.value_bottom);
		this.DOM.top_input.addEventListener("input", this.initOnInput.bind(this));
		this.DOM.top_input.addEventListener("change", this.initOnChange.bind(this));
		this.DOM.top_input.addEventListener("focus", this.selectInput);
		this.DOM.bottom_input.addEventListener("input", this.initOnInput.bind(this));
		this.DOM.bottom_input.addEventListener("change", this.initOnChange.bind(this));
		this.DOM.bottom_input.addEventListener("focus", this.selectInput);
		this.DOM.top_point.addEventListener("mousedown", this.mouseDownTop.bind(this));
		document.addEventListener("mouseup", this.mouseEndTop.bind(this));
		this.DOM.bottom_point.addEventListener("mousedown", this.mouseDownBottom.bind(this));
		document.addEventListener("mouseup", this.mouseEndBottom.bind(this));
		let applyResize = this.applyResize.bind(this);
		let resizeTimer: number;
		window.addEventListener("resize", e => {
			clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(applyResize, 250);
		});
	}

	public get getValues(): RangeValues {
		let values: RangeValues = {
			top: this._prop.value_top,
			bottom: this._prop.value_bottom
		};
		return values;
	}
	public setTopValue(val: number): boolean {
		if(val < this._prop.limit_top && val > this._prop.value_bottom + this._prop.precision) {
			this.setTop(val);
			return true;
		} else return false;
	}
	public setBottomValue(val: number): boolean {
		if(val > this._prop.limit_bottom && val < this._prop.value_top + this._prop.precision) {
			this.setBottom(val);
			return true;
		} else return false;
	}
}