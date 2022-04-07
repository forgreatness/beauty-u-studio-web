import { gql } from '@apollo/client';

const KIND_DATA = gql`
    fragment KindDetail on Kind {
        type
    }
`;

const PROMOTION_DATA = gql`
    fragment PromotionDetail on Promotion {
        __typename
        id
        code
        type
        amount
        description
        services
        start
        end
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
        status
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
        role
        photo
        about
        status
        activationCode
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
        time,
        status
    }
    ${USER_DATA}
    ${SERVICE_DATA}
`;

export const GET_PROMOTIONS = gql`
    query GetPromotions {
        promotions: promotions {
            ...PromotionDetail
        }
    }
    ${PROMOTION_DATA}
`;

export const ADD_PROMOTION = gql`
    mutation AddPromotion($newPromotion: PromotionInput!) {
        newPromotion: addPromotion(promotionInput: $newPromotion) {
            ...PromotionDetail
        }
    }
    ${PROMOTION_DATA}
`;

export const REMOVE_PROMOTION = gql`
    mutation RemovePromotion($promotionID: ID!) {
        removedPromotion: removePromotion(promotionID: $promotionID) {
            ...PromotionDetail
        }
    }
    ${PROMOTION_DATA}
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
    query GetUsers($role: String) {
        users: users(role: $role) {
            ...UserDetail
        }
    }
    ${USER_DATA}
`;

export const GET_USER = gql`
    query GetUser($userId: ID!) {
        user: user(userId: $userId) {
            ...UserDetail
        }
    }
    ${USER_DATA}
`;

export const SIGN_IN = gql`
    query SignIn($email: String = "", $password: String = "") {
        token: login(username: $email, password: $password)
    }
`;

export const SIGN_UP = gql`
    mutation SignUp($newUser: UserInput!) {
        token: addUser(userInput: $newUser)
    }
`;

export const GET_APPOINTMENTS = gql`
    query GetAppointments($query: AppointmentFilter) {
        appointments: appointments(filter: $query) {
            ...AppointmentDetail
        }
    }
    ${APPOINTMENT_DATA}
`;

export const UPDATE_APPOINTMENT = gql`
    mutation UpdateAppointment($appointmentID: ID!, $updatedAppointment: AppointmentInput!) {
        updatedAppointment: updateAppointment(appointmentID: $appointmentID, appointmentInput: $updatedAppointment) {
            ...AppointmentDetail
        }
    }
    ${APPOINTMENT_DATA}
`;

export const REMOVE_APPOINTMENT = gql`
    mutation RemoveAppointment($appointmentID: ID!) {
        removedAppointment: removeAppointment(appointmentID: $appointmentID) {
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

export const ADD_APPOINTMENT = gql`
    mutation AddAppointment($newAppointment: AppointmentInput!) {
        newAppointment: addAppointment(appointmentInput: $newAppointment) {
            ...AppointmentDetail
        }
    }
    ${APPOINTMENT_DATA}
`;

export const ACTIVATE_USER = gql`
    mutation ActivateUser($userId: ID!, $activationCode: String!) {
        token: activateUser(userId: $userId, activationCode: $activationCode)
    }
`;