/** @jsxRuntime classic
 * @jsx jsx 
 */
import { jsx, css } from '@emotion/react';
import Link from 'next/link';

import CustomButton from './custom_button';
import * as Constants from '../src/constants/index';

export default function Footbar() {
    const styles = css`
        text-align: center;
        height: 200px;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
        align-content: center;
        align-items: center;
        background-color: #666;
        border: 10px solid #666;
        outline: 2px solid black;
        outline-offset: -10px;
        padding: 10px 5px;

        .home {
            display: block;
            height: 70px;
            text-align: center;
        }

        img {
            height: 100%;
            width: auto;
            object-fit: contain;
        }

        .contacts > a {
            display: inline-block;
            height: 50px;
            padding: 10px 5px;
        }

        h5 {
            margin: 0px 0px;
            color: white;
        }

        @media (max-width:749px) {
            display: block;
            text-align: center;
            height: auto;
            width: 100%;
        }
    `;

    return (
        <div css={styles}>
            <div className="contacts">
                <a href=""> 
                    <img alt="BeautyUStudio Facebook Page" target="_blank" src={Constants.ICONS.facebook}/>
                </a>
                <a href="https://www.instagram.com/beautyu_byyen/?hl=en" target="_blank"> 
                    <img alt="BeautyUStudio Instagram Page" src={Constants.ICONS.instagram} />
                </a>
                <a href=""> 
                    <img alt="BeautyUStudio Twitter Page" target="_blank" src={Constants.ICONS.twitter} />
                </a>
                <h5>{Constants.CONTACTS.phone}</h5>
            </div>
            <Link href="/" passHref>
                <a className="home">
                    <img src="/images/BeautyUStudio-logo.png" alt="BeautyUStudio Home Link" />
                </a>
            </Link>
            <CustomButton className="appointment_button">Appointment</CustomButton>
        </div>
    );
}