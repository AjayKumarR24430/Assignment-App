import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function BasicButton({
    customStyle,
    textStyle,
    text,
    onPress,
}) {
    return (
        <TouchableOpacity style={[styles.container, customStyle]} onPress={onPress}>
            <Text style={[styles.text, textStyle]}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2B35E0',
        borderRadius: 8,
        padding: 10,
    },

    text: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: "center",
    },
});
