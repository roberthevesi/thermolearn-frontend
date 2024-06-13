// WifiInstructionsScreen.js
import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const WiFiInstructionsScreen = () => {
	const navigation = useNavigation();

	const handleConfirmConnection = () => {
		navigation.navigate("WiFi Credentials");
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<Text style={styles.message}>
				To connect the thermostat to the local WiFi network, please go
				to your WiFi Settings and select the network "Thermolearn WiFi
				Network" and come back here.
			</Text>
			<TouchableOpacity
				style={styles.confirmButton}
				onPress={handleConfirmConnection}
			>
				<Text style={styles.confirmButtonText}>Confirm Connection</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		padding: 20,
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	closeButton: {
		position: "absolute",
		top: 40,
		right: 20,
		zIndex: 1,
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
	},
	confirmButtonText: {
		color: "white",
		fontSize: 18,
	},
});

export default WiFiInstructionsScreen;
