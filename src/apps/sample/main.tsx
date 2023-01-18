// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
import { createCustomElement } from "@open-pioneer/runtime";

// import { hello } from "hello-world/hello";

// hello();

// ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
//     <React.StrictMode>
//         <App />
//     </React.StrictMode>
// );

const CustomElementClazz = createCustomElement({
    component: <div>Hello World!</div>,
    styles: "",
    openShadowRoot: true
});
globalThis.customElements.define("sample-element", CustomElementClazz);
