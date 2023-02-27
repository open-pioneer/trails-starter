// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import {
    Button,
    Container,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input,
    Text,
    VStack
} from "@open-pioneer/chakra-integration";
import { useService } from "open-pioneer:react-hooks";
import { useState } from "react";
import { NotificationLevel } from "./api";
import { NotifierUI } from "./NotifierUI";

export function AppUI() {
    return (
        <>
            <NotifierUI />
            <Form />
        </>
    );
}

function Form() {
    const notifier = useService("properties-app.Notifier");
    const [message, setMessage] = useState("");
    const onClick = (level: NotificationLevel) => {
        if (!message) {
            return;
        }
        notifier.notify(message, level);
    };

    return (
        <Container>
            <VStack my="20">
                <Heading size="m">Notifier Sample</Heading>
                <Text>
                    This Form attempts to emit a notification with a certain level when clicking one
                    of the button below. The notifier will ignore notifications with a level lower
                    than <strong>{notifier.level}</strong>. The notifier&apos;s level can be
                    configured using an attribute on the web component element.
                </Text>
                <FormControl pt="3">
                    <FormLabel>
                        Enter a message and click one of the buttons to emit a notification
                    </FormLabel>
                    <Input
                        placeholder="Notification text..."
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                    />
                </FormControl>
                <HStack>
                    <Button onClick={onClick.bind(undefined, "DEBUG")}>Debug</Button>
                    <Button onClick={onClick.bind(undefined, "INFO")}>Info</Button>
                    <Button onClick={onClick.bind(undefined, "ERROR")}>Error</Button>
                </HStack>
            </VStack>
        </Container>
    );
}
