import { ApiExtension } from "@open-pioneer/runtime";

export class TestApiExtension implements ApiExtension {
    constructor() {
        console.log("apiextenstion");
    }

    async getApiMethods() {
        return {
            foo(a: number) {
                return a * 2;
            }
        };
    }
}
