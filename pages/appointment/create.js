import { useRef, useState, useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateTimePicker from '@mui/lab/DateTimePicker';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import ClearIcon from '@mui/icons-material/Clear';
import Cookie from 'cookie';
import Stack from '@mui/material/Stack';
import Jwt from 'jsonwebtoken';
import { useApolloClient, gql } from '@apollo/client';
import EmailJS from '@emailjs/browser';

import ApolloClient from '../../lib/apollo/apollo-client';
import { GET_SERVICES, GET_USER, GET_USERS, ADD_APPOINTMENT } from '../../lib/apollo/data-queries';
import Layout from '../../components/page-layout';
import styles from '../../styles/createappointmentpage.module.css'
import { generateAppointmentDetailMessage } from '../../lib/utility/emailJS';

export default function CreateAppointment({ userDetail, clients, stylists, servicesByType, emailJS, error }) {
    const apolloClient = useApolloClient();

    const [searchedClient, setSearchedClient] = useState("");
    const [selectedClient, setSelectedClient] = useState("");
    const [selectedClientError, setSelectedClientError] = useState("");
    const [hideClientList, setHideClientList] = useState(true);
    const [selectedStylist, setSelectedStylist] = useState("");
    const [selectedStylistError, setSelectedStylistError] = useState("");
    const [serviceTypeFilter, setServiceTypeFilter] = useState(Object.keys(servicesByType)[0]);
    const [serviceByKind, setServiceByKind] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedServicesError, setSelectedServicesError] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState();
    const [selectedDateTimeError, setSelectedDateTimeError] = useState(false);
    const [appliedPromotionAmount, setAppliedPromotionAmount] = useState(0);
    const [appliedPromotionAmountError, setAppliedPromotionAmountError] = useState("");
    const [appointmentDetails, setAppointmentDetails] = useState("");
    const [appointmentDetailsError, setAppointmentDetailsError] = useState("");

    const [onLoading, setOnLoading] = useState(false);
    const [onLoadingNotification, setOnLoadingNotification] = useState("");
    const [alertStatus, setAlertStatus] = useState();
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    
    const handleSelectClientChange = (clientId, clientName) => {
        setSearchedClient(clientName);
        setSelectedClient(clientId);
        setHideClientList(true);
    }

    const handleSearchedClientChange = (e) => {
        setSearchedClient(e.target.value);
    }

    const handleSelectStylistChange = (e) => {
        setSelectedStylist(e.target.value);
    }

    const handleServiceTypeFilterChange = (e) => {
        setServiceTypeFilter(e.target.value);
    }

    const handleSelectedServiceChange = (e) => {
        let newSelected = Array.from(e.target.selectedOptions, option => option.value);

        const previousSelected = selectedServices.filter(serviceId => {
            let currentServices = servicesByType[serviceTypeFilter];
            let exist = currentServices.findIndex(service => service.id.toString() == serviceId);

            if (!serviceTypeFilter || exist > -1) {
                return false;
            }

            return true;
        });

        const selected = previousSelected.concat(newSelected);

        setSelectedServices(selected);
        
        if ((selected?.length ?? 0) > 0) {
            setSelectedServicesError(false);
        }
    }

    const handleSelectedDateTimeChange = (newDateTime) => {
        setSelectedDateTime(newDateTime);

        if (newDateTime < Date.now()) {
            setSelectedDateTimeError(true);
        } else {
            setSelectedDateTimeError(false);
        }
    }
    
    const handleAppliedPromotionAmountChange = (e) => {
        if (isNaN(e.target.value)) {
            return;
        }

        setAppliedPromotionAmount(e.target.value);
    }

    const handleAppointmentDetailsChange = (e) => {
        setAppointmentDetails(e.target.value);
    }

    const handleResetCreateAppointmentForm = () => {
        setSearchedClient("");
        setSelectedClient("");
        setSelectedClientError("");
        setHideClientList(true);
        setSelectedStylist("");
        setSelectedStylistError("");
        setSelectedServices([]);
        setSelectedServicesError(false);
        setSelectedDateTime();
        setSelectedDateTimeError(false);
        setAppliedPromotionAmount(0);
        setAppliedPromotionAmountError("");
        setAppointmentDetails("");
        setAppointmentDetailsError("");
    }

    const handleSubmitCreateAppointmentForm = async () => {
        let inputValidationError = false;

        if (!selectedClient) {
            setSelectedClientError('A client must be selected');
            inputValidationError = true;
        }

        if (!selectedStylist) {
            setSelectedStylistError('A stylist must be selected');
            inputValidationError = true;
        }

        if ((selectedServices.length ?? 0) < 1) {
            setSelectedServicesError(true);
            inputValidationError = true;
        } 

        if (!selectedDateTime) {
            setSelectedDateTimeError("Date time input is required");
            inputValidationError = true;
        }

        if (inputValidationError) {
            return;
        }

        setOnLoading(true);

        try {
            const newAppointmentInput = {
                client: selectedClient.toString(),
                stylist: selectedStylist.toString(),
                services: selectedServices,
                time: selectedDateTime.toISOString(),
                status: "Confirmed"
            };

            if (appointmentDetails) {
                newAppointmentInput.details = appointmentDetails;
            }

            if (appliedPromotionAmount) {
                newAppointmentInput.discount = parseFloat(appliedPromotionAmount);
            }

            const createAppointment = await apolloClient.mutate({
                mutation: ADD_APPOINTMENT,
                variables: {
                    newAppointment: newAppointmentInput
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

            const createdAppointment = createAppointment?.data?.newAppointment

            if (!createdAppointment) {
                throw new Error('Unable to add appointment to listing');
            }

            const sendConfirmedAppointmentEmail = await EmailJS.send(emailJS.serviceID, emailJS.appointmentConfirmedTemplateID, {
                client: createdAppointment.client.name,
                stylist: createdAppointment.stylist.name,
                stylist_phone: createdAppointment.stylist.phone,
                send_to: createdAppointment.client.email,
                message: `${createdAppointment.stylist.name} has confirmed an appointment with you for ${generateAppointmentDetailMessage(createdAppointment)}`
            }, emailJS.userID);

            if ((sendConfirmedAppointmentEmail?.status ?? "") != 200) {
                throw new Error("Unable to send appointment confirmation email");
            }

            setAlertStatus("success");
            setAlertMessage("Appointment Successfully Added");
        } catch (err) {
            console.log(err);
            setAlertStatus("error");
            setAlertMessage("Error adding appointment");
        } finally {
            handleResetCreateAppointmentForm();
            setShowAlert(true);
            setOnLoading(false);
        }
    }
    
    useEffect(() => {
        if (error) {
            setAlertStatus("error");
            setAlertMessage("Error Setting Up Page");
            setShowAlert(true);
        }
    }, []);

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
    
            setServiceByKind(newServicesByKind);
        }
    }, [serviceTypeFilter]);

    const filteredClients = clients.filter(client => {
        if (client.name.toLocaleLowerCase().includes(searchedClient.toLocaleLowerCase())) {
            return true;
        }

        return false;
    });

    return (
        <Layout userDetail={userDetail}>
            <Container maxWidth="lg" sx={{ px: 2, py: 2, border: "2px solid black" }}>
                <h2>Add a new appointment to Studio Booking List</h2>
                <Divider />
                <div id={styles.select_client_container}>
                    <h6 style={{ textAlign: 'start', marginTop: 20, fontWeight: 'normal' }}>Client</h6>
                    <TextField sx={{ width: "100%" }}
                        id="search_client" 
                        name="search_client" 
                        label="Search for the client" required
                        type="text" placeholder='Danh Nguyen'
                        autoComplete="off"
                        error={(selectedClientError ?? '') != ''}
                        onChange={handleSearchedClientChange}
                        onFocus={() => setHideClientList(false)}
                        onBlur={(e) => {
                            if (Array.from(e?.relatedTarget?.classList ?? []).includes("client_option")) {
                                return;
                            }

                            setHideClientList(true);
                        }}
                        value={searchedClient} helperText="Select the client"/>
                    <List id={styles.clients_list} sx={{ bgcolor: 'background.paper', visibility: `${hideClientList ? 'hidden' : 'visible'}` }} 
                        aria-label="searched_client">
                        {filteredClients.map(client => {
                            return (
                                <ListItem disablePadding key={client.id.toString()}>
                                    <ListItemButton className='client_option' selected={selectedClient == client.id.toString()} sx={{ textAlign: 'center' }}
                                        onClick={(e) => handleSelectClientChange(client.id, client.name)}>
                                        <ListItemText primary={client.name + " " + client.phone} />
                                    </ListItemButton>
                                </ListItem>
                            )
                        })}
                    </List>      
                </div>
                <FormControl sx={{ my: 2, minWidth: "40%", maxWidth: "40%" }} error={(selectedStylistError ?? '') != ''}>
                    <FormLabel id="select_stylist_label">Stylist</FormLabel>
                    <Select labelId="select_stylist_input_label" id="stylist_input" value={selectedStylist} onChange={handleSelectStylistChange}>
                        {stylists.map(stylist => {
                            return (
                                <MenuItem key={stylist.id.toString()} value={stylist.id.toString()}>{stylist.name}</MenuItem>
                            );
                        })}
                    </Select>
                    <FormHelperText>Select the stylist</FormHelperText>
                </FormControl>
                <br />
                <FormControl sx={{ my: 2, minWidth: 150, maxWith: 200 }}>
                    <InputLabel id="service_type_filter_label">Service Type</InputLabel>
                    <Select labelId="service_type_filter_label" id="service_type_input" value={serviceTypeFilter} onChange={handleServiceTypeFilterChange} autoWidth>
                        {Object.keys(servicesByType).map(serviceType => {
                            return (
                                <MenuItem key={serviceType} value={serviceType}>{serviceType.toLocaleUpperCase()}</MenuItem>
                            )
                        })}
                    </Select>
                </FormControl>
                <FormControl sx={{ my: 2, width: 400, minWidth: 300, py: 1 }} error={selectedServicesError}>
                    <InputLabel shrink id="select_multiple_services">Services</InputLabel>
                    <Select multiple native value={selectedServices} onChange={handleSelectedServiceChange} inputProps={{ id: 'select_multiple_services' }}>
                        {Object.entries(serviceByKind ?? []).map(key => {
                            return (
                                <optgroup key={key[0]} label={key[0]}>
                                    {key[1].map(service => {
                                        return (
                                            <option key={service.id.toString()} value={service.id.toString()}>{service.name}</option>
                                        );
                                    })}
                                </optgroup>
                            );
                        })}
                    </Select>
                    <FormHelperText>Select one or more (Drag mouse or hold CTRL)</FormHelperText>
                </FormControl>
                <FormControl sx={{ my: 2, display: "block" }} required>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker label="Appointment Datetime" value={selectedDateTime} onChange={handleSelectedDateTimeChange} renderInput={(params) => <TextField {...params} />} />
                    </LocalizationProvider>
                    <FormHelperText error={selectedDateTimeError}>Appointment date time should be in the future</FormHelperText>
                </FormControl>  
                <TextField 
                    sx={{ my: 2 }}
                    id="applied_promo_amount_input" 
                    name="applied_promo_amount" 
                    label="Applied Promotion Amount" 
                    type="text" 
                    error={(appliedPromotionAmountError ?? '') != ''}
                    value={appliedPromotionAmount} onChange={handleAppliedPromotionAmountChange} helperText={`Enter amount in USD`} />
                <TextField
                    sx={{ my: 2 }}
                    id="appointment_details_input"
                    name="appointment_details_input"
                    label="Description"
                    type="text" multiline rows={3} 
                    fullWidth
                    error={(appointmentDetailsError ?? '') != ''}
                    value={appointmentDetails} onChange={handleAppointmentDetailsChange} inputProps={{ maxLength: 250 }} 
                    helperText={`Count: ${appointmentDetails?.length ?? 0} | Remaining ${250-(appointmentDetails?.length ?? 0)} ${appointmentDetailsError}`}/>
                <Stack direction="row" justifyContent={'end'} gap={2}>
                    <Button variant="outlined" onClick={handleResetCreateAppointmentForm} startIcon={<ClearIcon />}>
                        Clear
                    </Button>
                    <LoadingButton 
                        color="primary" 
                        onClick={handleSubmitCreateAppointmentForm} 
                        loading={onLoading} loadingPosition="end"
                        endIcon={<ArrowCircleRightIcon />} variant="contained">
                        Submit
                    </LoadingButton>
                </Stack>
            </Container>
            <Container maxWidth="xs" className="alert_popup">
                <Collapse in={showAlert}>
                    <Alert
                        severity={alertStatus ?? 'info'}
                        action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setAlertMessage('');
                                setShowAlert(false);
                                setAlertStatus();
                            }}>
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                        }
                        sx={{ mb: 2 }} >
                        <AlertTitle>{(alertStatus ?? 'info').toLocaleUpperCase()}</AlertTitle>
                        {alertMessage}
                    </Alert>
                </Collapse>
            </Container>  
        </Layout>
    )
}

export async function getServerSideProps(context) {
    try {
        const cookies = Cookie.parse(context.req.headers?.cookie ?? '');
        const authToken = cookies?.token;
        const payload = Jwt.decode(authToken);

        if (!payload || (payload?.exp ?? 0) * 1000 < Date.now() || payload?.role?.toLowerCase() != 'admin') {
            throw new Error("Invalid auth token");
        }

        // Check if user has not been deleted or their status haven't change
        const getUser = await ApolloClient.query({
            query: GET_USER,
            variables: {
                userId: payload?.id
            },
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            },
            fetchPolicy: 'network-only'
        });

        const user = getUser?.data?.user;

        if (!user || user.status != "active") {
            throw new Error('Unable to verify credentials');
        }

        const getClients = await ApolloClient.query({
            query: GET_USERS,
            variables: {
                role: "client"
            },
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            },
        });

        const clients = getClients?.data?.users;

        if (!clients) {
            throw new Error('Unable to fetch clients');
        }

        const getStylists = await ApolloClient.query({
            query: GET_USERS,
            variables: {
                role: "stylist"
            }
        });

        const stylists = getStylists?.data?.users;

        if (!stylists) {
            throw new Error('Unable to fetch stylists');
        }

        const getServices = await ApolloClient.query({
            query: GET_SERVICES
        });

        const services = getServices?.data?.services;

        if (!services) {
            throw new Error('Unable to fetch services');
        }
        
        const activeServices = services.filter(service => service.status.toLowerCase() == "active");

        activeServices.sort((a, b) => {
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
    
        const servicesByType = {};
        activeServices.forEach(service => {
            if (servicesByType.hasOwnProperty(service.type)) {
                servicesByType[service.type].push(service);
            } else {
                servicesByType[service.type] = [service];
            }
        });

        return {
            props: {
                userDetail: user,
                clients: clients,
                stylists: stylists,
                servicesByType: servicesByType,
                emailJS: {
                    serviceID: process.env.EMAILJS_SERVICE_ID,
                    appointmentConfirmedTemplateID: process.env.EMAILJS_APPOINTMENT_CONFIRMED_TEMPLATE_ID,
                    userID: process.env.EMAILJS_USER_ID
                }
            }
        }
    } catch (err) {
        const reason = err.message.toLowerCase();

        if (reason == 'unable to verify credentials' || reason == 'invalid auth token') {
            return {
                notFound: true
            }
        }

        return {
            props: {
                error: err?.message
            }
        }
    }
}