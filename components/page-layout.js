/** @jsxRuntime classic */
/* @jsx jsx */
import { useEffect } from 'react';
import { jsx, css } from '@emotion/react';
import Head from 'next/head';

import Navbar from './navbar';
import Footbar from './footbar';

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

    useEffect(() => {
        // Ensure the script runs only once and after the component mounts
        if (typeof window !== 'undefined' && window._hw) {
            window._hw(
                "init",
                {
                    debug: false,
                    variables: {
                        slug: 'beautyu-studio', // Replace with your Cherry slug
                        name: 'BeautyUStudio Spa', // Replace with your business name
                        alle: true,
                    },
                    styles: {
                        primaryColor: '#735366', // Customize as needed
                        secondaryColor: '#F5D69B', // Customize as needed
                        fontFamily: 'Open Sans', // Customize as needed
                    },
                },
                ["all", "hero", "howitworks", "testimony", "faq", "calculator"]
            );
        }
    }, []); // Runs only once when the component mounts

    return (
        <div css={styles} className="layout">
            <Head>
                <meta name="description" content="Welcome to BeautyUStudio, 
                home to many different beauty services ranging from eyelashes, to eyebrows, hair, facial, nails and cosmetic tattoos. 
                We are located in King City Oregon, and are very excited to to have you as our guest." />
                <meta name="og:title" content="BeautyUStudio website" />
                <meta name="og:type" content="website" />
                <link rel="icon" href="/favicon.ico" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Playfair+Display&family=Slabo+27px&family=Lato&family=Raleway&family=Montserrat&family=Oswald&family=Poppins&family=Source+Sans+Pro&family=PT+Sans&family=Open+Sans&display=swap"
                    rel="stylesheet"
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function (w, d, s, o, f, js, fjs) {
                                w[o] =
                                    w[o] ||
                                    function () {
                                        (w[o].q = w[o].q || []).push(arguments);
                                    };
                                (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]);
                                js.id = o;
                                js.src = f;
                                js.async = 1;
                                fjs.parentNode.insertBefore(js, fjs);
                            })(window, document, "script", "_hw", 'https://files.withcherry.com/widgets/widget.js');
                        `,
                    }}
                />
            </Head>
            <header>
                <Navbar userDetail={props.userDetail} />
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