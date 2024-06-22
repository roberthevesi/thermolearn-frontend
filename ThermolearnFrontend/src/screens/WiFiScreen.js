import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Alert,
	TouchableOpacity,
	StyleSheet,
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
				navigation.navigate("Confirm Connection", {
					fingerprint,
				});
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
				placeholder="Enter WiFi SSID"
				placeholderTextColor="#888"
			/>
			<Text style={styles.label}>WiFi Password:</Text>
			<TextInput
				style={styles.input}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				placeholder="Enter WiFi Password"
				placeholderTextColor="#888"
			/>
			<TouchableOpacity
				style={styles.confirmButton}
				onPress={sendCredentials}
			>
				<Text style={styles.confirmButtonText}>Submit</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		justifyContent: "center",
		paddingHorizontal: 16,
	},
	label: {
		fontSize: 18,
		marginBottom: 8,
		color: "#333",
	},
	input: {
		height: 40,
		borderColor: "gray",
		borderWidth: 1,
		borderRadius: 5,
		marginBottom: 16,
		paddingHorizontal: 10,
		fontSize: 16,
		backgroundColor: "#f9f9f9",
	},
	confirmButton: {
		backgroundColor: "tomato",
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
