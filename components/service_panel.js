/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';

import ArrowHeading from './arrow_heading';
import useLongPress from '../hooks/useLongPress';

export default React.forwardRef(({ className, href, serviceType, services }, ref) => {
    const [isSelected, setIsSelected] = useState(false); 
    const router = useRouter();
    const servicesByKind = {};

    const onServicePanelSelect = () => {
        setIsSelected(true);
    }

    const onServicePanelClick = () => {
        
    }

    const onServicePanelSelectRelease = () => {
        router.push(href);
    }

    const onServicePanelSelectCancel = () => {
        setIsSelected(false);
    }

    const longPressOptions = {
        shouldPreventDefault: true,
        delay: 500
    };

    const longPressEvent = useLongPress(onServicePanelSelect, onServicePanelClick, onServicePanelSelectRelease, onServicePanelSelectCancel, longPressOptions);

    services.forEach(service => {
        if (service.kind == null) {
            if (servicesByKind.hasOwnProperty("Standard")) {
                servicesByKind["Standard"].push(service);
            } else {
                servicesByKind["Standard"] = [service];
            }
        } else {
            if (servicesByKind.hasOwnProperty(service.kind.type)) {
                servicesByKind[service.kind.type].push(service);
            } else {
                servicesByKind[service.kind.type] = [service];
            }
        }
    });

    const styles = css`
        position: relative;
        cursor: pointer;
        border: 5px solid #666;
        margin: 10px;

        ${isSelected ? 
            `-webkit-box-shadow: inset 0px 0px 10px black;
            -moz-box-shadow: inset 0px 0px 10px black;
            box-shadow: inset 0px 0px 10px black;
            transform: scale(0.99);` : ``}

        h3 {
            position: absolute;
            height: 100%;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            align-content: center;
            margin: 0;
            background-color: black;
            color: white;
        }

        .panel {
            overflow: auto;
            height: 100%;
            width: 100%;
            padding: 10px 10px;
        }

        &:hover {
            h3 {
                display: none;
            }
        }

        // &:active {
        //     -webkit-box-shadow: inset 0px 0px 10px black;
        //     -moz-box-shadow: inset 0px 0px 10px black;
        //     box-shadow: inset 0px 0px 10px black;
        //     transform: scale(0.99);
        // }

        .panel::-webkit-scrollbar {
            -webkit-appearance: none;
        }

        .panel::-webkit-scrollbar:vertical {
            width: 15px;
        }

        .panel::-webkit-scrollbar-thumb {
            border-radius: 10px;   
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
            background-color: white;
            border: 2px solid #666;
        }

        .panel::-webkit-scrollbar-track {
            border-radius: 10px;
            background-color: black;
        }

        .service_tag {
            width: 80%;
            clear: both;
            margin: auto;
            overflow: hidden;
            padding: 5px 10px;
        }

        .service_tag > .service_name {
            display: inline-block;
            float: left;
        }

        .service_tag > .service_price {
            display: inline-block;
            float: right;
        }
    `;

    return (
        <div {...longPressEvent} css={styles} className={className} ref={ref}>
            <h3>{serviceType}</h3>
            <div className="panel">
                {Object.entries(servicesByKind).map(key => {
                    return (
                        [
                            <ArrowHeading key={key[0]} heading={key[0]} />
                        ].concat(key[1].map(service => {
                            return (
                                <p key={service.id} className="service_tag"><strong className="service_name">{service.name}</strong><em className="service_price">${parseFloat(service.price).toFixed(2)}</em></p>
                            )
                        }))
                    )
                })}
            </div>
        </div>
    );
});