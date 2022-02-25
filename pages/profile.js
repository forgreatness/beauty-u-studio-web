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
import { GET_USER, GET_APPOINTMENTS, UPDATE_APPOINTMENT } from '../lib/apollo/data-queries.js';
import AppointmentDetail from '../components/appointment_details';

/* Purpose 
* If the user is a client: they should only be able to see their contact information, and past bookings, and upcoming bookings
* If the user is a stylist: they should be able to see their work schedule, their upcoming appointments, past appointments, upcoming bookings and past bookings
*/
export default function ProfilePage({ userDetails, error }) {
    const apolloClient = useApolloClient();
    const [updateAppointment, { _ }] = useMutation(UPDATE_APPOINTMENT);
    //     {
    //     update: (cache, { data: { updatedAppointment } }) => {
    //         cache.modify({
    //             id: cache.identify(updatedAppointment),
    //             fields: {
    //                 client(_) {
    //                     return cache.identify(updatedAppointment.client);
    //                 },
    //                 stylist(_) {
    //                     return cache.identify(updatedAppointment.stylist);
    //                 },
    //                 services(_) {
    //                     return updatedAppointment.services.map(service => cache.identify(service));
    //                 },
    //                 time(_) {
    //                     return updatedAppointment.time;
    //                 },
    //                 status(_) {
    //                     return updatedAppointment.status;
    //                 }
    //             }
    //         });
    //     }
    // });

    const [profileImage, setProfileImage] = useState("/images/profile_icon.png");
    const [clientAppointmentsTimeframe, setClientAppointmentsTimeframe] = useState('UPCOMING');
    const [applicationError, setApplicationError] = useState("");
    const [showAppError, setShowAppError] = useState(false);
    const [requestedAppointments, setRequestedAppointments] = useState([]);
    const [confirmedAppointments, setConfirmedAppointments] = useState([]);
    const [cancelledAppointments, setCancelledAppointments] = useState([]);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [noShowAppointments, setNoShowAppointments] = useState([]);
    const [completedAppointments, setCompletedAppoinments] = useState([]);

    // const userAppointments = useQuery(GET_APPOINTMENTS, {
    //     variables: {
    //         query: {
    //             client: userDetails?.id
    //         }
    //     },
    //     onError: (err) => {
    //         if (err) {
    //             setApplicationError("Unable to fetch data");
    //             setShowAppError(true);
    //         }
    //     }
    // });

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

                let filteredAppointments = filterAppointments(data.appointments);

                setRequestedAppointments(filteredAppointments.requested);
                setConfirmedAppointments(filteredAppointments.confirmed);
                setCancelledAppointments(filteredAppointments.cancelled);
                setRecentAppointments(filteredAppointments.recent);
                setNoShowAppointments(filteredAppointments.noShow);
                setCompletedAppoinments(filteredAppointments.completed);
            } catch (err) {
                console.log(err);
                setApplicationError("Unable to fetch data");
                setShowAppError(true);
            }
        }
    }, []);

    // When status of an appointment changed. Couple of things we need to do:
    // 1) Update the local state. This should re-render the UI automatically
    // 2) update the cache to reflect this change
    // 3) Update the database
    const handleConfirmAppointment = async (appointment, index) => {
        try {
            if (appointment.status.toLowerCase() != "requested") {
                return;
            }

            // Update remote state (backend) and cache if backend is configured to return an object of that type
            let response = await updateAppointment({
                variables: {
                    appointmentID: appointment.id,
                    updatedAppointment: {
                        stylist: appointment.stylist.id,
                        client: appointment.client.id,
                        services: appointment.services.map(service => service.id),
                        time: appointment.time,
                        status: "Confirmed"
                    }
                },
            });

            // Update local state
            let allRequested = JSON.parse(JSON.stringify(requestedAppointments));
            let allConfirmed = JSON.parse(JSON.stringify(confirmedAppointments));
            allConfirmed.splice(findSortedIndex(allConfirmed, response.data.updatedAppointment), 0, response.data.updatedAppointment);
            allRequested.splice(index, 1);
            setRequestedAppointments(allRequested);
            setConfirmedAppointments(allConfirmed);
        } catch (err) {
            setApplicationError("There was a problem confirming the appointment");
            showAppError(true);
        }
    }

    const handleCancelAppointment = async (appointment, index) => {
        try {
            if (appointment.status.toLowerCase() != "confirmed") {
                return;
            }

            let response = await updateAppointment({
                variables: {
                    appointmentID: appointment.id,
                    updatedAppointment: {
                        stylist: appointment.stylist.id,
                        client: appointment.client.id,
                        services: appointment.services.map(service => service.id),
                        time: appointment.time,
                        status: "Cancelled"
                    }
                }
            });

            let allConfirmed = JSON.parse(JSON.stringify(confirmedAppointments));
            let allCancelled = JSON.parse(JSON.stringify(cancelledAppointments));
            allConfirmed.splice(index, 1);
            allCancelled.splice(findSortedIndex(allCancelled, response.data.updatedAppointment), 0, response.data.updatedAppointment);
            setConfirmedAppointments(allConfirmed);
            setCancelledAppointments(allCancelled);
        } catch (err) {
            setApplicationError("There was a problem cancelling the appointment");
            showAppError(true);
        }
    }

    const findSortedIndex = (appointments, appointment) => {
        let index = 0; 
        let appointmentTime = new Date(appointment.time);

        for (index = 0; index < appointments.length; index++) {
            let currentTime = new Date(appointments[index].time);

            if (currentTime >= appointmentTime) {
                break;
            }
        }

        return index;
    }

    const sortAppointmentAscending = (appointments) => {
        appointments.sort((a, b) => {
            let appointmentATime = new Date(a.time);
            let appointmentBTime = new Date(b.time);

            if (appointmentATime < appointmentBTime) {
                return -1;
            } else if (appointmentATime > appointmentBTime) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    const sortAppointmentsDescending = (appointments) => {
        appointments.sort((a, b) => {
            let appointmentATime = new Date(a.time);
            let appointmentBTime = new Date(b.time);

            if (appointmentATime < appointmentBTime) {
                return 1;
            } else if (appointmentATime > appointmentBTime) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    const filterAppointments = (appointments) => {
        let requested = [];
        let confirmed = [];
        let cancelled = [];
        let recent = [];
        let noShow = [];
        let completed = [];

        appointments.forEach(appointment => {
            let when = new Date(appointment.time);

            if (appointment.status.toLowerCase() == "requested") {
                if (when > Date.now()) {
                    requested.push(appointment);
                }
            } else if (appointment.status.toLowerCase() == "confirmed") {
                if (when >= Date.now()) {
                    confirmed.push(appointment);
                } else {
                    recent.push(appointment);
                }
            } else if (appointment.status.toLowerCase() == "cancelled") {
                if (when > Date.now()) {
                    cancelled.push(appointment);
                }
            } else if (appointment.status.toLowerCase() == "no show") {
                noShow.push(appointment);
            } else if (appointment.status.toLowerCase() == "completed") {
                completed.push(appointment);
            }

        });

        sortAppointmentAscending(requested);
        sortAppointmentAscending(confirmed);
        sortAppointmentAscending(cancelled);
        sortAppointmentsDescending(recent);
        sortAppointmentsDescending(noShow);
        sortAppointmentsDescending(completed);

        return {
            requested,
            confirmed,
            cancelled,
            recent,
            noShow,
            completed
        };
    }

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
                        {(clientAppointmentsTimeframe == "UPCOMING") 
                            ? (
                                <div id={styles.upcomingAppointments}>
                                    {
                                        (requestedAppointments?.length ?? 0 > 0) 
                                        ? [
                                            <h4 id={styles.requestedHeading} className={styles.appointmentsTypeHeading}>Requested</h4>,
                                            <div className={styles.appointmentList}>
                                                {requestedAppointments.map((requestedAppointment, index) => {
                                                    return (
                                                        <AppointmentDetail 
                                                            key={requestedAppointment.id.toString()} 
                                                            className={styles.appointmentDetail} 
                                                            onConfirmAppointment={handleConfirmAppointment}
                                                            requestPosition={index}
                                                            appointment={requestedAppointment} 
                                                            isClient={false} />
                                                    );
                                                })}
                                            </div> 
                                        ] : null
                                    }
                                    {
                                        (confirmedAppointments?.length ?? 0 > 0) 
                                        ? [
                                            <h4 id={styles.confirmedHeading} className={styles.appointmentsTypeHeading}>Confirmed</h4>,
                                            <div className={styles.appointmentList}>
                                                {confirmedAppointments.map((confirmedAppointment, index) => {
                                                    return (
                                                        <AppointmentDetail 
                                                            key={confirmedAppointment.id.toString()} 
                                                            className={styles.appointmentDetail} 
                                                            appointment={confirmedAppointment}
                                                            onCancellingAppointment={handleCancelAppointment}
                                                            requestPosition={index} 
                                                            isClient={false} />
                                                    );
                                                })}
                                            </div>
                                        ] : null
                                    }
                                    {
                                        (cancelledAppointments?.length ?? 0 > 0)
                                        ? [
                                            <h4 id={styles.cancelledHeading} className={styles.appointmentsTypeHeading}>Cancelled</h4>,
                                            <div className={styles.appointmentList}>
                                                {cancelledAppointments.map(cancelledAppointment => {
                                                    return (
                                                        <AppointmentDetail key={cancelledAppointment.id.toString()} className={styles.appointmentDetail} appointment={cancelledAppointment} isClient={false} />
                                                    );
                                                })}
                                            </div>
                                        ] : null
                                    }
                                </div>
                            ) : (
                                <div>

                                </div>
                            )
                        }
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