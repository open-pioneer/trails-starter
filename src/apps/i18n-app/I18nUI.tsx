import {
    Button,
    Center,
    Container,
    Heading,
    HStack,
    ListItem,
    Text,
    UnorderedList,
    VStack
} from "@open-pioneer/chakra-integration";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { ReactNode } from "react";

export function I18nUI() {
    const intl = useIntl();
    const appCtx = useService("runtime.ApplicationContext");
    const locale = appCtx.getLocale();
    const supportedLocales = appCtx.getSupportedLocales();

    return (
        <Container>
            <Heading size="lg" mb={4}>
                {intl.formatMessage({ id: "content.header" })}
            </Heading>

            <Text mb={4}>{intl.formatMessage({ id: "content.description" })}</Text>

            <UnorderedList mb={4}>
                <ListItem>Current locale: {locale}</ListItem>
                <ListItem>Supported locales: {supportedLocales.join(", ")}</ListItem>
                <ListItem>Current date: {intl.formatDate(new Date())}</ListItem>
                <ListItem>Large number: {intl.formatNumber(1234567.89)}</ListItem>
            </UnorderedList>

            <Center>
                <LocalePicker current={locale} locales={supportedLocales} />
            </Center>
        </Container>
    );
}

function LocalePicker(props: { current: string; locales: readonly string[] }) {
    const intl = useIntl();
    const eventService = useService("integration.ExternalEventService");
    const changeLocale = (locale: string | undefined) => {
        eventService.emitEvent("locale-changed", {
            locale: locale
        });
    };

    // One entry for every supported locale (to force it) and one empty
    // to pick the default behavior.
    const makeButton = (locale: string | undefined) => (
        <Button key={locale ?? ""} onClick={() => changeLocale(locale)}>
            {locale ?? intl.formatMessage({ id: "picker.default" })}
        </Button>
    );
    const buttons: ReactNode[] = props.locales.map((locale) => makeButton(locale));
    buttons.unshift(makeButton(undefined));

    return (
        <VStack>
            <Text>{intl.formatMessage({ id: "picker.choose" })}</Text>
            <HStack spacing={2}>{buttons}</HStack>
        </VStack>
    );
}
