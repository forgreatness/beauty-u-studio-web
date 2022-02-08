import React, { useState, useEffect } from 'react';
import Jwt from 'jsonwebtoken';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Container from '@mui/material/Container';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useQuery, useMutation, useApolloClient, from } from '@apollo/client';
import Cookie from 'cookie';

import styles from '../styles/profilepage.module.css';
import Layout from '../components/page-layout.js';
import ApolloClient from '../lib/apollo/apollo-client.js';
import { GET_USER, GET_APPOINTMENTS } from '../lib/apollo/data-queries.js';
import AppointmentDetail from '../components/appointment_details';

/* Purpose 
* If the user is a client: they should only be able to see their contact information, and past bookings, and upcoming bookings
* If the user is a stylist: they should be able to see their work schedule, their upcoming appointments, pass appointments, upcoming bookings and past bookings
*/
export default function ProfilePage({ userDetails, error }) {
    const apolloClient = useApolloClient();
    const [profileImage, setProfileImage] = useState("/images/profile_icon.png");
    const [clientAppointmentsTimeframe, setClientAppointmentsTimeframe] = useState('UPCOMING');
    const [upcomingClientAppointments, setUpcomingClientAppointments] = useState([]);
    const [previousClientAppointments, setPreviousClientAppointments] = useState([]);
    const [applicationError, setApplicationError] = useState("");
    const [showAppError, setShowAppError] = useState(false);
    const [clients, setClients] = useState([]);

    const userAppointments = useQuery(GET_APPOINTMENTS, {
        variables: {
            query: {
                client: userDetails?.id
            }
        },
        onError: (err) => {
            if (err) {
                setApplicationError("Unable to fetch data");
                setShowAppError(true);
            }
        }
    });

    const handleClientAppointmentsTimeframeChange = (e, newValue) => {
        setClientAppointmentsTimeframe(newValue);
    }

    useEffect(async () => {
        if (error) {
            setApplicationError(error);
            setShowAppError(true);
            return;
        }

        if (userDetails?.photo) {
            setProfileImage("data:image/png;base64, " + userDetails.photo);
        }

        if ((userDetails?.role ?? '').toLowerCase() == 'stylist') {
            try {
                const { data } = await apolloClient.query({
                    query: GET_APPOINTMENTS, 
                    variables: {
                        query: {
                            stylist: userDetails?.id
                        }
                    }
                });

                if (!data) {
                    throw new Error("No clients appointment");
                }

                let previousClients = [];
                let upcomingClients = [];

                data.appointments.forEach(appointment => {
                    let when = new Date(appointment.time);
        
                    if (when < Date.now()) {
                        previousClients.push(appointment);
                    } else {
                        upcomingClients.push(appointment);
                    }
                });

                setUpcomingClientAppointments(upcomingClients);
                setPreviousClientAppointments(previousClients);
            } catch (err) {
                console.log(err);
                setApplicationError("Unable to fetch data");
                setShowAppError(true);
            }
        }
    }, []);

    useEffect(() => {
        if (clientAppointmentsTimeframe == "UPCOMING") {
            setClients(upcomingClientAppointments);
        } else {
            setClients(previousClientAppointments);
        }
    }, [clientAppointmentsTimeframe]);

    useEffect(() => {
        if (clientAppointmentsTimeframe == "UPCOMING") {
            setClients(upcomingClientAppointments);
        } else {
            setClients(previousClientAppointments);
        }
    }, [upcomingClientAppointments, previousClientAppointments])

    return (
        <Layout userDetail={userDetails}>
            <div className={styles.profilePage}>
                <div className={styles.profile}>
                    <div className={styles.profileAligner}>
                        <img className={styles.profilePicture} alt="user image" src={profileImage} />
                        <div className={styles.profileInfo}>
                            <h2>{userDetails?.name}</h2>
                            <ul className={styles.profileContact}>
                                <li>
                                    <a href={"mailto:" + userDetails?.email}>
                                        <EmailIcon className={styles.icon} />
                                        {userDetails?.email}
                                    </a>
                                </li>
                                <li>
                                    <a href={"tel:" + userDetails?.phone}>
                                        <PhoneIcon className={styles.icon} />
                                        {userDetails?.phone}
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
            <Container maxWidth="xs" className={styles.error_alert}>
                <Collapse in={showAppError}>
                    <Alert
                        severity="error"
                        action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                            setShowAppError(false);
                            }}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                        }
                        sx={{ mb: 2 }}
                    >
                        <AlertTitle>Error</AlertTitle>
                        {applicationError}
                    </Alert>
                </Collapse>
            </Container>  
        </Layout>
    );
}

export async function getServerSideProps(context) {
    try {
        const cookies = Cookie.parse(context.req.headers?.cookie ?? '');
        const authToken = cookies?.token;
        const payload = Jwt.decode(authToken);

        // Redirect user to login if user is not yet authenticated
        // The user is at this point if token is invalid, expired, or does not exist
        if (!payload || Date.now() > payload.exp * 1000) {
            throw new Error('Invalid token');
        }


        const userDetails = await ApolloClient.query({
            query: GET_USER,
            variables: {
                userId: payload.id
            },
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                },
            },
            fetchPolicy: "no-cache"
        });

        if (!userDetails) {
            throw new Error('User does not exist');
        } else {
            if (userDetails.data.user.status.toLowerCase() == 'suspended') {
                throw new Error('User is suspended');
            }
        }

        return {
            props: {
                userDetails: userDetails.data.user
            }
        }
    } catch (err) {
        const reason = err.message;
        console.log(err);

        if (reason.toLowerCase() == 'user is suspended') {
            return {
                redirect: {
                    source: '/profile',
                    destination: '/info/suspended',
                    permanent: false
                }
            }
        } else if (reason.toLowerCase() == 'user does not exist' || reason.toLowerCase() == 'no user found' || reason.toLowerCase() == "invalid token") {
            context.res.setHeader(
                "Set-Cookie", [
                `token=; Max-Age=0`]
            );

            return {
                redirect: {
                    source: '/profile',
                    destination: '/authenticate',
                    permanent: false
                }
            }
        } else if (err.networkError && err.networkError.length > 0) {
            return {
                props: {
                    error: "Network Error"
                }
            }
        } else {
            return {
                props: {
                    error: "Unknown Error"
                }
            }
        }
    }
}