import { useService, useProperties } from "open-pioneer:react-hooks";
import { Component as Package1Component } from "../../packages/package1/Component";
import { Component as Package2Component } from "../../packages/package2/Component";

export function Component() {
    const service = useService("import.from.app");
    const properties = useProperties();
    return (
        <div>
            {service.message}
            {properties.message}
            <Package1Component></Package1Component>
            <Package2Component></Package2Component>
        </div>
    );
}
