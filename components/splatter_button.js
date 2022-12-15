/** @jsxRuntime classic */
/* @jsx jsx */
import React from "react";
import { jsx, css } from '@emotion/react';

export default React.memo(function SplatterButton() {
    const styles = css`
        --color-primary-500: #FFEE3B;
        --color-primary-600: #FDD835;
        --color-primary-900: #F57F17;
        --color-secondary-500: #009688;
        --color-secondary-900: #004D40;
        --font-primary: "Montserrat", sans-serif;

        position: relative;
        display: inline-block;
        margin: 0;
        padding: 1.5rem 4.5rem;
        background: var(--color-primary-500);
        color: var(--color-secondary-900);
        font-family: inherit;
        font-size: 1.4rem;
        font-weight: 300;
        line-height: normal;
        border: 0;
        border-radius: 0.4rem;
        box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.4);
        appearance: none;
        cursor: pointer;
        transition: background 250ms, box-shadow 250ms;

        &:hover {
            background: var(--color-primary-600);
            box-shawdow: -2px 2px 16px rgba(0, 0, 0, 0.6);
        }
    `;

    return (
        <button css={styles}>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="text">Press Me!</span>
        </button>
    )
});