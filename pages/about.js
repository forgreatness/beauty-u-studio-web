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
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import Divider from '@mui/material/Divider';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import Layout from '../components/page-layout';
import { GET_USER } from '../lib/apollo/data-queries';
import styles from '../styles/aboutpage.module.css';
import { TermsOfService, Policy, PolicyColor, StudioContact, StudioHours, StudioLocation } from '../src/constants/index';
import Phone from '@mui/icons-material/Phone';

export default function AboutPage() {
    const ApolloClient = useApolloClient();
    const [userDetails, setUserDetails] = useState();

    const getUserDetails = async () => {
        try {
            const cookies = Cookie.parse(document?.cookie ?? '');

            const authToken = cookies?.token;
            const payload = Jwt.decode(authToken);
    
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

            setUserDetails(user);
        } catch (err) {
            return;
        }
    }

    useEffect(() => {
        getUserDetails();
    }, []);
    
    return (
        <Layout userDetail={userDetails}>
            <Container id={styles.background_section}>
                <div className={styles.outter_box}>
                    <div className={styles.inner_box}>
                        <img id={styles.outside_shop_photo} atl="Outside view of BeautyUStudio" src="/images/outside_shop_photo.jpg" />
                        <div id={styles.background_info}>
                            <h3 className={styles.section_header}>Background</h3>
                            <p>BeautyUStudio started in 2019 by <span id={styles.owner_name}>Hoang Yen Nguyen</span>. 
                            A very ambitious and confident woman that grew up in Portland almost her whole entire life. 
                            From clothings, to singing, and nursing, she found her passion for beauty in the beginning with lash extension and eyebrow tatooing. 
                            Together with her good friend Thanh they have built BeautyUStudio to be an amazing beauty shop today that brings many joy, excitement, and trust to their clients</p>
                        </div>
                    </div>
                </div>
            </Container>
            <Stack id={styles.conditions_section} direction="row" spacing={2}>
                <div id={styles.terms_container}>
                    <h3 className={styles.section_header}>Terms of Service</h3>
                    <ul>
                        {TermsOfService.map((term, index) => {
                            return <li key={`Term${index+1}`}>{term}</li>
                        })}
                    </ul>
                </div>
                <div id={styles.policy_container}>
                    <h3 className={styles.section_header}>Policy</h3>
                    <div id={styles.policy_list}>
                        {Object.keys(Policy).map(policyName => {
                            return (<Card key={policyName} className={styles.policy_card} sx={{ width: 400, maxWidth: 500, minWidth: 250 }}>
                                <CardHeader title={policyName.toLocaleUpperCase()} sx={{ color: PolicyColor[policyName], fontWeight: "bold" }} />
                                <CardContent>
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
                                </CardContent>
                            </Card>);
                        })}
                    </div>
                </div>
            </Stack>
            <Container id={styles.contact_us_section}>
                <h3 className={styles.section_header}>Contact Us</h3>
                <Stack id={styles.contact_list} direction="row" spacing={2}>
                    <div className={styles.contact_item}>
                        <h5 className={styles.item_header}>Contacts</h5>
                        <List>
                            <a className={styles.clickable_contact_details} href={"mailto:" + StudioContact?.email} style={{ textDecoration: "none", color: "#616161" }}>
                                <ListItem>
                                    <ListItemIcon>
                                        <EmailIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={StudioContact?.email} />
                                </ListItem>                       
                            </a>
                            <a className={styles.clickable_contact_details} href={"tel:" + StudioContact?.phone} style={{ textDecoration: "none", color: "#616161" }}>
                                <ListItem>
                                    <ListItemIcon>
                                        <PhoneIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={StudioContact?.phone} />
                                </ListItem>                       
                            </a>
                        </List>
                    </div>
                    <div className={styles.contact_item}>
                        <h5 className={styles.item_header}>Location</h5>
                        <List>
                            {StudioLocation.map((location, index) => {
                                const address = `${location?.street} ${location?.city} ${location?.state} ${location.zip}`;

                                return (
                                    <a id={`location${index}`} className={styles.clickable_contact_details} href={"mailtoaddress:" + address} style={{ textDecoration: "none", color: "#616161" }}>
                                        <ListItem>
                                            <ListItemIcon>
                                                <LocationOnIcon />
                                            </ListItemIcon>
                                            <ListItemText primary={address} />
                                        </ListItem>                       
                                    </a>
                                );
                            })}
                        </List>
                    </div>
                    <div className={styles.contact_item}>
                        <h5 className={styles.item_header}>Business Hours</h5>
                        <List>
                            {Object.keys(StudioHours).map(day => {
                                return (
                                    <ListItem key={day} style={{ paddingLeft: "0px" }}>
                                        <ListItemText><u>{day.toLocaleUpperCase()}</u>:&emsp;{StudioHours[day]}</ListItemText>
                                    </ListItem>
                                )
                            })}
                        </List>
                    </div>
                </Stack>
                <div>
                    <iframe 
                        width="100%" 
                        height="600" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight="0" 
                        marginWidth="0" 
                        src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=15405%20sw%20116th%20ave%20suite%20105+(BeautyUStudio)&amp;t=&amp;z=17&amp;ie=UTF8&amp;iwloc=B&amp;output=embed">
                    </iframe>
                </div>
            </Container>
        </Layout>
    );
}
