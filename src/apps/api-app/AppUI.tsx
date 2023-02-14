import { Button, Container, VStack, Text } from "@open-pioneer/chakra-integration";
import { useService } from "open-pioneer:react-hooks";

export function AppUI() {
    const eventService = useService("application-events.EventService");
    return (
        <Container>
            <VStack>
                <Text>Click this button to emit a browser event:</Text>
                <Button onClick={() => eventService.emitEvent("my-event-type")}>Emit Event</Button>
            </VStack>
        </Container>
    );
}
