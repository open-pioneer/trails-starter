import { useService } from "open-pioneer:react-hooks";

export function Component() {
    const service = useService("import.from.package1");
    return <div>{service.message}</div>
}
