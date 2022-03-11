/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import TimerIcon from '@mui/icons-material/Timer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SellIcon from '@mui/icons-material/Sell';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useEffect, useState } from 'react';
import { StatusColor } from '../src/constants/index';

const ServiceIcon = {
    "spa & beauty": "beauty_icon.png",
    nails: "nails_icon.png",
    hair: "hair_icon.png",
    eye: "eye_icon.png"
}

const DateOption = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

export default function UserAppointmentDetail({ appointment, fitleredIndex, onEditAppointment, onRemoveAppointment }) {
    const [appointmentTime, setAppointmentTime] = useState();
    const [appointmentCost, setAppointmentCost] = useState();
    const [appointmentDuration, setAppointmentDuration] = useState();
    const [appointmentPromotion, setAppointmentPromotion] = useState();

    const styles = css`
        width: min(800px, 90%);
        min-height: 100px;
        display: flex;
        border: 3px solid ${StatusColor[appointment.status]};
        align-items: center;
        align-content: center;
        justify-content: flex-start;
        border-radius: 200px;


        #appointment_header {
            text-align: center;
            padding: 5px 5px;
            flex-grow: 1
        }

        #appointment_details {
            padding: 10px 5px;
            max-Width: 70%;
            min-widtH: 70%;
        }

        #appointment_special {
            text-align: center;
            flex-grow: 2;
        }

        #appointment_service_list {
            overflow: auto;
            padding: 0px 7px;
            -ms-overflow-style: none; /* for Internet Explorer, Edge */
            scrollbar-width: none; /* for Firefox */
        }

        #appointment_service_list::-webkit-scrollbar {
            display: none;
        }

        .service_chip {
            background-color: #e3f2fd;
        }

        p { 
            margin: 0;
        }
    `;

    useEffect(() => {
        let totalPrice = 0;
        let totalDuration = 0;

        appointment.services.forEach(service => {
            totalPrice += parseFloat(service.price);
            totalDuration += service.time;
        });

        setAppointmentTime(new Date(appointment.time));
        setAppointmentCost(totalPrice);
        setAppointmentDuration(totalDuration);
    }, []);

    function appointmentActions(type) {
        if (type.toLocaleLowerCase() == "requested") {
            return ([
                <Tooltip title="Remove Appointment">
                    <IconButton aria-label="delete" size="small" onClick={() => onRemoveAppointment(appointment, fitleredIndex)}>
                        <DeleteIcon fontSize="inherit"/>
                    </IconButton>
                </Tooltip>,
                <Tooltip title="Edit Appointment">
                    <IconButton aria-label="edit" size='small' onClick={() => onEditAppointment()}>
                        <EditIcon fontSize="inherit"/>
                    </IconButton>
                </Tooltip>
            ]);
        }
    }

    if (appointmentCost && appointmentDuration && appointmentTime) {
        return (
            <Container css={styles}>
                <div id="appointment_header">
                    <PersonIcon />
                    <h6>{appointment.stylist.name}</h6>
                    {appointmentActions(appointment.status)}
                </div>
                <Divider style={{ height: "100px", alignSelf: "center" }} orientation="vertical" flexItem />
                <div id="appointment_details">
                    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" alignContent="center">
                        <div>
                            <p>
                                <CalendarTodayIcon />
                                <span>&nbsp;{appointmentTime.toLocaleDateString("en-US", DateOption)}</span>
                            </p>
                            <p>
                                <TimerIcon />
                                <span>&nbsp;{appointmentDuration} mins</span>
                            </p>
                        </div>
                        <div>
                            <p>
                                <AccessTimeFilledIcon />
                                <span>&nbsp;{appointmentTime.toLocaleTimeString([], { hour: "2-digit", minute: '2-digit'}) ?? ""}</span>
                            </p>
                            <p>
                                <AttachMoneyIcon />
                                <span>&nbsp;{appointmentCost} USD</span>
                            </p>
                        </div>
                    </Stack>
                    <Stack id="appointment_service_list" direction="row" justifyContent="flex-start" alignItems="center" alignContent="center">
                        {appointment.services.map(service => {
                            let serviceLabel = service.name;
    
                            if (service?.kind?.type) {
                                serviceLabel += ` (${service.kind.type})`;
                            }
    
                            return <Chip size="small" className="service_chip" key={service.id.toString()} label={serviceLabel} variant="filled" avatar={<Avatar src={"/images/"+ServiceIcon[service.type.toLocaleLowerCase()]} />} />
                        })}
                    </Stack>
                </div>
                {(appointmentPromotion) ? <div id="appointment_special">
                    <SellIcon />
                </div> : null}
            </Container>
        );   
    } else {
        return null;
    }
}