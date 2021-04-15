/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

export default function Navbar() {
    const [scrolled, hasScrolled] = useState(false);
    const [menuClicked, hasClicked] = useState(false);

    const styles = css`
        height: 64px;
        position: fixed;
        top: 0px;
        width: 100%;
        overflow: auto;
        background: white;
        z-index: 2;
        vertical-align: middle;

        a {
            display: inline-block;
            height: 100%;
            padding: 10px 30px;
            line-height: 2.5em;
            font-weight: 500;
        }

        .home > img {
            height: 100%;
            width: auto;
        }

        .nav {
            float: right;
            display: inline-block;
            height: 100%;
        }

        .nav > a:hover {
            color: white;
            background-color: #666;
        }

        .menu-icon {
            cursor: pointer;
            display: none;
        }

        .bar1, .bar2, .bar3 {
            width: 35px;
            height: 5px;
            background-color: #666;
            margin: 6px 0px;
            transition: 0.4s;
        }

        .clicked .bar1 {
            -webkit-transform: rotate(-45deg) translate(-9px, 6px);
            transform: rotate(-45deg) translate(-9px, 6px);
        }
          
        .clicked .bar2 {
            opacity: 0;
        }
        
        .clicked .bar3 {
            -webkit-transform: rotate(45deg) translate(-8px, -8px);
            transform: rotate(45deg) translate(-8px, -8px);
        }

        @media (max-width:749px) {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: center;
            align-content: center;
            overflow: hidden;
            padding: 0px 20px;
            
            .menu-icon {
                display: inline-block;
                flex-grow: 0;
                z-index: 3;
            }
            
            .home {
                text-align: center;
                position: relative;
                flex-grow: 1;
            }

            .nav {
                display: none;
                position: 
            }
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
    });

    const handleMenuClick = (e) => {
        e.preventDefault();

        hasClicked(menuClicked => !menuClicked);
    }

    return (
        <nav css={styles}>
            <div className={(menuClicked) ? 'menu-icon clicked' : 'menu-icon'} onClick={handleMenuClick}>
                <div class="bar1"></div>
                <div class="bar2"></div>
                <div class="bar3"></div>
            </div>

            <Link href="/" passHref>
                <a className="home">
                    <img 
                        alt="BeautyUStudio Home Link" 
                        src="images/BeautyUStudio-logo.png" />
                </a>
            </Link>
            <div className="nav">
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