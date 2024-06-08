import React, { useEffect } from "react";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "./src/utils/AuthContext";
import StackNavigator from "./src/utils/StackNavigator";
import * as Location from "expo-location";
import "./src/utils/BackgroundLocation";

const AppContent = () => {
	const { initialRoute } = useAuth();

	useEffect(() => {
		(async () => {
			const { status: foregroundStatus } =
				await Location.requestForegroundPermissionsAsync();
			if (foregroundStatus !== "granted") {
				console.log(
					"Permission to access location in the foreground was denied"
				);
				return;
			}

			const locationSubscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval: 60000, // Check location every minute
					distanceInterval: 50, // Check location every 50 meters
				},
				(location) => {
					// Handle location updates here
					console.log("Location update:", location);
				}
			);

			return () => {
				if (locationSubscription) {
					locationSubscription.remove();
				}
			};
		})();
	}, []);

	if (!initialRoute)
		return <ActivityIndicator size="large" color="#0000ff" />;

	return (
		<>
			{/* <StatusBar
				animated={true}
				backgroundColor="#61dafb"
				barStyle={'dark-content'}
			/> */}
			<NavigationContainer>
					<StackNavigator initialRouteName={initialRoute} />
			</NavigationContainer>
		</>
		
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
