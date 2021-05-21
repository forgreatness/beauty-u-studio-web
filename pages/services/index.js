import Link from 'next/link';
import { useRouter } from 'next/router';

import ApolloClient from '../../lib/apollo/apollo-client';
import Layout from '../../components/page-layout';
import styles from '../../styles/servicespage.module.css';
import ServicePanel from '../../components/service_panel';
import { GET_SERVICES } from '../../lib/apollo/data-queries';

export default function ServicesPage({ services }) {
    const router = useRouter();
    var servicesByType = {};

    services.forEach(service => {
        if (servicesByType.hasOwnProperty(service.type)) {
            servicesByType[service.type].push(service);
        } else {
            servicesByType[service.type] = [service];
        }
    });

    return (
        <Layout>
            <div className={styles.services_menu}>
                {Object.entries(servicesByType).map(key => {
                    return (
                        <Link key={key[0]} href={`${router.pathname}/${key[0].toLowerCase()}`} passHref>
                            <ServicePanel key={key[0]} className={styles.service_panel} serviceType={key[0]} services={key[1]} /> 
                        </Link>
                    );
                })}
            </div>
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