import { EventEmitter } from "@open-pioneer/core";

export interface UpdatedText {
    newText: string;
    oldText: string;
}

export interface TextEvents {
    "text-changed": UpdatedText;
}

export class TextService extends EventEmitter<TextEvents> {
    private text = "not yet set";

    setText(text: string) {
        this.text = text;
        // todo text-changed event
    }

    getText() {
        return this.text;
    }
}
