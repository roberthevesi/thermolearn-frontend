import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerifyRegistrationCodeScreen from "../screens/VerifyRegistrationCodeScreen";
import ForgottenPasswordScreen from "../screens/ForgottenPasswordScreen";
import VerifyForgottenPasswordCodeScreen from "../screens/VerifyForgottenPasswordCodeScreen";
import SetNewPasswordScreen from "../screens/SetNewPasswordScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import HeatingHistoryScreen from "../screens/HeatingHistoryScreen";
import PairingScreen from "../screens/PairingScreen";
import WiFiScreen from "../screens/WiFiScreen";
import ConfirmConnectionScreen from "../screens/ConfirmConnectionScreen";
import WiFiInstructionsScreen from "../screens/WiFiInstructionsScreen";

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
			<Stack.Screen
				name="Schedule"
				component={ScheduleScreen}
				options={{ headerShown: true }}
			/>
			<Stack.Screen
				name="Heating History"
				component={HeatingHistoryScreen}
				options={{ headerShown: true }}
			/>
			<Stack.Screen
				name="Pair Thermostat"
				component={PairingScreen}
				options={{ headerShown: true }}
			/>
			<Stack.Screen
				name="WiFi Instructions"
				component={WiFiInstructionsScreen}
				options={{ headerShown: true }}
			/>
			<Stack.Screen
				name="WiFi Credentials"
				component={WiFiScreen}
				options={{ headerShown: true }}
			/>
			<Stack.Screen
				name="Confirm Connection"
				component={ConfirmConnectionScreen}
				options={{ headerShown: true }}
			/>
		</Stack.Navigator>
	);
}

export default StackNavigator;
