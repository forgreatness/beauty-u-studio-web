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

const APPOINTMENT_DATA = gql`
    fragment AppointmentDetail on Appointment {
        __typename
        id
        stylist {
            ...UserDetail
        }
        client {
            ...UserDetail
        }
        services {
            ...ServiceDetail
        }
        time
    }
    ${USER_DATA}
    ${SERVICE_DATA}
`;

export const GET_SERVICES = gql`
    query GetServices {
        services: services {
            ...ServiceDetail
        }
    }
    ${SERVICE_DATA}
`;

export const GET_USERS = gql`
    query GetUsers($role: String = "all") {
        users: users(role: $role) {
            ...UserDetail
        }
    }
    ${USER_DATA}
`;

export const GET_APPOINTMENTS = gql`
    query GetAppointments($query: AppointmentInput) {
        appointments: appointments(filter: $query) {
            ...AppointmentDetail
        }
    }
    ${APPOINTMENT_DATA}
`;

export const GET_HOMEPAGEDATA = gql`
    query GetHomePageData($userRole: String = "all") {
        services: services {
            ...ServiceDetail
        }

        stylists: users(role: $userRole) {
            ...UserDetail
        }
    }
    ${SERVICE_DATA}
    ${USER_DATA}
`;