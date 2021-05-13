/** @jsxRuntime classic
 * @jsx jsx 
 */
import { jsx, css } from '@emotion/react';
import React from 'react';

export default React.forwardRef(({ className, onClick, href, children }, ref) => {
    const styles = css`
        --b64: url('https://image.flaticon.com/icons/png/128/109/109617.png');

        color: black;
        text-decoration: none;
        font-size: 1em;
        display: inline-block;
        position: relative;
        font-family: Montserrat;
        text-transform: uppercase;
        padding: 0.5em 2em;
        border: 4px solid black;
        transition: .02s .2s cubic-bezier(.1, 0, .1, 1);
        background-color: white;

        &::before {
            content: "";
            display: inline-block;
            position: absolute;
            top: 0;
            left: 0;
            right: 100%;
            bottom: 0;
            background: #666;
            transition: .3s .2s cubic-bezier(.1, 0, .1, 1), left .3s cubic-bezier(.1, 0, .1, 1);
            z-index: -1;
        }

        &::after {
            content: "";
            display: inline-block;
            background-image: var(--b64);
            position: absolute;
            top: 0;
            left: calc(100% - 3em);
            right: 3em;
            bottom: 0;
            background-size: 1.5em;
            background-repeat: no-repeat;
            background-position: center;
            transition: right .3s cubic-bezier(.1, 0 .1, 1);
        }

        &:hover {
            padding: 0.5em 3.5em 0.5em 0.5em;
        }

        &:hover::before {
            left: calc(100% - 3em);
            right: 0;
            transition: .3s cubic-bezier(.1, 0, .1, 1), left .3s .2s cubic-bezier(.1, 0, .1, 1);
            z-index: 0;
        }

        &:hover::after {
            right: 0;
            transition: right .3s .2s cubic-bezier(.1, 0, .1, 1);
        }
    `;

    return (
        <a className={className} css={styles} href={href} onClick={onClick} ref={ref}>{children}</a>
    );
});
