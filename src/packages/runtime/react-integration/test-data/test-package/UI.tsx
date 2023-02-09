import { useProperties, useService, useServices } from "open-pioneer:react-hooks";

export function UIWithProperties() {
    const properties = useProperties();
    return <div className="ui">Test-UI: {properties.greeting as string}</div>
}

export function UIWithService() {
    const service = useService("test.Provider") as any;
    return <div className="ui">Test-UI: {service.value}</div>;
}

export function UIWithServices() {
    const services = useServices("test.Provider") as any[];
    return <div className="ui">Test-UI: {services.map(service => service.value).join(",")}</div>;
}
