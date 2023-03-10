// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import {
    Container,
    Heading,
    Text,
    Input,
    Box,
    Stack,
    StackDivider,
    RadioGroup,
    Radio,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper
} from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import { useState } from "react";

export function AppUI() {
    const intl = useIntl();
    return (
        <Container>
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
            divider={<StackDivider borderColor="gray.200" />}
            spacing="24px"
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
    const [value, setValue] = useState("1");
    return (
        <>
            <Heading as="h4" size="md">
                {intl.formatMessage({ id: "plurals.heading" })}
            </Heading>
            <RadioGroup onChange={setValue} value={value}>
                <Stack spacing={4} direction="row">
                    <Radio size="md" value="0">
                        0
                    </Radio>
                    <Radio size="md" value="1">
                        1
                    </Radio>
                    <Radio size="md" value="42">
                        42
                    </Radio>
                    <Radio size="md" value="99">
                        99
                    </Radio>
                </Stack>
            </RadioGroup>
            <Text mb="8px">{intl.formatMessage({ id: "plurals.value" }, { n: value })}</Text>
        </>
    );
}

function SelectionExample() {
    const intl = useIntl();
    const [value1, setValue1] = useState("");
    const [value2, setValue2] = useState("male");
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
            />
            <RadioGroup onChange={setValue2} value={value2}>
                <Stack spacing={4} direction="row">
                    <Radio size="md" value="female">
                        {intl.formatMessage({ id: "selection.gender.female" })}
                    </Radio>
                    <Radio size="md" value="male">
                        {intl.formatMessage({ id: "selection.gender.male" })}
                    </Radio>
                    <Radio size="md" value="other">
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
    const [value, setValue] = useState("424224.24");
    return (
        <>
            <Heading as="h4" size="md">
                {intl.formatMessage({ id: "numberformat.heading" })}
            </Heading>
            <NumberInput
                onChange={(valueString) => setValue(valueString)}
                value={value}
                precision={2}
                step={0.25}
            >
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
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

function getDeltaTime(datetime: string): number {
    const delta = new Date(datetime).getTime() - new Date().getTime();
    return Math.round(delta / 60000);
}
