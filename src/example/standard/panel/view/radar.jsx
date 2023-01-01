import React, { useState, useEffect } from "react";

import { Radar, Pie } from "@ant-design/plots";
import { createRoot } from "react-dom/client";
import { Collapse, Layout } from 'antd';

export const DemoRadar = () => {
  const data = [
    {
      name: "G2",
      star: 10371
    },
    {
      name: "G6",
      star: 7380
    },
    {
      name: "F2",
      star: 7414
    },
    {
      name: "L7",
      star: 2140
    },
    {
      name: "X6",
      star: 660
    },
    {
      name: "AVA",
      star: 885
    },
    {
      name: "G2Plot",
      star: 1626
    }
  ];
  const config = {
    data: data.map((d) => ({ ...d, star: Math.sqrt(d.star) })),
    xField: "name",
    yField: "star",
    appendPadding: [0, 10, 0, 10],
    meta: {
      star: {
        alias: "star 数量",
        min: 0,
        nice: true,
        formatter: (v) => Number(v).toFixed(2)
      }
    },
    xAxis: {
      tickLine: null
    },
    yAxis: {
      label: false,
      grid: {
        alternateColor: "rgba(0, 0, 0, 0.04)"
      }
    },
    // 开启辅助点
    point: {
      size: 2
    },
    area: {}
  };
  return <Radar {...config} />;
};

const DemoPie = () => {
  const data = [
    {
      sex: "男",
      sold: 0.45
    },
    {
      sex: "女",
      sold: 0.55
    }
  ];
  const config = {
    appendPadding: 10,
    data,
    angleField: "sold",
    colorField: "sex",
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
    pieStyle: ({ sex }) => {
      if (sex === "男") {
        return {
          fill: "p(a)https://gw.alipayobjects.com/zos/antfincdn/FioHMFgIld/pie-wenli1.png"
        };
      }

      return {
        fill: "p(a)https://gw.alipayobjects.com/zos/antfincdn/Ye2DqRx%2627/pie-wenli2.png"
      };
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
      }]
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
      <DemoRadar />
    </Layout.Content>

  </Layout>;
}

export function renderDemoRadar(el) {
  const root = createRoot(el);
  root.render(
    < React.StrictMode>
      <DemoRadar />
      <DemoPie />
    </React.StrictMode>
  );
}
