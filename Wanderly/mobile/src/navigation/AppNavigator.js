import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { defaultTransition } from "../services/navigationConfig";

// Auth Screen components
import SplashScreen from "../screens/SplashScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ForgotPasswordScreen from "../screens/ForgotPassword";
import DashboardScreen from "../screens/DashboardScreen";

// Tab Screen components
import Home from '../screens/Home';
import Favorites from '../screens/Favorites';
import Tinder from '../screens/Tinder';
import Folder from '../screens/Folder';
import Profile from '../screens/Profile';
import BottomTabBar from '../components/BottomTabBar';
import CreateFolder from '../screens/CreateFolder'

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator Component
function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={Favorites}
        options={{
          tabBarLabel: 'Favorites',
        }}
      />
      <Tab.Screen
        name="Tinder"
        component={Tinder}
        options={{
          tabBarLabel: 'Tinder',
        }}
      />
      <Tab.Screen
        name="Folder"
        component={Folder}
        options={{
          tabBarLabel: 'Folder',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...defaultTransition,
      }}
    >
      {/* Initial loading screen */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      
      {/* Authentication flow */}
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      
      {/* Main app screen after login - can keep Dashboard if needed */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      
      {/* Main tab navigator (replaces or supplements Dashboard) */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="CreateFolder" component={CreateFolder} />
    </Stack.Navigator>
  );
}