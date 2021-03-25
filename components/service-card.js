/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';

export default function ServiceCard({ serviceType }) {
    const SERVICE_CARD_LOGO = {
        "EYE": "/images/eye_icon.png",
        "HAIR": "/images/hair_icon.png",
        "NAILS": "/images/nails_icon.png",
        "SPA & BEAUTY": "/images/beauty_icon.png"
    };

    const styles = css`
        text-align: center;
        width: 200px;
        background-color: white;
        margin: 1vw;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        border-radius: 5px;

        img {
            display: block;
            width: 100%;
            height: 150px;
            object-fit: contain;
        }
    `;

    return (
        <div css={styles}>
            <img src={SERVICE_CARD_LOGO[serviceType]} alt="Type of service" />
            <b>{serviceType}</b>
        </div>
    );
}