import React, { useState, useContext, createContext } from 'react';
import {
    ApolloProvider,
    ApolloClient, 
    InMemoryCache,
    HttpLink,
    gql
} from '@apollo/client';

const authContext = createContext();

export function AuthProvider({ children }) {
    const auth = useProvideAuth();

    return (
        <authContext.Provider value={auth}>
            <ApolloProvider client={auth.createApolloClient()}>
                {children}
            </ApolloProvider>
        </authContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(authContext);
}

function useProvideAuth() {
    const [authToken, setAuthToken] = useState(null);

    const isSignedIn = () => {
        if (authToken) {
            return true;
        } else { 
            return false;
        }
    }

    const getAuthHeaders = () => {
        if (!authToken) return null;

        return {
            authorization: `Bearer ${authToken}`
        };
    }

    const createApolloClient = () => {
        const link = new HttpLink({
            uri: 'https://beautyustudiospacommonserver.azurewebsites.net/graphql',
            headers: getAuthHeaders()
        });

        return new ApolloClient({
            link,
            cache: new InMemoryCache()
        });
    }
}
