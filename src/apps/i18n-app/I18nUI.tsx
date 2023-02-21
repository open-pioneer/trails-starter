import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure
} from "@open-pioneer/chakra-integration";
import { useI18nInternal } from "@open-pioneer/runtime/react-integration/hooks";

export function I18nUI() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const i18n = useI18nInternal("i18n-app"); // TODO generated hook
    return (
        <>
            <Button onClick={onOpen}>{i18n.formatMessage({ id: "open" })}</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{i18n.formatMessage({ id: "dialog.title" })}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>{i18n.formatMessage({ id: "dialog.content" })}</ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            {i18n.formatMessage({ id: "dialog.confirm" })}
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            {i18n.formatMessage({ id: "dialog.abort" })}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
