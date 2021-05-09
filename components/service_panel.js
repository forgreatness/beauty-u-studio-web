/** @jsxRuntime classic /
/* @jsx jsx */
import { jsx, css } from '@emotion/react';

export default function ServicePanel({ className, serviceType, services }) {
    const styles = css`
        overflow: scroll;
        position: relative;

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

        &:hover {
            h3 {
                display: none;
            }
        }

        &::-webkit-scrollbar {
            width: 12px;
            background-color: #F5F5F5;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
            background-color: #555;
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