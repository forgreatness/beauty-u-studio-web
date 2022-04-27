/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';

import { ServiceIcon } from '../src/constants';

export default function ServiceCard({ serviceType }) {
    const styles = css`
        text-align: center;
        width: 200px;
        background-color: white;
        margin: 1vw;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        border-radius: 5px;
        color: black;

        img {
            display: block;
            width: 100%;
            height: 150px;
            object-fit: contain;
        }
    `;

    return (
        <div css={styles}>
            <img src={`/images/${ServiceIcon[serviceType.toLowerCase()]}`} alt="Type of service" />
            <b>{serviceType}</b>
        </div>
    );
}