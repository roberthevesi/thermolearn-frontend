import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Alert,
} from "react-native";
import { useAuth } from "../utils/AuthContext";

const ForgottenPasswordScreen = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const { sendForgottenPasswordCode } = useAuth();

	const handleResetPassword = async () => {
		try {
			await sendForgottenPasswordCode(email);
			navigation.navigate("Verify Forgotten Password");
		} catch (error) {
			console.error("Password reset failed:", error);
			Alert.alert(
				"Reset Failed",
				"The email address may be wrong. Please try again.",
				[{ text: "OK" }]
			);
		}
	};

	const validateEmail = (email) => {
		const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		return regex.test(email);
	};

	const isFormValid = () => email.trim() !== "" && validateEmail(email);

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				autoCapitalize="none"
				placeholder="Enter your email"
				value={email}
				onChangeText={setEmail}
			/>

			<TouchableOpacity
				style={[
					styles.button,
					isFormValid() ? {} : styles.disabledButton,
				]}
				onPress={handleResetPassword}
				disabled={!isFormValid()}
			>
				<Text style={styles.buttonText}>Send Email</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.transparentButton}
				onPress={() => navigation.navigate("Login")}
			>
				<Text style={styles.transparentButtonText}>Back to Login</Text>
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
	input: {
		width: "100%",
		marginVertical: 10,
		padding: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
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

export default ForgottenPasswordScreen;
