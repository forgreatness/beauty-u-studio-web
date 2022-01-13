import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

const cache = new InMemoryCache();
const env = process.env.NODE_ENV || 'development';

const link = new HttpLink({
    uri: (env == 'development') ? 'http://localhost:8080/graphql' : 'https://beautyustudioserver.azurewebsites.net/graphql',
    credentials: (env == 'development') ? 'same-origin' : 'include'
});

const authLink = setContext((_, { headers }) => {
    const token = Cookies.get('token');

    return {
        headers: {
            ...headers,
            authorization: `Bearer ${token}`
        }
    }
});

const client = new ApolloClient({
    link: authLink.concat(link),
    cache: cache,
    name: 'BeautyUStudioWeb',
    version: '1.0',
    ssrMode: typeof window === "undefined",
});

export default client;