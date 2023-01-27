export class TestUtils {
    static render(tag: string) {
        TestUtils._renderToDocument(tag);
        return TestUtils.waitForSelector(tag);
    }

    static reset() {
        document.body.innerHTML = "";
    }

    static _renderToDocument(tag: string) {
        document.body.innerHTML = `<${tag}></${tag}>`;
    }

    static waitForSelector(selector: string, parent: ParentNode = document) {
        return new Promise<Element>((resolve) => {
            function requestComponent() {
                const element = parent.querySelector(selector);
                if (element) {
                    resolve(element);
                } else {
                    window.requestAnimationFrame(requestComponent);
                }
            }
            requestComponent();
        });
    }

    static waitForRemoval(selector: string, parent: ParentNode = document) {
        return new Promise<void>((resolve) => {
            function requestComponent() {
                const element = parent.querySelector(selector);
                if (element) {
                    window.requestAnimationFrame(requestComponent);
                } else {
                    resolve();
                }
            }
            requestComponent();
        });
    }
}
