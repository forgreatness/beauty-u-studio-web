/** @jsxRuntime classic */
/* @jsx jsx */
import React from "react";
import { jsx, css } from '@emotion/react';

export default React.memo(function SplatterButton(props) {
    const styles = css`
        --color-primary-500: Lavender;
        --color-primary-600: FireBrick;
        --color-primary-900: FireBrick;
        --color-secondary-500: #009688;
        --color-secondary-900: Black;
        --font-primary: "Montserrat", sans-serif;

        position: relative;
        display: inline-block;
        margin: 0;
        background: var(--color-primary-500);
        color: var(--color-secondary-900);
        font-family: inherit;
        font-size: ${props.buttonSize ?? "1em"};
        font-weight: bold;
        line-height: normal;
        border: 0;
        width: 50%;
        border-radius: 0.4em;
        box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.4);
        appearance: none;
        cursor: pointer;
        transition: background 250ms, box-shadow 250ms;
        z-index: 1;

        &:hover {
            background: var(--color-primary-600);
            box-shawdow: -2px 2px 16px rgba(0, 0, 0, 0.6);
            color: white;
        }

        &:active, &:focus {
            outline: none;
        }

        &:active {
            box-shadow: -4px 4px 16px rgba(0, 0, 0, 0.0);
        }

        .dot-span {
            position: absolute;
            display: block;
            width: 200px;
            height: 10px;
            transform-origin: 5px 5px;
            border-radius: 50%;
            
            &:nth-of-type(1) {
                top: 50%;
                left: 100%;
                transform: translate3d(-10px, -5px, 0);
              }
              
            &:nth-of-type(2) {
                bottom: 0;
                left: 100%;
                transform: translate3d(-10px, 0, 0) rotate(45deg);
            }
              
            &:nth-of-type(3) {
                bottom: 0;
                left: 50%;
                transform: translate3d(-5px, 0, 0) rotate(90deg);
            }
              
            &:nth-of-type(4) {
                bottom: 0;
                left: 0;
                transform: rotate(135deg);
            }
              
            &:nth-of-type(5) {
                top: 50%;
                left: 0;
                transform: translate3d(0, -5px, 0) rotate(180deg);
            }
              
            &:nth-of-type(6) {
                top: 0;
                left: 0;
                transform: rotate(225deg);
            }
              
            &:nth-of-type(7) {
                top: 0;
                left: 50%;
                transform: translate3d(-5px, 0, 0) rotate(270deg);
            }
              
            &:nth-of-type(8) {
                top: 0;
                left: 100%;
                transform: translate3d(-10px, 0, 0) rotate(315deg);
            }

            &::before {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                position: absolute;
                top: 0;
                left: 0;
                display: block;
                content: '';
                background-color: var(--color-primary-900);
                border-radius: 50%;
                offset-path: path("M0 1c7.1 0 10.7 2 14.3 4s7.1 4 14.3 4 10.7-2 14.3-4 7.2-4 14.3-4 10.7 2 14.3 4 7.1 4 14.3 4 10.7-2 14.3-4 7.1-4 14.3-4 10.7 2 14.3 4 7.1 4 14.3 4 10.7-2 14.3-4 7.1-4 14.3-4 10.7 2 14.3 4 7.1 4 14.3 4");
                offset-distance: 0;
                pointer-events: none;
                content: "";
                opacity: 0;
            }
        }

        &[animate="true"] .dot-span::before {
            animation: dot 750ms cubic-bezier(0.215, 0.61, 0.355, 1);
        }

        @keyframes dot {
            0% {
                offset-distance: 0%;
                opacity: 1;
            }
            100% {
                offset-distance: 100%;
                opacity: 0;
            }
        }
    `;

    const handleOnClick = (e) => {
        const splatteredButton = e.target.closest('.splattered-button');
        window.requestAnimationFrame((_) => {
            splatteredButton.setAttribute("animate", "false");

            window.requestAnimationFrame((_) => {
                splatteredButton.setAttribute("animate", "true");
            });
        });

        props.onButtonClick();
    }

    return (
        <button className={`${props.className} splattered-button`} animate="false" css={styles} onClick={handleOnClick}>
            <span className="dot-span"></span>
            <span className="dot-span"></span>
            <span className="dot-span"></span>
            <span className="dot-span"></span>
            <span className="dot-span"></span>
            <span className="dot-span"></span>
            <span className="dot-span"></span>
            <span className="dot-span"></span>
            <span className="text">{props.children}</span>
        </button>
    )
});