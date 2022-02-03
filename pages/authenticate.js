import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import InputLabel from '@mui/material/InputLabel';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import EastOutlinedIcon from '@mui/icons-material/EastOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import FormHelperText from '@mui/material/FormHelperText';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/router';
import Cookie from 'cookie';

import ApolloClient from '../lib/apollo/apollo-client.js';
import styles from '../styles/authenticatepage.module.css';
import { SIGN_IN, SIGN_UP } from '../lib/apollo/data-queries.js';

export default function AuthenticatePage() {
    const [submitForm, setSubmitForm] = useState(false);

    const [formType, setFormType] = useState("login");
    const [signInUsername, setSignInUsername] = useState("");
    const [signInPassword, setSignInPassword] = useState("");
    const [signInShowPassword, setSignInShowPassword] = useState(false);
    const [signInUsernameError, setSignInUsernameError] = useState("");
    const [signInPasswordError, setSignInPasswordError] = useState("");
    const [signInError, setSignInError] = useState("");

    const [signUpName, setSignUpName] = useState("");
    const [signUpEmail, setSignUpEmail] = useState("");
    const [signUpPhone, setSignUpPhone] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");
    const [signUpNameError, setSignUpNameError] = useState("");
    const [signUpEmailError, setSignUpEmailError] = useState("");
    const [signUpPasswordError, setSignUpPasswordError] = useState("");
    const [signUpPhoneError, setSignUpPhoneError] = useState("");
    const [signUpShowPassword, setSignUpShowPassword] = useState(false);
    const [signUpError, setSignUpError] = useState("");

    const router = useRouter();

    // Request change form type
    const handleFormTypeChange = (e, newValue) => {
        setFormType(newValue);
    }

    // Request password change link
    const handleSignInPasswordRequest = (e) => {
        e.preventDefault();
    }

    // SignIn event handlers
    const handleSignInUsernameChange = (e) => {
        setSignInUsernameError("");

        setSignInUsername(e.target.value);
    }

    const handleSignInPasswordChange = (e) => {
        setSignInPasswordError("");

        setSignInPassword(e.target.value);
    }

    const handleSignInShowPasswordChange = () => {
        setSignInShowPassword(!signInShowPassword);
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleSignInClear = () => {
        setSignInUsername("");
        setSignInPassword("");
        setSignInUsernameError("");
        setSignInPasswordError("");
        setSignInShowPassword(false);
    }


    const handleSignInSubmit = async (e) => {
        e.preventDefault();
        setSubmitForm(true);

        let isValid = true;

        if (!signInUsername) {
            setSignInUsernameError('required');

            isValid = false;
        } else {
            let isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInUsername);

            if (!isValidEmail) {
                setSignInUsernameError('email should contain @service and .domain');

                isValid = false;
            }
        }

        if (!signInPassword) {
            setSignInPasswordError('password can\'t be empty');

            isValid = false;
        }

        if (!isValid) {
            setSignInError('Input must match the specified criteria')
            return;
        }

        // If input is valid send sign in request
        try {
            const { data } = await ApolloClient.query({
                query: SIGN_IN,
                variables: {
                    email: signInUsername,
                    password: signInPassword
                },
                fetchPolicy: "no-cache"
            });

            // if login sucessfull save the token and reroute to profile page, else display page error saying login unsucessful
            if (data?.token) {
                document.cookie = 'token=' + data.token;

                router.push('/profile');
            } else {
                throw 'Login unsuccesful';
            }
        } catch (error) {
            setSignInError(error);
        }
    }

    // SignUp event handlers
    const handleSignUpClear = () => {
        setSignUpName("");
        setSignUpNameError("");
        setSignUpEmail("");
        setSignUpEmailError("");
        setSignUpPhone("");
        setSignUpPhoneError("");
        setSignUpPassword("");
        setSignUpPasswordError("");
        setSignUpShowPassword(false);
    }

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        setSubmitForm(true);

        let isValid = true;

        if (!signUpName) {
            setSignUpNameError('required');

            isValid = false;
        } else {
            let isValidName = /^[a-zA-Z]{2,}[\s]+[a-zA-Z]{2,}$/.test(signUpName);

            if (!isValidName) {
                setSignUpNameError('Name must include first and last/');

                isValid = false;
            }
        }

        if (!signUpEmail) {
            setSignUpEmailError('required');

            isValid = false;
        } else {
            let isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail);

            if (!isValidEmail) {
                setSignUpEmailError('email should contain @service and .domain');

                isValid = false;
            }
        }

        if (!signUpPhone) {
            setSignUpPhoneError('required');

            isValid = false;
        } else {
            let isValidPhone = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(signUpPhone);

            if (!isValidPhone) {
                setSignUpPhoneError('phone should be 10 digits in xxx-xxx-xxxx');

                isValid = false;
            }
        }

        if(!signUpPassword) {
            setSignUpPasswordError('password can\'t be empty');

            isValid = false;
        } else {
            // Password must be 8 characters long and have one uppercase, one lowercase, and one special character
            let passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!#%*?&]{8,}$/;

            let passRequirements = passwordRequirements.test(signUpPassword);

            if (!passRequirements) {
                setSignUpPasswordError('password must be at least 8 characters, with at least 1 uppercase, lowercase, and special character');

                isValid = false;
            }
        }

        if (!isValid) {
            setSignUpError('Account info needs to match the specified criteria');
            return;
        }

        try {
            const { data } = await ApolloClient.mutate({
                mutation: SIGN_UP,
                variables: {
                    newUser: {
                        name: signUpName,
                        email: signUpEmail,
                        phone: signUpPhone.split('-').join(''),
                        password: signUpPassword,
                        role: "client"
                    }
                },
                fetchPolicy: "no-cache"
            });

            if (data?.token) {
                document.cookie = 'token=' + data.token;
            } else {
                throw new Error('No token returned')
            }

            router.push('/profile');
        } catch(err) {
            setSignUpError("Sign Up Not Successful");
        }
    }

    const handleSignUpNameChange = (e) => {
        setSignUpName(e.target.value);

        setSignUpNameError("");
    }

    const handleSignUpEmailChange = (e) => {
        setSignUpEmail(e.target.value);

        setSignUpEmailError("");
    }

    const handleSignUpPhoneChange = (e) => {
        let numOfDigits = calNumOfDigits(e.target.value);
        let phoneNumber = e.target.value;

        if (numOfDigits == 4) {
            if (phoneNumber.charAt(3) != '-') {
                phoneNumber = phoneNumber.slice(0,3) + '-' + phoneNumber.slice(3);
            }
        } else if (numOfDigits == 7) {
            if (phoneNumber.charAt(7) != '-') {
                phoneNumber = phoneNumber.slice(0,7) + '-' + phoneNumber.slice(7);
            }
        }

        let pattern = /^[0-9]{0,3}$|^[0-9]{3}-$|^[0-9]{3}-[0-9]{0,3}$|^[0-9]{3}-[0-9]{3}-$|^[0-9]{3}-[0-9]{3}-[0-9]{0,4}$/;

        if (pattern.test(phoneNumber)) {
            setSignUpPhoneError('');

            setSignUpPhone(phoneNumber);
        } else {
            let phonePattern = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;

            if (!phonePattern.test(signUpPhone)) {
                setSignUpPhoneError('Must be in the format xxx-xxx-xxxx');
            }
        }
    }

    const handleSignUpShowPasswordChange = () => {
        setSignUpShowPassword(!signUpShowPassword);
    }

    const handleSignUpPasswordChange = (e) => {
        setSignUpPassword(e.target.value);

        setSignUpPasswordError("");
    }

    // Utility functions
    function calNumOfDigits(str) {
        let count = 0;

        for (let ch of str) {
            if (ch >= "0" && ch <= "9") {
                count++;
            }
        }

        return count;
    }

    useEffect(() => {
        setSubmitForm(false);
    }, [signInError, signUpError]);

    function signInForm() {
        return (
            <Box component="form" className={styles.auth_form} onSubmit={handleSignInSubmit}>
                <TextField fullWidth error={(signInUsernameError) ? true : false} autoComplete="email" id="username" label="Username" variant="outlined" helperText={signInUsernameError ? signInUsernameError : "your email address"} value={signInUsername} onChange={handleSignInUsernameChange} margin="normal" />
                <FormControl margin="normal" fullWidth variant="outlined">
                    <InputLabel error={(signInPasswordError) ? true : false} htmlFor="password">Password</InputLabel>
                    <OutlinedInput
                        autoComplete="current-password"
                        id="password"
                        type={signInShowPassword ? 'text' : 'password'}
                        value={signInPassword}
                        onChange={handleSignInPasswordChange}
                        error={(signInPasswordError) ? true : false}
                        label="Password"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleSignInShowPasswordChange}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end">
                                        {signInShowPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <FormHelperText error={(signInPasswordError) ? true : false}>{signInPasswordError ? signInPasswordError : ""}</FormHelperText>
                </FormControl>
                <a href="#" onClick={handleSignInShowPasswordChange}>Forget Password?</a>
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2 }>
                    <Button onClick={handleSignInClear} style={{"color": "black", "borderColor": "black"}} variant="outlined" startIcon={<RefreshIcon />}>Reset</Button>
                    <Button type="submit" style={{"color": "black", "borderColor": "black"}} variant="outlined" endIcon={<EastOutlinedIcon />}>Enter</Button>
                </Stack>
            </Box>
        );
    }

    function signUpForm() {
        return (
            <Box component="form" className={styles.auth_form} onSubmit={handleSignUpSubmit}>
                <TextField autoFocus fullWidth variant="outlined" margin="normal" autoComplete="name" label="Name" id="signUpName" placeholder="Katie Anderson" helperText={signUpNameError || ''} error={(signUpNameError) ? true : false} value={signUpName} onChange={handleSignUpNameChange} />
                <TextField fullWidth variant="outlined" margin="normal" autoComplete="email" label="Email" placeholder="example@gmail.com" id="signUpEmail" helperText={signUpEmailError || ''} error={(signUpEmailError) ? true : false} value={signUpEmail} onChange={handleSignUpEmailChange} />
                <TextField fullWidth variant="outlined" margin="normal" autoComplete="phone" label="Phone Number" placeholder="800-333-3333" id="signUpPhone" helperText={signUpPhoneError || ''} error={(signUpPhoneError) ? true : false} value={signUpPhone} onChange={handleSignUpPhoneChange} />
                <TextField fullWidth varaint="outlined" margin="normal" autoComplete="password" label="Password" id="signUpPassword"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleSignUpShowPasswordChange}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end">
                                        {signUpShowPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                    helperText={signUpPasswordError || ''} error={(signUpPasswordError) ? true : false} value={signUpPassword}
                    onChange={handleSignUpPasswordChange} type={signUpShowPassword ? 'text' : 'password'} />
                <Stack className={styles.signup_action_container} direction="row" alignItems="center" justifyContent="flex-end" spacing={2 }>
                    <Button onClick={handleSignUpClear} style={{"color": "black", "borderColor": "black"}} variant="outlined" startIcon={<RefreshIcon />}>Reset</Button>
                    <Button type="submit" style={{"color": "black", "borderColor": "black"}} variant="outlined" endIcon={<EastOutlinedIcon />}>Enter</Button>
                </Stack>
            </Box>
        );
    }

    return (
        [
            <Link href="/" passHref>
                <a className={styles.home}>
                    <img className={styles.logo} src="/images/BeautyUStudio-logo.png" alt="BeautyUStudio Home Link" />
                </a>
            </Link>,
            <Container component="main" maxWidth="xxl" className={styles.auth_page_container}>
                <div className={styles.auth_form_container}>
                    <Tabs value={formType} onChange={handleFormTypeChange} textColor="primary" indicatorColor="primary" aria-label="select the form type to authenticate">
                        <Tab value="login" label="SIGN IN" />
                        <Tab value="register" label="SIGN UP" />
                    </Tabs>
                    {formType == "login" ? signInForm() : signUpForm()}
                </div>
            </Container>,
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={submitForm}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        ]
    );
}

export async function getServerSideProps(context) {
    const cookies = Cookie.parse(context.req.headers?.cookie ?? '');
    const authToken = cookies?.token;

    if (authToken) {
        return {
            redirect: {
                source: '/authenticate',
                destination: '/profile',
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}