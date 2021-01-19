import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function AboutPage({ navigation }) {
  const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
  })

  return (
    <View>
      <Text>About Page</Text>
    </View>
  )
}

export default AboutPage;