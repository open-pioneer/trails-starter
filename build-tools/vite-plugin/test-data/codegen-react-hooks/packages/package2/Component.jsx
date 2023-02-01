import { useService } from "open-pioneer:react-hooks";

export function Component() {
    const service = useService("import.from.package2");
    return <div>{service.message}</div>
}
