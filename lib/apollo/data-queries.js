import { gql } from '@apollo/client';

const KIND_DATA = gql`
    fragment KindDetail on Kind {
        type
    }
`;

const SERVICE_DATA = gql`
    fragment ServiceDetail on Service {
        __typename
        id
        type
        name
        description
        price
        time
        kind {
            ...KindDetail
        }
    }
    ${KIND_DATA}
`;

export const GET_SERVICES = gql`
    query {
        services {
            ...ServiceDetail
        }
    }
    ${SERVICE_DATA}
`;