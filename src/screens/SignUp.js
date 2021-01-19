import React from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, ActivityIndicator, } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ValidationComponent from 'react-native-form-validator';
import AsyncStorage from '@react-native-async-storage/async-storage';

import firebase from '../FirebaseConfig';

import BasicButton from "../components/BasicButton";
import LoginSignUpBtn from "../components/LoginSignUpBtn";
import SnackBar from "../components/SnackBar";

export default class SignUp extends ValidationComponent {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            email: "",
            ageGroup: "",
            password: "",
            confirmPassword: "",

            isLoading: false,

            snackBarVisible: false,
            snackBarType: "",
            snackBarText: "",
        };
    }

    //function to handle when signup btn is clicked on
    handleRegisterBtnClick = () => {
        this.displayLoader();

        //validating fields using 3rd party library
        this.validate({
            name: { minlength: 3, required: true },
            email: { email: true, required: true },
            ageGroup: { required: true },
            password: { required: true },
            confirmPassword: { equalPassword: this.state.password, required: true },
        });

        //if some error found in validation
        //then displaying it in snackbar
        if (this.getErrorMessages()) {
            this.hideLoader();
            this.displaySnackBar("error", this.getErrorMessages());
        } else {
            //doing firebase auth
            firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then((user) => {
                    try {
                        //inserting user data in firebase db
                        const userId = user.user.uid;
                        const name = this.state.name;
                        const email = this.state.email;
                        const ageGroup = this.state.ageGroup;

                        const usersDbRef = firebase.app().database().ref('users/');
                        usersDbRef
                            .child(userId)
                            .set({
                                userId,
                                name,
                                email,
                                ageGroup,
                                profilePicUri: "",
                                desc: "",
                            },
                                async (error) => {
                                    if (error) {
                                        this.hideLoader();
                                        this.displaySnackBar("error", "Something went wrong");
                                    } else {
                                        try {
                                            //making cookie of the logged user
                                            await AsyncStorage.setItem("loggedUserEmail", email);
                                            await AsyncStorage.setItem("loggedUserId", userId);

                                            this.hideLoader();
                                            this.displaySnackBar("success", "Successfully Registered");
                                            this.props.navigation.push('Dashboard');
                                        } catch {
                                            this.hideLoader();
                                            this.displaySnackBar("error", "Something went wrong");
                                        }
                                    }
                                });
                    } catch {
                        this.hideLoader();
                        this.displaySnackBar("error", "Something went wrong");
                    }
                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;

                    this.hideLoader();
                    this.displaySnackBar("error", errorMessage);
                });
        }
    }

    //function to handle when sign in btn is clicked on
    handleSignInBtnClick = () => {
        this.props.navigation.navigate('Login');
    }

    //function to display snackbar
    displaySnackBar = (type, text) => {
        this.setState({
            "snackBarType": type,
            "snackBarText": text,
        });
        this.setState({
            "snackBarVisible": true
        });
    }

    //function to hide snackbar
    hideSnackBar = () => {
        this.setState({
            "snackBarVisible": false
        });
    }

    //function to toogle loading bar
    displayLoader = () => {
        this.setState({
            isLoading: true,
        });
    }

    hideLoader = () => {
        this.setState({
            isLoading: false,
        });
    }

    //component rendering
    render() {
        return (
            <>
                <ScrollView style={styles.container}>

                    <View style={styles.form}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="Enter your name"
                            value={this.state.name}
                            onChangeText={(name) => this.setState({ name })}
                        />

                        <View style={styles.divider}></View>

                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.inputField}
                            keyboardType="email-address"
                            placeholder="Enter your registered email"
                            value={this.state.email}
                            onChangeText={(email) => this.setState({ email })}
                        />

                        <View style={styles.divider}></View>

                        <Text style={styles.label}>Age Group</Text>
                        <Picker
                            style={styles.inputField}
                            selectedValue={this.state.ageGroup}
                            onValueChange={(ageGroup, itemIndex) => this.setState({ ageGroup })}
                        >
                            <Picker.Item label="" value="" />
                            <Picker.Item label="1-4" value="1-4" />
                            <Picker.Item label="5-12" value="5-12" />
                            <Picker.Item label="13-18" value="13-18" />
                        </Picker>

                        <View style={styles.divider}></View>

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.inputField}
                            secureTextEntry
                            placeholder="Enter password"
                            value={this.state.password}
                            onChangeText={(password) => this.setState({ password })}
                        />

                        <View style={styles.divider}></View>

                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.inputField}
                            secureTextEntry
                            placeholder="Confirm password"
                            value={this.state.confirmPassword}
                            onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
                        />
                    </View>

                    <BasicButton
                        text="Register"
                        onPress={this.handleRegisterBtnClick}
                    />

                    {
                        this.state.isLoading ?
                            <ActivityIndicator style={styles.loader} />
                            : null
                    }

                    <LoginSignUpBtn
                        customStyle={styles.signin}
                        text="Already have an account?"
                        btnText="Log in"
                        onPress={this.handleSignInBtnClick}
                    />
                </ScrollView>

                {
                    this.state.snackBarVisible ?
                        <SnackBar
                            isVisible={this.state.snackBarVisible}
                            text={this.state.snackBarText}
                            type={this.state.snackBarType}
                            onClose={this.hideSnackBar}
                        />
                        : null
                }
            </>
        );
    }
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
        borderWidth: 0,
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

    signin: {
        marginVertical: 40,
    },

    snackbar: {
        backgroundColor: "red",
    }
});
