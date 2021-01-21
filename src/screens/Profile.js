import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Image, Dimensions,TouchableOpacity, Platform, ActivityIndicator,Button, TouchableHighlight } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import firebase from '../FirebaseConfig';

import BasicButton from "../components/BasicButton";
import SnackBar from "../components/SnackBar";

export default function Profile() {
    const [profilePicUri, setProfilePicUri] = useState(require("../../assets/profile.png"));
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [ageGroup, setAgeGroup] = useState("");
    const [desc, setDesc] = useState("");
    const [givenQuizCount, setGivenQuizCount] = useState(null);
    const [performanceData, setPerformanceData] = useState({
        "total": 0,
        "correct": 0,
        "incorrect": 0,
    });

    const [hasImageUploaded, setHasImageUploaded] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [snackBarVisible, setSnackBarVisible] = useState(false);
    const [snackBarText, setSnackBarText] = useState("");
    const [snackBarType, setSnackBarType] = useState("");

    //component did mount
    useEffect(() => {
        //asking for permission to access phone's gallery
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
                if (status !== 'granted') {
                    alert('Sorry, we need camera roll permissions to make this work!');
                }
            }
        })();

        //getting users data from firebase
        fetchUsersData();
    }, []);

    //function to functions users data from firebase
    async function fetchUsersData() {
        const loggedUserId = await AsyncStorage.getItem('loggedUserId');
        if (loggedUserId) {
            const usersDbRef = firebase.app().database().ref('assignmentusers/');
            usersDbRef
                .child(loggedUserId)
                .once('value')
                .then(resp => {
                    const response = resp.val();
                    if (response) {
                        //for getting performance pie chart
                        let total = 0;
                        let correct = 0;
                        let incorrect = 0;

                        const quizResponses = response.quizResponses || {};

                        const tempGivenQuiz = Object.keys(quizResponses).length || null;

                        for (const quizId in quizResponses) {
                            const quizResponse = quizResponses[quizId];
                            const responses = quizResponse.responses || {};

                            console.log("responses", responses);

                            const tempTotal = Object.keys(responses).length || 0;
                            total += tempTotal;
                            for (const questionId in responses) {
                                const ansResponse = responses[questionId];
                                const isCorrect = ansResponse["isCorrect"];
                                if (isCorrect) {
                                    correct++;
                                }
                            }
                        }
                        incorrect = total - correct;

                        //updating state
                        setName(response.name);
                        setEmail(response.email);
                        setDesc(response.desc);
                        setAgeGroup(response.ageGroup);
                        setGivenQuizCount(tempGivenQuiz);
                        setPerformanceData({
                            total,
                            correct,
                            incorrect,
                        });

                        if (response.profilePicUri) {
                            setProfilePicUri(response.profilePicUri)
                        }
                    }
                    setIsLoading(false);
                })
                .catch(error => {
                    displaySnackBar("error", "Failed to fetch profile");
                });
        } else {
            displaySnackBar("error", "User is not logged in");
        }
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

    //function to handle when login btn is clicked on
    async function handleSaveBtnClick() {
        setIsLoading(true);

        try {
            const loggedUserId = await AsyncStorage.getItem('loggedUserId');
            if (loggedUserId) {
                //if new profile pic has been choosen
                //then uploading it to firebase storage
                if (hasImageUploaded) {
                    await uploadImageInFirebase(loggedUserId)
                        .then(() => {
                            displaySnackBar("success", "Image Successfully Uploaded");
                        })
                        .catch((error) => {
                            setIsLoading(false);
                            displaySnackBar("error", "Failed to upload Image");
                        });

                    setHasImageUploaded(false);
                } else {
                    updateProfileInFirebase(loggedUserId, profilePicUri);
                }
            }
        } catch {
            setIsLoading(false);
            displaySnackBar("error", "Something went wrong");
        }
    }

    //function to upload the image in firebase
    async function uploadImageInFirebase(loggedUserId) {
        const imageName = loggedUserId + ".jpg";

        const response = await fetch(profilePicUri.uri);
        const blob = await response.blob();

        //putting image in firebase
        const storageRef = firebase.app().storage().ref().child("profile_image/" + imageName);
        const resp = storageRef.put(blob);
        resp
            .on(
                firebase.storage.TaskEvent.STATE_CHANGED,
                snapshot => {
                    const percent = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    console.log("percent", percent);
                },
                error => {
                    console.log("image upload error: ", (error).toString());
                },
                () => {
                    storageRef.getDownloadURL()
                        .then((downloadUrl) => {
                            setProfilePicUri({ uri: downloadUrl });

                            //updating the uploaded image url in firebase db
                            updateProfileInFirebase(loggedUserId, { uri: downloadUrl });
                        })
                }
            )

        return resp;
    }

    //function to update user profile data in firebase db
    function updateProfileInFirebase(loggedUserId, imageUploadUrl) {
        const usersDbRef = firebase.app().database().ref('assignmentusers/');
        usersDbRef
            .child(loggedUserId)
            .update({
                name,
                ageGroup,
                profilePicUri: imageUploadUrl,
                desc,
            },
                (error) => {
                    if (error) {
                        setIsLoading(false);
                        displaySnackBar("error", "Failed to update profile");
                    } else {
                        setIsLoading(false);
                        displaySnackBar("success", "Profile updated");
                    }
                });
    }

    //function to handle when profile pic edit btn is clicked on
    async function handleProfilePicEditBtnClick() {
        console.log("hi")
        var result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
        });

        if (!result.cancelled) {
            setProfilePicUri({ uri: result.uri });
            setHasImageUploaded(true);
        }
    }

    //component rendering
    return (
        <>
            {
                isLoading ?
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator style={styles.loader} />
                    </View>
                    :
                    <ScrollView style={styles.container}>
                        <View style={styles.form}>
                            <View style={styles.imageContainer}>
                                <Image source={profilePicUri} style={styles.image} />                            
                            </View>
                            <TouchableOpacity onPress={handleProfilePicEditBtnClick} style={{marginLeft:210, marginTop: -25}}>
                                <Image source={require('../../assets/edit.png')} style={styles.edit} />                                    
                            </TouchableOpacity>    
                            
                            <View style={styles.divider}></View>

                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="Enter your name"
                                value={name}
                                autoCapitalize={"words"}
                                onChangeText={(val) => setName(val)}
                            />
                            <View style={styles.divider}></View>

                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.inputField}
                                keyboardType="email-address"
                                placeholder="Enter your registered email"
                                editable={false}
                                value={email}
                                onChangeText={(val) => setEmail(val)}
                            />
                            <View style={styles.divider}></View>

                            <Text style={styles.label}>Age Group</Text>
                            <Picker
                                style={styles.inputField}
                                selectedValue={ageGroup}
                                onValueChange={(ageGroup, itemIndex) => setAgeGroup(ageGroup)}
                            >
                                <Picker.Item label="" value="" />
                                <Picker.Item label="1-4" value="1-4" />
                                <Picker.Item label="5-12" value="5-12" />
                                <Picker.Item label="13-18" value="13-18" />
                            </Picker>
                            <View style={styles.divider}></View>

                            <Text style={styles.label}>About Yourself</Text>
                            <TextInput
                                style={styles.inputField}
                                multiline
                                placeholder="Describe yourself"
                                value={desc}
                                onChangeText={(val) => setDesc(val)}
                            />
                            <View style={styles.divider}></View>
                        </View>

                        <Text style={styles.label}>Performance</Text>
                        {
                            givenQuizCount ?
                                <Text style={styles.totalData}>Total quiz attempted: {givenQuizCount}</Text>
                                : null
                        }
                        <Text style={styles.totalData}>Total Questions attempted: {performanceData.total}</Text>

                        <View style={styles.divider}></View>
                        <BasicButton
                            text="Save"
                            onPress={handleSaveBtnClick}
                        />
                        <View style={styles.divider}></View>
                    </ScrollView>
            }

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
        paddingTop: 10,
        paddingHorizontal: 30,
    },

    title: {
        fontWeight: '500',
        fontSize: 20,
        letterSpacing: 0.1,
        color: '#2E2E2E',
    },

    imageContainer: {
        width: 120,
        height: 120,
        alignSelf: "center",
        shadowColor: 'grey',
        shadowOpacity: .8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 10,
    },

    image: {
        alignSelf: "center",
        width: "100%",
        height: "100%",
        borderRadius: 1000,
    },

    edit: {
        width:25,
        height:25,
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

    chartContainer: {
        alignItems: "center",
    },

    totalData: {
        fontWeight: '500',
        fontSize: 15,
        lineHeight: 17,
        color: '#757575',
        marginVertical: 10,
    },

    loaderContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 30,
        justifyContent: "center",
    },
});
