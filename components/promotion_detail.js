/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';
import { useEffect, useState } from 'react';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Stack from '@mui/material/Stack';

export default function PromotionDetail(props) {
    const [promotionStart, setPromotionStart] = useState(new Date(props.promotion.start));
    const [promotionEnd, setPromotionEnd] = useState(new Date(props.promotion.end));

    const styles = css`
        width: 300px;
        background-color: #8d6e63;
        padding: 10px 10px;
        border: 1px black solid;
        border-radius: 5px;

        .date_time_details {
            padding: 5px 5px;
        }
    `;

    return (
        <div css={styles}>
            <h3>{props.promotion.code.toLocaleUpperCase()}</h3>
            <p>
                <LocalOfferIcon fontSize='large' />
                {props.promotion.amount} {props.promotion.type.toLocaleLowerCase() == 'percentage' ? '%' : 'USD'}
            </p>
            <Stack direction="row" justifyContent={"space-around"}>
                <div>
                    <b>Starts</b>
                    <div className='date_time_details'>
                        <p>{promotionStart.toDateString()}</p>
                        <p>{promotionStart.toLocaleTimeString([], { hour: "2-digit", minute: '2-digit'}) ?? ""}</p>
                    </div>
                </div>
                <div>
                    <b>Ends</b>
                    <div className='date_time_details'>
                        <p>{promotionEnd.toDateString()}</p>
                        <p>{promotionEnd.toLocaleTimeString([], { hour: "2-digit", minute: '2-digit'}) ?? ""}</p>
                    </div>
                </div>
            </Stack>
            <p>{props.promotion.description}</p>
        </div>
    );
}