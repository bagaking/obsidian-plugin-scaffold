import React, {useState, useEffect} from "react";
import {Divider, List, Typography, Button} from 'antd';
import {createRoot} from "react-dom/client";

const MenuComponent = ({data, option}) => {
    console.log("MenuComponent data", data)
    return <List
        size="small"
        split="false"
        header={option?.header ? <div>option?.header</div> : ""}
        footer={option?.footer ? <div>option?.footer</div> : ""}
        bordered
        dataSource={data}
        renderItem={(item) => <List.Item style={{width:"100%", height:"32px"}} onClick={item?.jump}
                                 // actions={[<Button onClick={item?.jump} type="dashed" size="small">Jump</Button>]}
            >{item?.label}</List.Item>}
    />
}

// @see: https://marcus.se.net/obsidian-plugin-docs/getting-started/react
export function RenderMenu(el, data, option) {
    data = data || []
    const root = createRoot(el);
    root.render(
        <React.StrictMode>
            <MenuComponent data={data} option={option}/>
        </React.StrictMode>
    );
}