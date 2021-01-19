import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, ActivityIndicator, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import firebase from '../FirebaseConfig';

import BasicButton from "../components/BasicButton";
import LoginSignUpBtn from "../components/LoginSignUpBtn";
import SnackBar from "../components/SnackBar";

export default function Login({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [snackBarVisible, setSnackBarVisible] = useState(false);
    const [snackBarText, setSnackBarText] = useState("");
    const [snackBarType, setSnackBarType] = useState("");

    //function to handle when login btn is clicked on
    function handleLoginBtnClick() {
        displayLoader();
        //doing firebase auth
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(async (user) => {
                try {
                    const userId = user.user.uid;

                    //making cookie of the logged user
                    await AsyncStorage.setItem("loggedUserEmail", email);
                    await AsyncStorage.setItem("loggedUserId", userId);

                    hideLoader();
                    displaySnackBar("success", "Succesfully logged");
                    navigation.push('Dashboard');
                } catch {
                    hideLoader();
                    displaySnackBar("error", "Something went wrong");
                }
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;

                hideLoader();
                displaySnackBar("error", errorMessage);
            });
    }

    //function to handle when signup btn is clicked on
    function handleSignUpBtnClick() {
        navigation.navigate('Signup');
    }

    //function to display snackbar
    function displaySnackBar(type, text) {
        setSnackBarType(type);
        setSnackBarText(text);
        setSnackBarVisible(true);
    }

    //function to hide snackbar
    function hideSnackBar() {
        setSnackBarVisible(false);
    }

    //function to toogle loading bar
    function displayLoader() {
        setIsLoading(true);
    }

    function hideLoader() {
        setIsLoading(false);
    }

    //component rendering
    return (
        <>
            <ScrollView style={styles.container}>
                <View style={styles.form}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.inputField}
                        keyboardType="email-address"
                        placeholder="Enter your registered email"
                        value={email}
                        onChangeText={(val) => setEmail(val)}
                    />

                    <View style={styles.divider}></View>

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.inputField}
                        secureTextEntry
                        placeholder="Enter password"
                        value={password}
                        onChangeText={(val) => setPassword(val)}
                    />
                </View>

                <BasicButton
                    text="Login"
                    onPress={handleLoginBtnClick}
                />

                {
                    isLoading ?
                        <ActivityIndicator style={styles.loader} />
                        : null
                }

                <LoginSignUpBtn
                    customStyle={styles.signup}
                    text="Don’t have an account?"
                    btnText="Sign up"
                    onPress={handleSignUpBtnClick}
                />
            </ScrollView>

            {
                snackBarVisible ?
                    <SnackBar
                        isVisible={snackBarVisible}
                        text={snackBarText}
                        type={snackBarType}
                        onClose={hideSnackBar}
                    />
                    : null
            }
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 0,
        paddingHorizontal: 30,
    },

    title: {
        fontWeight: '500',
        fontSize: 20,
        letterSpacing: 0.1,
        color: '#2E2E2E',
    },

    form: {
        marginVertical: 35,
    },

    label: {
        fontSize: 16,
        lineHeight: 18,
        color: '#666666',
        marginBottom: 3,
    },

    inputField: {
        fontSize: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#BFBFBF',
        paddingVertical: 6,
    },

    divider: {
        paddingVertical: 8,
    },

    loader: {
        marginTop: 10,
    },

    signup: {
        marginTop: 40,
    }
});
