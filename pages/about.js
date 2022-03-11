import React, { useState, useEffect } from 'react';
import Cookie from 'cookie';
import Jwt from 'jsonwebtoken';
import { useApolloClient } from '@apollo/client';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CropSquareIcon from '@mui/icons-material/CropSquare';

import Layout from '../components/page-layout';
import { GET_USER } from '../lib/apollo/data-queries';
import styles from '../styles/aboutpage.module.css';
import { TermsOfService, Policy, PolicyColor } from '../src/constants/index';

export default function AboutPage() {
    const ApolloClient = useApolloClient();
    const [userDetails, setUserDetails] = useState();

    useEffect(async () => {
        try {
            const cookies = Cookie.parse(document?.cookie ?? '');

            const authToken = cookies?.token;
            const payload = Jwt.decode(authToken);
    
            if (!payload || Date.now() > payload.exp * 1000) {
                throw new Error("Invalid Token");
            }

            const user = localStorage.getItem("user");

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
            }

            localStorage.setItem("user", user);
            setUserDetails(user);
        } catch (err) {
            return;
        }
    }, []);
    
    return (
        <Layout userDetail={userDetails}>
            <Container id={styles.background_section}>
                <div className={styles.outter_box}>
                    <div className={styles.inner_box}>
                        <img id={styles.outside_shop_photo} atl="Outside view of BeautyUStudio" src="/images/Outside_Shop_Template.jpg" />
                        <div id={styles.background_info}>
                            <h3 id={styles.background_info_header}>Background</h3>
                            <p>BeautyUStudio started in 2019 by <span id={styles.owner_name}>Hoang Yen Nguyen</span>. 
                            A very ambitious and confident women that grew up in Portland almost her whole entire life. 
                            From clothings, to singing, and nursing, she found her passion for beauty in the beginning with lip and eyebrow tatooing. 
                            Together with her good friend Thanh they have built BeautyUStudio to be an amazing beauty shop today that brings many joy, excitement, and trust to their clients</p>
                        </div>
                    </div>
                </div>
            </Container>
            <Stack id={styles.conditions_section} direction="row" spacing={2} overflow="wrap">
                <div id={styles.terms_container}>
                    <h3 id={styles.terms_header}>Terms of Service</h3>
                    <ul>
                        {TermsOfService.map((term, index) => {
                            return <li key={`Term${index+1}`}>{term}</li>
                        })}
                    </ul>
                </div>
                <div id={styles.policy_container}>
                    <h3 id={styles.policy_header}>Policy</h3>
                    <div id={styles.policy_list}>
                        {Object.keys(Policy).map(policyName => {
                            return (<Card key={policyName} sx={{ width: 400, maxWidth: 500, minWidth: 250 }}>
                                <CardHeader title={policyName.toLocaleUpperCase()} sx={{ color: PolicyColor[policyName], fontWeight: "bold" }} />
                                <List>
                                    {Policy[policyName].map((guideline, index) => {
                                        return (
                                            <ListItem key={`guideline${index+1}`}>
                                                <ListItemIcon>
                                                    <CropSquareIcon />
                                                </ListItemIcon>
                                                <ListItemText primary={guideline} />                                 
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </Card>);
                        })}
                    </div>
                </div>
            </Stack>
        </Layout>
    );
}
