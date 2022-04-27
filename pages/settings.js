import { useEffect, useState } from 'react';
import Cookie from 'cookie';
import Jwt from 'jsonwebtoken';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import EastOutlinedIcon from '@mui/icons-material/EastOutlined';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useApolloClient } from '@apollo/client';

import ApolloClient from '../lib/apollo/apollo-client';
import { GET_USER, UPDATE_USER } from '../lib/apollo/data-queries';
import Layout from '../components/page-layout';
import styles from '../styles/settingspage.module.css';

export default function SettingsPage({ userDetails }) {
    const apolloClient = useApolloClient();

    const [newPassword, setNewPassword] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [newPasswordVerified, setNewPasswordVerified] = useState("");
    const [newPasswordVerifiedError, setNewPasswordVerifiedError] = useState("");
    const [activeSettingsType, setActiveSettingsType] = useState("security");
    const [openNewPasswordConfirmDialog, setOpenNewPasswordConfirmDialog] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertStatus, setAlertStatus] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    const handleNewPasswordChange = (e) => {
        // Password must be 8 characters long and have one uppercase, one lowercase, and one special character
        let passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!#%*?&]{8,}$/;
        let passRequirements = passwordRequirements.test(e.target.value);

        if (passRequirements) {
            setNewPasswordError("");
        }

        setNewPassword(e.target.value);
    }

    const handleNewPasswordVerifyChange = (e) => {
        if (e.target.value == newPassword) {
            setNewPasswordVerifiedError("");
        }

        setNewPasswordVerified(e.target.value);
    }

    const handleNewPasswordRequest = async () => {
        // Check if form input meets criteria
        // If it doesn't then set the error and then return
        // If it does then check to see if input need to be process to form request body
        // Form the request body using the input
        // Send the request
        // Check to see if it is succesful and either way send the result through an alert to user
        // Update the cache if needed.
        // Update the cookies if needed
        // If sucessful clear all inputs

        setOpenNewPasswordConfirmDialog(false);
        let inputError = false;

        if (newPassword) {
            // Password must be 8 characters long and have one uppercase, one lowercase, and one special character
            let passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!#%*?&]{8,}$/;
            let passRequirements = passwordRequirements.test(newPassword);

            if (!passRequirements) {
                setNewPasswordError('password must be at least 8 characters, with at least 1 uppercase, lowercase, a special character and a number');
                inputError = true;
            }
        } else {
            setNewPasswordError("Password can't be empty");
            inputError = true;
        }

        if (newPasswordVerified) {
            if (newPasswordVerified != newPassword) {
                setNewPasswordVerifiedError("Your password must match");
                inputError = true;
            }
        } else {
            setNewPasswordVerifiedError("You must confirmed your new password");
            inputError = true;
        }

        if (inputError) {
            return;   
        }

        try {
            const userInput = {
                password: newPassword
            };

            const updateUser = await apolloClient.mutate({
                mutation: UPDATE_USER,
                variables: {
                    userID: userDetails.id,
                    userInput: userInput
                }
            });

            const updatedUser = updateUser?.data?.updatedUser;

            if (!updatedUser) {
                throw new Error("Request does not contain an updated response");
            }

            setAlertStatus("success");
            setAlertMessage("Password Succesfully Changed");
            setShowAlert(true);
            clearFormInput();
        } catch (err) {
            setAlertStatus("error");
            setAlertMessage("there was a problem submitting new password");
            setShowAlert(true);
        }
    }

    function clearFormInput() {
        setNewPassword("");
        setNewPasswordError("");
        setNewPasswordVerified("");
        setNewPasswordVerifiedError("");
    }

    function securitySettings() {
        return (
            <Box component="form" id={styles.security_form} onSubmit={(e) => { e.preventDefault(); setOpenNewPasswordConfirmDialog(true)} }>
                <h3>Login</h3>
                <TextField fullWidth sx={{ my: 2, display: "block" }} id="new_password_input" name="new_password" 
                    placeholder='Enter your new password' label="New Password" type="text" error={(newPasswordError ?? '') != ''} 
                    value={newPassword} onChange={handleNewPasswordChange} 
                    helperText={newPasswordError || "password must be at least 8 characters, with at least 1 uppercase, lowercase, a special character and a number"} />
                <TextField fullWidth sx={{ my: 2, display: "block" }} id="new_password_verify_input" name="new_password_verify" 
                    placeholder="Verify your new password" label="Confirm Password" type="text" 
                    helperText={newPasswordVerifiedError || 're-enter your new password'}
                    error={(newPasswordVerifiedError ?? '') != ''} value={newPasswordVerified} onChange={handleNewPasswordVerifyChange} />
                <Button sx={{ display: "flex", clear: "both", float: "right" }} type="submit" style={{"color": "black", "borderColor": "black"}} variant="outlined" endIcon={<EastOutlinedIcon />}>Request</Button>
                <Dialog
                    open={openNewPasswordConfirmDialog}
                    onClose={() => setOpenNewPasswordConfirmDialog(false)}
                    aria-labelledby="set_new_password_confirm_dialog_title"
                    aria-describedby="set_new_password_confirm_dialog_description">
                        <DialogTitle id="set_new_password_confirm_dialog_title">
                            {"Request To Change Password"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="set_new_password_confirm_dialog_description">
                                New Password will 
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenNewPasswordConfirmDialog(false)}>Cancel</Button>
                            <Button onClick={handleNewPasswordRequest} autoFocus>Proceed</Button>
                        </DialogActions>
                </Dialog>
            </Box>
        )
    }

    function getSettingsType() {
        if (activeSettingsType == "security") {
            return securitySettings();
        }

        return;
    }

    return (
        <Layout userDetail={userDetails}>
            <Container id={styles.settings_layout}>
                <Paper id={styles.settings_menu} sx={{ width: "300px", maxWidth: '350px' }}>
                    <MenuList>
                        <MenuItem onClick={() => setActiveSettingsType("security")} sx={{ justifyContent: "center"}}>
                            Security
                        </MenuItem>
                    </MenuList>
                </Paper>
                <div id={styles.settings_form}>
                    {getSettingsType()}
                </div>
            </Container>
            <Container maxWidth="xs" className="alert_popup">
                <Collapse in={showAlert}>
                    <Alert
                        severity={alertStatus ?? 'info'}
                        action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setAlertMessage('');
                                setShowAlert(false);
                                setAlertStatus();
                            }}>
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                        }
                        sx={{ mb: 2 }} >
                        <AlertTitle>{(alertStatus ?? 'info').toLocaleUpperCase()}</AlertTitle>
                        {alertMessage}
                    </Alert>
                </Collapse>
            </Container>  
        </Layout>
    )
}

export async function getServerSideProps(context) {
    try {
        const cookies = Cookie.parse(context.req.headers?.cookie ?? '');
        const authToken = cookies?.token;
        const payload = Jwt.decode(authToken);

        if (!payload || (payload?.exp ?? 0) * 1000 < Date.now()) {
            throw new Error('bad token');
        }

        const user = await ApolloClient.query({
            query: GET_USER,
            variables: {
                userId: payload.id
            },
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            },
            fetchPolicy: "no-cache"
        });

        const userDetails = user?.data?.user;

        if (!userDetails) {
            throw new Error('Unable to identify user with token');
        }

        if (userDetails.status.toLowerCase() == 'suspended') {
            throw new Error('Account is suspended');
        }

        if (userDetails.status.toLowerCase() == 'not activated') {
            throw new Error('Account is not activated');
        }

        return {
            props: {
                userDetails: userDetails
            }
        }
    } catch (err) {
        console.log(err);
        return {
            redirect: {
                source: '/settings',
                destination: '/authenticate',
                permanent: false
            }
        }
    }
}