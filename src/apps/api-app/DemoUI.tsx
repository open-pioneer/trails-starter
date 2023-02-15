import { useService } from "open-pioneer:react-hooks";
import { TextService } from "./TextService";
import { Button, Container, VStack, Text, Heading } from "@open-pioneer/chakra-integration";

export function DemoUI() {
    const eventService = useService("application-events.EventService");
    const emitEvent = () => {
        eventService.emitEvent("my-custom-event", {
            data: "my-event-data"
        });
    };

    const textService = useService("api-app.TextService") as TextService;
    //service.on(); // todo listen on text-changed event

    return (
        <Container>
            <VStack>
                <Heading size="md">Emitting Events</Heading>
                <Text>Click this button to emit a browser event:</Text>
                <Button onClick={emitEvent}>Emit Event</Button>

                <Heading size="md" pt={20}>
                    React to api calls from outer site
                </Heading>
                <div>Current text: {textService.getText()}</div>
            </VStack>
        </Container>
    );
}
