/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import React, { useState, useEffect } from 'react';

import * as Constants from '../src/constants/index';

export default function Navbar(props) {
    const [scrolled, hasScrolled] = useState(false);
    const [menuClicked, hasClicked] = useState(false);
    const [profileImage, setProfileImage] = useState("/images/profile_icon.png");
    const router = useRouter();

    const styles = css`
        height: 64px;
        position: fixed;
        top: 0px;
        width: 100%;
        overflow: auto;
        background: white;
        z-index: 2;
        vertical-align: middle;

        .profile_action {
            float: right;
            height: 100%;
            display: inline-flex;
            justify-context: center;
            align-items: center;
            align-context: center;
            padding: 10px 10px;
        }

        .profile_action:hover {
            cursor: pointer;
        }

        .profile_action:hover svg {
            color: navy;
        }

        .signin {
            display: inline-flex;
            float: right;
            height: 100%;
            text-align: center;
            justify-content: center;
            align-items: center;
            align-content: center;
            padding: 10px;
        }

        .signin:hover {
            background-color: #666;
            cursor: pointer;
            color: white;
        }

        .signin > img {
            display: inline-block;
            height: 50%;
            object-fit: contain;
            margin: 5px;
        }

        .signin > p {
            display: inline-block;
            margin: 0;
        }

        a {
            text-decoration: none;
            display: inline-block;
            color: black;
            height: 100%;
            padding: 10px 30px;
            line-height: 2.5em;
            font-weight: 500;
        }

        .home {
            height: 100%;
            display: inline-block;
        }

        .home img {
            height: 100%;
            width: auto;
            filter: brightness(0);
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

        .footer {
            display: none;
        }

        .social-media {
            display: flex;
            justify-content: center;
            align-items: center;
            align-content: center;
            overflow: hide;
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
                flex-grow: 1;
            }

            .nav {
                display: block;
                height: 100%;
                width: ${menuClicked ? '80%' : '0%'};
                position: fixed;
                z-index: 1;
                top: 0;
                left: 0;
                background-color: white;
                transition: 0.5s;
                overflow-x: hidden;
                text-align: right;
            }

            .nav > a {
                display: block;
                height: auto;
                text-align: left;
            }

            .nav > .signin {
                height: 64px;
                float: none;
            }

            .nav > .footer {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                align-content: center;
                height: 20%;
                width: 100%;
                position: absolute;
                left: 0;
                bottom: 0;
                text-align: center;
            }

            .footer a {
                display: block;
                height: 70px;
                padding: 10px 30px;
            }
    
            .footer img {
                height: 100%;
                width: auto;
                object-fit: contain;
            }

            .footer_home {
                filter: brightness(0);
            }

            .social-media a {
                height: 50px;
                padding: 10px 5px;
            }
        }
    `;

    useEffect(() => {
        if (props.userDetail?.photo) {
            setProfileImage("data:image/png;base64, " + props.userDetail.photo);
        }
    }, []);

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
                <div className="bar1"></div>
                <div className="bar2"></div>
                <div className="bar3"></div>
            </div>
            <div className="home">
                <Link href="/" passHref>
                    <a>
                        <img 
                            alt="BeautyUStudio Home Link" 
                            src="/images/BeautyUStudio-logo.png" />
                    </a>
                </Link>
            </div>
            <div className="nav">
                {(props.userDetail)
                    ? (
                    <div className="profile_action" onClick={e => {
                        e.preventDefault();
                        router.push('/profile');
                    }}>
                        <AccountCircleIcon aria-label="account action"/>
                    </div>
                    ) 
                    : (
                        <div className="signin" onClick={e => {
                            e.preventDefault();
                            router.push('/authenticate');
                        }}>
                            <img src={Constants.ICONS.signin} alt="Sign-In icon" />
                            <b>Sign-In</b>
                        </div>
                    )
                }
                <Link href="/services" passHref>
                    <a>Services</a>
                </Link>
                <Link href="/appointment" passHref>
                    <a>Appointment</a>
                </Link>
                <Link href="/about" passHref>
                    <a>About Us</a>
                </Link>
                <div className="footer">
                    <Link href="/" passHref>
                        <a className="footer_home">
                            <img 
                                alt="BeautyUStudio Home Link" 
                                src="/images/BeautyUStudio-logo.png" />
                        </a>
                    </Link>
                    <div className="social-media">
                        <a href=""> 
                            <img alt="BeautyUStudio Facebook Page" src={Constants.ICONS.facebook} />
                        </a>
                        <a href="https://www.instagram.com/beautyu_byyen/?hl=en" target="_blank"> 
                            <img alt="BeautyUStudio Instagram Page" src={Constants.ICONS.instagram} />
                        </a>
                        <a href=""> 
                            <img alt="BeautyUStudio Twitter Page" src={Constants.ICONS.twitter} />
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}