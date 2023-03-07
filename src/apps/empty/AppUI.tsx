// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { Container, Heading, Text } from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";

export function AppUI() {
    const intl = useIntl();
    return (
        <Container>
            <Heading as="h1" size="lg">
                {intl.formatMessage({ id: "heading" })}
            </Heading>
            <Text>{intl.formatMessage({ id: "text" })}</Text>
        </Container>
    );
}
