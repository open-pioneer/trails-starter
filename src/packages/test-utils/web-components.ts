import { waitFor, within } from "@testing-library/dom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GLOBAL = global as any;

function nextId(): number {
    GLOBAL["__WEB_COMPONENT_COUNT__"] ??= 0;
    const id = (GLOBAL["__WEB_COMPONENT_COUNT__"] += 1);
    return id;
}

/**
 * Renders the given component into the DOM and returns the new node.
 */
export async function renderComponent(
    component: CustomElementConstructor | string,
    options?: {
        container?: HTMLElement;
        attributes?: Record<string, string>;
    }
) {
    const tag = typeof component === "string" ? component : defineComponent(component);
    const container = options?.container ?? document.body;
    const node = container.ownerDocument.createElement(tag);
    for (const [key, value] of Object.entries(options?.attributes ?? {})) {
        node.setAttribute(key, value);
    }
    container.innerHTML = "";
    container.appendChild(node);
    return {
        node
    };
}

/**
 * Renders the given component into the DOM (via {@link renderComponent}) and works on its shadow root.
 * In order to use this function, the shadow root should be attached as `open` from inside the component class.
 *
 * After the shadow root has been accessed, the function searches (and waits) for an inner root container (by default `.pioneer-root`)
 * where all other searches should be executed.
 *
 * Returns the shadow root, the inner container, and a bound queries object that automatically searches in the inner container
 * instead of the whole document.
 */
export async function renderComponentShadowDOM(
    component: CustomElementConstructor | string,
    options?: {
        container?: HTMLElement;
        attributes?: Record<string, string>;
        innerContainerSelector?: string;
    }
) {
    const { node } = await renderComponent(component, options);
    const selector = options?.innerContainerSelector ?? ".pioneer-root";
    const { shadowRoot, innerContainer } = await waitFor(() => {
        const shadowRoot = node.shadowRoot;
        if (!shadowRoot) {
            throw new Error("Shadow root not attached.");
        }
        const innerContainer = shadowRoot.querySelector<HTMLElement>(selector);
        if (!innerContainer) {
            throw new Error("Inner container not ready.");
        }
        return { shadowRoot, innerContainer };
    });

    const queries = within(innerContainer);
    return {
        node,
        shadowRoot,
        innerContainer,
        queries
    };
}

/**
 * Defines the given component and returns the unique tag name.
 * This helper is necessary because tag names must not collide in the global elements registry (and
 * un-registration is not possible).
 */
export function defineComponent(
    component: CustomElementConstructor,
    options?: {
        nameHint?: string;
    }
) {
    const nameHint = options?.nameHint ?? "test-component";
    const tag = `${nameHint}-${nextId()}`;
    customElements.define(tag, component);
    return tag;
}
