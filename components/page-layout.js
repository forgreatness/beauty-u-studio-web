/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';
import Head from 'next/head'

import Navbar from './navbar';

export default function PageLayout({ children }) {
    const styles = css`
        .container {
            max-width: 36rem;
            padding: 0 1rem;
            margin: 3rem auto 6rem;
        }
    `;

    return (
        <div css={styles} className="container">
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
        </div>
    );
}
