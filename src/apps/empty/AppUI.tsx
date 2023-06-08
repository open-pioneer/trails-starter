// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { Container, Heading, Text } from "@open-pioneer/chakra-integration";
import { useIntl, useService } from "open-pioneer:react-hooks";

export function AppUI() {
    const intl = useIntl();
    const greeter = useService("sample-package.Greeter");
    return (
        <Container>
            <Heading as="h1" size="lg">
                {intl.formatMessage({ id: "heading" })}
            </Heading>
            <Text pt={5}>{intl.formatMessage({ id: "text" })}</Text>
            <Text pt={5}>
                This messages comes from the sample package{"'"}s greeter service: {greeter.greet()}
            </Text>
        </Container>
    );
}
