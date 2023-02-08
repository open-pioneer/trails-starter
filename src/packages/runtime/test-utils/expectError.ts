export function expectError(impl: () => void) {
    try {
        impl();
        throw new Error("expected error!");
    } catch (e) {
        if (e instanceof Error) {
            return e;
        }
        throw new Error("unexpected error value, not an instance of Error");
    }
}
