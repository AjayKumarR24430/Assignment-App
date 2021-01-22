import * as React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import HomeStack from './HomeStack';
import MyQuizStack from './MyQuizStack';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function BottomNav() {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                    tabBarLabel: 'Home',
                    tabBarColor: '#009387',
                    tabBarIcon: ({ color }) => (
                        <Icon name="ios-home" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="My Topics"
                component={MyQuizStack}
                options={{
                    tabBarLabel: 'My Topics',
                    tabBarColor: '#1f65ff',
                    tabBarIcon: ({ color }) => (
                        <Icon name="ios-document" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarColor: '#694fad',
                    tabBarIcon: ({ color }) => (
                        <Icon name="ios-person" color={color} size={26} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}