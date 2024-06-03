// WiFiScreen.js

import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

const WiFiScreen = () => {
	const [ssid, setSsid] = useState("");
	const [password, setPassword] = useState("");

	const sendCredentials = async () => {
		try {
			const response = await fetch("http://192.168.4.1/setup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ssid, password }),
			});

			if (response.ok) {
				Alert.alert("Success", "Credentials sent successfully");
			} else {
				Alert.alert("Error", "Failed to send credentials");
			}
		} catch (error) {
			console.error(error);
			Alert.alert("Error", "Error sending credentials");
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.label}>WiFi SSID:</Text>
			<TextInput
				style={styles.input}
				value={ssid}
				onChangeText={setSsid}
			/>
			<Text style={styles.label}>WiFi Password:</Text>
			<TextInput
				style={styles.input}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>
			<Button title="Submit" onPress={sendCredentials} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 16,
	},
	label: {
		fontSize: 18,
		marginBottom: 8,
	},
	input: {
		height: 40,
		borderColor: "gray",
		borderWidth: 1,
		marginBottom: 16,
		paddingHorizontal: 8,
	},
});

export default WiFiScreen;
