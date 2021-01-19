import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator } from 'react-native';

import firebase from '../FirebaseConfig';

import SnackBar from "../components/SnackBar";
import BasicButton from "../components/BasicButton";

export default function QuizDetails({
    route: {
        params: {
            quizId,
            quizImgUri,
            quizName,
            quizDesc,
            quizType,
        } = {},
    } = {},
    navigation,
}) {
    const [questions, setQuestions] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [snackBarVisible, setSnackBarVisible] = useState(false);
    const [snackBarText, setSnackBarText] = useState("");
    const [snackBarType, setSnackBarType] = useState("");

    //component did mount
    useEffect(() => {
        //fetching available quiz types from db
        fetchQuizQuestions();
    }, []);

    //function to fetch questions of the quiz
    function fetchQuizQuestions() {
        console.log("hello");
        if (quizId) {
            console.log();
            const quizDbRef = firebase.app().database().ref('quizes/');            
            quizDbRef
                .child(quizId + "/questions")
                .on('value',
                    function(snap) {
                        const questions = snap.val();
                        console.log(snap);
                        if (questions) {
                            let quizQuestions = [];
                            for (const key in questions) {
                                const question = questions[key];
                                const questionTitle = question.question;

                                quizQuestions.push(questionTitle);
                            }
                            setQuestions(quizQuestions);
                        }
                        setIsLoading(false);
                    },
                    error => {
                        displaySnackBar("error", "Failed to get quiz questions");
                    });
        }
        else{
            console.log(quizId);
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

    //function to handle when any quiz item is clicked on
    function hanldeAddQstnBtnClick() {
        navigation.navigate('Add Question', {
            quizId: quizId
        });
    }

    //component rendering
    return (
        <>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>{quizName}</Text>
                <Text style={styles.subtitle2}>{quizType}</Text>

                <Image source={quizImgUri || require("../../assets/quiz.jpg")} style={styles.image} />
                <View style={styles.divider}></View>

                <Text style={styles.subtitle}>{quizDesc}</Text>
                <View style={styles.divider}></View>

                <View style={styles.qstnContainer}>
                    {
                        // isLoading ?
                        // <View>
                        //     <ActivityIndicator style={styles.loader} />
                        // </View>                            
                        //     :      
                            questions.map((item, idx) => {
                                return(
                                    <View style={styles.qstn} key={idx}>
                                        <Text style={styles.qstnText}>{idx + 1 + ". " + item}</Text>                                        
                                    </View>
                                )
                            })
                    }
                </View>
                <View style={styles.divider}></View>
                

                <BasicButton
                    text="Add Question"
                    onPress={hanldeAddQstnBtnClick}
                />
            </ScrollView >

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
        fontWeight: '600',
        fontSize: 20,
        letterSpacing: 0.1,
        color: '#2E2E2E',
    },

    subtitle2: {
        fontSize: 14,
        lineHeight: 18,
        color: '#666666',
        marginBottom: 3,
    },

    subtitle: {
        fontSize: 16,
        lineHeight: 18,
        color: '#666666',
        marginBottom: 3,
    },

    divider: {
        paddingVertical: 8,
    },

    image: {
        alignSelf: "center",
        width: "100%",
        height: 200,
        backgroundColor: "#f1f1f1",
    },

    qstnContainer: {
        // backgroundColor: "#f1f1f1",
        padding: 5,
    },

    qstn: {
        padding: 10,
        backgroundColor: 'rgba(113, 205, 220, 0.3)',
        marginVertical: 5,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
    },

    qstnText: {
        fontWeight: '500',
        fontSize: 16,
    }
});
