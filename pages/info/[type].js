import React from 'react';
import { useRouter } from "next/router";
import Container from '@mui/material/Container';

import { INFO_TYPE } from '../../src/constants';
import styles from '../../styles/infopage.module.css';

export default function InfoPage() {
    const router = useRouter();
    const infoType = router.query.type;

    return (
        <Container maxWidth="xl" className={styles.error_container}>
            <h1 className={styles.error}>{INFO_TYPE[infoType]}</h1>
        </Container>
    );
}