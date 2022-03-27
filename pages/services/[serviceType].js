import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import React, { useState, useEffect } from 'react';
import Cookie from 'cookie';
import Jwt from 'jsonwebtoken';

import Layout from '../../components/page-layout';
import ApolloClient from '../../lib/apollo/apollo-client'
import { GET_SERVICES, GET_USER } from '../../lib/apollo/data-queries';
import ServiceDetailCard from '../../components/service_detail_card';
import styles from '../../styles/servicetypepage.module.css';

function Service({ serviceType, servicesByKind }) {
    const [selectedServiceKind, setSelectedServiceKind] = useState(Object.keys(servicesByKind).sort()[0]);
    const [userDetail, setUserDetail] = useState();


    const handleServiceKindChange = (e, newValue) => {
        e.preventDefault();

        setSelectedServiceKind(newValue);
    }

    useEffect(async () => {
        try {
            const cookies = Cookie.parse(document?.cookie ?? '');
            const payload = Jwt.decode(cookies?.token);
    
            if (!payload || Date.now() > payload.exp * 1000) {
                throw new Error("Invalid Token");
            }

            let user = JSON.parse(localStorage.getItem("user"));

            if (!user) {
                user = await ApolloClient.query({
                    query: GET_USER,
                    variables: {
                        userId: payload?.id
                    }
                });

                if (!user) {
                    throw new Error("Unable to obtain user identity");
                }

                user = user.data.user;
                localStorage.setItem("user", JSON.stringify(user));
            }

            setUserDetail(user);
        } catch (err) {
            return;
        }
    }, []);

    return (
        <Layout userDetail={userDetail}>
            <h2 id={styles.serviceTypeHeading}>{serviceType.toLocaleUpperCase()}</h2>
            <Box sx={{ width: '80%', mx: 'auto' }}>
                <Tabs
                    sx={{ ".MuiTabs-flexContainer": {
                        display: "inline-block",
                        textAlign: "center",
                        width: "100%"
                    } }}
                    value={selectedServiceKind}
                    onChange={handleServiceKindChange}
                    textColor='secondary'
                    indicatorColor='secondary'
                    aria-label="Service Kind Tab"
                    variant="scrollable"
                    scrollButtons
                    allowScrollButtonsMobile>
                    {Object.keys(servicesByKind).sort().map(serviceKind => {
                        return (
                            <Tab key={serviceKind} value={serviceKind} label={serviceKind.toLocaleUpperCase()} />
                        )
                    })}
                </Tabs>
            </Box>
            <Box sx={{ my: '30px', ".MuiGrid-container": { justifyContent: "space-evenly" } }}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 4 }} columns={{ xs: 4, sm: 8, md: 9, lg: 12, xl: 20}}>
                    {servicesByKind[selectedServiceKind].map(service => {
                        return (
                            <Grid key={service.id} item xs={4} sm={4} md={3} lg={4} xl={5}>
                                <ServiceDetailCard service={service} />
                            </Grid>
                        )
                    })}
                </Grid>
            </Box>
        </Layout>
    );
}

export async function getStaticPaths() {
    const { data } = await ApolloClient.query({
        query: GET_SERVICES
    });

    if (!data) {
        return {
            paths: [],
            fallback: false
        };
    }

    let services = Array.from(data.services).filter(service => service.status.toLowerCase() == "active");
    let servicesByType = {};
    services.forEach(service => {
        if (servicesByType.hasOwnProperty(service.type)) {
            servicesByType[service.type].push(service);
        } else {
            servicesByType[service.type] = [service];
        }
    });

    const paths = Object.keys(servicesByType).map(type => {
        return {
            params: {
                serviceType: type.toLowerCase(),
            }
        }
    });

    return {
        paths: paths,
        fallback: false
    };
};

export async function getStaticProps({ params }) {
    const { data } = await ApolloClient.query({
        query: GET_SERVICES
    });

    if (!data) {
        return {
            notFound: true
        }
    }

    let services = Array.from(data.services).filter(service => service.status.toLowerCase() == "active" && service.type.toLowerCase() == params.serviceType);
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

    let servicesByKind = {};
    services.forEach(service => {
        if (service.kind == undefined) {
            if (servicesByKind.hasOwnProperty("Standard")) {
                servicesByKind["Standard"].push(service);
            } else {
                servicesByKind["Standard"] = [service];
            }
        } else {
            if (servicesByKind.hasOwnProperty(service.kind.type)) {
                servicesByKind[service.kind.type].push(service);
            } else {
                servicesByKind[service.kind.type] = [service];
            }
        }
    });


    return { 
        props: { 
            serviceType: params.serviceType,
            servicesByKind: servicesByKind
        } 
    };  
};

export default Service