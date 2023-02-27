// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { Button, Container, Heading, Text, VStack } from "@open-pioneer/chakra-integration";
import { useService } from "open-pioneer:react-hooks";

export function ActionsUI() {
    const service = useService("extension-app.ActionService");
    const buttons = service.getActionInfo().map(({ id, text }) => (
        <Button key={id} onClick={() => service.triggerAction(id)}>
            {text}
        </Button>
    ));

    return (
        <Container maxW="3xl" py={2}>
            <Heading as="h1" size="4xl" mb={4}>
                Extension Example
            </Heading>

            <Text my={2}>
                This example demonstrates how to provide an extensible API with services and 1-to-N
                dependencies.
            </Text>
            <Text my={2}>
                Individual <code>ActionProvider</code> instances can provide a number of actions,
                which are then gathered and indexed by the <code>ActionService</code>, which depends
                on all ActionProviders. The UI references the <code>ActionService</code> and renders
                the provided actions as buttons. When a button is clicked, the appropriate action
                will be triggered.
            </Text>
            <Text my={2}>
                To add a new action, simply add new implementation of{" "}
                <code>&quot;extension-app.ActionProvider&quot;</code>. The{" "}
                <code>ActionService</code> will pick it up automatically.
            </Text>

            <Heading as="h4" size="xl">
                Buttons from <code>ActionService</code>:
            </Heading>
            <VStack align="start">{buttons}</VStack>
        </Container>
    );
}
