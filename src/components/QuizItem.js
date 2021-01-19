import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

export default function QuizItem({
    customStyle,
    index,
    name,
    imageUrl,
    onPress,
}) {
    function handleOnPress() {
        onPress(index);
    }

    return (
        <TouchableOpacity style={[styles.box, customStyle]} onPress={handleOnPress}>
            {
                imageUrl ?
                    <Image source={{uri: imageUrl.uri }} style={styles.image} />
                    : <Image source={require("../../assets/quiz.jpg")} style={styles.image} />
            }

            <Text style={styles.boxText}>{name}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    box: {
        padding: 10,
        backgroundColor: 'rgba(113, 205, 220, 0.3)',
        marginVertical: 5,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
    },

    boxText: {
        fontWeight: '500',
        fontSize: 18,
        marginLeft: 16,
        flex: 1,
        flexWrap: "wrap",
    },

    image: {
        height: 68,
        width: 64,
    }
});
