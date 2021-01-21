import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BasicButton from "../components/BasicButton";

export default function Landing({ navigation }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            //checking if any user is already logged or not
            const loggedUserId = await AsyncStorage.getItem('loggedUserId');
            console.log("loggedUserId", loggedUserId);

            if (loggedUserId) {
                //if user is already logged then redirecting to Home Screen
                navigation.navigate('Dashboard');
            } else {
                setIsLoading(false);
            }
        })();

        //to prevent going back
        navigation.addListener('beforeRemove', (e) => {
            // Prevent default behavior of leaving the screen
            e.preventDefault();
            console.log("back pressed in landing");
        });
    }, []);

    //function to handle when login btn is clicked on
    function handleLoginBtnClick() {
        navigation.navigate('Login');
    }

    //function to handle when signup btn is clicked on
    function handleSignUpBtnClick() {
        navigation.navigate('Signup');
    }

    //component rendering
    return (
        <View style={styles.container}>
            {
                isLoading ?
                    <ActivityIndicator style={styles.loader} />
                    :
                    <>
                        <Text style={styles.title}>After Class Assignment</Text>
                        <View style={styles.divider}></View>
                        <BasicButton
                            text="Login"
                            onPress={handleLoginBtnClick}
                        />
                        <View style={styles.divider}></View>
                        <BasicButton
                            text="Signup"
                            onPress={handleSignUpBtnClick}
                        />
                    </>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 0,
        paddingHorizontal: 30,
        justifyContent: "center",
    },

    animation: {
        width: "100%",
        backgroundColor: "#f1f1f1",
        marginBottom: 50,
    },

    title: {
        fontWeight: '500',
        fontSize: 30,
        letterSpacing: 0.1,
        textAlign: "center",
    },

    divider: {
        paddingVertical: 8,
    },

    loader: {
        marginTop: 10,
    },
});
