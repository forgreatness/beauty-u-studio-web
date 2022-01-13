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

export default function AppointmentDetail({ appointment, isClient }) {
    const [schedule, setSchedule] = useState();
    const [appointmentCost, setAppointmentCost] = useState();
    const [appointmentDuration, setAppointmentDuration] = useState();

    const styles = css`
        min-width: 350px;
        padding: 8px 15px;
        border: 1px solid black;
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

    useEffect(() => {
        let totalPrice = 0;
        let totalDuration = 0;

        appointment.services.forEach(service => {
            totalPrice += parseFloat(service.price);
            totalDuration += service.time;
        });

        setSchedule(new Date(appointment.time));
        setAppointmentCost(totalPrice);
        setAppointmentDuration(totalDuration);
    }, []);

    return (
        <div css={styles}>
            <h3>{(isClient) ? appointment.stylist.name : appointment.client.name}</h3>
            <Stack direction="row" spacing={2}>
                <div>
                    <p>
                        <EventIcon />
                        {schedule?.toDateString() ?? ""}
                    </p>
                    <p>
                        <TimerIcon />
                        {appointmentDuration} minutes
                    </p>
                </div>
                <div>
                    <p>
                        <AccessTimeIcon />
                        {schedule?.toLocaleTimeString() ?? ""}
                    </p>
                    <p>
                        <AttachMoneyIcon />
                        {appointmentCost} USD
                    </p>
                </div>
            </Stack>
            <Stack id="serviceList" direction="row" spacing={1}>
                {appointment.services.map(service => {
                    let serviceType = service.type.toLowerCase();

                    let serviceIcon = {
                        "spa & beauty": "beauty_icon.png",
                        nails: "nails_icon.png",
                        hair: "hair_icon.png",
                        eye: "eye_icon.png"
                    };

                    return (
                        <Chip key={service.id} label={service.name} variant="filled" color="info" avatar={<Avatar src={"/images/"+serviceIcon[serviceType]} />} />
                    );
                })}
            </Stack>
        </div>
    );
}