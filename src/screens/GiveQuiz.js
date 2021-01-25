import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, TextInput, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import firebase from '../FirebaseConfig';

import BasicButton from "../components/BasicButton";
import SnackBar from "../components/SnackBar";

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
    const [answers, setAnswers] = useState("");

    const [snackBarVisible, setSnackBarVisible] = useState(false);
    const [snackBarText, setSnackBarText] = useState("");
    const [snackBarType, setSnackBarType] = useState("");

    useEffect(() => {
        if (questions) {
            //shuffling options of the qstn
            let qstns = [];
            for (const qstnId in questions) {
                let qstn = questions[qstnId];
                qstn["questionId"] = qstnId;
                qstns.push(qstn);
            }
            setQuizQsnts(qstns);
            setIsLoading(false);
            const quizDbRef = firebase.app().database().ref('assignmentquizes/');
            quizDbRef
                .child(quizId +"/question" + activeQstnIdx + "/answers")
                .on('value',
                    function(snap) {
                        const answers = snap.val();
                        console.log(snap);
                        if (answers) {
                            let quizAnswers = [];
                            for (const key in answers) {
                                const answer = answers[key];
                                const answerTitle = answer.answer;

                                quizAnswers.push(answerTitle);
                            }
                            setAnswers(quizAnswers);
                        }
                        setIsLoading(false);
                    },
                    error => {
                        displaySnackBar("error", "Failed to get previous answer");
                    });

        }
        else{
            console.log(quizId, questions);
        }
    }, []);

    //function to rdner question
    function renderQuestion() {
        if (questions) {
            const selectedQuestion = quizQsnts[activeQstnIdx] || {};

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
                        <BasicButton 
                            text="Add your answer"
                            onPress={addAnswer}/>
                    </View>
                    <View>
                        <Text style={{fontSize:20, marginTop:20}}>Previous Answers:</Text>
                    </View>
                    <View style={styles.ansContainer}>
                    {
                        // isLoading ?
                        // <View>
                        //     <ActivityIndicator style={styles.loader} />
                        // </View>                            
                        //     :      
                        answers ?
                            answers.map((item, idx) => {
                                return(
                                    <View style={styles.ans} key={idx}>
                                        <Text style={styles.ansText}>{idx + 1 + ". " + item}</Text>                                        
                                    </View>
                                )
                            })
                            :
                            <View>
                                <Text style={{marginLeft: -5}}>
                                Not yet answered!
                                Be the first one to answer!
                                </Text>
                            </View>
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
                    </View>

                    <View style={[styles.container, styles.btnsContainer]}>
                        {renderDirectionButtons()}
                    </View>
                </View>
            )
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

    function addAnswer(){
        const timeStamp = Math.floor(Date.now() / 1000);
            const ansId = quizId + "_ans_" + timeStamp;
            const quizDbRef = firebase.app().database().ref('assignmentquizes/');
            if(typedAnswer!= ""){
                quizDbRef
                    .child(quizId +"/question" + activeQstnIdx + "/answers/" + ansId)
                    .set({
                        answer: typedAnswer,
                    },
                        (error) => {
                            setIsLoading(false);
                        });
                displaySnackBar("success", "Answer added successfully")
                quizDbRef
                    .child(quizId +"/question" + activeQstnIdx + "/answers")
                    .on('value',
                        function(snap) {
                            const answers = snap.val();
                            console.log(snap);
                            if (answers) {
                                let quizAnswers = [];
                                for (const key in answers) {
                                    const answer = answers[key];
                                    const answerTitle = answer.answer;

                                    quizAnswers.push(answerTitle);
                                }
                                setAnswers(quizAnswers);
                            }
                            setIsLoading(false);
                        },
                        error => {
                            displaySnackBar("error", "Failed to get previous answer");
                        });
                updateAns("")
            }
            else
            displaySnackBar("error", "Please type in the answer")
    }


    //function to handle when submit btn is pressed on
    async function handleSubmitBtnClick() {
        const loggedUserId = await AsyncStorage.getItem('loggedUserId');
        if (loggedUserId && quizId) {
            setIsLoading(true);

            // adding responses for that quiz in firebase db
            const usersDbRef = firebase.app().database().ref('assignmentusers/');
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
        updateAns("")
        console.log(activeQstnIdx);
        if (activeQstnIdx > 0) {
            let num= activeQstnIdx - 1;
            console.log(num)
            setActiveQstnIdx(num);
            console.log(activeQstnIdx);
            const quizDbRef = firebase.app().database().ref('assignmentquizes/');
            quizDbRef
                    .child(quizId +"/question" + num + "/answers")
                    .on('value',
                        function(snap) {
                            const answers = snap.val();
                            console.log(snap);
                            if (answers) {
                                let quizAnswers = [];
                                for (const key in answers) {
                                    const answer = answers[key];
                                    const answerTitle = answer.answer;

                                    quizAnswers.push(answerTitle);
                                }
                                setAnswers(quizAnswers);
                            }
                            setIsLoading(false);
                        },
                        error => {
                            displaySnackBar("error", "Failed to get previous answer");
                        });
        }
    }

    function hanldeNextBtnClick() {
        updateAns("")
        console.log(activeQstnIdx);
        if (activeQstnIdx < totalQstnsCount - 1) {
            let num= activeQstnIdx + 1;
            console.log(num)
            setActiveQstnIdx(num);
            console.log(activeQstnIdx);
            const quizDbRef = firebase.app().database().ref('assignmentquizes/');
            quizDbRef
                .child(quizId +"/question" + num + "/answers")
                .on('value',
                    function(snap) {
                        const answers = snap.val();
                        console.log(snap);
                        if (answers) {
                            let quizAnswers = [];
                            for (const key in answers) {
                                const answer = answers[key];
                                const answerTitle = answer.answer;

                                quizAnswers.push(answerTitle);
                            }
                            setAnswers(quizAnswers);
                        }
                        setIsLoading(false);
                    },
                    error => {
                        displaySnackBar("error", "Failed to get previous answer");
                    });
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
    },
    ansContainer: {
        // backgroundColor: "#f1f1f1",
        padding: 5,
    },

    ans: {
        padding: 10,
        backgroundColor: 'rgba(113, 205, 220, 0.3)',
        marginVertical: 5,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
    },

    ansText: {
        fontWeight: '500',
        fontSize: 16,
    }
});
