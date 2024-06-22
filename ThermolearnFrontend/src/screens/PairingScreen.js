// PairThermostatScreen.js
import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Alert,
	StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api";

const PairingScreen = () => {
	const navigation = useNavigation();

	const openImagePicker = async () => {
		const { status } =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission Denied",
				"We need permission to access your photo library"
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: false,
			quality: 1,
		});

		handleImagePicked(result);
	};

	const handleImagePicked = async (result) => {
		if (!result.cancelled && result.assets && result.assets.length > 0) {
			const assetUri = result.assets[0].uri;

			try {
				const base64Image = await FileSystem.readAsStringAsync(
					assetUri,
					{
						encoding: FileSystem.EncodingType.Base64,
					}
				);

				const formData = new FormData();
				formData.append("file", {
					uri: assetUri,
					name: "photo.jpg",
					type: "image/jpeg",
				});

				const response = await fetch(
					"https://api.qrserver.com/v1/read-qr-code/",
					{
						method: "POST",
						body: formData,
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);

				const data = await response.json();

				if (
					data &&
					data.length > 0 &&
					data[0].symbol.length > 0 &&
					data[0].symbol[0].data
				) {
					const qrCodeData = data[0].symbol[0].data;
					// handleQRCodeScanned(qrCodeData);
					isThermostatReadyToPair(qrCodeData);
				} else {
					Alert.alert("Error", "No QR code found in the image.");
				}
			} catch (error) {
				console.error("Error decoding QR code", error);
				Alert.alert("Error", "Failed to decode QR code.");
			}
		}
	};

	const isThermostatReadyToPair = async (thermostatId) => {
		console.log("Checking if thermostat is ready to pair:", thermostatId);
		try {
			const userId = await AsyncStorage.getItem("userId");
			if (!userId) {
				Alert.alert("Error", "User ID not found in storage.");
				return;
			}

			const token = await AsyncStorage.getItem("userToken");
			const response = await api.get(
				`/thermostat/is-thermostat-ready-to-pair`,
				{
					params: {
						userId: userId,
						thermostatId: thermostatId,
					},
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.data) {
				console.log("Thermostat is ready to pair");
				AsyncStorage.setItem("tempThermostatId", thermostatId);
				navigation.navigate("WiFi Instructions");
				return true;
			} else {
				console.log("Thermostat is not ready to pair");
				return false;
			}
		} catch (error) {
			console.error(
				"Failed to check if thermostat is ready to pair",
				error
			);
			Alert.alert("Error", "Something went wrong. Please try again.");
		}
	};

	const handleQRCodeScanned = async (thermostatId) => {
		console.log("Scanned QR code:", thermostatId);
		try {
			const userId = await AsyncStorage.getItem("userId");
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
				Alert.alert("Success", "Thermostat paired successfully!");
				// fetchPairedThermostats();
				navigation.navigate("WiFi Instructions");
			} else {
				Alert.alert("Error", "Something went wrong. Please try again.");
			}
		} catch (error) {
			console.error("Failed to pair thermostat", error);
			Alert.alert("Error", "Something went wrong. Please try again.");
		}
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<Text style={styles.message}>
				To pair your thermostat, you will be asked to select an image
				from your gallery containing the thermostat's QR code.
			</Text>
			<TouchableOpacity
				style={styles.selectButton}
				onPress={openImagePicker}
			>
				<Text style={styles.selectButtonText}>Select Photo</Text>
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
	selectButton: {
		backgroundColor: "tomato",
		paddingVertical: 15,
		paddingHorizontal: 30,
		borderRadius: 5,
	},
	selectButtonText: {
		color: "white",
		fontSize: 18,
	},
});

export default PairingScreen;
