import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerifyRegistrationCodeScreen from "../screens/VerifyRegistrationCodeScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import BottomTabNavigator from "../components/BottomTabNavigator";

const Stack = createStackNavigator();

function StackNavigator({ initialRouteName }) {
	// Accept initialRouteName as a prop
	return (
		<Stack.Navigator initialRouteName={initialRouteName}>
			<Stack.Screen
				name="Login"
				component={LoginScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Main"
				component={BottomTabNavigator}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Register"
				component={RegisterScreen}
				options={{ headerShown: true }}
			/>
			<Stack.Screen
				name="Verify Account"
				component={VerifyRegistrationCodeScreen}
				options={{ headerShown: true }}
			/>
			<Stack.Screen
				name="Forgot Password"
				component={ForgotPasswordScreen}
				options={{ headerShown: true }}
			/>
		</Stack.Navigator>
	);
}

export default StackNavigator;
