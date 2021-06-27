import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useQuery, useMutation, gql, useApolloClient } from '@apollo/client';
import React, { useEffect, useState } from 'react';

import Layout from '../../components/page-layout';
import ApolloClient from '../../lib/apollo/apollo-client';
import { GET_SERVICES, GET_USERS, GET_APPOINTMENTS, ADD_APPOINTMENT } from '../../lib/apollo/data-queries';
import Loading from '../../components/loading';
import { user, studioOpens, studioCloses } from '../../src/constants/index';

export default function ApppointmentPage({ services }) {
    const apolloClient = useApolloClient();
    const today = new Date();
    today.setHours(0,0,0,0);
    const millisecondsPerDay = 8.64e+7;
    
    const minAppointmentDate = new Date(today.getTime() + millisecondsPerDay);
    const maxAppointmentDate = new Date(today.getTime() + millisecondsPerDay * 15);

    const [debug, setDebug] = useState("");
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedStylist, setSelectedStylist] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [appointments, setAppointments] = useState([]);
    const [availableTime, setAvailableTime] = useState([]);
    const [addAppointment, { addAppointmentLoading }] = useMutation(ADD_APPOINTMENT);
    const { loading, error, data } = useQuery(GET_USERS, {
        variables: {
            role: "stylist"
        },
        // onCompleted: (data) => {
        //     if (data.users) {
        //         setSelectedStylist(data.users[0].id);
        //     }
        // }
    }); //TODO: get stylists that can only perform the selected Service;


    // Calculate slots if we have all the data needed;
    if (selectedServices.length > 0 && selectedStylist && selectedDate && availableTime.length == 0) {
        // #1:filter all the appointments from our system to only use one from the selectedDate and order the filtered appointments by time;
        const onDate = new Date(selectedDate + " 00:00:00");
        let appointmentsOnDate = [];
        let timeSlots = [];

        for (var i = 0; i < appointments.length; i++) {
            let appointmentDate = new Date(appointments[i].time);

            // if the current appointment in iteration is on the same day as the selected date user choosed;
            if (onDate.getMonth() == appointmentDate.getMonth() && onDate.getDate() == appointmentDate.getDate()) {
                let x = 0;

                while (x < appointmentsOnDate.length) {
                    if (appointmentDate < new Date(appointmentsOnDate[x].time)) {
                        appointmentsOnDate.splice(x, 0, appointments[i]);
                        break;
                    }

                    x++;
                }

                if (x == i) {
                    appointmentsOnDate.push(appointments[i]);
                }
            }
        }

        // #2 Calculate slots using the ordered appointmentsOnDate and the startTime and endTime of studio/stylist;
            // Condition for adding slots. Starting at last free time. If there is a gap between free time and the next appointment and the gap is bigger than services time;
        let nextAvailableTime = new Date(`${selectedDate} ${studioOpens}`);
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
                nextUnavailableTime.setTime(Date.parse(`${selectedDate} ${studioCloses}`));
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

        setAvailableTime(timeSlots);
        setSelectedTime(timeSlots[0]);
    } 

    const DateToYYYYMMDDFormat = (date) => {
        return `${date.getFullYear()}-${(date.getMonth() < 9) ? "0"+(date.getMonth() + 1) : date.getMonth()+1}-${(date.getDate() < 10) ? "0"+date.getDate() : date.getDate()}`;
    }

    const handleServicesChange = (e) => {
        let selectedServices = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedServices(selectedServices);
    }

    const handleStylistChange = (e) => {
        setSelectedStylist(e.target.value);
    }

    const handleDateChange = (e) => {
        const targetValue = e.target.value;

        var date = new Date(targetValue + ' 00:00:00');

        if (date != 'Invalid Date' && date >= minAppointmentDate && date <= maxAppointmentDate) {
            targetValue.replace("/", "-");
            setSelectedDate(targetValue);   
        }
    }

    const handleTimeChange = (e) => {
        setSelectedTime(e.target.value);
    }

    const handleFormClear = (e) => {
        setSelectedServices([]);
        setSelectedStylist("");
        setSelectedDate("");
        setSelectedTime("");
        setAppointments([]);
        setAvailableTime([]);
    }

    const handleBookAppointment = async (e) => {
        e.preventDefault();

        if (selectedServices.length > 0 && selectedStylist && selectedDate && selectedTime) {
            let appointmentTime = new Date(`${selectedDate} ${selectedTime}`);

            let newAppointment = {
                stylist: selectedStylist,
                client: user.id,
                services: selectedServices,
                time: appointmentTime.toISOString()
            };

            addAppointment({
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
                                        }
                                    `
                                });
                                return [...existingAppointments, newAppointmentRef];
                            }
                        }
                    });
                }
            });

            handleFormClear(e);
        }
    }

    useEffect(async () => {
        if (selectedStylist) {
            const { data } = await apolloClient.query({
                query: GET_APPOINTMENTS,
                variables: {
                    query: {
                        stylist: selectedStylist.toString(),
                        client: user.id
                    }
                }
            });

            setAppointments(data.appointments);
        }
    }, [selectedStylist]);

    if (loading) return <Loading /> 
    if (error) {
      return <p>ERROR</p>
    }

    return (
        <Layout>
            <h2>{debug}</h2>
            <Form>
                <Form.Group controlId="selectedServices">
                    <Form.Label>Pick 1 or more services to schedule</Form.Label>
                    <Form.Control as="select" multiple onChange={handleServicesChange} value={selectedServices}>
                        {services.map(service => {
                            return (
                                <option key={service.id.toString()} value={service.id.toString()}>{service.name}</option>
                            )
                        })}
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="selectedStylist">
                    <Form.Label>Choose Stylist</Form.Label>
                    <Form.Control as="select" onChange={handleStylistChange} value={selectedStylist}>
                        {(selectedStylist ? [] : [<option value={selectedStylist}></option>]).concat
                        (data.users.map(stylist => {
                            return (
                                <option key={stylist.id} value={stylist.id}>{stylist.name}</option>
                            )
                        }))}.
                    </Form.Control>
                </Form.Group>
                {/* <Form.Group controlId="selectedDate">
                    <Form.Label>Date of Appointment (2 weeks)</Form.Label>
                    <Form.Control type="date" value={selectedDate} onChange={handleDateChange} min={DateToYYYYMMDDFormat(minAppointmentDate)} max={DateToYYYYMMDDFormat(maxAppointmentDate)} ></Form.Control>
                </Form.Group> */}
                <Form.Group controlId="selectedDate">
                    <Form.Label>Date of Appointment (2 weeks)</Form.Label>
                    <Form.Control type="date" value={selectedDate} onChange={handleDateChange} min={DateToYYYYMMDDFormat(minAppointmentDate)} max={DateToYYYYMMDDFormat(maxAppointmentDate)}></Form.Control>
                </Form.Group>
                <Form.Group controlId="selectedSlot">
                    <Form.Label>Time Slot</Form.Label>
                    <Form.Control as="select" onChange={handleTimeChange} value={selectedTime}>
                        {availableTime.map(timeSlot => {
                            return (
                                <option key={timeSlot} value={timeSlot}>{timeSlot}</option>
                            )
                        })}
                    </Form.Control>
                </Form.Group>
                <Button variant="outline-secondary" type="reset" onClick={handleFormClear}>Clear</Button>{' '}
                <Button variant="outline-primary" type="submit" onClick={handleBookAppointment}>Book</Button>{' '}
            </Form>
        </Layout>
    );
}

export async function getStaticProps() {
    const { data } = await ApolloClient.query({
        query: GET_SERVICES
    });

    if (!data) {
        return {
            notfound: true
        }
    }

    return {
        props: {
            services: data.services
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