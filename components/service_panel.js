/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';

export default function ServicePanel({ className, serviceType, services }) {
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
            text-align: center;
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
    `;

    return (
        <div css={styles} className={className}>
            <h3>{serviceType}</h3>
            <div className="panel">
                {services.map(service => {
                    return (
                        <p>{service.name} - {service.price}</p>
                    )
                })}
            </div>
        </div>
    );
}