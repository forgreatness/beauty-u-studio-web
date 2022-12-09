/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';
import React from 'react';

import { ServiceIcon } from '../src/constants';

export default React.memo(function ServiceCard({ serviceType }) {
    const styles = css`
        text-align: center;
        width: 250px;
        height: 250px;
        background-color: white;
        margin: 1vw;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        border-radius: 50%;
        color: black;
        position: relative;
        background-color: Lavender;
        transition: border-style 0.1s ease-in, border-width 0.1s ease-in;

        img {
            display: block;
            width: 60%;
            height: 60%;
            object-fit: contain;
            margin: auto;
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .card_title {
            width: 60%;
            position: absolute;
            bottom: 10%;
            left: 50%;
            transform: translate(-50%, 0%);
        }

        &:hover {
            border: 3px solid LightPink;
        }

        &:after {
            content: "";
            display: block;
            position: absolute;
            border-radius: 50%;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: all 0.5s;
            box-shadow: 0 0 10px 40px black;
        }

        &:active:after {
            box-shadow: 0 0 0 0 black;
            position: absolute;
            border-radius: 50%;
            left: 0;
            top: 0;
            opacity: 1;
            transition: 0s;
        }
    `;

    return (
        <div css={styles}>
            <img src={`/images/${ServiceIcon[serviceType.toLowerCase()]}`} alt="Type of service" />
            <b className='card_title'>{serviceType}</b>
        </div>
    );
});