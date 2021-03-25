import { ApolloClient, InMemoryCache } from '@apollo/client';

const cache = new InMemoryCache();

const client = new ApolloClient({
    cache: cache,
    uri: 'http://beauty-u-studio-server.azurewebsites.net/graphql',
    name: 'BeautyUStudioWeb',
    version: '1.0',
    ssrMode: typeof window === "undefined",
});

export default client;