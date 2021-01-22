import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import firebase from '../FirebaseConfig';

import SnackBar from "../components/SnackBar";
import BasicButton from "../components/BasicButton";

export default function CreateQuiz({ navigation }) {
    const [availableQuizTypes, setAvailableQuizTypes] = useState([]);

    const [quizImgUri, setQuizImgUri] = useState(null);
    const [quizName, setQuizName] = useState("");
    const [quizDesc, setQuizDesc] = useState("");
    const [quizType, setQuizType] = useState("");

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

        //fetching available quiz types from db
        fetchAvailableQuizTypes();
    }, []);

    //function yo fetch available quiz types from firebase db
    function fetchAvailableQuizTypes() {
        const quizTypesDbRef = firebase.app().database().ref('quizTypes/');
        quizTypesDbRef
            .once('value')
            .then(resp => {
                const quizTypes = resp.val();
                if (quizTypes) {
                    setAvailableQuizTypes(quizTypes);
                    setIsLoading(false);
                }
            })
            .catch(error => {
                displaySnackBar("error", "Failed to get user's quizes");
            });
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

    //function to handle when Pick Image btn is clicked on
    async function handlePickImgBtnClick() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
        });

        if (!result.cancelled) {
            setQuizImgUri({ uri: result.uri });
        }
    }

    //function to handle when any quiz item is clicked on
    async function hanldeCreateBtnClick() {
        setIsLoading(true);

        const createdByUserId = await AsyncStorage.getItem('loggedUserId');
        if (createdByUserId) {
            //if a quiz image is choosen
            //then uploading it to firebase storage
            if (quizImgUri) {
                await uploadImageInFirebase(createdByUserId)
                    .then(() => {
                        displaySnackBar("success", "Image Successfully Uploaded");
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        displaySnackBar("error", "Failed to upload Image");
                    });
            } else {
                insertQuizInFirebase(createdByUserId, quizImgUri);
            }

        } else {
            displaySnackBar("error", "User is not logged in");
        }
    }

    //function to upload the image in firebase
    async function uploadImageInFirebase(createdByUserId) {
        const timeStamp = Math.floor(Date.now() / 1000);
        const imageName = createdByUserId + "_" + timeStamp + ".jpg";

        const response = await fetch(quizImgUri.uri);
        const blob = await response.blob();

        //putting image in firebase
        const storageRef = firebase.app().storage().ref().child("quiz_image/" + imageName);
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
                            setQuizImgUri({ uri: downloadUrl });

                            //updating the uploaded image url in firebase db
                            insertQuizInFirebase(createdByUserId, { uri: downloadUrl });
                        })
                }
            )

        return resp;
    }

    //function to insert quiz in firebase db
    function insertQuizInFirebase(createdByUserId, imgUri) {
        const timeStamp = Math.floor(Date.now() / 1000);
        const insertKey = createdByUserId + "_" + timeStamp;

        const quizesDbRef = firebase.app().database().ref('assignmentquizes/');
        quizesDbRef
            .child(insertKey)
            .set({
                createdByUserId,
                quizImgUri: imgUri,
                quizName,
                quizDesc,
                quizType,
            },
                (error) => {
                    if (error) {
                        setIsLoading(false);
                        displaySnackBar("error", "Failed to add quiz");
                    } else {
                        setIsLoading(false);
                        displaySnackBar("success", "Quiz added");

                        //redirecting to quiz details screen
                        navigation.navigate('QuizDetails', {
                            insertKey,
                            quizImgUri: imgUri,
                            quizName,
                            quizDesc,
                            quizType,
                        });
                    }
                });
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
                            <Text style={styles.label}>Topic Image</Text>
                            <Image source={quizImgUri} style={styles.image} />
                            <View style={styles.divider}></View>
                            <BasicButton
                                text="Pick Image"
                                onPress={handlePickImgBtnClick}
                            />
                            <View style={styles.divider}></View>

                            <Text style={styles.label}>Topic Name</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="Give a name to your quiz"
                                value={quizName}
                                autoCapitalize="words"
                                autoFocus={true}
                                onChangeText={(val) => setQuizName(val)}
                            />
                            <View style={styles.divider}></View>

                            <Text style={styles.label}>Question Type</Text>
                            <Picker
                                style={styles.inputField}
                                selectedValue={quizType}
                                onValueChange={(quizType, itemIndex) => setQuizType(quizType)}
                            >
                                <Picker.Item label="" value="" />
                                {
                                    availableQuizTypes.map((item, idx) => {
                                        return (
                                            <Picker.Item key={idx} label={item} value={item} />
                                        )
                                    })
                                }
                            </Picker>
                            <View style={styles.divider}></View>

                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.inputField}
                                multiline
                                placeholder="What describes your topic?"
                                value={quizDesc}
                                onChangeText={(val) => setQuizDesc(val)}
                            />
                            <View style={styles.divider}></View>

                            <BasicButton
                                text="Create"
                                onPress={hanldeCreateBtnClick}
                            />
                            <View style={styles.divider}></View>
                        </View>
                    </ScrollView >
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

    divider: {
        paddingVertical: 8,
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

    image: {
        alignSelf: "center",
        width: "100%",
        height: 200,
        backgroundColor: "#f1f1f1",
    },

    loaderContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 30,
        justifyContent: "center",
    },
});
