import { config } from "../config";

class EmojiBtn {
    private container: HTMLDivElement;
    private emoji: string = "";
    private emoji_span: HTMLSpanElement;

    constructor() {
        // Create the div and span
        this.container = document.createElement("div");
        this.container.classList.add("emoji-btn");
        this.emoji_span = document.createElement("span");
        this.container.appendChild(this.emoji_span);
    }

    set_emoji(emoji: string) {
        this.emoji = emoji;
        this.emoji_span.innerHTML = emoji;
        this.show();
    }

    hide() {
        this.container.classList.add("hidden");
    }

    show() {
        this.container.classList.remove("hidden");
    }

    get_emoji() {
        return this.emoji;
    }

    get_container() {
        return this.container;
    }
}

export { EmojiBtn };
