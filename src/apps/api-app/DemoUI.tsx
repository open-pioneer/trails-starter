import { useService } from "open-pioneer:react-hooks";
import { TextService } from "./TextService";
import { Button, Container, VStack, Text, Heading } from "@open-pioneer/chakra-integration";

export function DemoUI() {
    const eventService = useService("application-events.EventService");
    const service = useService("api-app.TextService") as TextService;

    //service.on(); // todo listen on text-changed event

    return (
        <Container>
            <VStack>
                <Heading size="md">Emitting Events</Heading>
                <Text>Click this button to emit a browser event:</Text>
                <Button onClick={() => eventService.emitEvent("my-event-type")}>Emit Event</Button>

                <Heading size="md" pt={20}>
                    React to api calls from outer site
                </Heading>
                <div>Current text: {service.getText()}</div>
            </VStack>
        </Container>
    );
}
