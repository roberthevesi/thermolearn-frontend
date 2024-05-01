import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Image,
} from "react-native";
import api from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../utils/AuthContext";
import { useEffect } from "react";

const LoginScreen = ({ navigation }) => {
	const { isAuthenticated, setIsAuthenticated } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	useEffect(() => {
		if (isAuthenticated) {
			navigation.navigate("Home");
		}
	}, [isAuthenticated, navigation]);

	const handleLogin = async () => {
		try {
			const response = await api.post("/auth/authenticate", {
				email: email,
				password: password,
			});

			console.log("Login successful:", response.data);
			await AsyncStorage.setItem("@user_token", response.data.token);
			setIsAuthenticated(true);
			navigation.navigate("Home");
		} catch (error) {
			console.error(
				"Login failed:",
				error.response ? error.response.data : error.message
			);
		}
	};

	return (
		<View style={styles.container}>
			<Image style={styles.logo} source={require("../assets/logo.png")} />
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
			<TouchableOpacity style={styles.button} onPress={handleLogin}>
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
				onPress={() => navigation.navigate("ForgotPassword")}
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
