/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';
import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimerSharpIcon from '@mui/icons-material/TimerSharp';

export default function ServiceDetailCard({ service }) {
    const styles = css `
        background-color: #efebe9 !important;

        &::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        
        &::-webkit-scrollbar-track {
            background-color: transparent;
        }
        
        &::-webkit-scrollbar-thumb {
            background-color: var(--color-alpha);
            border-radius: 20px;
            border: 1px solid black;
            background-clip: content-box;
        }
        
        &t::-webkit-scrollbar-thumb:hover {
            background-color: #eeeeee;
        }
    `;

    return (
        <Card css={styles} sx={{ width: "100%", height: "250px", overflowY: "auto" }}>
            <CardHeader 
                sx={{ color: "#6d4c41" }}
                title={service.name} 
                subheader={<p><span style={{ color: "#9c27b0" }}><TimerSharpIcon /> {service.time} mins</span>&emsp;<span style={{ color: "green" }}><AttachMoneyIcon />{service.price} USD </span></p>}/>
            <CardContent>
                {service.description}
            </CardContent>
        </Card>
    );
}