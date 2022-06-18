import React, { useState, useEffect } from 'react';
import Cookie from 'cookie';
import Jwt from 'jsonwebtoken';
import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';

import PageLayout from '../../components/page-layout';
import { GET_USER, GET_USERS } from '../../lib/apollo/data-queries';
import ApolloClient from '../../lib/apollo/apollo-client';
import { UserDetailProperties, DataPerPage } from '../../src/constants';
import styles from '../../styles/userspage.module.css';
import { style } from '@mui/system';
import { debounce } from '@mui/material';

export default function UsersPage({ payload, error, users }) {
    const router = useRouter();
    const apolloClient = useApolloClient();
    const [userDetail, setUserDetail] = useState();
    const [appError, setAppError] = useState();
    const [filteredUser, setFilteredUser] = useState([]);
    const [searchFilter, setSearchFilter] = useState("");
    const [debounceSearch, setDebounceSearch] = useState();
    const [pagination, setPagination] = useState();

    useEffect(async () => {
        try {
            let user = JSON.parse(localStorage.getItem("user"));

            if (!user) {
                const getUser = await apolloClient.query({
                    query: GET_USER,
                    variables: {
                        userId: payload?.id
                    }
                });
    
                user = getUser?.data?.user;
    
                if (!user) {
                    throw new Error("Unable to obtain admin details");
                }
            }

            setUserDetail(user);
        } catch (err) {
            router.replace('/404');
        }
    }, []);

    useEffect(() => {
        clearTimeout(debounceSearch);

        setDebounceSearch(setTimeout(() => {
            let usersCopy = Array.from(users);

            usersCopy = usersCopy.filter(user => {
                if (user.name.includes(searchFilter)) {
                    return true;
                }
    
                if (user.email.includes(searchFilter)) {
                    return true;
                }
    
                if (user.phone.includes(searchFilter)) {
                    return true;
                }
    
                if (user.status.includes(searchFilter)) {
                    return true;
                }
    
                if (user.role.includes(searchFilter)) {
                    return true;
                }
    
                return false;
            });
    
            setFilteredUser(usersCopy);
        }, 1500));
    }, [searchFilter]);

    useEffect(() => {
        setPagination();
    }, [filteredUser]);

    const handleSearchFilterChange = (e) => {
        setSearchFilter(e.target.value);
    }

    const handlePaginationChange = (e) => {
        e.preventDefault();
        setPagination(e.target.text-1);
    }

    return (
        <PageLayout userDetail={userDetail}>
            <div id={styles.account_section}>
                <h3 className={styles.section_heading}>ACCOUNTS</h3>
                <div id={styles.account_table_wrapper}>
                    <div id={styles.search_filter_box}>
                        <label id={styles.search_filter_label} htmlFor='user_filter'>Search</label>
                        <br />
                        <input placeholder='Name, Email, Phone, Status, Role' onChange={handleSearchFilterChange} value={searchFilter} id="user_filter" name="user_filter" type="text" />
                    </div>
                    <table id={styles.account_table}>
                        <caption>All Users of BeautyUStudioWeb</caption>
                        <thead>
                            <tr>
                                {UserDetailProperties.map(userProperty => {
                                    return (
                                        <th id={userProperty} key={userProperty}>{userProperty}</th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUser.slice((pagination ?? 0)*DataPerPage, ((pagination ?? 0)+1)*DataPerPage-1).map(user => {
                                return (
                                    <tr key={user.id}>
                                        {UserDetailProperties.map(userProperty => {
                                            return (
                                                <td key={userProperty}>{user[userProperty]}</td>
                                            )
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div id={styles.pagination_container}>
                        {new Array(Math.ceil(filteredUser.length / DataPerPage)).fill(0).map((_, index) => {
                            return (
                                <a defaultValue={index} href='#' key={`page${index}`} onClick={handlePaginationChange}>{index+1}</a>
                            )
                        })}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export async function getServerSideProps(context) {
    try {
        const cookies = Cookie.parse(context.req.headers?.cookie ?? "");

        const authToken = cookies?.token;
        const payload = Jwt.decode(authToken);
    
        if (!payload || (payload?.role?.toLowerCase() ?? "") != "admin" || (payload?.exp ?? 0) * 1000 < Date.now()) {
            throw new Error("Invalid auth token");
        }
    
        const getUsers = await ApolloClient.query({
            query: GET_USERS,
            variables: {
                role: ""
            },
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            }
        });

        const users = getUsers?.data?.users;

        if (!users) {
            throw new Error("Server Error, unable to fetch users");
        }

        let usersCopy = Array.from(users);

        usersCopy.sort((a,b) => {
            let aName = a.name.toLowerCase(), bName = b.name.toLowerCase();

            if (aName < bName) {
                return -1;
            }

            if (aName > bName) {
                return 1;
            }

            return 0;
        });

        return {
            props: {
                users: usersCopy
            }
        }
    } catch (err) {
        console.log(err);
        const reason = err?.message?.toLowerCase();

        if (reason == "invalid auth token") {
            return {
                notFound: true
            }
        } else {
            return {
                props: {
                    error: reason
                }
            }
        }
    }
};