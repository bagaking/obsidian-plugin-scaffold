import React, {useState, useEffect} from "react";

import {Radar, Pie} from "@ant-design/plots";
import {createRoot} from "react-dom/client";
import {Collapse, Layout} from 'antd';

export const RadarComponent = ({data, option}) => {
    console.log("data = ", data, "option = ", option)
    data = data || []
    const axisConf = {
        xAxis: {
            tickLine: null
        },
        yAxis: {
            label: false,
            grid: {
                alternateColor: "rgba(0, 0, 0, 0.04)"
            }
        },
    }
    const config = {
        xField: "name",
        yField: "value",
        appendPadding: [0, 10, 0, 10],
        meta: {
            value: {
                alias: option.label || "value",
                min: 0,
                nice: true,
                formatter: (v) => Number(v).toFixed(2)
            }
        },
        // 开启辅助点
        point: {
            size: 2
        },
        area: {},
        // 数据
        data: data.map((d) => ({...d, value: (option.sqrt ? Math.sqrt : a => a )(d.value || d[label] || 0)})),
        ...axisConf,
    };
    return <Radar {...config} />;
};

export function RenderRadar(el, data, option) {
    data = data || []
    const root = createRoot(el);
    root.render(
        <React.StrictMode>
            <RadarComponent option={option} data={data}/>
        </React.StrictMode>
        // <DemoPie />
    );
}
