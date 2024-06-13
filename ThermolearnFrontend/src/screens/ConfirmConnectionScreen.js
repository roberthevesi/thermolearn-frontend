import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ConfirmConnectionScreen = ({ route }) => {
	const { fingerprint } = route.params;
	const [receivedFingerprint, setReceivedFingerprint] = useState("");
	const navigation = useNavigation();

	const pairThermostat = async () => {
		try {
			const userId = await AsyncStorage.getItem("userId");
			const thermostatId = await AsyncStorage.getItem("tempThermostatId");
			if (!userId) {
				Alert.alert("Error", "User ID not found in storage.");
				return;
			}

			console.log(
				"Pairing thermostat:",
				thermostatId,
				"for user:",
				userId
			);

			const token = await AsyncStorage.getItem("userToken");
			const response = await api.post(
				`/thermostat/pair-thermostat`,
				{ userId, thermostatId },
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			console.log("Response:", response);

			if (response.status === 200) {
				return true;
			} else {
				Alert.alert("Error", "Something went wrong. Please try again.");
				return false;
			}
		} catch (error) {
			console.error("Failed to pair thermostat", error);
			Alert.alert("Error", "Something went wrong. Please try again.");
		}
	};

	const confirmConnection = async () => {
		const checkFingerprint = async () => {
			try {
				const token = await AsyncStorage.getItem("userToken");
				const tempThermostatId =
					await AsyncStorage.getItem("tempThermostatId");

				const response = await api.get(
					`/thermostat/get-thermostat-fingerprint?thermostatId=${encodeURIComponent(tempThermostatId)}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.status === 200) {
					const data = response.data;
					console.log(
						"comparing received: ",
						data,
						" with fingerprint: ",
						fingerprint
					);
					setReceivedFingerprint(data);
					if (data === fingerprint) {
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
			const fingerprintOk = await checkFingerprint();
			if (fingerprintOk) {
				clearInterval(interval);

				const paired = await pairThermostat();
				if (paired) {
					Alert.alert("Success", "Thermostat paired successfully!", [
						{
							text: "OK",
							onPress: () => navigation.navigate("Main"),
						},
					]);
				}
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
				To check if the thermostat successfully connected to the
				internet, please go to your WiFi Settings and switch back to
				your local WiFi network and come back.
			</Text>
			<TouchableOpacity
				style={styles.confirmButton}
				onPress={confirmConnection}
			>
				<Text style={styles.confirmButtonText}>Confirm Connection</Text>
			</TouchableOpacity>
			<Text style={styles.fingerprintLabel}>Expected Fingerprint:</Text>
			<Text style={styles.fingerprint}>{fingerprint}</Text>
			<Text style={styles.fingerprintLabel}>Received Fingerprint:</Text>
			<Text style={styles.fingerprint}>{receivedFingerprint}</Text>
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
	fingerprintLabel: {
		fontSize: 16,
		marginTop: 20,
		textAlign: "center",
		color: "#333",
	},
	fingerprint: {
		fontSize: 16,
		textAlign: "center",
		color: "#555",
		marginBottom: 20,
	},
});

export default ConfirmConnectionScreen;
