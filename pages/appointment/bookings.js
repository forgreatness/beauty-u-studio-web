import React, { useState, useEffect } from 'react';
import Cookie from 'cookie'
import Jwt from 'jsonwebtoken';

import ApolloClient from '../../lib/apollo/apollo-client';
import { GET_APPOINTMENTS, GET_USER } from '../../lib/apollo/data-queries';
import PageLayout from '../../components/page-layout';
import styles from '../../styles/bookingspage.module.css';
import NonBootstrapAppointmentDetail from '../../components/non_bootstrap_appointment_details';
import { StatusColor } from '../../src/constants';

export default function ScheduledAppointments({ userDetail, appointments, error }) {
    const [filteredDate, setFilteredDate] = useState(new Date(new Date().setHours(0,0,0,0)));
    const [filteredStylist, setFilteredStylist] = useState();
    const [filteredAppointments, setFilteredAppointments] = useState({});

    const handleOnFilteredDateChange = (e) => {
        var zone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]

        const newFilteredDate = new Date(`${e.target.value} ${zone}`);

        setFilteredDate(newFilteredDate);
    }

    const handleOnFilteredStylistChange = (e) => {
        setFilteredStylist(e.target.value);
    }

    useEffect(() => {
        var appointmentsByStylist = {};

        appointments.forEach(appointment => {
            let appointmentDate = new Date(new Date(appointment.time).setHours(0,0,0,0));
            let appointmentKey = appointment.stylist.name.toString();

            if (appointmentDate.toDateString() === filteredDate.toDateString()) {
                if (Object.keys(appointmentsByStylist).includes(appointmentKey)) {
                    appointmentsByStylist[appointmentKey].push(appointment);
                } else {
                    appointmentsByStylist[appointmentKey] = [appointment];
                }
            }
        });

        setFilteredAppointments(appointmentsByStylist);
        setFilteredStylist(Object.keys(appointmentsByStylist)[0]);
    }, []);

    useEffect(() => {
        let queriedAppointments = {};
        appointments.forEach(appointment => {
            let appointmentDate = new Date(new Date(appointment.time).setHours(0,0,0,0));
            let appointmentKey = appointment.stylist.name.toString();

            if (appointmentDate.toDateString() === filteredDate.toDateString()) {
                queriedAppointments[appointmentKey] = [...(queriedAppointments[appointmentKey] ?? []), appointment];
            }
        });

        setFilteredAppointments(queriedAppointments);
        setFilteredStylist(Object.keys(queriedAppointments)[0]);
    }, [filteredDate]);

    return (
        <PageLayout userDetail = {userDetail}>
            <section id={styles.bookingsSection}>
                <h2 id={styles.bookingsSectionHeader}>Bookings</h2>
                <div id={styles.filterContainerWrapper}>
                    <div className={styles.filterContainer} id={styles.dateFilterContainer}>
                        <label htmlFor='dateFilter'>On Date</label>
                        <input type="date" id={styles.dateFilter} name="dateFilter" 
                            value={filteredDate.toISOString().split('T')[0]}
                            onChange={handleOnFilteredDateChange}/>
                    </div>
                    <div className={styles.filterContainer} id={styles.stylistFilterContainer}>
                        <h5 id={styles.stylistFilterLabel}>Stylist</h5>
                        {Object.keys(filteredAppointments).map(stylist => {
                            return (
                                <button onClick={handleOnFilteredStylistChange} aria-selected={filteredStylist==stylist} className={styles.stylistFilterOption} key={stylist} value={stylist}>{stylist}</button>
                            );
                        })}
                    </div>
                </div>
                <div id={styles.appointmentListWrapper}>
                    <h5 style={{ color: StatusColor["Confirmed"] }}>Confirmed</h5>
                    <div className={styles.appointmentList}>
                        {(filteredAppointments[filteredStylist] ?? []).filter(appointment => appointment?.status == "Confirmed").map(confirmedAppointment => {
                            return (
                                <NonBootstrapAppointmentDetail key={confirmedAppointment.id.toString()} appointment={confirmedAppointment} />
                            );
                        })}
                    </div>
                    <h5 style={{ color: StatusColor["Requested"] }}>Requested</h5>
                    <div className={styles.appointmentList}>
                        {(filteredAppointments[filteredStylist] ?? []).filter(appointment => appointment?.status == "Requested").map(confirmedAppointment => {
                            return (
                                <NonBootstrapAppointmentDetail key={confirmedAppointment.id.toString()} appointment={confirmedAppointment} />
                            );
                        })}
                    </div>
                    <h5 style={{ color: StatusColor["Cancelled"] }}>Cancelled</h5>
                    <div className={styles.appointmentList}>
                        {(filteredAppointments[filteredStylist] ?? []).filter(appointment => appointment?.status == "Cancelled").map(confirmedAppointment => {
                            return (
                                <NonBootstrapAppointmentDetail key={confirmedAppointment.id.toString()} appointment={confirmedAppointment} />
                            );
                        })}
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}

export async function getServerSideProps(context) { 
    try {
        const cookies = Cookie.parse(context.req.headers?.cookie ?? '');
        const authToken = cookies?.token;
        const payload = Jwt.decode(authToken);

        if (!payload || (payload?.exp ?? 0) * 1000 < Date.now() || payload?.role?.toLowerCase() != 'admin') {
            throw new Error('Invalid auth token');
        }

        const getUser = await ApolloClient.query({
            query: GET_USER,
            variables: {
                userId: payload.id
            },
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            }
        });

        const user = getUser?.data?.user;

        if (!user || user?.status != 'active') {
            throw new Error('Unable to verify credentials');
        }

        const getAppointments = await ApolloClient.query({
            query: GET_APPOINTMENTS,
            variables: {
                future: true
            },
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            },
            fetchPolicy: "network-only"
        });

        // const getAppointments = await ApolloClient.query({
        //     query: GET_APPOINTMENTS,
        //     variables: {
        //         future: false
        //     },
        //     context: {
        //         headers: {
        //             authorization: `Bearer ${authToken}`
        //         }
        //     },
        //     fetchPolicy: "network-only"
        // });

        const appointments = getAppointments?.data?.appointments;

        if (!appointments) {
            throw new Error('Unable to get appointments');
        }

        return {
            props: {
                appointments: appointments,
                userDetail: user
            }
        }
    } catch (err) {
        const reason = err.message.toLowerCase();

        if (reason == 'invalid auth token' || 'unable to get appointments') {
            return {
                notFound: true
            }
        } else {
            return {
                props: {
                    error: err
                }
            }
        }
    }
}