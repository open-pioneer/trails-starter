// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { useIntl } from "open-pioneer:react-hooks";

export function SamplePackageComponent() {
    const intl = useIntl();
    return <div>Greeting: {intl.formatMessage({ id: "greeting" })}</div>;
}
