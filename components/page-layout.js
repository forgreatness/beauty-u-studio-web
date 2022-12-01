/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';
import Head from 'next/head';

import Navbar from './navbar';
import Footbar from './footbar';
import { Error } from '@mui/icons-material';

export default function PageLayout(props) {
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

    return (
        <div css={styles} className="layout">
            <Head>
                <link rel="icon" href="/favicon.ico" />
                <meta name="description" content="Welcome to BeautyUStudio, 
                home to many different beauty services ranging from eyelashes, to eyebrows, hair, facial, nails and cosmetic tattoos. 
                We are located in King City Oregon, and are very excited to to have you as our guest." />
                <meta name="og:title" content="BeautyUStudio website" />
                <meta name="og:type" content="website" />
            </Head>
            <header>
                <Navbar userDetail={props.userDetail}/>
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