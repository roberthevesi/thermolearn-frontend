import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "react-native";
import { ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "./src/utils/AuthContext";

const Stack = createNativeStackNavigator();

const App = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkToken = async () => {
			try {
				const token = await AsyncStorage.getItem("@user_token");
				setIsAuthenticated(!!token);
			} finally {
				setIsLoading(false);
			}
		};

		checkToken();
	}, []);

	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<ActivityIndicator size="large" color="#14293d" />
			</View>
		);
	}

	return (
		<AuthProvider>
			<NavigationContainer>
				<Stack.Navigator
					initialRouteName="Login"
					screenOptions={{
						headerStyle: {
							backgroundColor: "#14293d",
						},
						headerTintColor: "#fff",
						headerTitleStyle: {
							fontWeight: "bold",
						},
					}}
				>
					<Stack.Screen name="Home" component={HomeScreen} />
					<Stack.Screen name="Login" component={LoginScreen} />
					<Stack.Screen name="Register" component={RegisterScreen} />
				</Stack.Navigator>
			</NavigationContainer>
		</AuthProvider>
	);
};

export default App;
