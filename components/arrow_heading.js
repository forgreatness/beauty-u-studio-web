/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';

export default function ArrowHeading({ heading }) {
    const styles = css`
        h4 {
            display: inline-block;
            height: 30px;
            margin: 0px;
            line-height: 26px;
            vertical-align: middle;
            padding-right: 15px;
            padding-left: 5px;
            background-color: #666;
            color: white;
        }

        .right_triangle_border {
            display: inline-block;
            border-top: 15px solid transparent;
            border-bottom: 15px solid transparent;        
            border-left: 15px solid #666;
            vertical-align: middle;
        }
    `;

    return (
        <div css={styles}>
            <h4>{heading.toUpperCase()}</h4>
            <div className="right_triangle_border"></div>
        </div>
    );
}