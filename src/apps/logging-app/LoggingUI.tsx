import { useRef } from "react";
import { useService } from "open-pioneer:react-hooks";

export function LoggingUI() {
    const service = useService("logging.LogService");
    const clickCount = useRef(0);

    return (
        <div>
            <h1>Description</h1>
            <p>
                This example uses a service to log message to the console when the button below has
                been clicked.
                <br />
                The service is defined in another package.
                <br />
                The framework will automatically load the code required because the dependency is
                declared in the package.json of this app.
            </p>
            <button
                onClick={() => {
                    const count = ++clickCount.current;
                    service.log(`Button has been clicked ${count} times.`);
                }}
            >
                Click me
            </button>
        </div>
    );
}
