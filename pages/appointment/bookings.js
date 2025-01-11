import React, { useState, useEffect } from 'react';
import Cookie from 'cookie'
import Jwt from 'jsonwebtoken';
import { useQuery, gql, useApolloClient } from '@apollo/client';

import ApolloClient from '../../lib/apollo/apollo-client';
import { GET_APPOINTMENTS, GET_USER, GET_USERS } from '../../lib/apollo/data-queries';
import PageLayout from '../../components/page-layout';
import styles from '../../styles/bookingspage.module.css';
import NonBootstrapAppointmentDetail from '../../components/non_bootstrap_appointment_details';
import { StatusColor } from '../../src/constants';

export default function ScheduledAppointments({ userDetail, appointments, error }) {
    const [filteredDateStart, setFilteredDateStart] = useState(new Date(new Date().setHours(0,0,0,0)));
    const [filteredDateEnd, setFilteredDateEnd] = useState();
    const [filteredStylist, setFilteredStylist] = useState();
    const [filteredAppointments, setFilteredAppointments] = useState({}); //shouldn't this display all the apointments we want to list
    const [stylists, setStylists] = useState([]);
    const { data: usersData, loading: getUsersLoading, error: getUsersErrors } = useQuery(GET_USERS, {
        variables: {
            role: "stylist"
        },
        onCompleted: data => {
            console.log("data from GET_USERS", data);

            if (!data?.users) {
                return;
            }

            // We only want users whome are active and not anything else
            let stylists = Array.from(data.users).filter(stylist => (stylist?.status ?? "").toLowerCase() == 'active');

            setStylists(stylists);
        },
        onError: error => {
            // setAlertMessage('Unable to fetch promotions list');
            // setAlertStatus('error');
            // setShowAlert(true);
        },
        onLoading: loading => {
            console.log("loadding to useQuery(GET_USERS)");
        }
    });

    function handleFilterDateStartChange(e) {
        let selectedDateString = e.target.value;

        let [filteredYear, filteredMonth, filteredDay] = selectedDateString.split('-').map(Number);

        let newFilteredStartDate = new Date();
        newFilteredStartDate.setFullYear(filteredYear);
        newFilteredStartDate.setMonth(filteredMonth-1);
        newFilteredStartDate.setDate(filteredDay);
        newFilteredStartDate.setHours(0,0,0,0);

        if (isNaN(newFilteredStartDate)) {
            return;
        }

        setFilteredDateStart(newFilteredStartDate);
    }

    function handleFilterdDateEndChange(e) {
        let selectedDateString = e.target.value;

        let [filteredYear, filteredMonth, filteredDay] = selectedDateString.split('-').map(Number);

        let newFilteredEndDate = new Date();
        newFilteredEndDate.setFullYear(filteredYear);
        newFilteredEndDate.setMonth(filteredMonth-1);
        newFilteredEndDate.setDate(filteredDay);
        newFilteredEndDate.setHours(0,0,0,0);

        if (isNaN(newFilteredEndDate)) {
            return;
        } else {
            if (!isNaN(filteredDateStart) && newFilteredEndDate < filteredDateStart) {
                return;
            }
        }

        setFilteredDateEnd(newFilteredEndDate);
    }



    const handleOnFilteredStylistChange = (e) => {
        setFilteredStylist(e.target.value);
    }


    /*
        GOAL: THIS effect runt he filtration of the appointments we want to display: The filtration process can definitely be improved
    */
    useEffect(() => {
        // If there are any appointments we select the ones that has appointment.stylist.id == filteredStylist?.id 
        appointments.forEach(appointment => {
            let appointmentDate = new Date(new Date(appointment.time).setHours(0,0,0,0));

        });
    }, [filteredDateStart, filteredDateEnd, filteredStylist]);

    console.log("what is my filteredDateStart", filteredDateStart.toLocaleString());

    return (
        <PageLayout userDetail = {userDetail}>
            <section id={styles.bookingsSection}>
                <h2 id={styles.bookingsSectionHeader}>Bookings</h2>
                <div className='container-fluid' id={styles.filterContainerWrapper}>
                    {/* <div className={styles.filterContainer} id={styles.dateFilterContainer}>
                        <label htmlFor='dateFilter'>On Date</label>
                        <input type="date" id={styles.dateFilter} name="dateFilter" 
                            value={filteredDate.toISOString().split('T')[0]}
                            onChange={handleOnFilteredDateChange}/>
                    </div> */}
                    {/* <div className={styles.filterContainer} id={styles.dateFilterContainer}>
                        <h5>Filtered Date</h5>
                        <div className={styles.startDateFilter}>
                            <label htmlFor="startDateFilter">From</label>
                            <input type="date" id="startDateFilter" name="startDateFilter" onChange={handleFilterDateStartChange} value={filteredDateStart.toISOString().split('T')[0]} />
                        </div>
                        <div className={styles.endDateFilter}>
                            <label htmlFor="endDateFilter">To</label>
                            <input type="date" id="endDateFilter" name="endDateFilter" onChange={handleFilterdDateEndChange} value={filteredDateEnd?.toISOString()?.split('T')?.[0] ?? ''} />
                        </div>
                    </div> */}
                    <div className='container'>
                        <h3 className={`${styles.filterHeader} ${styles.neonText} mb-2 mb-md-3`}>Filtered Stylist</h3>
                        <div id={styles.filteredStylistOptionWrapper} className='row'>
                            <div className='col-sm-12 col-md-6 col-lg-4'>
                                {stylists.map(stylist => {
                                    return (
                                        <div className='card stylist' key={stylist.id.toLocaleString()}>
                                            <img src={"data:image/png;base64, " + stylist.photo} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    {/* <div className={styles.filterContainer} id={styles.stylistFilterContainer}>
                        <h5 id={styles.stylistFilterLabel}>Stylist</h5>
                        {Object.keys(filteredAppointments).map(stylist => {
                            return (
                                <button onClick={handleOnFilteredStylistChange} aria-selected={filteredStylist==stylist} className={styles.stylistFilterOption} key={stylist} value={stylist}>{stylist}</button>
                            );
                        })}
                    </div> */}
                </div>
                <div className='container-fluid' id={styles.appointmentListWrapper}>
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
        console.log('hi i would like to see context in booking.js', context);

        const cookies = Cookie.parse(context.req.headers?.cookie ?? '');
        const authToken = cookies?.token;
        const payload = Jwt.decode(authToken);

        // This check:
        /*
            1. If they are authenticated
            2. If their authentication is not expired
            3. If they have the appropriate roles
        */
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

        /*
            A token will allow acess to application to certain amount of time, if the access is reovke, either token need to be remove, or we need to check if
            it is revoke somewhere,
            Below we check revocation as user being removed from DB and not exist
        */
        const user = getUser?.data?.user;

        if (!user || user?.status != 'active') {
            throw new Error('Unable to verify credentials');
        }

        const getAppointments = await ApolloClient.query({
            query: GET_APPOINTMENTS,
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