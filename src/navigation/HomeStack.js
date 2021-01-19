import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import UserHome from "../screens/UserHome";
import GiveQuiz from "../screens/GiveQuiz";

const Stack = createStackNavigator();
export default function HomeStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="UserHome" component={UserHome} options={{ headerShown: false }} />
            <Stack.Screen name="GiveQuiz" component={GiveQuiz} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}