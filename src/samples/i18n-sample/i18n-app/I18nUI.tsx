// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import {
    Button,
    Center,
    Container,
    Heading,
    HStack,
    ListItem,
    Text,
    UnorderedList,
    VStack,
    Divider
} from "@open-pioneer/chakra-integration";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { ReactNode } from "react";
import { SamplePackageComponent } from "i18n-sample-package/SamplePackageComponent";

export function I18nUI() {
    const intl = useIntl();
    const appCtx = useService("runtime.ApplicationContext");
    const locale = appCtx.getLocale();
    const supportedLocales = appCtx.getSupportedLocales();
    const name = "Müller";
    const list = ["Hans", "Peter", "Hape"];

    return (
        <Container>
            <Heading size="lg" mb={4}>
                {intl.formatMessage({ id: "content.header" })}
            </Heading>

            <Text mb={4}>{intl.formatMessage({ id: "content.description" })}</Text>

            <UnorderedList mb={4}>
                <ListItem>Current locale: {locale}</ListItem>
                <ListItem>Supported locales: {supportedLocales.join(", ")}</ListItem>
                <ListItem>
                    Current date and time:{" "}
                    {intl.formatDate(new Date(), { dateStyle: "full", timeStyle: "short" })}
                </ListItem>
                <ListItem>
                    Relative Time - 1:{" "}
                    {intl.formatRelativeTime(1, "minute", { numeric: "auto", style: "long" })}
                </ListItem>
                <ListItem>
                    Relative Time - 15:{" "}
                    {intl.formatRelativeTime(15, "minute", { numeric: "auto", style: "long" })}
                </ListItem>
                <ListItem>
                    Relative Time - 0:{" "}
                    {intl.formatRelativeTime(0, "minute", { numeric: "auto", style: "long" })}
                </ListItem>
                <ListItem>
                    Large number (Currency):{" "}
                    {intl.formatNumber(1234567.89, { style: "currency", currency: "EUR" })}
                </ListItem>
                <ListItem>
                    Large number (Unit):{" "}
                    {intl.formatNumber(1234567.89, { style: "unit", unit: "kilogram-per-second" })}
                </ListItem>
                <ListItem>
                    Plural - Count 0: {intl.formatMessage({ id: "content.testplural" }, { n: 0 })}
                </ListItem>
                <ListItem>
                    Plural - Count 1: {intl.formatMessage({ id: "content.testplural" }, { n: 1 })}
                </ListItem>
                <ListItem>
                    Plural - Count 2: {intl.formatMessage({ id: "content.testplural" }, { n: 2 })}
                </ListItem>
                <ListItem>List: {intl.formatList(list, { type: "conjunction" })}</ListItem>
                <ListItem>
                    Gender - female:{" "}
                    {intl.formatMessage(
                        { id: "content.testgender" },
                        { gender: "female", name: name }
                    )}
                </ListItem>
                <ListItem>
                    Gender - male:{" "}
                    {intl.formatMessage(
                        { id: "content.testgender" },
                        { gender: "male", name: name }
                    )}
                </ListItem>
                <ListItem>
                    Gender - other:{" "}
                    {intl.formatMessage(
                        { id: "content.testgender" },
                        { gender: "other", name: name }
                    )}
                </ListItem>
            </UnorderedList>

            <Center mb={4}>
                <LocalePicker current={locale} locales={supportedLocales} />
            </Center>

            <Divider my={4} />

            <Text mb={4}>
                This component is from another package which does <em>not</em> support de-simple by
                itself:
            </Text>
            <SamplePackageComponent />
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
