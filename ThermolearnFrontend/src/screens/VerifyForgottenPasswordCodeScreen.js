import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
} from "react-native";
import { useEffect } from "react";
import { Button } from "react-native";
import { useAuth } from "../utils/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VerifyForgottenPasswordCodeScreen = ({ navigation }) => {
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => (
				<Button onPress={() => confirmExit(navigation)} title="Close" />
			),
			headerBackTitleVisible: false,
		});
	}, [navigation]);

	const confirmExit = (navigation) => {
		Alert.alert(
			"Confirm Exit",
			"Are you sure you want to cancel the account verification? You can verify it later.",
			[
				{ text: "No", style: "cancel" },
				{
					text: "Yes",
					onPress: () => {
						AsyncStorage.removeItem("userEmail");
						navigation.navigate("Login");
					},
				},
			],
			{ cancelable: false }
		);
	};

	const [code, setCode] = useState("");
	const { sendForgottenPasswordCode } = useAuth();
	const { verifyForgottenPasswordCode } = useAuth();

	const handleVerifyCode = async () => {
		try {
			const email = await AsyncStorage.getItem("userEmail");
			const response = await verifyForgottenPasswordCode(email, code);
			console.log("Verification response:", response);
			if (response === true) {
				navigation.navigate("Set New Password");
				// Alert.alert(
				// 	"Account Verified",
				// 	"Your account has been successfully verified. Please log in.",
				// 	[
				// 		{
				// 			text: "OK",
				// 			onPress: async () => {
				// 				await AsyncStorage.removeItem("userEmail");
				// 				navigation.navigate("Login");
				// 			},
				// 		},
				// 	],
				// 	{ cancelable: false }
				// );
			} else {
				Alert.alert(
					"Verification Failed",
					"The code you entered is incorrect. Please try again.",
					[{ text: "OK" }]
				);
			}
		} catch (error) {
			console.error("Verification failed:", error);
			Alert.alert(
				"Verification Failed",
				"The code you entered is incorrect. Please try again.",
				[{ text: "OK" }]
			);
		}
	};

	const resendCode = async () => {
		try {
			const email = await AsyncStorage.getItem("userEmail");
			await sendForgottenPasswordCode(email);
			Alert.alert(
				"Verification Code Sent",
				"A new verification code has been sent to your email.",
				[{ text: "OK" }]
			);
		} catch (error) {
			console.error("Failed to resend code:", error);
			Alert.alert(
				"Failed",
				"Unable to send a new verification code. Please try again later.",
				[{ text: "OK" }]
			);
		}
	};

	const isFormValid = () => code.length === 6;

	return (
		<View style={styles.container}>
			<Text style={styles.instructions}>
				You should receive a verification code by email in a few
				seconds.
			</Text>

			<TextInput
				style={styles.input}
				placeholder="Enter Code"
				value={code}
				onChangeText={(text) => setCode(text.toUpperCase())}
				maxLength={6}
				placeholderTextColor="#ccc"
				autoCapitalize="characters"
				keyboardType="default"
			/>

			<TouchableOpacity
				style={[
					styles.button,
					isFormValid() ? {} : styles.disabledButton,
				]}
				onPress={handleVerifyCode}
				disabled={!isFormValid()}
			>
				<Text style={styles.buttonText}>Verify Code</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.transparentButton}
				onPress={resendCode}
			>
				<Text style={styles.transparentButtonText}>Send New Code</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "flex-start",
		alignItems: "center",
		padding: 30,
		backgroundColor: "#f0f0f0",
	},
	instructions: {
		fontSize: 16,
		textAlign: "center",
		marginVertical: 20,
	},
	input: {
		width: "100%",
		marginVertical: 10,
		paddingVertical: 12,
		paddingHorizontal: 10,
		fontSize: 48,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		textAlign: "center",
	},
	button: {
		width: "100%",
		padding: 15,
		marginVertical: 5,
		backgroundColor: "#14293d",
		alignItems: "center",
		borderRadius: 5,
	},
	disabledButton: {
		backgroundColor: "#aaa",
	},
	buttonText: {
		color: "white",
		fontSize: 13,
		fontWeight: "bold",
	},
	transparentButton: {
		width: "100%",
		padding: 15,
		marginVertical: 5,
		backgroundColor: "transparent",
		alignItems: "center",
		borderRadius: 5,
		borderWidth: 2,
		borderColor: "#f0f0f0",
	},
	transparentButtonText: {
		color: "#14293d",
		fontSize: 13,
		fontWeight: "bold",
	},
});

export default VerifyForgottenPasswordCodeScreen;
