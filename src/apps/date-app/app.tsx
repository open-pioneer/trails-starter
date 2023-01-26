import { createCustomElement } from "@open-pioneer/runtime";
import packages from "open-pioneer:app";

export interface AppInputs {
    date?: string;
}

export function DateUI({ date = "empty" }: AppInputs) {
    return <div>{date}</div>;
}

const Element = createCustomElement({
    component: DateUI,
    attributes: ["date"],
    packages
});

customElements.define("date-app", Element);
