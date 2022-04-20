/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

export default function PromotionBanner(props) {
    const promotionStart = props?.promotion?.start ? new Date(props.promotion.start) : undefined;
    const promotionEnd = props?.promotion?.end ? new Date(props.promotion.end) : undefined;

    return (
        <div id="banner">
            <Stack id="promotion_header" direction="row" justifyContent="space-around">
                <h5>{props?.promotion?.code}</h5>
                <p>{props?.amount} {props?.type == "value" ? 'USD' : '%'}</p>
            </Stack>
            <p>{props.description}</p>
            <Stack id="promotion_footer" justifyContent="space-around" alignContent="center">
                <Stack display="inline-flex" sx={{ maxWidth: "70%" }}>
                    {(props?.promotion?.services ?? []).map(service => {
                        return (
                            <Chip size="small" className="service_chip" key={service.id.toString()} 
                                label={serviceLabel} variant="filled" 
                                avatar={<Avatar src={"/images/"+ServiceIcon[service.type.toLocaleLowerCase()]} />} />
                        );
                    })}
                </Stack>
                <p>{promotionStart?.toLocaleDateString()} - {promotionEnd?.toLocaleDateString()}</p>
            </Stack>
        </div>
    );
}