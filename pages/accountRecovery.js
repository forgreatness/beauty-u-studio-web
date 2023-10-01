import { useEffect, useState } from 'react';
import Jwt from 'jsonwebtoken';
import { useRouter } from 'next/router';
import Container from '@mui/material/Container';

import ApolloClient from '../lib/apollo/apollo-client';
import { RECOVER_ACCOUNT, GET_USER } from '../lib/apollo/data-queries';
import Layout from '../components/page-layout';

export default function AccountRecovery({ authToken }) {
    const router = useRouter();
    const [userDetails, setUserDetails] = useState();

    const getUserDetails = async () => {
        try {
            const payload = Jwt.decode(authToken);

            if (!payload || (payload?.exp ?? 0) * 1000 < Date.now()) {
                throw new Error("Invalid auth token");
            }
            
            const getUser = await ApolloClient.query({
                query: GET_USER,
                variables: {
                    userId: payload.id
                },
                context: {
                    headers: {
                        authorization: `Bearer ${authToken}`
                    }
                }
            });

            if (!getUser?.data?.user) {
                throw new Error('Unable to find user');
            }

            document.cookie = 'token=' + authToken;
            localStorage.setItem("user", JSON.stringify(getUser.data.user));

            setUserDetails(getUser.data.user);
        } catch (err) {
            router.push('/info/notRecovered');
        }
    }
    
    useEffect(() => {
        getUserDetails();
    }, []);

    return (
        <Layout userDetail={userDetails}>
            <Container sx={{ height: "70vh", textAlign: "center", position: "relative" }} maxWidth="xl">
                <h5 style={{ height: "20%", color: "green", position: "absolute", right: "50%", bottom: "50%", transform: "translateX(50%)" }}>{userDetails ? 'Account Succesfully Recovered' : 'Recovering'}</h5>
            </Container>
        </Layout>
    );
}

export async function getServerSideProps(context) {
    try {
        const recoveryToken = context.query?.recoveryToken;

        if (!recoveryToken) {
            throw new Error('no account recovery token provided');
        }

        const recoverAccount = await ApolloClient.query({
            query: RECOVER_ACCOUNT,
            variables: {
                accountRecoveryToken: recoveryToken
            },
            fetchPolicy: "no-cache"
        });

        const authToken = recoverAccount?.data?.token;

        if (!authToken) {
            throw new Error('unable to recover account');
        }

        return {
            props: {
                authToken: authToken
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/profile',
                destination: '/info/notRecovered',
                permanent: false
            }
        }
    }
}