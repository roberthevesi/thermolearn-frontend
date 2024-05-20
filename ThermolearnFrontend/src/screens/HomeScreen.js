import React, { useState, useEffect, useRef } from "react";
import { View, Alert, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import api from "../utils/api";
import * as FileSystem from "expo-file-system";

const HomeScreen = ({ navigation }) => {
	const [temperature, setTemperature] = useState(22);
	const [thermostats, setThermostats] = useState([]);
	const [loading, setLoading] = useState(true);
	const timeoutId = useRef(null);

	const handlePress = async (temp) => {
		if (timeoutId.current) {
			clearTimeout(timeoutId.current);
		}

		timeoutId.current = setTimeout(async () => {
			try {
				const token = await AsyncStorage.getItem("userToken");

				const response = await api.post(
					`/demo?mode=manual&desiredTemp=${temp}`,
					{},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				Alert.alert(
					"Success",
					"Request succeeded with response: " +
						JSON.stringify(response.data)
				);
			} catch (error) {
				console.error("Request failed", error);
				Alert.alert("Error", error.message || "Something went wrong");
			}
		}, 2000); // 2s delay
	};

	const fetchPairedThermostats = async () => {
		try {
			const userId = await AsyncStorage.getItem("userId");
			if (!userId) {
				Alert.alert("Error", "User ID not found in storage.");
				setLoading(false);
				return;
			}

			const token = await AsyncStorage.getItem("userToken");
			const response = await api.get(
				`/user/get-user-paired-thermostats`,
				{
					params: { userId },
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setThermostats(response.data || []);
		} catch (error) {
			console.error("Failed to fetch paired thermostats", error);
			Alert.alert("Error", "Failed to fetch paired thermostats.");
		} finally {
			setLoading(false);
		}
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
					handleQRCodeScanned(qrCodeData);
				} else {
					Alert.alert("Error", "No QR code found in the image.");
				}
			} catch (error) {
				console.error("Error decoding QR code", error);
				Alert.alert("Error", "Failed to decode QR code.");
			}
		}
	};

	const handleQRCodeScanned = async (thermostatId) => {
		try {
			const userId = await AsyncStorage.getItem("userId");
			if (!userId) {
				Alert.alert("Error", "User ID not found in storage.");
				return;
			}

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

			if (response.status === 200) {
				Alert.alert("Success", "Thermostat paired successfully!");
				fetchPairedThermostats();
			} else {
				Alert.alert("Error", "Failed to pair thermostat.");
			}
		} catch (error) {
			console.error("Failed to pair thermostat", error);
			Alert.alert("Error", "Failed to pair thermostat.");
		}
	};

	const handleUnpairThermostat = async (thermostatId) => {
		Alert.alert(
			"Confirm Unpair",
			"Are you sure you want to unpair this thermostat?",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "OK",
					onPress: async () => {
						try {
							const userId = await AsyncStorage.getItem("userId");
							if (!userId) {
								Alert.alert(
									"Error",
									"User ID not found in storage."
								);
								return;
							}

							const token = await AsyncStorage.getItem(
								"userToken"
							);
							console.log(
								"Unpairing thermostat:",
								thermostatId,
								"for user:",
								userId
							);
							const response = await api.post(
								`/thermostat/unpair-thermostat`,
								{ userId, thermostatId },
								{
									headers: {
										Authorization: `Bearer ${token}`,
										"Content-Type": "application/json",
									},
								}
							);

							if (response.status === 200) {
								Alert.alert(
									"Success",
									"Thermostat unpaired successfully!"
								);
								fetchPairedThermostats();
							} else {
								Alert.alert(
									"Error",
									"Failed to unpair thermostat."
								);
							}
						} catch (error) {
							console.error("Failed to unpair thermostat", error);
							Alert.alert(
								"Error",
								"Failed to unpair thermostat."
							);
						}
					},
				},
			]
		);
	};

	useEffect(() => {
		fetchPairedThermostats();
	}, []);

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

	return (
		<View style={styles.container}>
			<View style={styles.thermostatCard}>
				{thermostats.length === 0 ? (
					<View style={styles.centered}>
						<Text>No paired thermostats found.</Text>
						<TouchableOpacity
							style={styles.addButton}
							onPress={openImagePicker}
						>
							<Text style={styles.buttonText}>Add</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View style={styles.thermostatContainer}>
						<Text style={styles.thermostatId}>
							Thermostat ID: {thermostats[0].thermostatId}
						</Text>
						<TouchableOpacity
							style={styles.removeButton}
							onPress={() =>
								handleUnpairThermostat(
									thermostats[0].thermostatId
								)
							}
						>
							<Text style={styles.buttonText}>X</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>

			<View style={styles.tempControl}>
				<TouchableOpacity
					onPress={() => {
						setTemperature((prevTemp) => prevTemp - 0.5);
						handlePress(temperature - 0.5);
					}}
					style={styles.tempButton}
				>
					<Text style={styles.tempButtonText}>-</Text>
				</TouchableOpacity>

				<Text style={styles.temperature}>{temperature.toFixed(1)}</Text>

				<TouchableOpacity
					onPress={() => {
						setTemperature((prevTemp) => prevTemp + 0.5);
						handlePress(temperature + 0.5);
					}}
					style={styles.tempButton}
				>
					<Text style={styles.tempButtonText}>+</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	thermostatCard: {
		width: "90%",
		padding: 20,
		marginBottom: 20,
		borderRadius: 10,
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 5,
		elevation: 5,
	},
	centered: {
		justifyContent: "center",
		alignItems: "center",
	},
	thermostatContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	thermostatId: {
		fontSize: 18,
	},
	addButton: {
		marginTop: 10,
		padding: 10,
		borderRadius: 5,
		backgroundColor: "#4CAF50",
	},
	removeButton: {
		padding: 10,
		borderRadius: 5,
		backgroundColor: "#f44336",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
		textAlign: "center",
	},
	tempControl: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 20,
	},
	tempButton: {
		marginHorizontal: 20,
		padding: 10,
		borderRadius: 5,
		backgroundColor: "#2196F3",
	},
	tempButtonText: {
		color: "#fff",
		fontSize: 20,
	},
	temperature: {
		fontSize: 40,
		fontWeight: "bold",
	},
});

export default HomeScreen;
