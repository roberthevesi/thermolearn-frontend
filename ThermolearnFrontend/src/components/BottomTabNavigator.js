import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import WiFiScreen from "../screens/WiFiScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BottomNavigationBar from "./BottomNavigationBar";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
	return (
		<Tab.Navigator tabBar={(props) => <BottomNavigationBar {...props} />}>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="WiFi" component={WiFiScreen} />
			<Tab.Screen name="Settings" component={SettingsScreen} />
		</Tab.Navigator>
	);
};

export default BottomTabNavigator;
