/** @jsxRuntime classic /
/* @jsx jsx */
import {jsx, css} from '@emotion/react';

export default function MemberSelector({ member, selected, onSelectMemberSelector }) {
    const styles = css`
        width: 10px;
        height: 10px;
        margin: 5px;
        border: ${selected ? '2px solid white' : 'none'};
        border-radius: 50%;
        background-color: ${selected ? 'black' : 'white'};

        &:hover {
            filter: brightness(50%);
            cursor: pointer;
        }
    `;


    return (
        <div id={member.name} css={styles} onClick={(e) => onSelectMemberSelector(e)}></div>
    );
}