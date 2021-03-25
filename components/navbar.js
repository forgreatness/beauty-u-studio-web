/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

export default function Navbar() {
    const [scrolled, hasScrolled] = useState(false);

    const styles = css`
        height: 64px;
        position: fixed;
        top: 0px;
        width: 100%;
        overflow: auto;
        background: white;
        z-index: 2;

        a {
            display: inline-block;
            height: 100%;
            padding: 10px 30px;
            line-height: 2.5em;
        }

        a > img {
            height: 100%;
            width: auto;
        }

        .right-nav {
            float: right;
            display: inline-block;
            height: 100%;
        }
    `;

    useEffect(() => {
        window.onscroll = () => {
            if (window.pageYOffset !== 0) {
                hasScrolled(true);
            }
        }

        return () => {
            window.onscroll = null;
        }
    })

    return (
        <nav css={styles}>
            <Link href="/" passHref>
                <a>
                    <img 
                        alt="BeautyUStudio Home Link" 
                        src="images/BeautyUStudio-logo.png" />
                </a>
            </Link>
            <div className="right-nav">
                <Link href="/services" passHref>
                    <a>Services</a>
                </Link>
                <Link href="/apointment" passHref>
                    <a>Apointment</a>
                </Link>
                <Link href="/about" passHref>
                    <a>About Us</a>
                </Link>
            </div>
        </nav>
    );
}