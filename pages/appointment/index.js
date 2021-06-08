import Form from 'react-bootstrap/Form';
import { useQuery } from '@apollo/client';
import React, { useState } from 'react';

import Layout from '../../components/page-layout';
import ApolloClient from '../../lib/apollo/apollo-client';
import { GET_SERVICES, GET_APPOINTMENTPAGEDATA, GET_APPOINTMENTS } from '../../lib/apollo/data-queries';
import Loading from '../../components/loading';
import { user } from '../../src/constants/index';

export default function ApppointmentPage({ services }) {
    const today = new Date();
    
    var minAppointmentDate = new Date();
    var maxAppointmentDate = new Date();

    minAppointmentDate.setDate(today.getDate() + 1);
    maxAppointmentDate.setDate(today.getDate() + 15);
    minAppointmentDate = new Date(`${minAppointmentDate.getFullYear()}-${minAppointmentDate.getMonth()+1}-${minAppointmentDate.getDate()}PDT`);
    maxAppointmentDate = new Date(`${maxAppointmentDate.getFullYear()}-${maxAppointmentDate.getMonth()+1}-${maxAppointmentDate.getDate()}PDT`);

    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedStylist, setSelectedStylist] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const { loading, error, data } = useQuery(GET_APPOINTMENTPAGEDATA(), {
        onCompleted: (data) => {
            if (data.stylists) {
                setSelectedStylist(data.stylists[0].id);
            }
        }
    }); //TODO: get stylists based on the selected Service;

    if (loading) return <Loading /> 
    if (error) {
      return <p>ERROR</p>
    }

    const handleServicesChange = (e) => {
        let selectedServices = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedServices(selectedServices);
    }

    const handleStylistChange = (e) => {
        setSelectedStylist(e.target.value);
    }

    const handleDateChange = (e) => {
        var date = new Date(e.target.value + 'PDT');

        console.log(date, minAppointmentDate, maxAppointmentDate);

        if (date >= minAppointmentDate && date <= maxAppointmentDate) {
            setSelectedDate(e.target.value.replace("/", "-"));   
        }
    }

    return (
        <Layout>
            <Form>
                <Form.Group controlId="selectedServices">
                    <Form.Label>Pick 1 or more services to schedule</Form.Label>
                    <Form.Control as="select" multiple onChange={handleServicesChange} value={selectedServices}>
                        {services.map(service => {
                            return (
                                <option key={service.id} value={service.id}>{service.name}</option>
                            )
                        })}
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="selectedStylist">
                    <Form.Label>Choose Stylist</Form.Label>
                    <Form.Control as="select" onChange={handleStylistChange} value={selectedStylist}>
                        {data.stylists.map(stylist => {
                            return (
                                <option key={stylist.id} value={stylist.id}>{stylist.name}</option>
                            )
                        })}
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="selectedDate">
                    <Form.Label>Date of Appointment (2 weeks)</Form.Label>
                    <Form.Control type="date" value={selectedDate} onChange={handleDateChange} min={DateToYYYYMMDDFormat(minAppointmentDate)} max={DateToYYYYMMDDFormat(maxAppointmentDate)} ></Form.Control>
                </Form.Group>
            </Form>
        </Layout>
    );
}

function DateToYYYYMMDDFormat(date) {
    return `${date.getFullYear()}-${(date.getMonth() < 9) ? "0"+(date.getMonth() + 1) : date.getMonth()+1}-${(date.getDate() < 10) ? "0"+date.getDate() : date.getDate()}`;
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