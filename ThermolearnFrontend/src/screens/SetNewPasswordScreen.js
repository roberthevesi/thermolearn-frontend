import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../utils/AuthContext";
import { Button } from "react-native";

const SetNewPasswordScreen = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const { resetPassword } = useAuth();

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
			"Are you sure you want to cancel the password reset? You can reset it later.",
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

	useEffect(() => {
		const fetchEmail = async () => {
			try {
				const storedEmail = await AsyncStorage.getItem("userEmail");
				if (storedEmail) {
					setEmail(storedEmail);
				}
			} catch (error) {
				console.error(
					"Failed to fetch email from AsyncStorage:",
					error
				);
			}
		};

		fetchEmail();
	}, []);

	const handleResetPassword = async () => {
		if (password !== confirmPassword) {
			Alert.alert(
				"Passwords do not match",
				"Please check your passwords.",
				[{ text: "OK" }]
			);
			return;
		}
		try {
			await resetPassword(email, password);
			Alert.alert(
				"Password Reset",
				"Your password has been reset successfully.",
				[{ text: "OK", onPress: () => navigation.navigate("Login") }]
			);
		} catch (error) {
			console.error("Password reset failed:", error);
			Alert.alert(
				"Reset Failed",
				"Something went wrong. Please try again.",
				[{ text: "OK" }]
			);
		}
	};

	const isFormValid = () =>
		password.trim() !== "" &&
		confirmPassword.trim() !== "" &&
		password === confirmPassword;

	return (
		<View style={styles.container}>
			<Text style={styles.instructions}>
				Please set a new password for your account.
			</Text>

			<TextInput
				style={[styles.input, styles.disabledInput]}
				value={email}
				editable={false}
			/>

			<TextInput
				style={styles.input}
				placeholder="New Password"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>

			<TextInput
				style={styles.input}
				placeholder="Confirm New Password"
				secureTextEntry
				value={confirmPassword}
				onChangeText={setConfirmPassword}
			/>

			<TouchableOpacity
				style={[
					styles.button,
					isFormValid() ? {} : styles.disabledButton,
				]}
				onPress={handleResetPassword}
				disabled={!isFormValid()}
			>
				<Text style={styles.buttonText}>Confirm</Text>
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
	closeButton: {
		alignSelf: "flex-end",
		padding: 10,
	},
	closeButtonText: {
		color: "#14293d",
		fontSize: 16,
		fontWeight: "bold",
	},
	input: {
		width: "100%",
		marginVertical: 10,
		padding: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
	},
	disabledInput: {
		backgroundColor: "#e0e0e0",
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
});

export default SetNewPasswordScreen;
