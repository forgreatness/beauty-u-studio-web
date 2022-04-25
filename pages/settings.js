import { useEffect, useState } from 'react';
import Cookie from 'cookie';
import Jwt from 'jsonwebtoken';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

import ApolloClient from '../lib/apollo/apollo-client';
import { GET_USER } from '../lib/apollo/data-queries';
import Layout from '../components/page-layout';

export default function SettingsPage({ userDetails }) {
    return (
        <Layout userDetail={userDetails}>
            <Paper sx={{ width: "300px", maxWidth: '350px' }}>
                <MenuList>
                    <MenuItem >
                        Security
                    </MenuItem>
                </MenuList>
            </Paper>
        </Layout>
    )
}

export async function getServerSideProps(context) {
    try {
        const cookies = Cookie.parse(context.req.headers?.cookie ?? '');
        const authToken = cookies?.token;
        const payload = Jwt.decode(authToken);

        if (!payload || (payload?.exp ?? 0) * 1000 < Date.now()) {
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

        const userDetails = user?.data?.user;

        if (!userDetails) {
            throw new Error('Unable to identify user with token');
        }

        if (userDetails.status.toLowerCase() == 'suspended') {
            throw new Error('Account is suspended');
        }

        if (userDetails.status.toLowerCase() == 'not activated') {
            throw new Error('Account is not activated');
        }

        return {
            props: {
                userDetails: userDetails
            }
        }
    } catch (err) {
        console.log(err);
        return {
            redirect: {
                source: '/settings',
                destination: '/authenticate',
                permanent: false
            }
        }
    }
}