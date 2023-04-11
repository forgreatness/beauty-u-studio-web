import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, from } from '@apollo/client';
import {} from '@apollo/client/link/core/'
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

const cache = new InMemoryCache();
const env = process.env.NODE_ENV || 'development';

const link = new HttpLink({
    uri: (env == 'development') ? 'http://localhost:8080/graphql' : 'https://beautyustudioapi.azurewebsites.net/graphql',
    credentials: (env == 'development') ? 'same-origin' : 'include'
});

const authLink = new ApolloLink((operation, forward) => {
    if (!operation.getContext().headers?.authorization) {
        const token = Cookies.get('token');

        operation.setContext({
            headers: {
                authorization: token ? `Bearer ${token}` : ''
            }
        });
    }

    return forward(operation);
});

const client = new ApolloClient({
    link: from([authLink, link]),
    cache: cache,
    name: 'BeautyUStudioWeb',
    version: '1.0',
    ssrMode: typeof window === "undefined",
});

export default client;
