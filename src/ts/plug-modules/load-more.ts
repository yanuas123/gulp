/* module Load More ---------------- */
export function loadMore(operation: string): void {
	const loader: HTMLElement = document.getElementById("loader");
	const body: HTMLElement = document.body;
	const style_open: string = "open";
	const style_blocked_body: string = "noscroll";
	const act_open: string = "open";
	const act_close: string = "close";
	if(operation == act_open) {
		loader.classList.add(style_open);
		body.classList.add(style_blocked_body);
	} else if(operation == act_close) {
		loader.classList.remove(style_open);
		body.classList.remove(style_blocked_body);
	}
}