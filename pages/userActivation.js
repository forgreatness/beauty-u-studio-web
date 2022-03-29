import React, { useEffect, useState } from 'react';
import Cookie from 'cookie';
import Jwt from 'jsonwebtoken';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import VerifiedIcon from '@mui/icons-material/Verified';
import GppBadIcon from '@mui/icons-material/GppBad';
import Container from '@mui/material/Container';

import { GET_USER, ACTIVATE_USER } from '../lib/apollo/data-queries';
import ApolloClient from '../lib/apollo/apollo-client';
import Layout from '../components/page-layout';
import { user } from '../src/constants';
// The purpose of the page is to activate the user account by using the query parameter
// ?uid and ?ac after verifing it. 
// If user navigate to the page and we cant find the user, or the code doesnt match with the activation then
// we will return invalid activation code 
// If the token is sucessful we will store the user info in the localstorage, save the auth token and navigate the user 
// to the profile page

export default function UserActivation({ error, user, authToken }) {
    const [onLoading, setOnLoading] = useState(false);
    const [onLoadingNotification, setOnLoadingNotification] = useState('');
    const [activationResult, setActivationResult] = useState('');

    useEffect(() => {
        let result = "";
        setOnLoading(true);
        setOnLoadingNotification('Activating');

        if (error || !user || !authToken) {
            result = 'Activation Unsuccessful';
        } else {
            result = `Hello ${user.name}, your account is sucessfully activated`;
            document.cookie = 'token=' + authToken;
            localStorage.setItem("user", JSON.stringify(user));
        }

        setOnLoadingNotification('');
        setOnLoading(false);
        setActivationResult(result);
    }, []);

    return (
        <Layout>
            {activationResult ? <Container sx={{ position: "fixed", top: "30%", left: "50%", width: "fit-content", transform: "translate(-50%, -50%)"}}>
                {error ? <GppBadIcon sx={{ color: "#b71c1c" }} /> : <VerifiedIcon sx={{ color: "#1b5e20" }} />}
                {activationResult}
            </Container> : null}
            <Backdrop
                sx={{ color: 'black', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={onLoading}>
                <CircularProgress color="inherit" />
                <span>&nbsp;{onLoadingNotification}</span> 
            </Backdrop>
        </Layout>
    )
}

export async function getServerSideProps(context) {
    try {
        const queryParams = context.query;

        const decodedToken = await Jwt.verify(queryParams?.activationToken, process.env.JWT_ACTIVATION_TOKEN_KEY)

        if (!decodedToken || decodedToken.exp * 1000 < Date.now() || !decodedToken?.uid || !decodedToken?.ac) {
            throw new Error('invalid activation token');
        }

        let activate = await ApolloClient.mutate({
            mutation: ACTIVATE_USER,
            variables: {
                userId: decodedToken.uid,
                activationCode: decodedToken.ac
            },
            fetchPolicy: "no-cache",
        });

        if (!activate || activate?.data?.token) {
            throw new Error('unable to activate account');
        }

        let user = await ApolloClient.query({
            query: GET_USER,
            variables: {
                userId: decodedToken.uid,
            },
            context: {
                headers: {
                    authorization: `Bearer ${activate?.data?.token}`
                }
            },
            fetchPolicy: "no-cache"
        });

        return {
            props: {
                user: user.data.user,
                authToken: activate.data.token
            }
        }
    } catch (err) {
        return {
            props: {
                error: err.message
            }
        };
    }
}