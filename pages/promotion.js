import React, { useState, useEffect } from 'react';
import Cookie from 'cookie';
import Jwt from 'jsonwebtoken';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useApolloClient } from '@apollo/client';

import ApolloClient from '../lib/apollo/apollo-client';
import Layout from '../components/page-layout';
import { getServerSideProps } from './appointment';
import { GET_USER } from '../lib/apollo/data-queries';

export default function PromotionPage({ user }) {
    return (
        <Layout>

        </Layout>
    )
}

export async function getServerSideProps(context) {
    try {
        const cookies = Cookie.parse(context.req.headers?.cookie ?? '');
        const token = cookies?.token;
        const payload = Jwt.token(token);

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
                    authorization: `Bearer ${token}`
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

        return {
            props: {
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