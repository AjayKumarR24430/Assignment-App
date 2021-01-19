import React, { useEffect } from 'react';
import { DrawerActions } from '@react-navigation/native';
import { DefaultTheme, Provider as PaperProvider, Appbar } from 'react-native-paper';
import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItem,
} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BottomNav from './BottomNav';

const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
        ...DefaultTheme.colors,
        primary: '#2B35E0',
        accent: '#3498db',
    },
};
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
    return (
        <DrawerContentScrollView {...props}>
            <DrawerItem
                label="Home"
                onPress={() => props.navigation.navigate("UserHome")}
            />

            <DrawerItem
                label="Social"
                onPress={() => props.navigation.navigate("Social")}
            />

            <DrawerItem
                label="Sign Out"
                // labelStyle={{color: "red"}}
                onPress={() => hanldeLogoutPress(props)}
            />
        </DrawerContentScrollView>
    );
}

async function hanldeLogoutPress(props) {
    try {
        await AsyncStorage.removeItem("loggedUserEmail");
        await AsyncStorage.removeItem("loggedUserId");

        console.log("successfully logged out");

        //redirecring to ladnding page
        props.navigation.push("Landing");
    }
    catch (exception) {
        console.log("failed to log out");
    }
}

function DrawerNav({ navigation }) {
    useEffect(
        () =>
            navigation.addListener('beforeRemove', (e) => {
                // Prevent default behavior of leaving the screen
                e.preventDefault();
                console.log("back pressed");
            }),
        []
    );

    return (
        <PaperProvider theme={theme}>
            <Appbar.Header>
                <Appbar.Action icon="menu" onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} />
                <Appbar.Content title="Assignment App" />
            </Appbar.Header>

            <Drawer.Navigator 
                drawerContent={props => <CustomDrawerContent {...props} />}
                drawerContentOptions={{
                    activeTintColor: 'red',
                    activeBackgroundColor: 'white',
                    labelStyle:{
                      marginLeft:5
                    }
                  }} 
                >
                <Drawer.Screen name="Home" component={BottomNav} />
            </Drawer.Navigator>
        </PaperProvider>
    )
}

export default DrawerNav;