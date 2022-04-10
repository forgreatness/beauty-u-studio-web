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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SellIcon from '@mui/icons-material/Sell';
import Tooltip from '@mui/material/Tooltip';

import { StatusColor } from '../src/constants/index';

export default function AppointmentDetail(props) {
    const [schedule, setSchedule] = useState();
    const [appointmentCost, setAppointmentCost] = useState();
    const [appointmentDuration, setAppointmentDuration] = useState();

    const styles = css`
        min-width: 350px;
        max-width: 450px;
        padding: 8px 15px;
        border: 2px solid ${StatusColor[props.appointment.status] ?? 'black'};
        border-radius: 8px;
        position: relative;

        #serviceList {
            overflow: auto;
            -ms-overflow-style: none; /* for Internet Explorer, Edge */
            scrollbar-width: none; /* for Firefox */
        }

        #serviceList::-webkit-scrollbar {
            display: none;
        }

        #promotion_container {
            position: absolute;
            top: 5px;
            right: 5px;
            color: #2e7d32;
        }

        #appointment_cost_details {
            color: ${props?.appointment?.discount ? '#ff8a65' : 'black'}
        }
    `;

    const buttonStyle = {
        "&.MuiButton-root": {
            color: "blue",
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
        "&.MuiButton-complete": {
            background: "#1b5e20",
            border: "none",
            color: "white"
        },
        "&.MuiButton-noshow": {
            color: "#d84315",
            fontWeight: "bold"
        }
    };
      

    useEffect(() => {
        let totalPrice = 0;
        let totalDuration = 0;

        props.appointment.services.forEach(service => {
            totalPrice += parseFloat(service.price);
            totalDuration += service.time;
        });

        totalPrice -= parseFloat(props?.appointment?.discount ?? 0);

        setSchedule(new Date(props.appointment.time));
        setAppointmentCost(totalPrice);
        setAppointmentDuration(totalDuration);
    }, []);

    function appointmentActions(type) {
        if (type.toLocaleLowerCase() == "requested") {
            return (
                [
                    <Button sx={buttonStyle} variant="decline" size="small" onClick={() => props.onRemoveAppointment(props.appointment, props.filteredIndex)}>DECLINE</Button>,
                    <Button sx={buttonStyle} variant="confirm" size="small" onClick={() => props.onUpdateAppointment(props.appointment, props.filteredIndex, "Confirmed")}>CONFIRM</Button>
                ]
            );
        } else if (type.toLocaleLowerCase() == "confirmed") {
            return (
                [
                    <Button sx={buttonStyle} variant="cancel" size="small" onClick={() => props.onUpdateAppointment(props.appointment, props.filteredIndex, "Cancelled")}>CANCEL</Button> 
                ]
            )
        } else if (type.toLocaleLowerCase() == 'recent') {
            return ([
                <Button sx={buttonStyle} variant="noshow" size="small" onClick={() => props.onUpdateAppointment(props.appointment, props.filteredIndex, "No Show")}>NO SHOW</Button>,
                <Button sx={buttonStyle} variant="complete" size="small" onClick={() => props.onUpdateAppointment(props.appointment, props.filteredIndex, "Completed")}>COMPLETED</Button>,
            ]);
        }
    }

    return (
        <div css={styles}>
            <h3>{(props?.isClient) ? props.appointment.stylist.name : props.appointment.client.name}</h3>
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
                    <p id="appointment_cost_details">
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
            {props?.appointment?.details 
                ? <Accordion sx={{ my: 2 }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="appointment_details"
                        id="appointment_details_header"
                        >
                    <Typography variant="h6">Additional Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Typography>
                        {props.appointment.details}
                    </Typography>
                    </AccordionDetails>
                </Accordion> : null}
            <Stack mt={1} direction="row" spacing={1} justifyContent="flex-end">
                {appointmentActions(props.appointment.status)}
            </Stack>
            {props?.appointment?.discount 
                ? <Tooltip title="Discount Applied">
                    <span id="promotion_container">
                        <SellIcon />
                        {props?.appointment?.discount} USD
                    </span>
                </Tooltip> : null
            }
        </div>
    );
}