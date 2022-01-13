import React, { useState, useEffect } from 'react';
import Jwt from 'jsonwebtoken';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import styles from '../styles/profilepage.module.css';
import Layout from '../components/page-layout.js';
import ApolloClient from '../lib/apollo/apollo-client.js';
import { GET_USER, GET_APPOINTMENTS } from '../lib/apollo/data-queries.js';
import AppointmentDetail from '../components/appointment_details';
import client from '../lib/apollo/apollo-client.js';

/* Purpose 
* If the user is a client: they should only be able to see their contact information, and past bookings, and upcoming bookings
* If the user is a stylist: they should be able to see their work schedule, their upcoming appointments, pass appointments, upcoming bookings and past bookings
*/
export default function ProfilePage({ userDetails, clientAppointments, userAppointments }) {
    const [profileImage, setProfileImage] = useState("/images/profile_icon.png");
    const [clientAppointmentsTimeframe, setClientAppointmentsTimeframe] = useState('UPCOMING');
    const [upcomingClientAppointments, setUpcomingClientAppointments] = useState([]);
    const [previousClientAppointments, setPreviousClientAppointments] = useState([]);
    const [clients, setClients] = useState([]);

    const handleClientAppointmentsTimeframeChange = (e, newValue) => {
        setClientAppointmentsTimeframe(newValue);
    }

    useEffect(() => {
        if (userDetails.photo) {
            setProfileImage("data:image/png;base64, " + userDetails.photo);
        }

        let previousClients = [];
        let upcomingClients = [];

        clientAppointments.forEach(appointment => {
            let when = new Date(appointment.time);

            if (when < Date.now()) {
                previousClients.push(appointment);
            } else {
                upcommingClients.push(appointment);
            }
        });

        setUpcomingClientAppointments(upcomingClients);
        setPreviousClientAppointments(previousClients);
    }, []);

    useEffect(() => {
        if (clientAppointmentsTimeframe == "UPCOMING") {
            setClients(upcomingClientAppointments);
        } else {
            setClients(previousClientAppointments);
        }
    }, clientAppointmentsTimeframe);

    return (
        <Layout>
            <div className={styles.profilePage}>
                <div className={styles.profile}>
                    <div className={styles.profileAligner}>
                        <img className={styles.profilePicture} alt="user image" src={profileImage} />
                        <div className={styles.profileInfo}>
                            <h2>{userDetails.name}</h2>
                            <ul className={styles.profileContact}>
                                <li>
                                    <a href={"mailto:" + userDetails.email}>
                                        <EmailIcon className={styles.icon} />
                                        {userDetails.email}
                                    </a>
                                </li>
                                <li>
                                    <a href={"tel:" + userDetails.phone}>
                                        <PhoneIcon className={styles.icon} />
                                        {userDetails.phone}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div id={styles.appointmentContent}>
                    <div id={styles.clientAppointments}>
                        <h2>CLIENTS APPOINTMENT</h2>
                        <Tabs value={clientAppointmentsTimeframe} onChange={handleClientAppointmentsTimeframeChange} textColor="primary" indicatorColor="primary" aria-label="select appointments based on upcoming or past">
                            <Tab value="UPCOMING" label="UPCOMING" />
                            <Tab value="PREVIOUS" label="PREVIOUS" />
                        </Tabs>
                        <div className={styles.appointmentList}>
                            {clients.map(client => {
                                return (
                                    <AppointmentDetail className={styles.appointmentDetail} appointment={client} isClient={false} />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export async function getServerSideProps(context) {
    const authToken = context.req.cookies.token;
    let redirect = false;

    // We can look at the token to see what type of account this is so that we can present the right data to the profile page
    // Decode the token to get the payload
    // Then get all information related to the user
    // If account = client -> just get appointments which they have booked
    // If account = stylist
    // -----> Get their work schedule
    // -----> Get their sheduled appointments
    // -----> Get their personal bookings

    const payload = Jwt.decode(authToken);

    if (!payload) {
        redirect = true;
    } else {
        if (Date.now() > payload.exp * 1000) {
            redirect = true;
        }
    }

    // Redirect user to login if user is not yet authenticated
    if (redirect) {
        return {
            redirect: {
                destination: '/authenticate',
                permanent: false
            }
        }
    }

    let userDetails = {};
    let clientAppointments = [];
    let userAppointments = [];
    let workSchedule;

    try {
        userDetails = await ApolloClient.query({
            query: GET_USER,
            variables: {
                userId: payload.id
            },
            context: {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
        });

        userDetails = userDetails.data.user;

        userAppointments = await ApolloClient.query({
            query: GET_APPOINTMENTS,
            variables: {
                query: {
                    client: payload.id
                }
            },
            context: {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
        });

        userAppointments = userAppointments.data.appointments;


        if (payload.role.toLowerCase() == 'stylist') {
            clientAppointments = await ApolloClient.query({
                query: GET_APPOINTMENTS,
                variables: {
                    query: {
                        stylist: payload.id
                    }
                },
                context: {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            });

            clientAppointments = clientAppointments.data.appointments;
        }

    } catch (err) {
        // Redirect the user to login page
    }

    return {
        props: {
            userDetails,
            clientAppointments,
            userAppointments
        }
    }
}