/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';

import ArrowHeading from './arrow_heading';

export default function ServicePanel({ className, serviceType, services }) {
    const servicesByKind = {};

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

        &:active {
            -webkit-box-shadow: inset 0px 0px 10px black;
            -moz-box-shadow: inset 0px 0px 10px black;
            box-shadow: inset 0px 0px 10px black;
            transform: scale(0.99);
        }

        .panel::-webkit-scrollbar {
            width: 11px;
            border: 5px solid white;
        }

        .panel::-webkit-scrollbar-thumb {
            border-radius: 5px;   
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
            background-color: #666;
        }

        .panel::-webkit-scrollbar-button:single-button {
            background-color: #bbbbbb;
            display: block;
            border-style: solid;
            height: 13px;
            width: 16px;
        }

        /* Up */
        .panel::-webkit-scrollbar-button:single-button:vertical:decrement {
            border-width: 0 8px 8px 8px;
            border-color: transparent transparent #555555 transparent;
        }
          
        .panel::-webkit-scrollbar-button:single-button:vertical:decrement:hover {
            border-color: transparent transparent #777777 transparent;
        }
        /* Down */
        .panel::-webkit-scrollbar-button:single-button:vertical:increment {
            border-width: 8px 8px 0 8px;
            border-color: #555555 transparent transparent transparent;
        }
          
        .panel::-webkit-scrollbar-button:vertical:single-button:increment:hover {
            border-color: #777777 transparent transparent transparent;
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
        <div css={styles} className={className}>
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
}