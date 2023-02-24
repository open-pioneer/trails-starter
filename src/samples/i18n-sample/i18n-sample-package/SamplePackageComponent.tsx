import { useIntl } from "open-pioneer:react-hooks";

export function SamplePackageComponent() {
    const intl = useIntl();
    return <div>Greeting: {intl.formatMessage({ id: "greeting" })}</div>;
}
