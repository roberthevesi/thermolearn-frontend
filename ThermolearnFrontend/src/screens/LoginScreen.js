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
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login } = useAuth();
	const { sendNewRegistrationCode } = useAuth();

	const handleLogin = async () => {
		try {
			const isAccountVerified = await login(email, password);
			if (isAccountVerified) {
				navigation.navigate("Main");
			} else {
				navigation.navigate("Verify Account");
			}
		} catch (error) {
			console.error("Login failed:", error);
			Alert.alert(
				"Login Failed",
				"Something went wrong. Please check your credentials and try again.",
				[{ text: "OK" }],
				{ cancelable: false }
			);
		}
	};

	const isFormValid = () => email.trim() !== "" && password.trim() !== "";

	return (
		<View style={styles.container}>
			<Image
				style={styles.logo}
				source={require("../../assets/logo.png")}
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
				returnKeyType="go"
				onSubmitEditing={handleLogin}
				disabled={!isFormValid()}
			/>

			<TouchableOpacity
				style={[
					styles.button,
					isFormValid() ? {} : styles.disabledButton,
				]}
				onPress={handleLogin}
				disabled={!isFormValid()}
			>
				<Text style={styles.buttonText}>Login</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.semiTransparentButton}
				onPress={() => navigation.navigate("Register")}
			>
				<Text style={styles.semiTransparentButtonText}>
					Create a new account
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.transparentButton}
				onPress={() => navigation.navigate("Forgot Password")}
			>
				<Text style={styles.transparentButtonText}>
					Forgot your password?
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
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

export default LoginScreen;
