import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import { useQuery, useMutation, gql, useApolloClient } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import Cookie from 'cookie';
import 'react-datepicker/dist/react-datepicker.css';
import Jwt from 'jsonwebtoken';
import EmailJS from '@emailjs/browser';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

import styles from '../../styles/appointmentpage.module.css';
import Layout from '../../components/page-layout';
import ApolloClient from '../../lib/apollo/apollo-client';
import { GET_SERVICES, GET_USERS, GET_APPOINTMENTS, ADD_APPOINTMENT, GET_USER, GET_PROMOTIONS } from '../../lib/apollo/data-queries';
import Loading from '../../components/loading';
import { studioOpens, studioCloses, BUSINESS_HOURS } from '../../src/constants/index';

export default function ApppointmentPage({ clientsOccupiedAppointments, activePromotions, services, servicesByType, user, emailJS }) {
    const apolloClient = useApolloClient();
    const today = new Date();
    today.setHours(0,0,0,0);
    const millisecondsPerDay = 8.64e+7;
    
    const minAppointmentDate = new Date(today.getTime() + millisecondsPerDay * 4);
    const maxAppointmentDate = new Date(today.getTime() + millisecondsPerDay * 19);

    const [appError, setAppError] = useState("");
    const [showAppError, setShowAppError] = useState(false);
    const [showBookedMessage, setShowBookedMessage] = useState(false);
    const [onLoading, setOnLoading] = useState(false);
    const [onLoadingNotification, setOnLoadingNotification] = useState("");
    const [serviceTypeFilter, setServiceTypeFilter] = useState("");
    const [servicesByKind, setServicesByKind] = useState({});
    const [calculateSlots, setCalculateSlots] = useState(false);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedStylist, setSelectedStylist] = useState("");
    const [qualifyingStylist, setQuallifyingStylist] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [appointments, setAppointments] = useState([]);
    const [availableTime, setAvailableTime] = useState([]);
    const [qualifyingPromotions, setQualifyingPromotions] = useState([]);
    const [selectedPromotion, setSelectedPromotion] = useState("");
    const [promotionDiscount, setPromotionDiscount] = useState(0);
    const [calculateDiscount, setCalculateDiscount] = useState(false);
    const [appointmentCost, setAppointmentCost] = useState(0);
    const [addAppointment, { addAppointmentLoading }] = useMutation(ADD_APPOINTMENT);
    const [bookAppointmentDialog, setBookAppointmentDialog] = useState(false);
    const [onePerDayCondition, setOnePerDayCondition] = useState(true);
    const [fourHoursMaxCondition, setFourHoursMaxCondition] = useState(true);
    const { loading, error, data } = useQuery(GET_USERS, {
        variables: {
            role: "stylist"
        },
        // onCompleted: (data) => {
        //     data.users = [];
        // }
    }); //TODO: get stylists that can only perform the selected Service;

    if (calculateSlots) {
        if (selectedDate) {
            const onDate = new Date(Date.parse(selectedDate));
            const selectedDateOpenTime = BUSINESS_HOURS[onDate.getDay()]?.open;
            const selectedDateCloseTime = BUSINESS_HOURS[onDate.getDay()]?.close;

            if (selectedDateOpenTime || selectedDateCloseTime) {
                // Calculate slots if we have all the data needed;
                if (selectedServices.length > 0 && selectedStylist) {
                    // #1:filter all the appointments from our system to only use one from the selectedDate and order the filtered appointments by time;
                    // const onDate = new Date(Date.parse(selectedDate));
                    let appointmentsOnDate = [];
                    let timeSlots = [];
    
                    for (var i = 0; i < appointments.length; i++) {
                        let appointmentDate = new Date(appointments[i].time);
    
                        // if the current appointment in iteration is on the same day as the selected date user choosed;
                        if (onDate.getMonth() == appointmentDate.getMonth() && onDate.getDate() == appointmentDate.getDate()) {
                            let isAdded = false;
    
                            for (let x = 0; x < appointmentsOnDate.length; x++) {
                                if (appointmentDate < new Date(appointmentsOnDate[x].time)) {
                                    appointmentsOnDate.splice(x, 0, appointments[i]);
                                    isAdded = true;
                                    break;
                                }
                            }
    
                            if (!isAdded) {
                                appointmentsOnDate.push(appointments[i]);
                            }
                        }
                    }
    
                    // #2 Calculate slots using the ordered appointmentsOnDate and the startTime and endTime of studio/stylist;
                        // Condition for adding slots. Starting at last free time. If there is a gap between free time and the next appointment and the gap is bigger than services time;
                    let nextAvailableTime = new Date(`${selectedDate.toDateString()} ${selectedDateOpenTime}`);
                    let nextUnavailableTime = new Date();
                    let currentSlot = new Date();
                    let newAppointmentTime = 0;
    
                        // Calculate newAppointmentTime; 
                    selectedServices.forEach(serviceId => {
                        let service = services.find(service => service.id == serviceId);
    
                        newAppointmentTime = newAppointmentTime + service.time;
                    });
    
                    for (let j = 0; j <= appointmentsOnDate.length; j++) {
                        if (j == appointmentsOnDate.length) {
                            nextUnavailableTime.setTime(Date.parse(`${selectedDate.toDateString()} ${selectedDateCloseTime}`));
                        } else {
                            // Date must be normalized to start at midnight;
                            nextUnavailableTime.setTime(Date.parse(appointmentsOnDate[j].time));
                            nextUnavailableTime.setSeconds(0);
                            nextUnavailableTime.setMilliseconds(0);
                        }
    
                        currentSlot.setTime(nextAvailableTime.getTime());
    
                        while (nextAvailableTime.setMinutes(nextAvailableTime.getMinutes() + newAppointmentTime) <= nextUnavailableTime.getTime()) {
                            let meridiem = currentSlot.getHours() < 12 ? "AM" : "PM";
                            let hour = currentSlot.getHours() < 13 ? `${currentSlot.getHours()}` : `${currentSlot.getHours() - 12}`;
                            let minutes = currentSlot.getMinutes();
                
                            if (parseInt(hour) < 10) {
                                hour = "0" + hour;
                            }
                
                            if (parseInt(minutes) < 10) {
                                minutes = "0" + minutes;
                            }
                
                            timeSlots.push(hour + ":" + minutes + " " + meridiem);
                            
                            currentSlot.setHours(nextAvailableTime.getHours());
                            currentSlot.setMinutes(nextAvailableTime.getMinutes());
                        };
    
                        if (j < appointmentsOnDate.length) {
                            let appointmentTime = 0;
                            appointmentsOnDate[j].services.forEach(service => {
                                appointmentTime = appointmentTime + service.time;
                            });
                            nextAvailableTime.setTime(nextUnavailableTime);
                            nextAvailableTime.setMinutes(nextAvailableTime.getMinutes() + appointmentTime);             
                        }
                    }
    
                    setCalculateSlots(false);
                    setAvailableTime(timeSlots);
                    setSelectedTime(timeSlots[0]); 
                } else {
                    setCalculateSlots(false);
                    setAvailableTime([]);
                    setSelectedTime("");
                }
            } else {
                setAppError("Studio is closed on selected day");
                setShowAppError(true);
                setCalculateSlots(false);
            }
        }
    }

    if (calculateDiscount) {
        console.log("calculating the discount for you");
        const promotion = activePromotions.find(promotion => promotion.code == selectedPromotion);
        let discount = 0;

        if (promotion) {
            selectedServices.forEach(selectedService => {
                if (promotion.services.findIndex(promotionService => promotionService.toString() == selectedService) > -1) {
                    const serviceInfo = services.find(service => service.id.toString() == selectedService);

                    if (promotion.type == 'value') {
                        discount += promotion.amount;
                    } else {
                        let promotionAmount = promotion.amount;
                        if (promotion.amount > 100) {
                            promotionAmount = 100;
                        } else if (promotion.amount < 0) {
                            promotionAmount = 0;
                        }

                        discount += (serviceInfo.price / 100 * promotionAmount);
                    }
                }
            });
        }

        console.log(discount);
        setPromotionDiscount(discount);
        setCalculateDiscount(false);
    }

    const handleServicesChange = (e) => {
        let newSelected = Array.from(e.target.selectedOptions, option => option.value);

        const previousSelected = selectedServices.filter(service => {
            const serviceInfo = services.find(element => element.id.toString() == service);

            if (!serviceTypeFilter || serviceInfo.type == serviceTypeFilter) {
                return false;
            }

            return true;
        });

        const selected = previousSelected.concat(newSelected);

        let combinedServicePrice = 0;

        selected.forEach(selected => {
            const service = services.find(element => element.id.toString() == selected);

            combinedServicePrice += service.price;
        });

        setAppointmentCost(combinedServicePrice);
        setAvailableTime([]);
        setSelectedTime("");
        setSelectedServices(selected);
        setCalculateSlots(true);
    }

    const handleStylistChange = (e) => {
        setOnLoadingNotification("Getting Available Time Slots");
        setOnLoading(true);
        setAvailableTime([]);
        setSelectedTime("");
        setSelectedStylist(e.target.value);
    }

    const handleDateChange = (date) => {
        if (date != 'Invalid Date' && date >= minAppointmentDate && date <= maxAppointmentDate) {
            setAvailableTime([]);
            setSelectedTime("");
            setAppError("");
            setShowAppError(false);
            setSelectedDate(date);   
            setCalculateSlots(true);
        }
    }

    const handleTimeChange = (e) => {
        setSelectedTime(e.target.value);
    }

    const handleSelectedPromotionChange = (e) => {
        setSelectedPromotion(e.target.value);
        setCalculateDiscount(true);
    };

    const handleFormClear = (e) => {
        setSelectedServices([]);
        setSelectedStylist("");
        setSelectedDate("");
        setSelectedTime("");
        setAppointments([]);
        setAvailableTime([]);
        setCalculateSlots(false); 
        setQualifyingPromotions([]);
        setSelectedPromotion("");
        setPromotionDiscount(0);
        setCalculateDiscount(false);
        setAppointmentCost(0);
    }

    const handleCloseBookedMessage = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowBookedMessage(false);
    }

    const handleBookAppointment = async (e) => {
        e.preventDefault();

        if (selectedServices.length > 0 && selectedStylist && selectedDate && selectedTime) {
            setOnLoading(true);
            let appointmentTime = new Date(`${selectedDate.toDateString()} ${selectedTime}`);

            let newAppointment = {
                stylist: selectedStylist,
                client: user.id,
                services: selectedServices,
                time: appointmentTime.toISOString(),
                status: "Requested"
            };

            if (selectedPromotion) {
                newAppointment.details = `Promotion code ${selectedPromotion} applied`;
                newAppointment.discount = promotionDiscount;
            }

            try {
                let response = await addAppointment({
                    variables: {
                        newAppointment: newAppointment
                    },
                    update: (cache, { data: { newAppointment } }) => {
                        cache.modify({
                            fields: {
                                appointments(existingAppointments = []) {
                                    const newAppointmentRef = cache.writeFragment({
                                        data: newAppointment,
                                        fragment: gql`
                                            fragment NewAppointment on Appointment {
                                                __typename
                                                id
                                                stylist {
                                                    __typename
                                                    id
                                                    name
                                                    email
                                                    phone
                                                    photo
                                                    about
                                                }
                                                client {
                                                    __typename
                                                    id
                                                    name
                                                    email
                                                    phone
                                                    photo
                                                    about
                                                }
                                                services {
                                                    __typename
                                                    id
                                                    type
                                                    name
                                                    description
                                                    price
                                                    time
                                                    kind {
                                                        type
                                                    }
                                                }
                                                time
                                                status
                                                discount
                                                details
                                            }
                                        `
                                    });
                                    return [...existingAppointments, newAppointmentRef];
                                }
                            }
                        });
                    }
                });

                if (!response?.data?.newAppointment) {
                    throw new Error('Unable to create new Appointment');
                }

                newAppointment = response.data.newAppointment;

                clientsOccupiedAppointments.push(newAppointment);

                let newAppointmentServicesMsg = "";

                newAppointment.services.forEach((service, index) => {
                    if (index == newAppointment.services.length-1 && index != 0) {
                        newAppointmentServicesMsg += " and";
                    }

                    newAppointmentServicesMsg += ` ${service.name}`;
                    newAppointmentServicesMsg += ` ${service.type}`;
                    newAppointmentServicesMsg += (service?.kind?.type) ? ` ${service.kind.type}` : "";
                    newAppointmentServicesMsg += ','
                });

                const emailResponse = await EmailJS.send(emailJS.serviceID, emailJS.appointmentRequestTemplateID, {
                    stylist: newAppointment.stylist.name,
                    message: `${newAppointment.client.name} has requested an appointment for ${newAppointmentServicesMsg} on ${appointmentTime.toDateString()} at ${appointmentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                    send_to: newAppointment.stylist.email,
                }, emailJS.userID);

                if ((emailResponse?.status ?? "") != 200) {
                    throw new Error ('Unable to notify the stylist of requested appointment');
                }

                setShowBookedMessage(true);
            } catch (err) {
                setAppError(err.message);
                setShowAppError(true);
            } finally {
                setOnLoading(false);
                handleFormClear(e);
            }
        } else {
            setAppError("Not enough information to book");
            setShowAppError(true);
        }

        setBookAppointmentDialog(false);
    }

    const handleServiceTypeFilterSelect = (key, event) => {
        setServiceTypeFilter(key);
    }

    useEffect(async () => {
        try {
            if (selectedStylist) {
                const { data } = await apolloClient.query({
                    query: GET_APPOINTMENTS,
                    variables: {
                        query: {
                            stylist: selectedStylist
                        },
                        future: true
                    },
                    fetchPolicy: 'network-only'
                });

                if (!(data?.appointments)) {
                    throw new Error('unable to request stylist and client existing schedule');
                }

                // We want only appointments in the future
                // We want only appointments which are confirmed
                // We want appointments which are requested when:
                // The stylist is the client of that appointment
                let occupiedAppointments = data.appointments.filter(appointment => {
                    if (appointment.status.toLocaleLowerCase() == "confirmed") {
                        return true;
                    }

                    if (appointment.status.toLocaleLowerCase() == "requested" && appointment.client.id.toString() == selectedStylist) {
                        return true;
                    }

                    return false;
                });
    
                setAppointments(occupiedAppointments.concat(clientsOccupiedAppointments));
                setCalculateSlots(true);
            }
        } catch (err) {
            setAppError(err.message);
            setShowAppError(true);
        } finally {
            setOnLoadingNotification("");
            setOnLoading(false);
        }
    }, [selectedStylist]);

    useEffect(() => {
        if (serviceTypeFilter) {
            var newServicesByKind = {};

            servicesByType[serviceTypeFilter].forEach(service => {
                var kindFilter = (service.kind == undefined) ? "Standard" : service.kind.type;
    
                if (newServicesByKind.hasOwnProperty(kindFilter)) {
                    newServicesByKind[kindFilter].push(service);
                } else {
                    newServicesByKind[kindFilter] = [service];
                }
            });
    
            setServicesByKind(newServicesByKind);
        }
    }, [serviceTypeFilter]);

    useEffect(() => {
        let qualifiedPromotions = [];
        if (selectedDate && selectedTime && selectedServices) {
            let appointmentTime = new Date(`${selectedDate.toDateString()} ${selectedTime}`);

            activePromotions.forEach(promotion => {
                let promotionStart = new Date(promotion.start);
                let promotionEnd = new Date(promotion.end);

                if (appointmentTime >= promotionStart && appointmentTime <= promotionEnd) {
                    for (let i = 0; i < promotion.services.length; i++) {
                        if (selectedServices.includes(promotion.services[i])) {
                            qualifiedPromotions.push(promotion);
                            break;
                        }
                    }
                }
            });    
        }

        if (qualifiedPromotions.findIndex(promotion => promotion.code == selectedPromotion) < 0) {
            setSelectedPromotion("");
        }

        
        if (selectedPromotion) {
            setCalculateDiscount(true);
        }

        setQualifyingPromotions(qualifiedPromotions);
    }, [selectedServices, selectedDate, selectedTime]);

    useEffect(() => {
        if (selectedServices?.length) {
            let requestedDuration = 0;
            selectedServices.forEach(selectedService => {
                const serviceInfo = services.find(service => service.id.toString() == selectedService);
    
                requestedDuration += serviceInfo.time;
            });
    
            if (requestedDuration > 240) {
                setFourHoursMaxCondition(false);
                setAppError("Appointment can't be over 4 hrs in total time");
                setShowAppError(true);
                return;
            }
        }

        setFourHoursMaxCondition(true);
    }, [selectedServices]);

    useEffect(() => {
        let qualifiedStylist = (data?.users ?? []).filter(stylist => {
            const qualified = selectedServices.every(service => {
                return (stylist?.capabilities ?? []).includes(service);
            });

            return qualified;
        })

        if (!qualifiedStylist.find(stylist => stylist.id.toString() == selectedStylist)) {
            setSelectedStylist("");
        }

        setQuallifyingStylist(qualifiedStylist);
    }, [selectedServices]);

    useEffect(() => {
        if (selectedDate) {
            let selectedAppointmentDate = new Date(selectedDate);

            for (let i = 0; i < clientsOccupiedAppointments.length; i++) {
                let occupiedAppointmentDate = new Date(clientsOccupiedAppointments[i].time);
                console.log(occupiedAppointmentDate.toDateString());
    
                if (selectedAppointmentDate.setHours(0,0,0,0) == occupiedAppointmentDate.setHours(0,0,0,0)) {
                    setOnePerDayCondition(false);
                    setAppError("You have already book an appointment on this date, select another");
                    setShowAppError(true);
                    return;
                }
            }    
        }        

        setOnePerDayCondition(true);
    }, [selectedDate]);

    if (loading) return <Loading /> 
    if (error) {
      return <p>ERROR</p>
    }

    return (
        <Layout userDetail={user}>
            <Container fluid="lg" className={styles.schedule_appointment_form}>
                <Form>
                    <h3>Schedule your appointment</h3>
                    <Form.Group className={styles.form_group} controlId="selectedServices">
                        <Form.Label column="lg">Services</Form.Label>
                        <InputGroup className="mb-3">
                            <DropdownButton as={InputGroup.Prepend} variant="secondary" id="service-type-dropdown" title={(serviceTypeFilter) || "Service Type"}>
                                <Dropdown.Header>Type of Service</Dropdown.Header>
                                <Dropdown.Item active={(!serviceTypeFilter)} onSelect={handleServiceTypeFilterSelect} eventKey="">All</Dropdown.Item>
                                {Object.getOwnPropertyNames(servicesByType).map(serviceType => {
                                    return (
                                        <Dropdown.Item active={serviceTypeFilter == serviceType} onSelect={handleServiceTypeFilterSelect} eventKey={serviceType}>{serviceType}</Dropdown.Item>
                                    )
                                })}
                            </DropdownButton>
                            <Form.Control as="select" htmlSize={10} multiple onChange={handleServicesChange} value={selectedServices}>
                                {serviceTypeFilter ? 
                                Object.entries(servicesByKind).map(key => {
                                    return (
                                        <optgroup label={key[0]}>
                                            {key[1].map(service => {
                                                return (
                                                    <option key={service.id.toString()} value={service.id.toString()}>{service.name} - {service.time}'minutes || ${service.price.toFixed(2)}</option>
                                                )
                                            })}
                                        </optgroup>
                                    )
                                    }) : services.map(service => <option key={service.id.toString()} value={service.id.toString()}>{service.name} - {service.time}'minutes || ${service.price.toFixed(2)}</option>)}
                            </Form.Control>
                        </InputGroup>
                        <Form.Text className="text-muted">
                            Select 1 or more services to schedule using <b>CTRL</b>
                        </Form.Text>
                    </Form.Group>
                    <Form.Group className={styles.form_group} controlId="selectedStylist">
                        <Form.Label column="lg">Stylist</Form.Label>
                        <Form.Control as="select" onChange={handleStylistChange} value={selectedStylist}>
                            {(selectedStylist ? [] : [<option value={selectedStylist}></option>]).concat(
                                qualifyingStylist.filter(stylist => stylist.id.toString() != user.id.toString()).map(stylist => {
                                    return (
                                        <option key={stylist.id} value={stylist.id}>{stylist.name}</option>
                                    );
                                })
                            )}
                        </Form.Control>
                        <Form.Text muted>
                            Choose a stylist
                        </Form.Text>
                    </Form.Group>
                    <Form.Group className={styles.form_group} controlId="selectedDate">
                        <Form.Label id={styles.select_date_label} column="lg">Date</Form.Label>
                        <DatePicker
                            name="selectedDate" 
                            placeholderText="Click to select a date"
                            autoComplete='off'
                            selected={selectedDate} onChange={handleDateChange} 
                            minDate={minAppointmentDate} maxDate={maxAppointmentDate} peekNextMonth showMonthDropdown dropdownMode="select"/>
                    </Form.Group>
                    <Form.Group className={styles.form_group} controlId="selectedSlot">
                        <Form.Label column="lg">Time Slot</Form.Label>
                        <Form.Control as="select" onChange={handleTimeChange} value={selectedTime}>
                            {availableTime.map(timeSlot => {
                                return (
                                    <option key={timeSlot} value={timeSlot}>{timeSlot}</option>
                                )
                            })}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className={styles.form_group} controlId="selectedPromotion">
                        <Form.Label column="lg">Qualifying Promotion</Form.Label>
                        <Form.Control as="select" onChange={handleSelectedPromotionChange} value={selectedPromotion}>
                            {[<option key="no_promo" value="" />].concat(qualifyingPromotions.map(promotion => {
                                return (
                                    <option key={promotion.id} value={promotion.code}>{promotion.code}</option>
                                );
                            }))}
                        </Form.Control>
                    </Form.Group>
                    <Stack direction="row" gap={3}>
                        {promotionDiscount > 0 ? 
                            <p>
                                <b>Applied Discount</b> <span style={{ color: "green" }}>- ${promotionDiscount}</span>
                            </p> : null
                        }
                        <p>
                            <b>Total Due</b> ${appointmentCost - promotionDiscount}
                        </p>
                    </Stack>
                    <div id={styles.form_action}>
                        <Button variant="outline-secondary" type="reset" onClick={handleFormClear}>Clear</Button>{' '}
                        <Button disabled={!onePerDayCondition || !fourHoursMaxCondition} variant="outline-primary" type="submit" onClick={e => { 
                            e.preventDefault();
                            setBookAppointmentDialog(true);
                        }}>Book</Button>{' '}
                    </div>
                </Form>
                <em>Note: To schedule appointments on a date not available above please call (503) 446-4774</em>
            </Container>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={onLoading}>
                <CircularProgress color="inherit" />
                <span>&nbsp;{onLoadingNotification}</span> 
            </Backdrop>
            <Snackbar open={showBookedMessage} autoHideDuration={6000} onClose={handleCloseBookedMessage}>
                <Alert onClose={handleCloseBookedMessage} severity="success" sx={{ width: '100%' }}>
                    Your appointment have been requested, we will notify you via your contact once confirmed
                </Alert>
            </Snackbar>
            <Container fluid="xs" className={styles.error_alert}>
                <Collapse in={showAppError}>
                    <Alert
                        severity="error"
                        action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                            setAppError('');
                            setShowAppError(false);
                            }}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                        }
                        sx={{ mb: 2 }} >
                        <AlertTitle>Error</AlertTitle>
                        {appError}
                    </Alert>
                </Collapse>
            </Container>
            <BookingDialog isBookAppointmentDialogOpen={bookAppointmentDialog} onBookAppointment={handleBookAppointment} onCloseBookingDialog={() => setBookAppointmentDialog(false)}/>
            {/* <Dialog 
                open={bookAppointmentDialog} 
                onClose={() => setBookAppointmentDialog(false)}
                aria-labelledby="book_appointment_dialog_title"
                aria-describedby="book_appointment_dialog_description">
                <DialogTitle id="book_appointment_dialog_title">
                    Are you sure want to schedule the appointment
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="book_appointment_dialog_description">
                        Once the appointment is booked, stylist will be notify. If the stylist confirms your appointment, you will be notify via your contact info.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBookAppointmentDialog(false)}>Cancel</Button>
                    <Button onClick={handleBookAppointment}>Confirm</Button>
                </DialogActions>
            </Dialog> */}
        </Layout>
    );
}

const BookingDialog = React.memo(function BookingDialog(props) {
    return (
        <Dialog 
            open={props.isBookAppointmentDialogOpen} 
            onClose={props.onCloseBookingDialog}
            aria-labelledby="book_appointment_dialog_title"
            aria-describedby="book_appointment_dialog_description">
            <DialogTitle id="book_appointment_dialog_title">
                Are you sure want to schedule the appointment
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="book_appointment_dialog_description">
                    Once the appointment is booked, stylist will be notify. If the stylist confirms your appointment, you will be notify via your contact info.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCloseBookingDialog}>Cancel</Button>
                <Button onClick={props.onBookAppointment}>Confirm</Button> 
            </DialogActions>
        </Dialog>
    )
}, (prev, curr) => prev.isBookAppointmentDialogOpen == curr.isBookAppointmentDialogOpen);

export async function getServerSideProps(context) {
    try {
        // Authentication is require to use appointments page
        const cookies = Cookie.parse(context.req.headers?.cookie ?? '');
        const token = cookies?.token;
        const payload = Jwt.decode(token);

        if (!payload || Date.now() > payload.exp *1000) {
            throw new Error('bad token');
        }

        const user = await ApolloClient.query({
            query: GET_USER,
            variables: {
                userId: payload.id
            },
            context: {
                headers: {
                    authorization: `Bearer ${token}`
                },
            },
            fetchPolicy: "no-cache"
        });

        if (!user) {
            throw new Error("User doesn't exist");
        } else {
            if (user?.data?.user?.status == "suspended") {
                throw new Error("Account Suspended");
            }
        }

        const { data } = await ApolloClient.query({
            query: GET_SERVICES
        });

        if (!data) {
            throw new Error('No service found');
        }

        let services = Array.from(data.services).filter(service => service.status.toLowerCase() == 'active');

        services.sort((a, b) => {
            const serviceA = a.name.toUpperCase();
            const serviceB = b.name.toUpperCase();
    
            let compare = 0;
    
            if (serviceA < serviceB) {
                compare = -1;
            }
            
            if (serviceA > serviceB) {
                compare = 1;
            }
            
            return compare;
        });
    
        let servicesByType = {};
        services.forEach(service => {
            if (servicesByType.hasOwnProperty(service.type)) {
                servicesByType[service.type].push(service);
            } else {
                servicesByType[service.type] = [service];
            }
        });

        const getPromotions = await ApolloClient.query({
            query: GET_PROMOTIONS,
            context: {
                headers: {
                    authorization: `Bearer ${token}`
                }
            },
            fetchPolicy: "no-cache"
        });

        if (!getPromotions?.data?.promotions) {
            throw new Error('Unable to fetch promotions');
        }

        const activePromotions = getPromotions.data.promotions.filter(promotion => {
            if (Date.now() > new Date(promotion.end) || Date.now() < new Date(promotion.start)) {
                return false;
            }
            
            return true;
        });

        const getClientsAppointments = await ApolloClient.query({
            query: GET_APPOINTMENTS,
            variables: {
                query: {
                    client: payload.id
                },
                future: true
            },
            context: {
                headers: {
                    authorization: `Bearer ${token}`
                }
            },
            fetchPolicy: "no-cache"
        });

        if (!getClientsAppointments?.data?.appointments) {
            throw new Error('Unable to fetch user appointments');
        }

        let clientsOccupiedAppointments = getClientsAppointments.data.appointments.filter(appointment => {
            if (appointment.status.toLowerCase() == 'requested' || appointment.status.toLowerCase() == 'confirmed') {
                return true;
            }

            return false;
        });

        return {
            props: {
                clientsOccupiedAppointments: clientsOccupiedAppointments,
                services: services,
                servicesByType: servicesByType,
                user: user.data.user,
                activePromotions: activePromotions,
                emailJS: {
                    "serviceID": process.env.EMAILJS_SERVICE_ID,
                    "appointmentRequestTemplateID": process.env.EMAILJS_APPOINTMENT_REQUEST_TEMPLATE_ID,
                    "userID": process.env.EMAILJS_USER_ID
                }
            }
        };
    } catch (err) {
        console.log(err);
        const reason = err?.message.toLowerCase();

        if (reason == 'bad token') {
            context.res.setHeader(
                "Set-Cookie", [
                `token=; Max-Age=0`
                ]
            );

            return {
                redirect: {
                    source: '/appointment',
                    destination: '/authenticate',
                    permanent: false
                }
            };
        } else if (reason == "account suspended") {
            return {
                redirect: {
                    source: '/appointment',
                    destination: '/info/suspended',
                    permanent: false
                }
            }
        } else {
            return {
                redirect: {
                    source: '/appointment',
                    destination: '/',
                    permanent: false
                }
            }
        }
    }
}

// Page Work Flow
// 1. Get all the services that our shop offer so we can get what services the user want to book for
// 2. Get all the stylists that can perform that service, disable select stylist if service have yet to be selected
// 3. Get a date the user would like to schedule (14 days advance max)
// 4. Calculate time slots user can select
    // - get the schedule of the stylist that day
    // - get all the appointments the stylists have that day order them by earliest to latest
    // - calculate the slots
    // - get all the appointments the client have that day order them by earliest to latest
    // - filter the slots
    // - present to user