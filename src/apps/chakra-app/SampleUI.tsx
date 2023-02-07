import {
    Button,
    Container,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    Input,
    useDisclosure,
    useToast,
    Heading,
    Link,
    Stack,
    StackDivider,
    Box,
    RadioGroup,
    Radio
} from "@open-pioneer/chakra-integration";
import { useRef, useState } from "react";

export function SampleUI() {
    return (
        <Container>
            <Heading>chakra technical demo</Heading>
            <Link href="https://chakra-ui.com" isExternal m={5} className="foo">
                Chakra Design system Link
            </Link>
            <ComponentStack></ComponentStack>
        </Container>
    );
}

function ComponentStack() {
    return (
        <Stack divider={<StackDivider borderColor="gray.200" />} spacing="24px" align="stretch">
            <Box>
                <ToastExample />
            </Box>
            <Box>
                <DrawerExample />
            </Box>
            <Box bg="pink.300">
                <RadioGroupExample />
            </Box>
        </Stack>
    );
}

function ToastExample() {
    const toast = useToast();
    return (
        <Button
            onClick={() =>
                toast({
                    title: "Account created.",
                    description: "We've created your account for you.",
                    status: "success",
                    duration: 9000,
                    position: "bottom-left",
                    isClosable: true
                })
            }
        >
            Show Toast
        </Button>
    );
}

function DrawerExample() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef<HTMLButtonElement>(null);
    return (
        <>
            <Button ref={btnRef} colorScheme="teal" onClick={onOpen}>
                Open
            </Button>
            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={onClose}
                finalFocusRef={btnRef}
                isFullHeight={false}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Create your account</DrawerHeader>

                    <DrawerBody>
                        <Input placeholder="Type here..." />
                    </DrawerBody>

                    <DrawerFooter>
                        <Button variant="outline" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue">Save</Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}

function RadioGroupExample() {
    const [value, setValue] = useState("2");
    return (
        <>
            <RadioGroup onChange={setValue} value={value}>
                <Stack spacing={4} direction="row">
                    <Radio size="sm" value="1" isDisabled>
                        Radio 1 (Disabled)
                    </Radio>
                    <Radio size="md" value="2">
                        Radio 2
                    </Radio>
                    <Radio size="lg" value="3">
                        Radio 3
                    </Radio>
                </Stack>
            </RadioGroup>
            <p>{"Checked radio: " + value}</p>
        </>
    );
}
