// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box } from "@chakra-ui/react";
import { Chart, useChart } from "@chakra-ui/charts";
import { LineChart, CartesianGrid, XAxis, YAxis, Line, Tooltip } from "recharts";

export function AppUI() {
    const chart = useChart({
        data: [
            { sale: 10, month: "January" },
            { sale: 95, month: "February" },
            { sale: 87, month: "March" },
            { sale: 88, month: "May" },
            { sale: 65, month: "June" },
            { sale: 90, month: "August" }
        ],
        series: [{ name: "sale", color: "teal.solid" }]
    });


    return (<Box  bg={"blue"} >
        
                    <Chart.Root  chart={chart} height="500px" width={"500px"}>
                        <LineChart data={chart.data}>
                            <CartesianGrid stroke={chart.color("border")} vertical={false} />
                            <XAxis
                                axisLine={false}
                                dataKey={chart.key("month")}
                                tickFormatter={(value) => value.slice(0, 3)}
                                stroke={chart.color("border")}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickMargin={10}
                                stroke={chart.color("border")}
                            />
                            <Tooltip
                                animationDuration={100}
                                cursor={false}
                                content={<Chart.Tooltip />}
                            />
                            {chart.series.map((item) => (
                                <Line
                                    key={item.name}
                                    isAnimationActive={false}
                                    dataKey={chart.key(item.name)}
                                    stroke={chart.color(item.color)}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            ))}
                        </LineChart>
                    </Chart.Root>

    </Box>

    );
}
