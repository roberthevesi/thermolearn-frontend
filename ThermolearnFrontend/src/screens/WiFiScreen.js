import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	StyleSheet,
	Alert,
	TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import uuid from "react-native-uuid";

const WiFiScreen = () => {
	const [ssid, setSsid] = useState("");
	const [password, setPassword] = useState("");
	const [fingerprint, setFingerprint] = useState("");
	const navigation = useNavigation();

	const generateUuid = () => {
		const newUuid = uuid.v4();
		setFingerprint(newUuid);
		return newUuid;
	};

	const sendCredentials = async () => {
		try {
			const fingerprint = generateUuid();
			console.log("fingerprint:", fingerprint);

			const response = await fetch(
				`http://192.168.1.100:5000/receive_credentials?ssid=${encodeURIComponent(
					ssid
				)}&password=${encodeURIComponent(password)}&fingerprint=${encodeURIComponent(fingerprint)}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (response.ok) {
				Alert.alert("Success", "Credentials sent successfully", [
					{
						text: "OK",
						onPress: () => {
							navigation.navigate("Confirm Connection", {
								fingerprint,
							});
						},
					},
				]);
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

const ConfirmConnectionScreen = ({ route }) => {
	const { fingerprint } = route.params;
	const navigation = useNavigation();

	const confirmConnection = async () => {
		const checkFingerprint = async () => {
			try {
				const response = await fetch(
					"http://localhost:8080/api/v1/thermostat/get-thermostat-fingerprint"
				);

				if (response.ok) {
					const data = await response.json();
					if (data.fingerprint === fingerprint) {
						return true;
					}
				}
			} catch (error) {
				console.error(error);
			}
			return false;
		};

		const startTime = Date.now();
		const interval = setInterval(async () => {
			const isConnected = await checkFingerprint();
			if (isConnected) {
				clearInterval(interval);
				Alert.alert("Success", "Thermostat paired successfully!", [
					{ text: "OK", onPress: () => navigation.navigate("Main") },
				]);
			} else if (Date.now() - startTime >= 30000) {
				clearInterval(interval);
				Alert.alert(
					"Error",
					"Failed to pair thermostat. Please try again.",
					[
						{
							text: "OK",
							onPress: () =>
								navigation.navigate("WiFi Instructions"),
						},
					]
				);
			}
		}, 5000);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.message}>
				To connect the thermostat to the local WiFi network, please go
				to your WiFi Settings and select the network "Thermolearn WiFi
				Network" and come back here.
			</Text>
			<TouchableOpacity
				style={styles.confirmButton}
				onPress={confirmConnection}
			>
				<Text style={styles.confirmButtonText}>Confirm Connection</Text>
			</TouchableOpacity>
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
	message: {
		marginBottom: 40,
		textAlign: "center",
		fontSize: 18,
		color: "#333",
		paddingHorizontal: 20,
	},
	confirmButton: {
		backgroundColor: "#007BFF",
		paddingVertical: 15,
		paddingHorizontal: 30,
		borderRadius: 5,
		alignItems: "center",
	},
	confirmButtonText: {
		color: "white",
		fontSize: 18,
	},
});

export default WiFiScreen;
