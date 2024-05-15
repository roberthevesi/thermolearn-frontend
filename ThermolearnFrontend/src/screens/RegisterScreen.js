import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Image,
	Alert,
} from "react-native";
import { useAuth } from "../utils/AuthContext";

const RegisterScreen = ({ navigation }) => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const { register } = useAuth();

	const handleRegister = async () => {
		if (password !== confirmPassword) {
			Alert.alert(
				"Passwords do not match",
				"Please check your passwords.",
				[{ text: "OK" }]
			);
			return;
		}
		try {
			await register(email, password, firstName, lastName);
			navigation.navigate("Verify Account");
		} catch (error) {
			console.error("Registration failed:", error);
			Alert.alert(
				"Registration Failed",
				"Something went wrong. Please try again.",
				[{ text: "OK" }]
			);
		}
	};

	const isFormValid = () =>
		email.trim() !== "" &&
		password.trim() !== "" &&
		firstName.trim() !== "" &&
		lastName.trim() !== "" &&
		password === confirmPassword;

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				autoCapitalize="none"
				placeholder="First Name"
				value={firstName}
				onChangeText={setFirstName}
			/>

			<TextInput
				style={styles.input}
				autoCapitalize="none"
				placeholder="Last Name"
				value={lastName}
				onChangeText={setLastName}
			/>

			<TextInput
				style={styles.input}
				autoCapitalize="none"
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
			/>

			<TextInput
				style={styles.input}
				placeholder="Password"
				secureTextEntry
				autoCapitalize="none"
				value={password}
				onChangeText={setPassword}
			/>

			<TextInput
				style={styles.input}
				placeholder="Confirm Password"
				secureTextEntry
				autoCapitalize="none"
				value={confirmPassword}
				onChangeText={setConfirmPassword}
			/>

			<TouchableOpacity
				style={[
					styles.button,
					isFormValid() ? {} : styles.disabledButton,
				]}
				onPress={handleRegister}
				disabled={!isFormValid()}
			>
				<Text style={styles.buttonText}>Register</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.transparentButton}
				onPress={() => navigation.navigate("Login")}
			>
				<Text style={styles.transparentButtonText}>
					Already have an account? Log in
				</Text>
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
	logo: {
		width: 184,
		height: 184,
		marginBottom: 32,
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
	semiTransparentButton: {
		width: "100%",
		padding: 15,
		marginVertical: 5,
		backgroundColor: "transparent",
		alignItems: "center",
		borderRadius: 5,
		borderWidth: 2,
		borderColor: "#14293d",
	},
	semiTransparentButtonText: {
		color: "#14293d",
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

export default RegisterScreen;
