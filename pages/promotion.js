import React, { useState, useEffect } from 'react';
import Cookie from 'cookie';
import Jwt from 'jsonwebtoken';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import Divider from '@mui/material/Divider';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormLabel from '@mui/material/FormLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DateTimePicker from '@mui/lab/DateTimePicker';
import Stack from '@mui/material/Stack';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { useApolloClient } from '@apollo/client';

import ApolloClient from '../lib/apollo/apollo-client';
import Layout from '../components/page-layout';
import { GET_SERVICES, GET_USER } from '../lib/apollo/data-queries';

export default function PromotionPage({ servicesByType, user }) {
    const [onLoading, setOnLoading] = useState(false);
    const [onLoadingNotification, setOnLoadingNotification] = useState('');
    
    const [serviceTypeFilter, setServiceTypeFilter] = useState(Object.keys(servicesByType)[0]);
    const [serviceByKind, setServiceByKind] = useState([]);
    const [qualifyingServices, setQualifyingServices] = useState([]);
    const [newPromoCode, setNewPromoCode] = useState('');
    const [newPromoAmount, setNewPromoAmount] = useState();
    const [newPromoCodeError, setNewPromoCodeError] = useState('');
    const [newPromoType, setNewPromoType] = useState('percentage');
    const [newPromoStartDate, setNewPromoStartDate] = useState();
    const [newPromoEndDate, setNewPromoEndDate] = useState();
    const [newPromoDescription, setNewPromoDescription] = useState();

    const handleNewPromoCodeChange = (e) => {
        setNewPromoCode(e.target.value.toUpperCase());
    }

    const handleServiceTypeFilterChange = (e) => {
        setServiceTypeFilter(e.target.value);
    }

    const handleNewPromoAmountChange = (e) => {
        if (isNaN(e.target.value)) {
            return;
        }

        setNewPromoAmount(e.target.value);
    }

    const handleNewPromoType = (e) => {
        setNewPromoType(e.target.value);
    }

    const handleQualifyingServicesChange = (e) => {
        let newSelected = Array.from(e.target.selectedOptions, option => option.value);

        const selected = qualifyingServices.filter(serviceId => {
            let currentServices = servicesByType[serviceTypeFilter];
            let exist = currentServices.findIndex(service => service.id.toString() == serviceId);

            if (!serviceTypeFilter || exist > -1) {
                return false;
            }

            return true;
        });

        setQualifyingServices(selected.concat(newSelected));
    }

    const handleNewPromoStartDateChange = (newDateTime) => {
        setNewPromoStartDate(newDateTime);
    }

    const handleNewPromoEndDateChange = (newDateTime) => {
        setNewPromoEndDate(newDateTime);
    }

    const handleNewPromoDescriptionChange = (e) => {
        setNewPromoDescription(e.target.value);
    }

    const handleNewPromoFormSubmit = () => {

    }

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

    const promoTypeUnit = newPromoType == "percentage" ? '%' : '$';

    return (
        <Layout userDetail={user}>
            <Container maxWidth="lg" sx={{ px: 2, py: 2, border: "2px solid black" }}>
                <h2>Create New Promo</h2>
                <Divider />
                <FormControl sx={{ display: "block" }}>
                    <TextField sx={{ my: 2 }}
                        id="promo_code" 
                        name="promo_code" 
                        label="Promotion Code" 
                        type="text" placeholder='SUMMER20' 
                        value={newPromoCode} onChange={handleNewPromoCodeChange} helperText="The promotion code must be at least 8 characters" />
                </FormControl>
                <FormControl sx={{ display: "block" }}>
                    <FormLabel id="promo_type_label">Promotion Type</FormLabel>
                    <RadioGroup row aria-labelledby='promo_type_label' defaultValue={newPromoType} name="promo_type_group" onChange={handleNewPromoType}>
                        <FormControlLabel value="percentage" control={<Radio />} label="%" />
                        <FormControlLabel value="value" control={<Radio />} label="USD" />
                    </RadioGroup>
                </FormControl>
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
                <FormControl sx={{ my: 2, width: 400, minWidth: 300 }}>
                    <InputLabel shrink id="select_multiple_services">Qualifying Services</InputLabel>
                    <Select multiple native value={qualifyingServices} onChange={handleQualifyingServicesChange} inputProps={{ id: 'select_multiple_services' }}>
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
                    <FormHelperText>Select One or more (Drag mouse or hold CTRL)</FormHelperText>
                </FormControl>
                <FormControl sx={{ my: 2, display: "block" }}>
                    <TextField 
                        id="promo_amount_input" 
                        name="promo_amount_input" 
                        label="Amount For" 
                        type="text" 
                        value={newPromoAmount} onChange={handleNewPromoAmountChange} helperText={`Enter amount in ${promoTypeUnit}`} />
                </FormControl>
                <FormControl sx={{ my: 2, display: "block" }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Stack direction="row">
                        <DateTimePicker label="Start Datetime" value={newPromoStartDate} onChange={handleNewPromoStartDateChange} renderInput={(params) => <TextField {...params} />} />
                        <DateTimePicker label="End Datetime" value={newPromoEndDate} onChange={handleNewPromoEndDateChange} renderInput={(params) => <TextField {...params} />} />
                    </Stack>
                    </LocalizationProvider>
                </FormControl>
                <FormControl sx={{ my: 2, display: 'block' }}>
                    <TextField
                        id="promo_description_input"
                        name="promo_description_input"
                        label="Description"
                        type="text" multiline rows={3} 
                        fullWidth
                        value={newPromoDescription} onChange={handleNewPromoDescriptionChange} inputProps={{ maxLength: 250 }} 
                        helperText={`Count: ${newPromoDescription?.length ?? 0} | Remaining ${250-newPromoDescription.length}`}/>
                </FormControl>
            </Container>            
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={onLoading}>
                <CircularProgress color="inherit" />
                <span>&nbsp;{onLoadingNotification}</span> 
            </Backdrop>
        </Layout>
    )
}

export async function getServerSideProps(context) {
    try {
        const cookies = Cookie.parse(context.req.headers?.cookie ?? '');
        const authToken = cookies?.token;
        const payload = Jwt.decode(authToken);

        if (!payload || Date.now() > (payload?.exp ?? 0) * 1000) {
            throw new Error('bad token');
        }

        const user = await ApolloClient.query({
            query: GET_USER,
            variables: {
                userId: payload.id
            },
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            },
            fetchPolicy: "no-cache"
        });

        if (!user) {
            throw new Error('Unable to identify user with token');
        }

        if (user.data.user.status.toLowerCase() == 'suspended') {
            throw new Error('Account is suspended');
        }

        if (user.data.user.status.toLowerCase() == 'not activated') {
            throw new Error('Account is not activated');
        }

        if (user.data.user.role.toLowerCase() != "admin") {
            throw new Error('Unauthorized');
        }

        const getServices = await ApolloClient.query({
            query: GET_SERVICES
        });

        if (!getServices) {
            throw new Error('Error getting services');
        }

        let services = Array.from(getServices.data.services).filter(service => service.status.toLowerCase() == "active");
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

        return {
            props: {
                servicesByType: servicesByType,
                user: user.data.user
            }
        }
    } catch (err) {
        const reason = err?.message.toLowerCase();

        if (reason == 'bad token' || reason == 'unable to identify user with token' || reason == 'unauthorized') {
            context.res.setHeader(
                "Set-Cookie", [
                `token=; Max-Age=0`
                ]
            );

            return {
                notFound: true
            };
        } else if (reason == 'suspended') {
            return {
                redirect: {
                    source: '/promotion',
                    destination: '/info/suspended',
                    permanent: false
                }
            }
        } else if (reason == 'not activated') {
            return {
                redirect: {
                    source: '/promotion',
                    destination: '/info/notActivated',
                    permanent: false
                }
            }
        } else {
            context.res.setHeader(
                "Set-Cookie", [
                `error=${reason}; Max-Age=30`
                ]
            )

            return {
                redirect: {
                    source: '/promotion',
                    destination: '/',
                    permanent: false
                }
            }
        }
    }
}