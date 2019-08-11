/* Countries for select --------------- */

// global ajax request
import {ajax_methods, ajax_content_type, postReqObj, getReqObj, putReqObj, delReqObj, ajax_prop, Request_} from "./ajax";

// arguments
export type select_form_data = {form_name: string; select_name: string}[];

export function addSelectCountries(prop: select_form_data): void {
	let countries = null;
	let selects: HTMLSelectElement[] = [];
	for(let i = 0; i < prop.length; i++) {
		let form = <HTMLFormElement> document.querySelector(`form[name='${prop[i].form_name}']`);
		let select = <HTMLSelectElement> form.querySelector(`select[name='${prop[i].select_name}']`);
		selects[selects.length] = select;
	}

	let callback = (data: any) => {
		let options = "";
		for(let i = 0; i < data.length; i++) {
			let option = `<option value="${data[i].name}">${data[i].name}</option>`;
			options += option;
		}
		for(let j = 0; j < selects.length; j++) {
			let option_content: string = selects[j].innerHTML;
			selects[j].innerHTML = option_content + options;
		}
	}
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4) {
			if(xhr.status == 200) {
				let data = JSON.parse(xhr.responseText);
				callback(data);
			}
		}
	};
	xhr.open("GET", "https://restcountries.eu/rest/v2/all", true);
	xhr.setRequestHeader("Content-Type", "text/plain");
	xhr.send();
}