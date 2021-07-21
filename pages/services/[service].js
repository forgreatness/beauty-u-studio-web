import Link from 'next/link';

import Layout from '../../components/page-layout';
import ApolloClient from '../../lib/apollo/apollo-client'
import { GET_SERVICES } from '../../lib/apollo/data-queries';

function Service({ service }) {
    return (
        <Layout>
            <h1>{service}</h1>
        </Layout>
    );
}

export async function getStaticPaths() {
    var typeOfServices = [];
    const { data } = await ApolloClient.query({
        query: GET_SERVICES
    });

    if (!data) {
        return {
            paths: typeOfServices,
            fallback: false
        };
    }

    data.services.forEach(service => {
        if (!typeOfServices.includes(service.type)) {
            typeOfServices.push(service.type);
        }
    });

    const paths = typeOfServices.map((serviceType) => ({
        params: { 
            service: serviceType.toLowerCase()
        }
    }));

    return {
        paths: paths,
        fallback: false
    };
};

export async function getStaticProps({ params }) {
    return { 
        props: { 
            service: params.service
        } 
    };  
};

export default Service