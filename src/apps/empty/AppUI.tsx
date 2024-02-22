// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Container, Heading, Text, chakra } from "@open-pioneer/chakra-integration";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { Greeter, SimpleUiComponent } from "sample-package";

export function AppUI() {
    const intl = useIntl();
    const greeter = useService<Greeter>("sample-package.Greeter");
    return (
        <Container>
            <Heading as="h1" size="lg">
                {intl.formatMessage({ id: "heading" })}
            </Heading>
            <Text pt={5}>{intl.formatMessage({ id: "text" })}</Text>
            <Text pt={5}>
                This messages comes from the sample package{"'"}s greeter service: {greeter.greet()}
            </Text>
            <chakra.div mt={5}>
                <SimpleUiComponent textToShow="This text is rendered inside the sample UI-Component 'SimpleUiComponent'"></SimpleUiComponent>
            </chakra.div>
        </Container>
    );
}
