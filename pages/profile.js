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
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { indigo, brown, blueGrey, grey } from '@mui/material/colors';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useQuery, useMutation, useApolloClient, useLazyQuery } from '@apollo/client';
import Cookie from 'cookie';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';


import styles from '../styles/profilepage.module.css';
import Layout from '../components/page-layout.js';
import ApolloClient from '../lib/apollo/apollo-client.js';
import { GET_USER, GET_APPOINTMENTS, UPDATE_APPOINTMENT, REMOVE_APPOINTMENT } from '../lib/apollo/data-queries.js';
import AppointmentDetail from '../components/appointment_details';
import UserAppointmentDetail from '../components//user_appointment_detail';
import { StatusColor, MonthLabel } from '../src/constants/index';
import { style } from '@mui/system';


/* Purpose 
* If the user is a client: they should only be able to see their contact information, and past bookings, and upcoming bookings
* If the user is a stylist: they should be able to see their work schedule, their upcoming appointments, past appointments, upcoming bookings and past bookings
*/
export default function ProfilePage({ userDetails, error }) {
    let now = new Date();
    let refetchClientsAppointment;
    
    const apolloClient = useApolloClient();
    const [getClientsAppointment, clientsAppointmentResult] = useLazyQuery(GET_APPOINTMENTS, {
        variables: {
            query: {
                stylist: userDetails?.id
            }
        },
        fetchPolicy: "network-only",
        onCompleted: data => {
            if (!data) {
                throw new Error("No clients appointment");
            }

            updateClientsAppointment(filterAppointments(data.appointments));

            refetchClientsAppointment = setInterval(async () => {
                try {
                    setOnLoadingNotification("Checking for new appointments");
                    setOnLoading(true);

                    let refetchedClientsAppointment = await clientsAppointmentResult.refetch();

                    if (!refetchedClientsAppointment) {
                        throw new Error("Unable to refetch clients appointment");
                    }

                    updateClientsAppointment(filterAppointments(refetchedClientsAppointment.data.appointments));
                } catch (err) {
                    console.log(err);
                    setApplicationError("Unable to refetch clients appointments");
                    setShowAppError(true);
                } finally {
                    setOnLoadingNotification("");
                    setOnLoading(false);
                }
            }, 450000);

            setOnLoading(false);
        },
        onError: () => {
            setApplicationError("Unable to get clients appointments");
            setShowAppError(true);
            setOnLoading(false);
        }
    });
    const [updateAppointment] = useMutation(UPDATE_APPOINTMENT);
    const [removeAppointment] = useMutation(REMOVE_APPOINTMENT, {
        update: (cache, { data: { removedAppointment } }) => {
            cache.evict({
                id: cache.identify(removedAppointment)
            });
        }
    });

    const [upcomingMonthFilter, setUpcomingMonthFilter] = useState(now.getMonth()+1);
    const [upcomingYearFilter, setUpcomingYearFilter] = useState(now.getFullYear());
    const [upcomingDayFilter, setUpcomingDayFilter] = useState('ALL');
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
    const [filteredUserAppointments, setFilteredUserAppointments] = useState();
    const [userAppointmentFilters, setUserAppointmentFilters] = useState();
    const [onLoading, setOnLoading] = useState(false);
    const [onLoadingNotification, setOnLoadingNotification] = useState("");

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

        try {
            setOnLoading(true);
            const userAppointments = await apolloClient.query({
                query: GET_APPOINTMENTS,
                variables: {
                    query: {
                        client: userDetails.id
                    }
                }
            });

            if (!userAppointments?.data?.appointments) throw new Error("Unable to get user Appointments");

            let filteredUserAppointments = filterAppointments(userAppointments.data.appointments);

            setFilteredUserAppointments(filteredUserAppointments);
        } catch (err) {
            setApplicationError("Unable get user and clients appointments");
            setShowAppError(true);
        } finally {
            setOnLoading(false);
        }

        if ((userDetails?.role ?? '').toLowerCase() == 'stylist') {
            setOnLoading(true);
            getClientsAppointment();
        }

        return () => {
            if (refetchClientsAppointment) clearInterval(refetchClientsAppointment);
        }
    }, []);

    // When status of an appointment changed. Couple of things we need to do:
    // 1) Update the local state. This should re-render the UI automatically
    // 2) update the cache to reflect this change
    // 3) Update the database
    const handleUpdateClientAppointment = async (appointment, index, newStatus) => {
        try {
            let response = await updateAppointment({
                variables: {
                    appointmentID: appointment.id,
                    updatedAppointment: {
                        stylist: appointment.stylist.id,
                        client: appointment.client.id,
                        services: appointment.services.map(service => service.id),
                        time: appointment.time,
                        status: newStatus
                    }
                }
            });

            if (!response) {
                throw new Error("Unable to update clients appointment");
            }

            // Update local state
            if (appointment.status.toLocaleLowerCase() == "requested") {
                let allRequested = JSON.parse(JSON.stringify(requestedAppointments));
                allRequested.splice(index, 1);
                setRequestedAppointments(allRequested);
            } else if (appointment.status.toLocaleLowerCase() == "confirmed") {
                let allConfirmed = JSON.parse(JSON.stringify(confirmedAppointments));
                allConfirmed.splice(index, 1);
                setConfirmedAppointments(allConfirmed);
            } else if (appointment.status.toLocaleLowerCase() == "recent") {
                let allRecent = JSON.parse(JSON.stringify(recentAppointments));
                allRecent.splice(index, 1);
                setRecentAppointments(allRecent);
            }

            // Update local state
            if (newStatus.toLocaleLowerCase() == "confirmed") {
                let allConfirmed = JSON.parse(JSON.stringify(confirmedAppointments));
                allConfirmed.splice(findSortedIndex(allConfirmed, response.data.updatedAppointment), 0, response.data.updatedAppointment);
                setConfirmedAppointments(allConfirmed);
            } else if (newStatus.toLocaleLowerCase() == "cancelled") {
                let allCancelled = JSON.parse(JSON.stringify(cancelledAppointments));
                allCancelled.splice(findSortedIndex(allCancelled, response.data.updatedAppointment), 0, response.data.updatedAppointment);
                setCancelledAppointments(allCancelled);
            } else if (newStatus.toLocaleLowerCase() == "no show") {
                let allNoShow = JSON.parse(JSON.stringify(noShowAppointments));
                allNoShow.splice(findSortedIndex(allNoShow, response.data.updatedAppointment), 0, response.data.updatedAppointment);
                setNoShowAppointments(allNoShow);
            } else if (newStatus.toLocaleLowerCase() == "completed") {
                let allCompleted = JSON.parse(JSON.stringify(completedAppointments));
                allCompleted.splice(findSortedIndex(allCompleted, response.data.updatedAppointment), 0, response.data.updatedAppointment);
                setCompletedAppoinments(allCompleted);
            }
        } catch (err) {
            setApplicationError("There was a problem updating the clients appointment");
            setShowAppError(true);
        }
    }

    const handleRemoveClientAppointment = async (appointment, index) => {
        try {
            let response = await removeAppointment({
                variables: {
                    appointmentID: appointment.id
                }
            });

            if (!response) {
                throw new Error("Unable to remove the appointment");
            }

            // Update local state
            if (appointment.status.toLocaleLowerCase() == "requested") {
                let allRequested = JSON.parse(JSON.stringify(requestedAppointments));
                allRequested.splice(index, 1);
                setRequestedAppointments(allRequested);
            }
        } catch (err) {
            setApplicationError("There was a problem removing the appointment");
            setShowAppError(true);
        }
    }

    // const handleDeclineAppointment = async (appointment, index) => {
    //     try {
    //         if (appointment.status.toLocaleLowerCase() == "requested") {
    //             let response = await removeAppointment({
    //                 variables: {
    //                     appointmentID: appointment.id
    //                 }
    //             });

    //             if (!response) {
    //                 throw new Error("Unable to remove the appointment");
    //             }

    //             let allRequested = JSON.parse(JSON.stringify(requestedAppointments));
    //             allRequested.splice(index, 1);
    //             setRequestedAppointments(allRequested);
    //         }
    //     } catch (err) {
    //         setApplicationError("There was a problem declining the appointment");
    //         setShowAppError(true);
    //     }
    // }

    const handleRemoveAppointment = async (appointment, index) => {
        try {
            if (appointment.status.toLocaleLowerCase() == "requested") {
                const response = await removeAppointment({
                    variables: {
                        appointmentID: appointment.id
                    }
                });

                if (!response) {
                    throw new Error("Unable to remove the appointment");
                }

                let allFilteredUserAppointments = JSON.parse(JSON.stringify(filteredUserAppointments));
                let filteredRequestedAppointments = allFilteredUserAppointments.requested;
                filteredRequestedAppointments.splice(index, 1);
                allFilteredUserAppointments.requested = filteredRequestedAppointments;
                setFilteredUserAppointments(allFilteredUserAppointments);
            }
        } catch (err) {
            setApplicationError("There was a problem removing the appointment");
            setShowAppError(true);
        }
    }

    const handleUserAppointmentFiltersChange = (e, filter) => {
        e.preventDefault();
        let updatedFilters = {
            ...userAppointmentFilters
        };

        if (!(userAppointmentFilters?.[filter] ?? false)) {
            updatedFilters[filter] = true;
        } else {
            delete updatedFilters[filter];
        }

        setUserAppointmentFilters(updatedFilters);
    }

    const handleUpcomingMonthFilterChange = (e) => {
        let today = new Date();

        if (upcomingYearFilter < today.getFullYear() || (upcomingYearFilter == today.getFullYear() && e.target.value < today.getMonth()+1)) {
            return;
        }

        setUpcomingMonthFilter(e.target.value);
    }

    const handleUpcomingDayFilterChange = (e) => {
        let today = new Date();

        if (upcomingYearFilter < today.getFullYear() || (upcomingYearFilter == today.getFullYear() && upcomingMonthFilter < today.getMonth()+1)) {
            return;
        }

        if (e.target.value != 'ALL') {
            today.setHours(0,0,0,0); //Set the date object to 12:00 AM to ignore the time of date object
    
            if (new Date(upcomingYearFilter, upcomingMonthFilter-1, e.target.value) < today) {
                return;
            }
        }

        setUpcomingDayFilter(e.target.value);
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
                    const recentAppointment = JSON.parse(JSON.stringify(appointment));
                    recentAppointment.status = "recent";
                    recent.push(recentAppointment);
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
            completed,
            "no show": noShow
        };
    }

    const updateClientsAppointment = (updatedAppointments) => {
        setRequestedAppointments(updatedAppointments.requested);
        setConfirmedAppointments(updatedAppointments.confirmed);
        setCancelledAppointments(updatedAppointments.cancelled);
        setRecentAppointments(updatedAppointments.recent);
        setNoShowAppointments(updatedAppointments["no show"]);
        setCompletedAppoinments(updatedAppointments.completed);
    }

    const getUpcomingDayFilterOption = () => {
        let dayFilterOption = [];
        let today = new Date();
        today.setHours(0,0,0,0);

        for(let i = 1; i <= new Date(upcomingYearFilter, upcomingMonthFilter, 0).getDate(); i++) {
            dayFilterOption.push(
                <MenuItem disabled={new Date(upcomingYearFilter, upcomingMonthFilter-1, i) < today} key={`${upcomingMonthFilter} ${i} ${upcomingYearFilter}`} value={i}>{i}</MenuItem>
            );
        }
        
        return dayFilterOption;
    }

    const filteredDateStart = new Date(upcomingYearFilter, upcomingMonthFilter-1, (upcomingDayFilter == 'ALL') ? 1 : upcomingDayFilter);
    const filteredDateEnd = (upcomingDayFilter == 'ALL') ? new Date(upcomingYearFilter, upcomingMonthFilter, 1) : new Date(upcomingYearFilter, upcomingMonthFilter-1, upcomingDayFilter+1)

    return (
        <Layout userDetail={userDetails}>
            {(userDetails.role.toLowerCase() == "stylist") ? (
            <div className={styles.profilePage}>
                <div className={styles.profile}>
                    <div className={styles.profileAligner}>
                        <div className={styles.profileHeader}>
                            <img className={styles.profilePicture} alt="user image" src={profileImage} />
                            <h2 className={styles.header}>{userDetails?.name}</h2>
                        </div>
                        <div className={styles.profileInfo}>
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
                        <h2 className={styles.header}>CLIENTS APPOINTMENT</h2>
                        <Tabs value={clientAppointmentsTimeframe} onChange={handleClientAppointmentsTimeframeChange} textColor="primary" indicatorColor="primary" aria-label="select appointments based on upcoming or past">
                            <Tab value="UPCOMING" label="UPCOMING" />
                            <Tab value="PREVIOUS" label="PREVIOUS" />
                        </Tabs>
                        {(clientAppointmentsTimeframe == "UPCOMING") 
                            ? (
                                <div id={styles.upcomingAppointments}>
                                    <Stack id={styles.dateFilter} direction="row" spacing={2}>
                                        <Box sx={{ minWidth: 120 }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="month_filter_input">Month</InputLabel>
                                                <Select
                                                    labelId="month_filter_input"
                                                    id={styles.month_filter_input}
                                                    value={upcomingMonthFilter}
                                                    label="Month"
                                                    onChange={handleUpcomingMonthFilterChange}>
                                                    {MonthLabel.map((month, index) => {
                                                        return (
                                                            <MenuItem disabled={(upcomingYearFilter < now.getFullYear() || (upcomingYearFilter == now.getFullYear() && index < now.getMonth()))} 
                                                                key={month} value={index+1}>{month}</MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Box sx={{ minWidth: 100 }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="day_filter_input">Day</InputLabel>
                                                <Select
                                                    labelId="day_filter_input"
                                                    id={styles.day_filter_input}
                                                    value={upcomingDayFilter}
                                                    label="Day"
                                                    onChange={handleUpcomingDayFilterChange}>
                                                    {[
                                                        <MenuItem key={`${upcomingMonthFilter} ALL ${upcomingYearFilter}`} value='ALL'>ALL</MenuItem>
                                                    ].concat(getUpcomingDayFilterOption())}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Box sx={{ minWidth: 100}}>
                                            <FormControl fullWidth>
                                                <InputLabel id="year_filter_input">Year</InputLabel>
                                                <Select
                                                    labelId="year_filter_input"
                                                    id={styles.year_filter_input}
                                                    value={upcomingYearFilter}
                                                    label="Year"
                                                    onChange={(e) => setUpcomingYearFilter(e.target.value)}>
                                                    <MenuItem value={now.getFullYear()}>{now.getFullYear()}</MenuItem>
                                                    <MenuItem value={now.getFullYear()+1}>{now.getFullYear()+1}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Stack>
                                    {
                                        (requestedAppointments?.length ?? 0 > 0) 
                                        ? [
                                            <h4 id={styles.requestedHeading} className={styles.appointmentsTypeHeading}>Requested</h4>,
                                            <div className={styles.appointmentList}>
                                                {requestedAppointments.map((requestedAppointment, index) => {
                                                    let appointmentDate = new Date(requestedAppointment.time);
                                                    
                                                    if (appointmentDate >= filteredDateStart && appointmentDate < filteredDateEnd) {
                                                        return (
                                                            <AppointmentDetail 
                                                                key={requestedAppointment.id.toString()} 
                                                                className={styles.appointmentDetail}
                                                                onUpdateAppointment={handleUpdateClientAppointment}
                                                                onRemoveAppointment={handleRemoveClientAppointment} 
                                                                filteredIndex={index}
                                                                appointment={requestedAppointment} 
                                                                isClient={false} />
                                                        );
                                                    }

                                                    return;
                                                }).filter(appointment => appointment != null)}
                                            </div> 
                                        ] : null
                                    }
                                    {
                                        (confirmedAppointments?.length ?? 0 > 0) 
                                        ? [
                                            <h4 id={styles.confirmedHeading} className={styles.appointmentsTypeHeading}>Confirmed</h4>,
                                            <div className={styles.appointmentList}>
                                                {confirmedAppointments.map((confirmedAppointment, index) => {
                                                    let appointmentDate = new Date(confirmedAppointment.time);
                                                    
                                                    if (appointmentDate >= filteredDateStart && appointmentDate < filteredDateEnd) {
                                                        return (
                                                            <AppointmentDetail 
                                                                key={confirmedAppointment.id.toString()} 
                                                                className={styles.appointmentDetail} 
                                                                appointment={confirmedAppointment}
                                                                onUpdateAppointment={handleUpdateClientAppointment}
                                                                filteredIndex={index} 
                                                                isClient={false} />
                                                        );
                                                    }

                                                    return;
                                                }).filter(appointment => appointment != null)}
                                            </div>
                                        ] : null
                                    }
                                    {
                                        (cancelledAppointments?.length ?? 0 > 0)
                                        ? [
                                            <h4 id={styles.cancelledHeading} className={styles.appointmentsTypeHeading}>Cancelled</h4>,
                                            <div className={styles.appointmentList}>
                                                {cancelledAppointments.map(cancelledAppointment => {
                                                    let appointmentDate = new Date(cancelledAppointment.time);
                                                    
                                                    if (appointmentDate >= filteredDateStart && appointmentDate < filteredDateEnd) {
                                                        return (
                                                            <AppointmentDetail key={cancelledAppointment.id.toString()} className={styles.appointmentDetail} appointment={cancelledAppointment} isClient={false} />
                                                        );
                                                    }

                                                    return;
                                                }).filter(appointment => appointment != null)}
                                            </div>
                                        ] : null
                                    }
                                </div>
                            ) : (
                                <div id={styles.previousAppointment}>
                                    {
                                        recentAppointments?.length ? [
                                            <h4 id={styles.recentHeading} className={styles.appointmentsTypeHeading}>Recent</h4>,
                                            <div className={styles.appointmentList}>
                                                {recentAppointments.map((recentAppointment, index) => {
                                                    return (
                                                        <AppointmentDetail 
                                                            key={recentAppointment.id.toString()} 
                                                            className={styles.appointmentDetail} 
                                                            onUpdateAppointment={handleUpdateClientAppointment}
                                                            filteredIndex={index}
                                                            appointment={recentAppointment} 
                                                            isClient={false} />
                                                    );
                                                })}
                                            </div>
                                        ] : null
                                    }
                                    {
                                        completedAppointments?.length ? [
                                            <h4 id={styles.completedHeading} className={styles.appointmentsTypeHeading}>Completed</h4>,
                                            <div className={styles.appointmentList}>
                                                {completedAppointments.map((completedAppointment, index) => {
                                                    return (
                                                        <AppointmentDetail 
                                                            key={completedAppointment.id.toString()} 
                                                            className={styles.appointmentDetail} 
                                                            appointment={completedAppointment} 
                                                            isClient={false} />
                                                    );
                                                })}
                                            </div>
                                        ] : null
                                    }
                                    {
                                        noShowAppointments?.length ? [
                                            <h4 id={styles.noShowHeading} className={styles.appointmentsTypeHeading}>No Show</h4>,
                                            <div className={styles.appointmentList}>
                                                {noShowAppointments.map((noShowAppointment, index) => {
                                                    return (
                                                        <AppointmentDetail 
                                                            key={noShowAppointment.id.toString()} 
                                                            className={styles.appointmentDetail} 
                                                            appointment={noShowAppointment} 
                                                            isClient={false} />
                                                    );
                                                })}
                                            </div>
                                        ] : null
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>) : null}
            {filteredUserAppointments ? (
            <Container maxWidth="xl" id={styles.user_appointments}>
                <List sx={{ p: 1, bgcolor: grey[800], boxShadow: 1, borderRadius: 2 }} id={styles.user_appointments_filter}
                    component="nav"
                    subheader={
                        <ListSubheader sx={{ bgcolor: grey[800] }}component="div" id={styles.appointments_filter_subheader} >
                            FILTER
                        </ListSubheader>
                    }>
                    <ListItemButton selected={userAppointmentFilters?.Requested} onClick={(e) => handleUserAppointmentFiltersChange(e, "Requested")} className={styles.appointments_filter_option} sx={{ 
                        '&:hover': {
                            backgroundColor: blueGrey[500]
                        }, 
                        '&.Mui-selected': {
                            color: StatusColor.Requested,
                            backgroundColor: 'none'
                        }}}
                        >
                        <ListItemText primary="Requested" />
                    </ListItemButton>
                    <ListItemButton selected={userAppointmentFilters?.Confirmed} onClick={(e) => handleUserAppointmentFiltersChange(e, "Confirmed")} className={styles.appointments_filter_option} 
                        sx={{ 
                        '&:hover': {
                            backgroundColor: blueGrey[500]
                        }, 
                        '&.Mui-selected': {
                            color: StatusColor.Confirmed,
                            backgroundColor: 'none'
                        }}} >
                        <ListItemText primary="Confirmed" />
                    </ListItemButton>
                    <ListItemButton selected={userAppointmentFilters?.Completed} onClick={(e) => handleUserAppointmentFiltersChange(e, "Completed")} className={styles.appointments_filter_option} sx={{ 
                        '&:hover': {
                            backgroundColor: blueGrey[500]
                        }, 
                        '&.Mui-selected': {
                            color: StatusColor.Completed,
                            backgroundColor: 'none'
                        }}}
                        >
                        <ListItemText primary="Completed" />
                    </ListItemButton>
                    <ListItemButton selected={userAppointmentFilters?.Cancelled} onClick={(e) => handleUserAppointmentFiltersChange(e, "Cancelled")} className={styles.appointments_filter_option} className={styles.appointments_filter_option} sx={{ 
                        '&:hover': {
                            backgroundColor: blueGrey[500]
                        }, 
                        '&.Mui-selected': {
                            color: StatusColor.Cancelled,
                            backgroundColor: 'none'
                        }}}
                        >
                        <ListItemText primary="Cancelled" />
                    </ListItemButton>
                    <ListItemButton selected={userAppointmentFilters?.["No Show"]} onClick={(e) => handleUserAppointmentFiltersChange(e, "No Show")} className={styles.appointments_filter_option} sx={{ 
                        '&:hover': {
                            backgroundColor: blueGrey[500]
                        }, 
                        '&.Mui-selected': {
                            color: StatusColor["No Show"],
                            backgroundColor: 'none'
                        }}}
                        >
                        <ListItemText primary="No Show" />
                    </ListItemButton>
                    <ListItemButton selected={userAppointmentFilters?.Recent} onClick={(e) => handleUserAppointmentFiltersChange(e, "Recent")} className={styles.appointments_filter_option} sx={{ 
                        '&:hover': {
                            backgroundColor: blueGrey[500]
                        }, 
                        '&.Mui-selected': {
                            color: StatusColor.Recent,
                            backgroundColor: 'none'
                        }}}
                        >
                        <ListItemText primary="Recent" />
                    </ListItemButton>
                </List>
                <div id={styles.user_appointments_list}>
                    <h1 className={styles.header}>Your Appointments</h1>
                    <div id={styles.user_appointments_container}>
                        {Object.keys(userAppointmentFilters ?? {}).length ? 
                        Object.keys(userAppointmentFilters ?? {}).map(filter => {
                            if (!userAppointmentFilters[filter]) {
                                return null;
                            }

                            let filteredAppointments = filteredUserAppointments[filter.toLocaleLowerCase()];

                            if (!filteredAppointments?.length) {
                                return null;
                            }

                            return (
                                <div key={filter.toLocaleLowerCase()} className={styles.filtered_section}>
                                    <h5 id={styles.filtered_section_header}>{filter}</h5>
                                    {filteredAppointments.map((appointment, index) => {
                                        return (
                                            [
                                                <UserAppointmentDetail 
                                                    key={appointment.id} 
                                                    appointment={appointment}
                                                    filteredIndex={index} 
                                                    onEditAppointment={null}
                                                    onRemoveAppointment={handleRemoveAppointment}/>,
                                                <br />
                                            ]
                                        );
                                    })}
                                </div>
                            )
                        }) : <h5 id={styles.select_filter_info}>Choose your filter to view your appointments</h5>}
                    </div>
                </div>
            </Container>) : null }
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={onLoading}>
                <CircularProgress color="inherit" />
                <span>&nbsp;{onLoadingNotification}</span> 
            </Backdrop>
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
            } else if (userDetails.data.user.status.toLowerCase() == 'not activated') {
                throw new Error('User account is not activated');
            }
        }

        return {
            props: {
                userDetails: userDetails.data.user
            }
        }
    } catch (err) {
        const reason = err.message;

        if (reason.toLowerCase() == 'user is suspended') {
            return {
                redirect: {
                    source: '/profile',
                    destination: '/info/suspended',
                    permanent: false
                }
            }
        } else if (reason.toLowerCase() == 'user account is not activated') {
            return {
                redirect: {
                    source: '/profile',
                    destination: '/info/notActivated',
                    permanent: false
                }
            }
        } else if (reason.toLocaleLowerCase() == 'userinputerror: no user found' || reason.toLowerCase() == 'user does not exist' || reason.toLowerCase() == 'no user found' || reason.toLowerCase() == "invalid token") {
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