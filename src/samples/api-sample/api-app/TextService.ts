// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
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
        const oldText = this.text;
        this.text = text;
        this.emit("text-changed", { newText: this.text, oldText: oldText });
    }

    getText() {
        return this.text;
    }
}
