// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

export function reactive<Class, Value>(
    target: ClassAccessorDecoratorTarget<Class, Value>,
    context: ClassAccessorDecoratorContext<Class, Value> & {
        static: false;
    }
): ClassAccessorDecoratorResult<Class, Value> {
    return {
        get() {
            const value = context.access.get(this);
            console.debug("get", value);
            return value;
        },
        set(value: Value) {
            console.debug("set", value);
            context.access.set(this, value);
        },
        init(value) {
            console.debug("init", value);
            return value;
        },  
    };
}
