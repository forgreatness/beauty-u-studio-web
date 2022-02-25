/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';
import { useEffect, useState } from 'react';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimerIcon from '@mui/icons-material/Timer';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

import { StatusColor } from '../src/constants/index';

export default function AppointmentDetail(props) {
    const [schedule, setSchedule] = useState();
    const [appointmentCost, setAppointmentCost] = useState();
    const [appointmentDuration, setAppointmentDuration] = useState();

    const styles = css`
        min-width: 350px;
        padding: 8px 15px;
        border: 2px solid ${StatusColor[props.appointment.status] ?? 'black'};
        border-radius: 8px;

        #serviceList {
            overflow: auto;
            -ms-overflow-style: none; /* for Internet Explorer, Edge */
            scrollbar-width: none; /* for Firefox */
        }

        #serviceList::-webkit-scrollbar {
            display: none;
        }
    `;

    const buttonStyle = {
        "&.MuiButton-root": {
            color: "blue"
        },
        "&.MuiButton-root:hover": {
            cursor: "pointer",
            opacity: 0.8
        },
        "&.MuiButton-confirm": {
            color: "white",
            border: "none",
            background: "black",
        },
        "&.MuiButton-decline": {
            color: "black",
            fontWeight: "bold"
        },
        "&.MuiButton-cancel": {
            color: "white",
            border: "none",
            background: "black",
        },
      };
      

    useEffect(() => {
        let totalPrice = 0;
        let totalDuration = 0;

        props.appointment.services.forEach(service => {
            totalPrice += parseFloat(service.price);
            totalDuration += service.time;
        });

        setSchedule(new Date(props.appointment.time));
        setAppointmentCost(totalPrice);
        setAppointmentDuration(totalDuration);
    }, []);

    function appointmentActions(type) {
        if (type.toLowerCase() == "requested") {
            return (
                [
                    <Button sx={buttonStyle} variant="decline">DECLINE</Button>,
                    <Button sx={buttonStyle} variant="confirm" onClick={() => props.onConfirmAppointment(props.appointment, props.requestPosition)}>CONFIRM</Button>
                ]
            );
        } else if (type.toLowerCase() == "confirmed") {
            return (
                [
                    <Button sx={buttonStyle} variant="cancel" onClick={() => props.onCancellingAppointment(props.appointment, props.requestPosition)}>CANCEL</Button> 
                ]
            )
        }
    }

    return (
        <div css={styles}>
            <h3>{(props.isClient) ? props.appointment.stylist.name : props.appointment.client.name}</h3>
            <Stack direction="row" spacing={2}>
                <div>
                    <p>
                        <EventIcon />
                        <span> </span>
                        {schedule?.toDateString() ?? ""}
                    </p>
                    <p>
                        <TimerIcon />
                        <span> </span>
                        {appointmentDuration} minutes
                    </p>
                </div>
                <div>
                    <p>
                        <AccessTimeIcon />
                        <span> </span>
                        {schedule?.toLocaleTimeString([], { hour: "2-digit", minute: '2-digit'}) ?? ""}
                    </p>
                    <p>
                        <AttachMoneyIcon />
                        <span> </span>
                        {appointmentCost} USD
                    </p>
                </div>
            </Stack>
            <Stack id="serviceList" direction="row" spacing={1}>
                {props.appointment.services.map(service => {
                    let serviceType = service.type.toLowerCase();

                    let serviceIcon = {
                        "spa & beauty": "beauty_icon.png",
                        nails: "nails_icon.png",
                        hair: "hair_icon.png",
                        eye: "eye_icon.png"
                    };

                    return (
                        <Chip key={service.id.toString()} label={service.name} variant="filled" color="info" avatar={<Avatar src={"/images/"+serviceIcon[serviceType]} />} />
                    );
                })}
            </Stack>
            <Stack mt={1} direction="row" spacing={1} justifyContent="flex-end">
                {appointmentActions(props.appointment.status)}
            </Stack>
        </div>
    );
}