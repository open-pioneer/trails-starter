// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, chakra, Text } from "@chakra-ui/react";
import { useCommonComponentProps, CommonComponentProps } from "@open-pioneer/react-utils";
import { useIntl } from "open-pioneer:react-hooks";
import { FC } from "react";

export interface SimpleUiComponentProps extends CommonComponentProps {
    textToShow: string;
}

export const SimpleUiComponent: FC<SimpleUiComponentProps> = (props) => {
    const { textToShow } = props;
    const { containerProps } = useCommonComponentProps("simple-ui", props);
    const { formatMessage } = useIntl();
    return (
        <Box {...containerProps} border="1.5px solid" textAlign={"center"}>
            <chakra.p>{textToShow}</chakra.p>
            <Text>{formatMessage({ id: "simpleComponentText" })}</Text>
        </Box>
    );
};
