import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import MyQuizes from "../screens/MyQuizes";
import CreateQuiz from "../screens/CreateQuiz";
import QuizDetails from "../screens/QuizDetails";
import AddQuizQstn from "../screens/AddQuizQstn";

const Stack = createStackNavigator();
export default function MyQuizStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MyQuizes" component={MyQuizes} options={{ headerShown: false }} />
            <Stack.Screen name="CreateQuiz" component={CreateQuiz} options={{ headerShown: false }} />
            <Stack.Screen name="QuizDetails" component={QuizDetails} options={{ headerShown: false }} />
            <Stack.Screen name="Add Question" component={AddQuizQstn} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}