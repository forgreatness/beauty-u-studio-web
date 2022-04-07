import React, { useState, useEffect } from 'react';
import Cookie from 'cookie';
import Jwt from 'jsonwebtoken';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
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
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useApolloClient, useQuery, gql } from '@apollo/client';

import ApolloClient from '../lib/apollo/apollo-client';
import Layout from '../components/page-layout';
import PromotionDetail from '../components/promotion_detail';
import { GET_SERVICES, GET_USER, GET_PROMOTIONS, ADD_PROMOTION, REMOVE_PROMOTION } from '../lib/apollo/data-queries';

export default function PromotionPage({ servicesByType, user }) {
    const ApolloClient = useApolloClient();

    const [onLoading, setOnLoading] = useState(false);
    const [onLoadingNotification, setOnLoadingNotification] = useState('');
    
    const [serviceTypeFilter, setServiceTypeFilter] = useState(Object.keys(servicesByType)[0]);
    const [serviceByKind, setServiceByKind] = useState([]);
    const [qualifyingServices, setQualifyingServices] = useState([]);
    const [newPromoCode, setNewPromoCode] = useState('');
    const [newPromoAmount, setNewPromoAmount] = useState('');
    const [newPromoType, setNewPromoType] = useState('percentage');
    const [newPromoStartDate, setNewPromoStartDate] = useState(new Date());
    const [newPromoEndDate, setNewPromoEndDate] = useState(new Date());
    const [newPromoDescription, setNewPromoDescription] = useState();

    const [newPromoCodeError, setNewPromoCodeError] = useState('');
    const [qualifyingServicesError, setQualifyingServicesError] = useState(false);
    const [newPromoAmountError, setNewPromoAmountError] = useState('');
    const [newPromoDateError, setNewPromoDateError] = useState(false);
    const [newPromoDescriptionError, setNewPromoDescriptionError] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertStatus, setAlertStatus] = useState();
    const [promotionTimeFrame, setPromotionTimeFrame] = useState('ACTIVE');
    const [promotionByTimeFrame, setPromotionByTimeFrame] = useState();

    const getPromotion = useQuery(GET_PROMOTIONS, {
        onCompleted: data => {
            if (!data?.promotions) {
                return;
            }

            let promotions = Array.from(data.promotions);
            let active = [];
            let previous = [];
            let upcoming = [];

            promotions.sort((a, b) => {
                const promotionAExpires = new Date(a.end);
                const promotionBExpires = new Date(b.end);

                if (promotionAExpires < promotionBExpires) {
                    return -1;
                } else if (promotionAExpires > promotionBExpires) {
                    return 1;
                } else {
                    return 0;
                }
            });

            promotions.forEach(promotion => {
                let promotionStart = new Date(promotion.start);
                let promotionEnd = new Date(promotion.end);

                if (Date.now() > promotionEnd) {
                    previous.push(promotion);
                } else if (Date.now() < promotionStart) {
                    upcoming.push(promotion);
                } else {
                    active.push(promotion);
                }
            });

            setPromotionByTimeFrame({
                active,
                previous,
                upcoming
            });
        },
        onError: error => {
            setAlertMessage('Unable to fetch promotions list');
            setAlertStatus('error');
            setShowAlert(true);
        },
    });

    const handlePromotionTimeFrameChange = (e, newValue) => {
        setPromotionTimeFrame(newValue);
    }

    const handleNewPromoCodeChange = (e) => {
        setNewPromoCode(e.target.value.toUpperCase());

        if ((e.target.value?.length ?? 0) >= 6) {
            setNewPromoCodeError('');
        }
    }

    const handleServiceTypeFilterChange = (e) => {
        setServiceTypeFilter(e.target.value);
    }

    const handleNewPromoAmountChange = (e) => {
        if (isNaN(e.target.value)) {
            return;
        }

        setNewPromoAmount(e.target.value);
        setNewPromoAmountError('');
    }

    const handleNewPromoType = (e) => {
        setNewPromoType(e.target.value);
    }

    const handleQualifyingServicesChange = (e) => {
        let newSelected = Array.from(e.target.selectedOptions, option => option.value);

        const previousSelected = qualifyingServices.filter(serviceId => {
            let currentServices = servicesByType[serviceTypeFilter];
            let exist = currentServices.findIndex(service => service.id.toString() == serviceId);

            if (!serviceTypeFilter || exist > -1) {
                return false;
            }

            return true;
        });

        const selected = previousSelected.concat(newSelected);

        setQualifyingServices(selected);
        
        if ((selected?.length ?? 0) > 0) {
            setQualifyingServicesError(false);
        }
    }

    const handleNewPromoStartDateChange = (newDateTime) => {
        setNewPromoStartDate(newDateTime);

        if (newDateTime < newPromoEndDate) {
            setNewPromoDateError(false);
        }
    }

    const handleNewPromoEndDateChange = (newDateTime) => {
        setNewPromoEndDate(newDateTime);

        if (newDateTime > newPromoStartDate) {
            setNewPromoDateError(false);
        }
    }

    const handleNewPromoDescriptionChange = (e) => {
        setNewPromoDescription(e.target.value);
        if (newPromoDescription) setNewPromoDescriptionError('');
    }

    const handleRemovePromotion = async (promotionID, promotionTimeFrame, index) => {
        try {
            setOnLoading(true);

            const removePromotion = await ApolloClient.mutate({
                mutation: REMOVE_PROMOTION,
                variables: {
                    promotionID: promotionID
                },
                update: (cache, { data: { removedPromotion }}) => {
                    cache.evict({
                        id: cache.identify(removedPromotion)
                    });
                }
            });

            if (!removePromotion?.data?.removedPromotion) {
                throw 'Unable to remove promotion';
            }

            const promotionByTimeFrameCopy = JSON.parse(JSON.stringify(promotionByTimeFrame));
            const promotions = promotionByTimeFrameCopy[promotionTimeFrame.toLocaleLowerCase()];
            promotions.splice(index, 1);
            promotionByTimeFrameCopy[promotionTimeFrame.toLocaleLowerCase()] = promotions;
            
            setPromotionByTimeFrame(promotionByTimeFrameCopy);
            setAlertMessage('Promotion successfully removed');
            setAlertStatus('success');
        } catch (err) {
            console.log(err);
            setAlertMessage('Unable to remove promotion');
            setAlertStatus('error')           
        } finally {
            setOnLoading(false);
            setShowAlert(true);
        }
    }

    const handleNewPromoFormSubmit = async () => {
        let error = false;

        if (!newPromoCode) {
            setNewPromoCodeError('(Required Field)');
            error = true;
        } else {
            if ((newPromoCode?.length ?? 0) < 6) {
                setNewPromoCodeError('(min 8 chars)');
                error = true;
            }
        }

        if ((qualifyingServices.length ?? 0) < 1) {
            setQualifyingServicesError(true);
            error = true;
        } 

        if (!newPromoAmount) {
            setNewPromoAmountError('(Required Field)');
            error = true;
        }

        if (newPromoStartDate >= newPromoEndDate) {
            setNewPromoDateError(true);
            error = true;
        }

        if (!newPromoDescription) {
            setNewPromoDescriptionError('Required Field');
            error = true;
        }

        if (error) {
            return;
        }

        // Add loading while the request is running
        setOnLoading(true);

        try {
            const addPromotion = await ApolloClient.mutate({
                mutation: ADD_PROMOTION,
                variables: {
                    newPromotion: {
                        code: newPromoCode,
                        type: newPromoType,
                        amount: parseInt(newPromoAmount),
                        description: newPromoDescription,
                        start: newPromoStartDate.toISOString(),
                        end: newPromoEndDate.toISOString(),
                        services: qualifyingServices
                    }
                },
                update: (cache, { data: { newPromotion } }) => {
                    cache.modify({
                        fields: {
                            promotions(existingPromotions = []) {
                                const newPromotionRef = cache.writeFragment({
                                    data: newPromotion,
                                    fragment: gql`
                                        fragment NewPromotion on Promotion {
                                            __typename
                                            id
                                            code
                                            type
                                            amount
                                            description
                                            services
                                            start
                                            end
                                        }
                                    `
                                });
                                return [...existingPromotions, newPromotionRef];
                            }
                        }
                    });
                }
            });
    
            if (!addPromotion?.data?.newPromotion) {
                throw "response is undefined";
            }

            let newPromotionTimeFrame = '';
            
            if (Date.now() > newPromoEndDate) {
                newPromotionTimeFrame = "previous";
            } else if (Date.now() < newPromoStartDate) {
                newPromotionTimeFrame = "upcoming";
            } else {
                newPromotionTimeFrame = "active";
            }

            const timeFramePromotions = Array.from(promotionByTimeFrame[newPromotionTimeFrame]);
            timeFramePromotions.splice(
                findSortedIndex(timeFramePromotions, addPromotion.data.newPromotion), 0, addPromotion.data.newPromotion);

            console.log({
                ...promotionByTimeFrame,
                [newPromotionTimeFrame]: timeFramePromotions
            });

            setPromotionByTimeFrame({
                ...promotionByTimeFrame,
                [newPromotionTimeFrame]: timeFramePromotions
            });
            handleNewPromoFormClear();
            setAlertMessage('Promotion successfully added');
            setAlertStatus('success');
        } catch (err) {
            console.log(err);
            setAlertMessage('Unable to create new promotion');
            setAlertStatus('error')
        } finally {
            setOnLoading(false);
            setShowAlert(true);
        }
    }

    const handleNewPromoFormClear = () => {
        setQualifyingServices([]);
        setNewPromoCode('');
        setNewPromoAmount('');
        setNewPromoStartDate(new Date());
        setNewPromoEndDate(new Date());
        setNewPromoDescription('');
        setNewPromoCodeError('');
        setQualifyingServicesError(false);
        setNewPromoAmountError('');
        setNewPromoDateError(false);
        setNewPromoDescriptionError('');
    }

    const findSortedIndex = (promotions, promotion) => {
        let index = 0; 
        let promotionExpires = new Date(promotion.end);

        for (index = 0; index < promotions.length; index++) {
            let currentPromotionExpires = new Date(promotions[index].end);

            if (promotionExpires >= currentPromotionExpires) {
                break;
            }
        }

        return index;
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
            <Container sx={{ p: 2, m: 2 }}>
                <Stack gap={3} direction="row" alignContent={"center"} alignItems={"center"}>
                    <h3>ALL PROMOTIONS</h3>
                    <Tabs value={promotionTimeFrame} onChange={handlePromotionTimeFrameChange} textColor="primary" indicatorColor="primary" aria-label="view all promotions based on upcoming, past, or active">
                        <Tab value="ACTIVE" label="ACTIVE" />
                        <Tab value="UPCOMING" label="UPCOMING" />
                        <Tab value="PREVIOUS" label="PREVIOUS" />
                    </Tabs>
                </Stack>
                <Stack sx={{ p: 5 }} gap={5} direction="row" alignContent="center" alignItems="center" overflow="auto">
                    {(promotionByTimeFrame?.[promotionTimeFrame.toLocaleLowerCase()] ?? []).map((promotion, index) => {
                        return (
                            <PromotionDetail onRemovePromotion={(promotionID) => handleRemovePromotion(promotionID, promotionTimeFrame, index)} promotion={promotion} key={promotion.id.toLocaleLowerCase()} />
                        )
                    })}
                </Stack>
            </Container>
            <Container maxWidth="lg" sx={{ px: 2, py: 2, border: "2px solid black" }}>
                <h2>Create New Promo</h2>
                <Divider />
                <FormControl sx={{ display: "block" }}>
                    <TextField sx={{ my: 2 }}
                        id="promo_code" 
                        name="promo_code" 
                        label="Promotion Code" required
                        type="text" placeholder='SUMMER20' 
                        error={(newPromoCodeError ?? '') != ''}
                        value={newPromoCode} onChange={handleNewPromoCodeChange} helperText={`The promotion code must be at least 8 characters ${newPromoCodeError ?? ''}`}/>
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
                <FormControl sx={{ my: 2, width: 400, minWidth: 300, py: 1 }} error={qualifyingServicesError}>
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
                    <FormHelperText>Select one or more (Drag mouse or hold CTRL)</FormHelperText>
                </FormControl>
                <FormControl sx={{ my: 2, display: "block" }}>
                    <TextField 
                        id="promo_amount_input" 
                        name="promo_amount_input" 
                        label="Amount For" 
                        type="text" 
                        error={(newPromoAmountError ?? '') != ''}
                        value={newPromoAmount} onChange={handleNewPromoAmountChange} helperText={`Enter amount in ${promoTypeUnit} ${newPromoAmountError}`} />
                </FormControl>
                <FormControl sx={{ my: 2, display: "block" }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Stack direction="row">
                            <DateTimePicker label="Start Datetime" value={newPromoStartDate} onChange={handleNewPromoStartDateChange} renderInput={(params) => <TextField {...params} />} />
                            <DateTimePicker label="End Datetime" value={newPromoEndDate} onChange={handleNewPromoEndDateChange} renderInput={(params) => <TextField {...params} />} />
                        </Stack>
                    </LocalizationProvider>
                    <FormHelperText error={newPromoDateError}>Start Date must be before End Date</FormHelperText>
                </FormControl>
                <FormControl sx={{ my: 2, display: 'block' }}>
                    <TextField
                        id="promo_description_input"
                        name="promo_description_input"
                        label="Description"
                        type="text" multiline rows={3} 
                        fullWidth
                        required
                        error={(newPromoDescriptionError ?? '') != ''}
                        value={newPromoDescription} onChange={handleNewPromoDescriptionChange} inputProps={{ maxLength: 250 }} 
                        helperText={`Count: ${newPromoDescription?.length ?? 0} | Remaining ${250-(newPromoDescription?.length ?? 0)} ${newPromoDescriptionError}`}/>
                </FormControl>
                <Stack direction="row" justifyContent={'end'} gap={2}>
                    <Button variant="outlined" onClick={handleNewPromoFormClear} startIcon={<ClearIcon />}>
                        Clear
                    </Button>
                    <LoadingButton 
                        color="primary" 
                        onClick={handleNewPromoFormSubmit} 
                        loading={onLoading} loadingPosition="end"
                        endIcon={<ArrowCircleRightIcon />} variant="contained">
                        Submit
                    </LoadingButton>
                </Stack>
            </Container>            
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={onLoading}>
                <CircularProgress color="inherit" />
                <span>&nbsp;{onLoadingNotification}</span> 
            </Backdrop>
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

        if (!getServices?.data?.services) {
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