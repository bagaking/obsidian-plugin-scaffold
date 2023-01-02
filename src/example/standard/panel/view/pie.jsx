import React, {useState, useEffect} from "react";

import {Radar, Pie} from "@ant-design/plots";
import {createRoot} from "react-dom/client";
import {Collapse, Layout} from 'antd';

const PieComponent = ({data, option}) => {
    data = data || []
    const config = {
        appendPadding: 10,
        angleField: option.value || "value",
        colorField: option.label || "label",
        radius: 0.8,
        legend: false,
        startAngle: Math.PI,
        endAngle: Math.PI * 1.5,
        label: {
            type: "inner",
            offset: "-50%",
            style: {
                fill: "#fff",
                fontSize: 18,
                textAlign: "center"
            }
        },
        pieStyle: ({fill}) => {
            if (!fill) {
                return
            }
            return {fill};
        },
        tooltip: false,
        interactions: [
            {
                type: "element-single-selected"
            },
            {
                type: "pie-legend-active"
            },
            {
                type: "element-active"
            }],
        data,
    };
    return <Pie {...config} />;
};

function CreateView() {
    return <Layout>
        <Layout.Header>

        </Layout.Header>
        <Layout.Content>
            <Collapse defaultActiveKey={['1']} onChange={onChange}>
                <Collapse.Panel header="This is panel header 1" key="1">
                    <p>{text}</p>
                </Collapse.Panel>
                <Collapse.Panel header="This is panel header 2" key="2">
                    <p>{text}</p>
                </Collapse.Panel>
                <Collapse.Panel header="This is panel header 3" key="3">
                    <p>{text}</p>
                </Collapse.Panel>
            </Collapse>
            <DemoRadar/>
        </Layout.Content>

    </Layout>;
}

export function RenderPie(el, data, option) {
    data = data || []
    const root = createRoot(el);
    root.render(
        <React.StrictMode>
            <PieComponent option={option} data={data}/>
        </React.StrictMode>
    );
}
