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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';
import Cookie from 'cookie';
import Jwt from 'jsonwebtoken';
import EmailJS from '@emailjs/browser';
import { useApolloClient } from '@apollo/client';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import SnackBar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import ApolloClient from '../lib/apollo/apollo-client.js';
import styles from '../styles/authenticatepage.module.css';
import { GET_USER, SIGN_IN, SIGN_UP, GET_ACCOUNT_RECOVERY_TOKEN } from '../lib/apollo/data-queries.js';

export default function AuthenticatePage(props) {
    const [submitForm, setSubmitForm] = useState(false);
    const apolloClient = useApolloClient();

    const [openErrorSnackBar, setOpenErrorSnackBar] = useState(false);
    const [snackBarError, setSnackBarError] = useState("");

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

    const [forgotPassword, setForgotPassword] = useState(false);
    const [forgotPasswordUsername, setForgotPasswordUsername] = useState("");
    const [forgotPasswordUsernameError, setForgotPasswordUsernameError] = useState("");
    const [forgotPasswordError, setForgotPasswordError] = useState("");
    const [openAccountRecoveryDialog, setOpenAccountRecoveryDialog] = useState(false);

    const router = useRouter();

    // Request change form type
    const handleFormTypeChange = (e, newValue) => {
        setFormType(newValue);
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
            setSignInError('Input must match the specified criteria');
            return;
        }

        setSubmitForm(true);

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

            const token = data?.token;
            const payload = Jwt.decode(token);

            if (!payload || Date.now() > payload.exp * 1000) {
                throw 'Login unsuccessful';
            }
            
            const user = await ApolloClient.query({
                query: GET_USER,
                variables: {
                    userId: payload?.id
                },
                context: {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                }
            });

            if (!user) {
                throw 'Login unsucessful';
            }

            // if login sucessfull save the token, save userDetails and reroute to profile page, else display page error saying login unsucessful
            document.cookie = 'token=' + token;
            localStorage.setItem("user", JSON.stringify(user.data.user));

            router.push('/profile');
        } catch (error) {
            setOpenErrorSnackBar(true);
            setSnackBarError("Invalid Credentials");
            setSubmitForm(false);
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
            setSubmitForm(true);

            const activationCode = Math.random().toString(16).substring(2,12);
            const accountRecoveryCode = Math.random().toString(16).substring(2,12);
            const { data } = await ApolloClient.mutate({
                mutation: SIGN_UP,
                variables: {
                    newUser: {
                        name: signUpName,
                        email: signUpEmail,
                        phone: signUpPhone.split('-').join(''),
                        password: signUpPassword,
                        role: "client",
                        activationCode: activationCode,
                        accountRecoveryCode: accountRecoveryCode
                    }
                },
                fetchPolicy: "no-cache"
            });

            const token = data?.token;
            const payload = Jwt.decode(token);

            if (!payload || Date.now() > payload.exp * 1000) {
                throw new Error('invalid auth token');
            }

            // if signup sucessfull save the token, but no need to get the user detail because they need to verify account first
            document.cookie = 'token=' + token;

            // Once the user sign up and their token is store, we need to send an email with activation code to user
            const activationPayload = {
                "uid": payload.id,
                "ac": activationCode
            };

            const activationToken = await Jwt.sign(activationPayload, props.jwtActivationTokenKey, {
                expiresIn: "30d",
                subject: "Account activation jwt",
                issuer: "beautyustudioweb",
                audience: "beautyustudio clients"
            });

            const emailResponse = await EmailJS.send(props.emailJS.serviceID, props.emailJS.accountActivationTemplateID, {
                client: signUpName,
                activation_link: `${props.appHomeUrl}/userActivation?activationToken=${activationToken}`,
                send_to: signUpEmail
            }, props.emailJS.userID);

            if ((emailResponse?.status ?? "") != 200) {
                throw new Error ('Unable to send user activation link');
            }

            router.push('/profile');
        } catch(err) {
            const reason = err?.message?.toLocaleLowerCase() ?? '';

            if (reason == "unable to send user activation link") {
                setSnackBarError("There was a problem sending the activation code, please use the contact section and reach out to activate your account");
            } else {
                setSnackBarError("Unable to process your credentials");
            }
            
            setOpenErrorSnackBar(true);
            setSignUpError(err?.message ?? 'Sign up unsuccessful');
            setSubmitForm(false);
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

    const handleForgotPasswordUsernameChange = (e) => {
        setForgotPasswordUsername(e.target.value);

        setForgotPasswordUsernameError("");
    }

    const handleForgotPassword = (forgot) => {
        setForgotPassword(forgot);
    }

    const handleForgotPasswordRequest = async (e) => {
        e.preventDefault();

        let inputError = false;

        if (!forgotPasswordUsername) {
            setForgotPasswordUsernameError('required');
            inputError = true;
        } else {
            let isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordUsername);

            if (!isValidEmail) {
                inputError = true;
                setForgotPasswordUsernameError('email should contain @service and .domain');
            }
        }

        if (inputError) {
            setOpenAccountRecoveryDialog(false);
            return;
        }

        try {
            const getAccountRecoveryToken = await apolloClient.query({
                query: GET_ACCOUNT_RECOVERY_TOKEN,
                variables: {
                    "username": forgotPasswordUsername
                },
            });

            if (!getAccountRecoveryToken?.data?.token) {
                throw new Error('Unable to send account recovery');
            }

            const payload = Jwt.decode(getAccountRecoveryToken.data.token);

            if (!payload || Date.now() > (payload?.exp ?? 0) * 1000) {
                throw new Error('Invalid account recovery token');
            }

            const emailResponse = await EmailJS.send(props.emailJS.serviceID, props.emailJS.accountRecoveryTemplateID, {
                client: payload?.name,
                account_recovery_link: `${props.appHomeUrl}/accountRecovery?recoveryToken=${getAccountRecoveryToken.data.token}`,
                send_to: forgotPasswordUsername
            }, props.emailJS.userID);

            if ((emailResponse?.status ?? "") != 200) {
                throw new Error ('Unable to send user recovery link');
            }
        } catch (err) {

        } finally {
            setForgotPassword(false);
            setForgotPasswordUsername("");
            setForgotPasswordUsernameError("");
            setOpenAccountRecoveryDialog(false);
            return;
        }
    }

    const handleCloseErrorSnackBar = () => {
        setOpenErrorSnackBar(false);
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
                <a href="#" onClick={() => handleForgotPassword(true)}>Forget Password?</a>
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

    function forgotPasswordForm() {
        return (
            <Box component="form" className={styles.forgot_password_form} onSubmit={(e) => { e.preventDefault(); setOpenAccountRecoveryDialog(true)} }>
                <TextField fullWidth error={forgotPasswordUsernameError ? true : false} autoComplete="email" id="username" label="Username" variant="outlined" helperText={forgotPasswordUsernameError ? forgotPasswordUsernameError : "Enter the email of the account"} value={forgotPasswordUsername} onChange={handleForgotPasswordUsernameChange} />
                <a href="#" style={{ "color": "black", "textDecoration": "none" }} onClick={() => handleForgotPassword(false)}><ArrowBackIcon /> Back</a>
                <Stack className={styles.forgot_password_action_container} direction="row" alignItems="center" justifyContent="flex-end" spacing={2 }>
                    <Button type="submit" style={{"color": "black", "borderColor": "black"}} variant="outlined" endIcon={<EastOutlinedIcon />}>Enter</Button>
                    <Dialog
                        open={openAccountRecoveryDialog}
                        onClose={() => setOpenAccountRecoveryDialog(false)}
                        aria-labelledby="send-account-recovery-dialog-title"
                        aria-describedby="send-account-recovery-dialog-description"
                    >
                        <DialogTitle id="send-account-recovery-title">
                            {"Send Account Recovery Request"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="send-account-recovery-dialog-description">
                                If an account exist, a recovery link will be send out to the email of the account
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenAccountRecoveryDialog(false)}>Back</Button>
                            <Button onClick={handleForgotPasswordRequest} autoFocus>Proceed</Button>
                        </DialogActions>
                    </Dialog>
                </Stack>
            </Box>
        )
    }

    return (
        [
            <Link href="/" passHref>
                <a className={styles.home}>
                    <img className={styles.logo} src="/images/BeautyUStudio-logo.png" alt="BeautyUStudio Home Link" />
                </a>
            </Link>,
            <Container component="main" maxWidth="xxl" className={styles.auth_page_container}>
                {forgotPassword ? 
                    <div className={styles.forgot_password_form_container}>
                        <h5>Recover your password</h5>
                        {forgotPasswordForm()}
                    </div>
                    : <div className={styles.auth_form_container}>
                        <Tabs value={formType} onChange={handleFormTypeChange} textColor="primary" indicatorColor="primary" aria-label="select the form type to authenticate">
                            <Tab value="login" label="SIGN IN" />
                            <Tab value="register" label="SIGN UP" />
                        </Tabs>
                        {formType == "login" ? signInForm() : signUpForm()}
                    </div>
                }
            </Container>,
            <SnackBar anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }} open={openErrorSnackBar} autoHideDuration={7500} onClose={handleCloseErrorSnackBar}>
                <Alert severity="error">{snackBarError}</Alert>
            </SnackBar>,
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
        props: {
            appHomeUrl: `https://${context.req.headers.host}`,
            emailJS: {
                "serviceID": process.env.EMAILJS_SERVICE_ID,
                "accountActivationTemplateID": process.env.EMAILJS_ACCOUNT_ACTIVATION_TEMPLATE_ID,
                "accountRecoveryTemplateID": process.env.EMAILJS_ACCOUNT_RECOVERY_TEMPLATE_ID,
                "userID": process.env.EMAILJS_USER_ID
            },
            jwtActivationTokenKey: process.env.JWT_ACTIVATION_TOKEN_KEY
        }
    }
}
