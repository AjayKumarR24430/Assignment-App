import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

import BasicButton from "./BasicButton";

export default function SocialProfileItem({
    customStyle,
    index,
    profilePicUri,
    name,
    email,
    desc,
    quizes = [],
    navigation,
    onPress,
}) {
    function handleOnPress() {
        onPress(index);
    }

    // function to handle when any quiz btn is clicked on
    function handleQuizItemClick(idx) {
        // redirecting to GiveQuiz.js
        navigation.navigate('GiveQuiz', quizes[idx]);
    }

    //component rendering
    return (
        <TouchableOpacity style={[styles.card, customStyle]} onPress={handleOnPress}>
            <View style={styles.container}>
                <Image source={profilePicUri || require("../../assets/profile.png")} style={styles.img} />
                <View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.email}>{email}</Text>
                </View>
            </View>

            <Text style={styles.desc}>{desc}</Text>

            <View style={styles.quizesContainer}>
                {
                    quizes.map(function(item, idx) {
                        return (
                            <BasicButton
                                key={idx}
                                customStyle={styles.quizBtn}
                                textStyle={styles.btnText}
                                text={item.quizName}
                                onPress={() => handleQuizItemClick(idx)}
                            />
                        )
                    })
                }
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        marginVertical: 12,
        padding: 16,
    },

    container: {
        flexDirection: "row",
        alignItems: "center",
    },

    img: {
        width: 60,
        height: 60,
        borderRadius: 1000,
        marginRight: 14,
    },

    name: {
        fontWeight: '500',
        fontSize: 15,
        lineHeight: 20,
        color: '#2E2E2E',
    },

    email: {
        fontWeight: '500',
        fontSize: 12,
        lineHeight: 20,
        color: '#757575',
    },

    desc: {
        fontSize: 14,
        lineHeight: 20,
        color: '#2E2E2E',
        marginVertical: 15,
    },

    quizesContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
    },

    quizBtn: {
        margin: 4,
    },

    btnText: {
        fontWeight: '600',
        fontSize: 13,
        lineHeight: 20,
    }
});
