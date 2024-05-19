import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerifyRegistrationCodeScreen from "../screens/VerifyRegistrationCodeScreen";
import ForgottenPasswordScreen from "../screens/ForgottenPasswordScreen";
import VerifyForgottenPasswordCodeScreen from "../screens/VerifyForgottenPasswordCodeScreen";
import SetNewPasswordScreen from "../screens/SetNewPasswordScreen";

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
				component={ForgottenPasswordScreen}
				options={{ headerShown: true }}
			/>
			<Stack.Screen
				name="Verify Forgotten Password"
				component={VerifyForgottenPasswordCodeScreen}
				options={{ headerShown: true }}
			/>
			<Stack.Screen
				name="Set New Password"
				component={SetNewPasswordScreen}
				options={{ headerShown: true }}
			/>
		</Stack.Navigator>
	);
}

export default StackNavigator;
