import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const cache = new InMemoryCache();

const link = new HttpLink({
    uri: 'https://beautyustudioserver.azurewebsites.net/graphql'
});

const client = new ApolloClient({
    link,
    cache: cache,
    name: 'BeautyUStudioWeb',
    version: '1.0',
    ssrMode: typeof window === "undefined",
});

export default client;