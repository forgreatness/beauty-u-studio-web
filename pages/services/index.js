import Link from 'next/link';

import ApolloClient from '../../lib/apollo/apollo-client';
import Layout from '../../components/page-layout';
import styles from '../../styles/servicespage.module.css';
import { GET_SERVICES } from '../../lib/apollo/data-queries';

export default function ServicesPage({ services }) {
    return (
        <Layout>
            <div className={styles.services_menu}></div>
        </Layout>
    );
}

export async function getStaticProps() {
    const { data } = await ApolloClient.query({
        query: GET_SERVICES
    });

    if (!data) {
        return {
            notfound: true
        }
    }

    return {
        props: {
            services: data.services
        }
    }
};