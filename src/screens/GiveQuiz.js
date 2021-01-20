import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, TextInput, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import firebase from '../FirebaseConfig';

import BasicButton from "../components/BasicButton";

export default function GiveQuiz({ route: {
    params: {
        quizId,
        quizImgUri,
        quizName,
        questions = [],
    } = {},
} = {},
    navigation,
}) {
    const totalQstnsCount = Object.keys(questions).length || 0;

    const [quizQsnts, setQuizQsnts] = useState([]);
    const [activeQstnIdx, setActiveQstnIdx] = useState(0);
    const [qstnResponses, setQstnResponses] = useState({});

    const [isLoading, setIsLoading] = useState(true);
    const [typedAnswer, updateAns] = useState("");
    const [bool, setValue] = useState(false);
    const [CorrectAns, setCorrect] = useState("");

    useEffect(() => {
        if (questions) {
            //shuffling options of the qstn
            let qstns = [];
            for (const qstnId in questions) {
                let qstn = questions[qstnId];
                let answer = qstn.answer;
                qstn["answer"] = answer;
                qstn["questionId"] = qstnId;
                qstns.push(qstn);
            }
            setQuizQsnts(qstns);
            setIsLoading(false);
        }
    }, []);

    //function to rdner question
    function renderQuestion() {
        if (questions) {
            const selectedQuestion = quizQsnts[activeQstnIdx] || {};
            const answer = selectedQuestion.answer || [];

            function correctAnswer(){
                console.log("Answer check")
                console.log("Answer is ", answer[0]['answer'])
                setCorrect(answer[0]['answer'])
                setValue(true)
            }

            //rendering
            return (
                <View style={styles.scroll}>
                    <View style={styles.qstnContainer}>
                        <Text style={styles.qstnCount}>{activeQstnIdx + 1 + " of " + totalQstnsCount}</Text>
                        <Text style={styles.qstnText}>{selectedQuestion.question}</Text>
                    </View>
                    <View>
                        <TextInput 
                            style={{marginTop: 30,height: 30, marginBottom: 30}}
                            placeholder="Enter your answer here"
                            value={typedAnswer}
                            onChangeText= {(val) => updateAns(val)}
                        />
                    </View>
                    <View>
                    <BasicButton
                        text="Check Answer"
                        onPress={() => correctAnswer()}
                        />  
                    </View>
                    <View>
                        {
                            bool &&
                            <Text style={{marginTop: 20, marginBottom: 20}}>Correct Answer is: {CorrectAns}</Text>                         
                        }
                    </View>

                    <View style={[styles.container, styles.btnsContainer]}>
                        {renderDirectionButtons()}
                    </View>
                </View>
            )
        }
    }


    //function to render direction buttons
    function renderDirectionButtons() {
        let isPrevBtnActive = activeQstnIdx > 0;
        let isNextBtnActive = activeQstnIdx < totalQstnsCount - 1;
        return (
            <>
                <BasicButton
                    key={0}
                    text="Prev"
                    customStyle={isPrevBtnActive ? styles.button : styles.disabledButton}
                    onPress={isPrevBtnActive ? hanldePrevBtnClick : null}
                />
                <BasicButton
                    key={1}
                    text="Next"
                    customStyle={isNextBtnActive ? styles.button : styles.disabledButton}
                    onPress={isNextBtnActive ? hanldeNextBtnClick : null}
                />
            </>
        )
    }

    //function to handle when submit btn is pressed on
    async function handleSubmitBtnClick() {
        const loggedUserId = await AsyncStorage.getItem('loggedUserId');
        if (loggedUserId && quizId) {
            setIsLoading(true);

            // adding responses for that quiz in firebase db
            const usersDbRef = firebase.app().database().ref('users/');
            usersDbRef
                .child(loggedUserId + "/quizResponses/" + quizId)
                .set({
                    "quizId": quizId,
                    "responses": qstnResponses
                },
                    (error) => {
                        if (error) {
                            setIsLoading(false);

                            navigation.goBack();
                        } else {
                            setIsLoading(false);

                            navigation.goBack();
                        }
                    });

        }
    }

    //function to handle next/prev btn click
    function hanldePrevBtnClick() {
        setCorrect("");
        setValue(false);
        if (activeQstnIdx > 0) {
            setActiveQstnIdx(activeQstnIdx - 1);
        }
    }

    function hanldeNextBtnClick() {
        setCorrect("");
        setValue(false);
        if (activeQstnIdx < totalQstnsCount - 1) {
            setActiveQstnIdx(activeQstnIdx + 1);
        }
    }

    //component rendering
    return (
        <ScrollView>
            <View style={styles.root}>
                {
                    isLoading ?
                        <ActivityIndicator style={styles.loader} />
                        :
                        <>
                            <View style={styles.container}>
                                <View style={styles.row}>
                                    <Text style={styles.title}>{quizName}</Text>
                                    <BasicButton
                                        key={1}
                                        text="Submit"
                                        onPress={handleSubmitBtnClick}
                                    />
                                </View>
                                <View style={styles.divider}></View>
                            </View>

                            <Image source={quizImgUri || require("../../assets/quiz.jpg")} style={styles.image} />

                            {renderQuestion()}
                        </>
                }
            </View >
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10,
    },

    container: {
        paddingHorizontal: 30,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    title: {
        fontWeight: '500',
        fontSize: 20,
        letterSpacing: 0.1,
        color: '#2E2E2E',
        flex: 1,
        flexWrap: "wrap",
    },

    divider: {
        paddingVertical: 8,
    },

    image: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignSelf: "center",
        width: "100%",
        height: 250,
        backgroundColor: "#f1f1f1",
    },

    scroll: {
        marginTop: 150,
        paddingHorizontal: 30,
    },

    qstnContainer: {
        backgroundColor: "#fff",
        padding: 8,
        shadowColor: 'black',
        shadowOpacity: .3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 10,
        borderRadius: 8,
        marginBottom: 20,
    },

    qstnCount: {
        fontWeight: '500',
        fontSize: 13,
        letterSpacing: 0.1,
        color: '#B9B9B9',
    },

    qstnText: {
        fontWeight: '500',
        fontSize: 17,
        letterSpacing: 0.1,
        paddingVertical: 14,
        textAlign: "center",
    },

    option: {
        backgroundColor: "#fff",
        marginVertical: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#C6C6C6",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    optionText: {
        fontWeight: '500',
        fontSize: 16,
        letterSpacing: 0.1,
        color: '#757575',
    },

    rightAnsBorder: {
        borderColor: "#34A853",
    },

    wrongAnsBorder: {
        borderColor: "#EB4335",
    },

    optionImg: {
        width: 16,
        height: 16,
    },

    btnsContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 20,
    },

    button: {
        width: "43%",
    },

    disabledButton: {
        width: "43%",
        backgroundColor: "grey",
    }
});
