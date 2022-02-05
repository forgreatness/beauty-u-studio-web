/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';
import Head from 'next/head';
import Cookie from 'cookie';
import { useApolloClient } from '@apollo/client';
import Jwt from 'jsonwebtoken';
import { useState } from 'react';

import Navbar from './navbar';
import Footbar from './footbar';
import { useEffect } from 'react';
import { GET_USER  } from '../lib/apollo/data-queries';
import { Error } from '@mui/icons-material';

export default function PageLayout(props) {
    const apolloClient = useApolloClient();
    const [userDetail, setUserDetail] = useState();

    const styles = css`
        .layout {
            max-width: 36rem;
            padding: 0 1rem;
            margin: 3rem auto 6rem;
        }

        main {
            position: relative;
            top: 64px;
            padding: 0px 10px;
        }

        footer {
            position: absolute;
            bottom: -400px;
            width: 100%;
            height: 300px;
        }
    `;

    useEffect(async () => {
        const cookies = Cookie.parse(document?.cookie ?? '');

        const payload = Jwt.decode(cookies?.token);

        if (!payload || Date.now() > payload.exp * 1000) {
            return;
        }

        if (cookies?.token) {
            try {
                const user = await apolloClient.query({
                    query: GET_USER,
                    variables: {
                        userId: payload.id
                    }
                });

                if (!user) {
                    throw new Error('User detail does not exist')
                }

                setUserDetail(user.data.user);
            } catch (err) {

            }
        }
    }, []);

    return (
        <div css={styles} className="layout">
            <Head>
                <link rel="icon" href="/favicon.ico" />
                <meta name="description" content="A website use to serve all informations relating to BeautyUStudio salon" />
                <meta name="og:title" content="BeautyUStudio website" />
                <meta name="og:type" content="website" />
            </Head>
            <header>
                <Navbar userDetail={userDetail}/>
            </header>
            <main>
                {props.children}
            </main>
            <footer>
                <Footbar />
            </footer>
        </div>
    );
}