// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { useIntl } from "open-pioneer:react-hooks";

export function SamplePackageComponent() {
    const intl = useIntl();
    return <div>Greeting: {intl.formatMessage({ id: "greeting" })}</div>;
}
