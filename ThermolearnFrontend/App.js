import React from "react";
import StackNavigator from "./src/utils/StackNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "./src/utils/AuthContext";

const AppContent = () => {
	const { initialRoute } = useAuth();

	if (!initialRoute) return null;

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
