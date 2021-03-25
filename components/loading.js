/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';
import ReactLoading from 'react-loading';

export default function Loading(props) {
    const styles = css`
        position: absolute;
        top: 50%;
        left: 50%;
    `;

    return <ReactLoading css={styles} type="spinningBubbles" color='#000' />
}