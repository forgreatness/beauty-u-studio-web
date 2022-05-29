/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';
import { useState, useEffect } from 'react';

import { ServiceIcon, StatusColor } from '../src/constants';
 
export default function NonBootstrapAppointmentDetail ({ appointment }) {
    // const [clientName, setClientName] = useState("");
    // const [appointmentTime, setAppointmentTime] = useState("");
    // const [appointmentServices, setAppointmentServices] = useState([]);
    // const [appointmentPrice, setAppointmentPrice] = useState();
    // const [appointmentStatus, setAppointmentStatus] = useState();


    const styles = css `
        min-width: 300px;
        width: 350px;
        min-height: 300px;
        height: 300px;
        padding: 10px 20px;
        border: 1px solid ${StatusColor[appointment.status]};
        margin: auto;
    

        #textDetails {
            list-style: none;
            padding: 0px 0px;
        }

        #servicesWrapper {
            max-height: 30%;
            width: 100%;
        }

        #serviceList {
            overflow-y: auto;

        }

        .serviceDetails {
            font-family: 'Tiro Kannada', serif;
            border: 1px solid var(--color-alpha);
            color: #9fa8da;
            margin: 15px 15px;

            & > .serviceTypeIcon {
               width: 30px;
               height: 30px;
               border: 1px solid black;
               border-radius: 10% 30% 50% 70%;
               object-fit: contain;
               position: relative;
               top: -10px;
               left: -10px;
               z-index: 2;
               background-color: #fffde7;
            }
        }

        #serviceTime {
            display: inline-block;
        }
    `;

    const appointmentPrice = (appointment?.services ?? []).map(service => service.price).reduce((a, b) => a + b, 0);
    const appointmentTime = new Date(appointment?.time).toLocaleTimeString();

    return (
        <div css={styles}>
            <ul id="textDetails">
                <li>
                    <span><b>Client Name</b>&nbsp;{appointment.client.name}</span>    
                </li>
                <li>
                    <span><b>Time</b>&nbsp;{appointmentTime}</span>    
                </li>
                <li>
                    <span><b>Total</b>&nbsp;{appointmentPrice} {appointment?.discount ? `- ${appointment.discount} = ${appointmentPrice - appointment.discount}` : ""}</span>    
                </li>
            </ul>
            <div id='servicesWrapper'>
                <h6>Services</h6>
                <div id='serviceList'>
                    {appointment.services.map(service => {
                        return (
                            <div key={service.id.toString()} className="serviceDetails">
                                <img className="serviceTypeIcon" src={`/images/${ServiceIcon[service.type.toLowerCase()]}`} />
                                {service.name} &nbsp; <span id="serviceTime">{service.time} mins</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}