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
            -webkit-overflow-scrolling: touch;
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
            background-color: none;
        }

        .panel::-webkit-scrollbar-thumb {
            border-radius: 5px;   
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
            background-color: #666;
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