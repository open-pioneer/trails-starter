const GlobalError = globalThis.Error;

// 'cause' property is missing in typescript typings
declare global {
    interface ErrorConstructor {
        new (
            message?: string,
            options?: {
                cause?: unknown;
            }
        ): globalThis.Error;
    }
}

export class Error extends GlobalError {
    public readonly id: string;
    public readonly text: string;

    // TODO: Document error ids & conventions
    constructor(id: string, text: string, options?: { cause?: unknown }) {
        super(`${id}: ${text}`, options);
        this.id = id;
        this.text = text;
    }
}

/** 
 * Returns the error chain for the given `err`, starting with this error.
 * The error chain contains the error itself and all its causes.
 * The first entry is `err` itself.
 */
export function getErrorChain(err: globalThis.Error): globalThis.Error[] {
    const chain: globalThis.Error[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        chain.push(err);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cause = (err as any).cause;
        if (cause instanceof GlobalError) {
            err = cause;
        } else {
            break;
        }
    }
    return chain;
}
