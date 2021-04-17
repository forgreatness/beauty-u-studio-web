/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';

export default function ClientReview({ review }) {
    const styles = css`
        width: 600px;
        height: 400px;
        padding: 20px 20px;
        margin: 20px; 
        background-color: #666;
        display: inline-block;
        vertical-align: top;
        white-space: normal;

        img {
            display: inline-block;
            width: 200px;
            height: 200px;
            border: 20px solid white;
            vertical-align: middle;
            margin: 10px;
        }

        div {
            margin: 20px auto;
            display: inline-block;
            max-width: calc(100% - 220px);
            vertical-align: middle;
        }

        div > span {
            font-size: 48px;
            padding: 0px;
            margin: 0px;
            color: white;
        }

        div > p {
            margin: 0px;
            color: white;
        }

        div > h3 {
            color: white;
        }

        #opening-quote {
            float: left;
        }
        
        #closing-quote {
            float: right;
        }

        #review {
            clear: both;
        }

        #client-name {
            clear: both;
            float: right;
        }
    `;

    return (
        <div id={review.id} css={styles}>
            <img alt='Photo of client review' src={review.photo} />
            <div>
                <span id="opening-quote">"</span>
                <p id="review">{review.review}</p>
                <span id="closing-quote">"</span>
                <h3 id="client-name">{review.client.name}</h3>
            </div>
        </div>
    );
}