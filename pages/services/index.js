import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Cookie from 'cookie';
import Jwt from 'jsonwebtoken';
import { useApolloClient } from '@apollo/client';

import ApolloClient from '../../lib/apollo/apollo-client';
import Layout from '../../components/page-layout';
import styles from '../../styles/servicespage.module.css';
import ServicePanel from '../../components/service_panel';
import { GET_SERVICES, GET_USER } from '../../lib/apollo/data-queries';

export default function ServicesPage({ servicesByType }) {
    const router = useRouter();
    const ApolloClient = useApolloClient();

    const [userDetails, setUserDetails] = useState();

    useEffect(async () => {
        try {
            const cookies = Cookie.parse(document?.cookie ?? '');
            const authToken = cookies?.token;
            const payload = Jwt.decode(authToken);
    
            if (!payload || Date.now() > payload.exp * 1000) {
                throw new Error('Auth Token is invalid');
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
                    throw new Error("Unable to verify user identity");
                }

                user = user.data.user;
                localStorage.setItem("user")
            } 

            setUserDetails(user);
        } catch(err) {
            return;
        }
    }, []);

    return (
        <Layout userDetail={userDetails}>
            <div className={styles.services_menu}>
                {Object.entries(servicesByType).map(key => {
                    return (
                        <Link key={key[0]} href={`${router.pathname}/${key[0].toLowerCase()}`} passHref>
                            <ServicePanel key={key[0]} className={styles.service_panel} serviceType={key[0]} services={key[1]} /> 
                        </Link>
                    );
                })}
            </div>
        </Layout>
    );
}

export async function getStaticProps() {
    const { data } = await ApolloClient.query({
        query: GET_SERVICES
    });

    if (!data) {
        return {
            notFound: true
        }
    }

    let services = Array.from(data.services).filter(service => service.status.toLowerCase() == "active");
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
            servicesByType: servicesByType
        },
        revalidate: 86400
    }
};