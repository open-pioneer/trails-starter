// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { FC } from "react";
import { useCommonComponentProps, CommonComponentProps } from "@open-pioneer/react-utils";
import { Box, chakra } from "@chakra-ui/react";

export interface SimpleUiComponentProps extends CommonComponentProps {
    textToShow: string;
}

export const SimpleUiComponent: FC<SimpleUiComponentProps> = (props) => {
    const { textToShow } = props;
    const { containerProps } = useCommonComponentProps("simple-ui", props);
    return (
        <Box {...containerProps} border="1.5px solid" textAlign={"center"}>
            <chakra.p>{textToShow}</chakra.p>
        </Box>
    );
};
