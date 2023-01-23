import { createCustomElement } from "@open-pioneer/runtime";

export interface AppInputs {
    date?: string;
}

export function DateUI({ date = "empty" }: AppInputs) {
    return <div>{date}</div>;
}

const Element = createCustomElement({
    component: DateUI,
    attributes: ["date"]
});

customElements.define("date-app", Element);
