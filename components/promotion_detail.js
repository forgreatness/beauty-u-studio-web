/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';
import { useEffect, useState } from 'react';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import RemoveIcon from '@mui/icons-material/Remove';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function PromotionDetail(props) {
    const [promotionStart, setPromotionStart] = useState(new Date(props.promotion.start));
    const [promotionEnd, setPromotionEnd] = useState(new Date(props.promotion.end));
    const [removePromotionDialog, setRemovePromotionDialog] = useState(false);

    const styles = css`
        width: 300px;
        background-color: #e8eaf6;
        padding: 10px 10px;
        border: 1px black solid;
        border-radius: 5px;
        position: relative;

        .date_time_details {
            padding: 5px 5px;
        }

        #promotion_amount {
            color: #ef9a9a;
        }

        #remove_button {
            position: absolute;
            top: 0px;
            right: 0px;
        }
    `;

    const handleRemovePromotion = () => {
        setRemovePromotionDialog(false);
        props.onRemovePromotion(props.promotion.id);
    }

    return (
        <div css={styles}>
            <h3>{props.promotion.code.toLocaleUpperCase()}</h3>
            <p id="promotion_amount">
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
            <IconButton aria-label='remove_promotion' id="remove_button" onClick={() => setRemovePromotionDialog(true)}>
                <RemoveIcon />
            </IconButton>
            <Dialog 
                open={removePromotionDialog} 
                onClose={() => setRemovePromotionDialog(false)}
                aria-labelledby="remove_promotion_dialog_title"
                aria-describedby="remove_promotion_dialog_description">
                <DialogTitle id="remove_promotion_dialog_title">
                    Are you sure want to remove the promotion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="remove_promotion_dialog_description">
                        You should remove the promotion if there was a mistake during creation or the promotion should no longer be available
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRemovePromotionDialog(false)}>Cancel</Button>
                    <Button onClick={handleRemovePromotion}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}