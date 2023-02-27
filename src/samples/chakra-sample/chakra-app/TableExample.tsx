// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer
} from "@open-pioneer/chakra-integration";

export function TableExampleComponent() {
    return (
        <TableContainer sx={{ border: "solid" }}>
            <Table variant="striped" colorScheme="teal">
                <TableCaption>This is the table cation</TableCaption>
                <Thead>
                    <Tr>
                        <Th>First</Th>
                        <Th>Test</Th>
                        <Th isNumeric>Third (numeric)</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td>one</Td>
                        <Td>bla</Td>
                        <Td isNumeric>22,3</Td>
                    </Tr>
                    <Tr>
                        <Td>two</Td>
                        <Td>blub</Td>
                        <Td isNumeric>23.4</Td>
                    </Tr>
                    <Tr>
                        <Td>three</Td>
                        <Td>blob</Td>
                        <Td isNumeric>12</Td>
                    </Tr>
                </Tbody>
            </Table>
        </TableContainer>
    );
}
