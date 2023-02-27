// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
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
    useDisclosure,
    useToast,
    Heading,
    Text,
    Link,
    Stack,
    StackDivider,
    Box,
    Tooltip,
    RadioGroup,
    Radio,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Portal,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,
    PopoverFooter,
    Select
} from "@open-pioneer/chakra-integration";
import { useRef, useState } from "react";
import { TableExampleComponent } from "./TableExample";

export function SampleUI() {
    return (
        <div style={{ overflow: "auto", height: "100%", width: "100%" }}>
            <Container>
                <Heading mb={5}>chakra technical demo</Heading>
                <LinkComponent></LinkComponent>
                <ComponentStack></ComponentStack>
                <TableExampleComponent />
                <SelectComponent />
            </Container>
        </div>
    );
}

function LinkComponent() {
    return (
        <Text>
            This is a{" "}
            <Link href="https://chakra-ui.com" isExternal color="yellow.500">
                link to Chakra&apos;s Design system
            </Link>
        </Text>
    );
}

function ComponentStack() {
    return (
        <Stack
            mb={5}
            mt={5}
            divider={<StackDivider borderColor="gray.200" />}
            spacing="24px"
            align="stretch"
        >
            <Box>
                <PortalExample />
            </Box>
            <Box>
                <TooltipExample />
            </Box>
            <Box>
                <ToastExample />
            </Box>
            <Box>
                <AlertExample />
            </Box>
            <Box>
                <AlertDialogExample />
            </Box>
            <Box>
                <ModalExample />
            </Box>
            <Box>
                <DrawerExample />
            </Box>
            <Box>
                <PopoverExample />
            </Box>
            <Box bg="yellow.100">
                <RadioGroupExample />
            </Box>
        </Stack>
    );
}

function PortalExample() {
    return (
        <Box bg="yellow.100">
            <Heading size="sm">Portal Example: </Heading>
            This is box and displayed here. Scroll/Look down to see the portal that is added at the
            end of document.body. The Portal is part of this Box.
            <Portal>This is the portal content!</Portal>
        </Box>
    );
}

function TooltipExample() {
    return (
        <Tooltip hasArrow label="Button Tooltip" aria-label="A tooltip" placement="top">
            <Button colorScheme="teal">Button with a tooltip</Button>
        </Tooltip>
    );
}

function ToastExample() {
    const toast = useToast();
    return (
        <Button
            colorScheme="teal"
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

function AlertExample() {
    return (
        <Alert status="error">
            <AlertIcon />
            <AlertTitle>Test Alert!</AlertTitle>
            <AlertDescription>This is a test alert (error)</AlertDescription>
        </Alert>
    );
}

function AlertDialogExample() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    return (
        <>
            <Button onClick={onOpen} colorScheme="teal">
                Open Alert
            </Button>

            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent className="class-from-app">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Alert Title
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            This is the text in the alert dialog body.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="green" onClick={onClose} ml={3}>
                                Okay
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}

function ModalExample() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Button onClick={onOpen} colorScheme="teal">
                Show Modal
            </Button>

            <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>This is a modal</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>This is a modal text!</ModalBody>

                    <ModalFooter>
                        <Button colorScheme="green" mr={2}>
                            Got it
                        </Button>
                        <Button onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

function DrawerExample() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef<HTMLButtonElement>(null);
    return (
        <>
            <Button ref={btnRef} colorScheme="teal" onClick={onOpen}>
                Open Drawer
            </Button>
            <Drawer
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                finalFocusRef={btnRef}
                isFullHeight={false}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>This is the drawer header</DrawerHeader>

                    <DrawerBody>This is the body.</DrawerBody>

                    <DrawerFooter>
                        <Button variant="outline" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="green">Got it</Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}

function PopoverExample() {
    return (
        <>
            <Popover>
                <PopoverTrigger>
                    <Button colorScheme="teal">Show Popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader>Popover!</PopoverHeader>
                    <PopoverBody>This is a very important Popover</PopoverBody>
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger>
                    <Button ml={5} colorScheme="teal">
                        Show Popover rendered in an portal
                    </Button>
                </PopoverTrigger>
                <Portal>
                    <PopoverContent>
                        <PopoverArrow />
                        <PopoverHeader>Header</PopoverHeader>
                        <PopoverCloseButton />
                        <PopoverBody>
                            <PopoverBody>This is a very important Popover</PopoverBody>
                        </PopoverBody>
                        <PopoverFooter>This is the footer</PopoverFooter>
                    </PopoverContent>
                </Portal>
            </Popover>
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

function SelectComponent() {
    return (
        <Select m={5} placeholder="Select an item">
            <option value="item1">Item 1</option>
            <option value="item2">Item 2</option>
            <option value="item3">Item 3</option>
        </Select>
    );
}
