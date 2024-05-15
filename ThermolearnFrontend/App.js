import React, { useEffect, useState } from "react";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "react-native";
import { ActivityIndicator } from "react-native";
import { useRef } from "react";
import StackNavigator from "./src/utils/StackNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "./src/utils/AuthContext";

// const Tab = createBottomTabNavigator();

const AppContent = () => {
	const { initialRoute } = useAuth();

	if (!initialRoute) return null; // Or some loading indicator

	return (
		<NavigationContainer>
			<StackNavigator initialRouteName={initialRoute} />
		</NavigationContainer>
	);
};

const App = () => {
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	);
};

export default App;
