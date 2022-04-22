/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

import { ServiceIcon } from '../src/constants/index';

export default function PromotionBanner(props) {
    const styles = css`
        color: var(--color-alpha);
        background-color: white;
        padding: 10px 8px;

        #promotion_timeframe {
            flex-grow: 0;
            flex-basis: 20%;
            text-align: center;
            padding: none;
            margin: none;
        }

        #promotion_service_list {
            &::-webkit-scrollbar {
                width: 10px;
                height: 10px;
            }
            
            &::-webkit-scrollbar-track {
                background-color: transparent;
            }
            
            &::-webkit-scrollbar-thumb {
                background-color: var(--color-alpha);
                border-radius: 20px;
                border: 1px solid black;
                background-clip: content-box;
            }
            
            &::-webkit-scrollbar-thumb:hover {
                background-color: #eeeeee;
            }
        }
    `;

    const promotionStart = props?.promotion?.start ? new Date(props.promotion.start) : undefined;
    const promotionEnd = props?.promotion?.end ? new Date(props.promotion.end) : undefined;

    return (
        <div css={styles} id="banner">
            <Stack id="promotion_header" direction="row" justifyContent="space-between">
                <h5>{props?.promotion?.code}</h5>
                <p>{props?.promotion?.amount} {props?.promotion?.type == "value" ? 'USD' : '%'}</p>
            </Stack>
            <p>{props?.promotion?.description}</p>
            <Stack direction="row" id="promotion_footer" justifyContent="space-between" alignContent="center">
                <Stack id="promotion_service_list" display="inline-flex" sx={{ width: "75%" }} direction="row" overflow="auto">
                    {(props?.promotion?.services ?? []).map(service => {
                        let serviceLabel = service.name;

                        if (service?.kind?.type) {
                            serviceLabel += ` (${service.kind.type})`;
                        }

                        return (
                            <Chip size="small" className="service_chip" key={service.id.toString()} 
                                label={serviceLabel} variant="filled" 
                                avatar={<Avatar src={"/images/"+ServiceIcon[service.type.toLocaleLowerCase()]} />} />
                        );
                    })}
                </Stack>
                <p id="promotion_timeframe">{promotionStart?.toLocaleDateString()} - {promotionEnd?.toLocaleDateString()}</p>
            </Stack>
        </div>
    );
}