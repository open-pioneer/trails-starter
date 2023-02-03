import { useProperties } from "open-pioneer:react-hooks";

export function UI() {
    const properties = useProperties();
    return <div className="ui">{properties.greeting as string}</div>
}
