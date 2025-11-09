import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Favorites from '../screens/Favorites';
import Tinder from '../screens/Tinder';
import Folder from '../screens/Folder';
import Profile from '../screens/Profile';
import NewPlace from '../screens/NewPlace';
import BottomTabBar from '../components/BottomTabBar';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
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
        name="NewPlace"
        component={NewPlace}
        options={{
          tabBarLabel: 'NewPlace',
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
};

export default AppNavigator;