/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';
import Head from 'next/head'

import Navbar from './navbar';
import Footbar from './footbar';

export default function PageLayout({ children }) {
    const styles = css`
        .layout {
            max-width: 36rem;
            padding: 0 1rem;
            margin: 3rem auto 6rem;
        }

        main {
            margin-top: 64px;
        }

        footer {
            position: absolute;
            bottom: -300px;
            width: 100%;
            height: 300px;
        }
    `;

    return (
        <div css={styles} className="layout">
            <Head>
                <link rel="icon" href="/favicon.ico" />
                <meta name="description" content="A website use to serve all informations relating to BeautyUStudio salon" />
                <meta name="og:title" content="BeautyUStudio website" />
                <meta name="og:type" content="website" />
            </Head>
            <header>
                <Navbar />
            </header>
            <main>
                {children}
            </main>
            <footer>
                <Footbar />
            </footer>
        </div>
    );
}
