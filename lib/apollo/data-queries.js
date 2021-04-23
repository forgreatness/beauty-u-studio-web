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

const USER_DATA = gql`
    fragment UserDetail on User {
        __typename
        id
        name
        email
        phone
        photo
        about
    }
`;

export const GET_SERVICES = gql`
    query {
        services {
            ...ServiceDetail
        }
    }
    ${SERVICE_DATA}
`;

export const GET_USERS = (role = "all") => {
    return gql`
        query {
            users(role: ${role}) {
                UserDetail
            }
        }
        ${USER_DATA}
    `;
};

export function GET_HOMEDATA (role = "all") {
    return gql`
        query {
            services: services {
                ...ServiceDetail
            }

            stylists: users(role: "stylist") {
                ...UserDetail
            }
        }
        ${SERVICE_DATA}
        ${USER_DATA}   
    `;
};