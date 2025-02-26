/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import EventIcon from '@mui/icons-material/Event';
import React, { useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import Tooltip from "@mui/material/Tooltip";
import GroupIcon from '@mui/icons-material/Group';

import { removeAllCookies } from '../lib/utility/cookie';
import * as Constants from '../src/constants/index';

export default React.memo(function Navbar(props) {
    const [scrolled, hasScrolled] = useState(false);
    const [menuClicked, hasClicked] = useState(false);
    const [profileImage, setProfileImage] = useState("/images/profile_icon.png");
    const [anchorE1, setAnchorE1] = useState(null);
    const [loading, setLoading] = useState(false);

    const styles = css`
        height: 64px;
        position: fixed;
        top: 0px;
        width: 100%;
        overflow: auto;
        background: white;
        z-index: 10;
        vertical-align: middle;

        .profile_action {
            float: right;
            height: 100%;
            display: inline-flex;
            justify-context: center;
            align-items: center;
            align-context: center;
            padding: 10px 10px;
            width: 100px;
        }

        .profile_action:hover {
            cursor: pointer;
        }

        #profile_icon {
            text-align: center;
            margin: auto;
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

        .nav > a[aria-selected="true"] {
            color: white;
            background-color: black;
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

            .nav > .profile_action {
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

    const open = Boolean(anchorE1);
    const router = useRouter();
    const apolloClient = useApolloClient();

    const handleClick = (e) => {
        setAnchorE1(e.currentTarget);
    }

    const handleClose = () => {
        setAnchorE1(null);
    }

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

    const handleSignOut = () => {
        localStorage.clear();
        removeAllCookies();
        apolloClient.clearStore();

        if (router.pathname == '/') {
            router.reload();
        } else {
            router.replace("/");            
        }
    }

    const handleNavigation = (path, e = undefined) => {
        if (e) {
            e?.preventDefault();
        }

        console.log("handle navg", path);

        setLoading(true);
        if (router.pathname == path) {
            console.log('here');
            router.reload();
        } else {
            console.log('there');
            router.push(path);
        }
    }

    function stringToColor(string) {
        let hash = 0;
        let i;
      
        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
          hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
      
        let color = '#';
      
        for (i = 0; i < 3; i += 1) {
          const value = (hash >> (i * 8)) & 0xff;
        //   console.log(`00${value.toString(16)}`.substr(-2));
        //   console.log(`00${value.toString(16)}`);
          color += `00${value.toString(16)}`.substring(`00${value.toString(16)}`.length - 2);
        //   color += `00${value.toString(16)}`.substr(-2);
        }
        /* eslint-enable no-bitwise */  
      
        return color;
    }
      
    function stringAvatar(name) {
        if (!name) {
            return {
                src: profileImage
            };
        }

        let wordsInName = name.split(' ');

        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: `${wordsInName[0][0]}` + (name.split(' ')?.[1]?.[0] ?? '')
        };
    }

    return [
        <nav css={styles}>
            <div className={(menuClicked) ? 'menu-icon clicked' : 'menu-icon'} onClick={handleMenuClick}>
                <div className="bar1"></div>
                <div className="bar2"></div>
                <div className="bar3"></div>
            </div>
            <div className="home">
                <Link href="/" passHref onClick={() => handleNavigation("/")}>

                    <img 
                        alt="BeautyUStudio Home Link" 
                        src="/images/BeautyUStudio-logo.png" />

                </Link>
            </div>
            <div className="nav">
                {(props.userDetail)
                    ? (
                        <Tooltip title="Account Menu">
                            <div className="profile_action" onClick={handleClick}>
                                <Avatar {...stringAvatar(props.userDetail.name)} id="profile_icon" aria-label="account action" aria-controls={open ? 'account-menu' : undefined} aria-haspopup={true} aria-expanded={open ? true : undefined} />
                            </div>
                        </Tooltip>
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
                <Link
                    href="/services"
                    passHref
                    aria-selected={router.pathname == "/services"}
                    onClick={(_) => handleNavigation("/services")}>
                    Services
                </Link>
                <Link
                    href="/appointment"
                    passHref
                    aria-selected={router.pathname == "/appointment"}
                    onClick={(_) => handleNavigation("/appointment")}>
                    Appointment
                </Link>
                <Link
                    href="/about"
                    passHref
                    aria-selected={router.pathname == "/about"}
                    onClick={(_) => handleNavigation("/about")}>
                    About Us
                </Link>
                <Link
                    href="/allePayments"
                    passHref
                    aria-selected={router.pathname == "/allePayments"}
                    onClick={(e) => handleNavigation("/allePayments", e)}>
                    About Alle Payments
                </Link>
                <div className="footer">
                    <Link href="/" passHref className="footer_home">

                        <img 
                            alt="BeautyUStudio Home Link" 
                            src="/images/BeautyUStudio-logo.png" />

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
            <Menu
                id="account-menu"
                anchorEl={anchorE1}
                open={open}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right"}}
                onClose={handleClose}
                onClick={handleClose}
                sx={{
                    '& .MuiMenuItem-root': {
                        justifyContent: 'flex-start',
                        gap: '10px'
                    },
                    '& .MuiAvatar-root': {
                        bgcolor: 'black'
                    }
                }}
            >
                <MenuItem onClick={(_) => handleNavigation("/profile")}>
                    <Avatar /> Profile
                </MenuItem>
                {(props?.userDetail?.role.toLowerCase() == 'admin')
                    ? <MenuItem onClick={(_) => handleNavigation("/users")}>
                        <Avatar>
                            <GroupIcon />
                        </Avatar>
                        Users
                    </MenuItem> : null
                }
                {(props?.userDetail?.role.toLowerCase() == 'admin')
                    ? <MenuItem onClick={(_) => handleNavigation("/appointment/bookings")}>
                        <Avatar>
                            <EventAvailableRoundedIcon />
                        </Avatar>
                        Bookings
                    </MenuItem> : null
                }
                {(props?.userDetail?.role.toLowerCase() == 'admin')
                    ? <MenuItem onClick={(_) => handleNavigation("/appointment/create")}>
                        <Avatar>
                            <EventIcon   />
                        </Avatar>
                        Add Appointments
                    </MenuItem> : null
                }
                {(props?.userDetail?.role.toLowerCase() == 'admin') 
                    ? <MenuItem onClick={(_) => handleNavigation("/promotion")}>
                        <Avatar>
                            <LocalOfferIcon />
                        </Avatar>
                        Add Promotions
                    </MenuItem> : null
                }
                <MenuItem onClick={(_) => handleNavigation("/settings")}>
                    <Avatar>
                        <SettingsIcon />
                    </Avatar>
                    Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="medium" />
                    </ListItemIcon>
                    Sign Out
                </MenuItem>
            </Menu>
        </nav>,
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    ];
}, function (prevProps, newProps) {
    return prevProps.userDetail?.id == newProps.userDetail?.id;
});