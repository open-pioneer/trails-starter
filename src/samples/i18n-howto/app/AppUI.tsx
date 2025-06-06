// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    Button,
    Container,
    Heading,
    HStack,
    Input,
    Stack,
    StackSeparator,
    Tag,
    Text,
    VStack
} from "@chakra-ui/react";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { useState } from "react";
import { Radio, RadioGroup } from "@open-pioneer/chakra-snippets/radio";
import { NumberInputField, NumberInputRoot } from "@open-pioneer/chakra-snippets/number-input";
import { GreetingService } from "./GreetingService";

export function AppUI() {
    const intl = useIntl();
    return (
        <Container maxWidth="xl">
            <Heading as="h1" size="lg">
                {intl.formatMessage({ id: "heading" })}
            </Heading>
            <Text>{intl.formatMessage({ id: "text" })}</Text>
            <ExampleStack></ExampleStack>
        </Container>
    );
}

function ExampleStack() {
    return (
        <Stack
            mb={5}
            mt={5}
            separator={<StackSeparator borderColor="gray.200" />}
            gap="24px"
            align="stretch"
        >
            <Box bg="white" w="100%" p={4} color="black" borderWidth="1px" borderColor="black">
                <InterpolationExample></InterpolationExample>
            </Box>
            <Box bg="white" w="100%" p={4} color="black" borderWidth="1px" borderColor="black">
                <PluralsExample></PluralsExample>
            </Box>
            <Box bg="white" w="100%" p={4} color="black" borderWidth="1px" borderColor="black">
                <SelectionExample></SelectionExample>
            </Box>
            <Box bg="white" w="100%" p={4} color="black" borderWidth="1px" borderColor="black">
                <NumberFormatExample></NumberFormatExample>
            </Box>
            <Box bg="white" w="100%" p={4} color="black" borderWidth="1px" borderColor="black">
                <DateTimeFormatExample></DateTimeFormatExample>
            </Box>
            <Box bg="white" w="100%" p={4} color="black" borderWidth="1px" borderColor="black">
                <RichTextExample></RichTextExample>
            </Box>
            <Box bg="white" w="100%" p={4} color="black" borderWidth="1px" borderColor="black">
                <ServiceI18nExample />
            </Box>
        </Stack>
    );
}

function InterpolationExample() {
    const intl = useIntl();
    const [value, setValue] = useState("");
    return (
        <>
            <Heading as="h4" size="md">
                {intl.formatMessage({ id: "interpolation.heading" })}
            </Heading>
            <Input
                value={value}
                onChange={(evt) => setValue(evt.target.value)}
                placeholder={intl.formatMessage({ id: "interpolation.placeholder" })}
                size="sm"
            />
            <Text mb="8px">
                {intl.formatMessage({ id: "interpolation.value" }, { name: value })}
            </Text>
        </>
    );
}

function PluralsExample() {
    const intl = useIntl();
    const [value, setValue] = useState<string | null>("1");
    return (
        <>
            <Heading as="h4" size="md">
                {intl.formatMessage({ id: "plurals.heading" })}
            </Heading>
            <RadioGroup onValueChange={(e) => setValue(e.value)} value={value}>
                <Stack gap={4} direction="row">
                    <Radio value="0">0</Radio>
                    <Radio value="1">1</Radio>
                    <Radio value="42">42</Radio>
                    <Radio value="99">99</Radio>
                </Stack>
            </RadioGroup>
            <Text mb="8px">{intl.formatMessage({ id: "plurals.value" }, { n: value })}</Text>
        </>
    );
}

function SelectionExample() {
    const intl = useIntl();
    const [value1, setValue1] = useState("");
    const [value2, setValue2] = useState<string | null>("male");
    return (
        <>
            <Heading as="h4" size="md">
                {intl.formatMessage({ id: "selection.heading" })}
            </Heading>
            <Input
                value={value1}
                onChange={(evt) => setValue1(evt.target.value)}
                placeholder={intl.formatMessage({ id: "interpolation.placeholder" })}
                size="sm"
                mb={"5px"}
            />
            <RadioGroup onValueChange={(e) => setValue2(e.value)} value={value2}>
                <Stack gap={4} direction="row">
                    <Radio value="female">
                        {intl.formatMessage({ id: "selection.gender.female" })}
                    </Radio>
                    <Radio value="male">
                        {intl.formatMessage({ id: "selection.gender.male" })}
                    </Radio>
                    <Radio value="other">
                        {intl.formatMessage({ id: "selection.gender.other" })}
                    </Radio>
                </Stack>
            </RadioGroup>
            <Text mb="8px">
                {intl.formatMessage({ id: "selection.value" }, { name: value1, gender: value2 })}
            </Text>
        </>
    );
}

function NumberFormatExample() {
    const intl = useIntl();
    const [value, setValue] = useState("2334232.24");
    return (
        <>
            <Heading as="h4" size="md">
                {intl.formatMessage({ id: "numberformat.heading" })}
            </Heading>
            <NumberInputRoot
                onValueChange={(valueChangeDetails) => {
                    setValue(valueChangeDetails.value);
                }}
                value={value}
                step={0.25}
                formatOptions={{
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    useGrouping: false
                }}
            >
                <NumberInputField />
            </NumberInputRoot>
            <Text mb="8px">
                {intl.formatMessage({ id: "numberformat.example.currency1" })}
                {intl.formatNumber(+value, { style: "currency", currency: "EUR" })}
            </Text>
            <Text mb="8px">
                {intl.formatMessage({ id: "numberformat.example.currency2" })}
                {intl.formatNumber(+value, {
                    style: "currency",
                    currency: "EUR",
                    currencyDisplay: "name"
                })}
            </Text>
            <Text mb="8px">
                {intl.formatMessage({ id: "numberformat.example.unit1" })}
                {intl.formatNumber(+value, { style: "unit", unit: "terabyte-per-second" })}
            </Text>
            <Text mb="8px">
                {intl.formatMessage({ id: "numberformat.example.unit2" })}
                {intl.formatNumber(+value, {
                    style: "unit",
                    unit: "terabyte-per-second",
                    unitDisplay: "long"
                })}
            </Text>
        </>
    );
}

function DateTimeFormatExample() {
    const intl = useIntl();
    const [value, setValue] = useState("2023-02-19T19:02");
    return (
        <>
            <Heading as="h4" size="md">
                {intl.formatMessage({ id: "datetimeformat.heading" })}
            </Heading>
            <Input
                value={value}
                onChange={(evt) => setValue(evt.target.value)}
                size="md"
                type="datetime-local"
            />
            <Text mb="8px">
                {intl.formatMessage({ id: "datetimeformat.timelabel" })}
                {intl.formatDate(value, { dateStyle: "full", timeStyle: "short" })}
            </Text>
            <Text mb="8px">
                {intl.formatMessage({ id: "datetimeformat.relativetimelabel" })}
                {intl.formatRelativeTime(getDeltaTime(value), "minute", {
                    numeric: "auto",
                    style: "long"
                })}
            </Text>
        </>
    );
}

function RichTextExample() {
    const intl = useIntl();

    return (
        <>
            <Heading as="h4" size="md">
                {intl.formatMessage({ id: "richtext.heading" })}
            </Heading>
            <VStack gap={2} align="start">
                <Box>
                    {intl.formatRichMessage(
                        { id: "richtext.messageWithReactNode" },
                        {
                            element: (
                                <Tag.Root>
                                    <Tag.Label>Hi</Tag.Label>
                                </Tag.Root>
                            )
                        }
                    )}
                </Box>
                <Box>
                    {intl.formatRichMessage({
                        id: "richtext.messageWithInlineCode"
                    })}
                </Box>
                <Box>
                    {intl.formatRichMessage(
                        {
                            id: "richtext.messageWithReactTag"
                        },
                        {
                            customTag: (parts) => (
                                <Box display="inline-block" background="trails.200" px={1}>
                                    {parts}
                                </Box>
                            )
                        }
                    )}
                </Box>
            </VStack>
        </>
    );
}

function ServiceI18nExample() {
    const intl = useIntl();
    const greetingService = useService<GreetingService>("i18n-howto-app.GreetingService");
    const [inputValue, setInputValue] = useState("");
    const [greeting, setGreeting] = useState("");
    return (
        <>
            <Heading as="h4" size="md">
                {intl.formatMessage({ id: "serviceI18n.heading" })}
            </Heading>
            <HStack
                as="form"
                onSubmit={(e) => {
                    e.preventDefault();

                    const name = inputValue.trim();
                    if (name) {
                        setGreeting(greetingService.greet(name));
                    } else {
                        setGreeting("");
                    }
                }}
            >
                <Input
                    placeholder={intl.formatMessage({ id: "serviceI18n.placeholder" })}
                    value={inputValue}
                    onChange={(evt) => setInputValue(evt.target.value)}
                    size="md"
                />
                <Button type="submit" flexShrink={0}>
                    {intl.formatMessage({ id: "serviceI18n.showGreeting" })}
                </Button>
            </HStack>
            {greeting && (
                <Text>
                    {intl.formatMessage({ id: "serviceI18n.serviceResponse" })} {greeting}
                </Text>
            )}
        </>
    );
}

function getDeltaTime(datetime: string): number {
    const delta = new Date(datetime).getTime() - new Date().getTime();
    return Math.round(delta / 60000);
}
