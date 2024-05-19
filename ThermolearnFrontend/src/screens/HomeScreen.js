import React, { useState, useEffect } from "react";
import {
	View,
	Alert,
	Text,
	TouchableOpacity,
	StyleSheet,
	Button,
	Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import api from "../utils/api";
import * as FileSystem from "expo-file-system";

const HomeScreen = ({ navigation }) => {
	const [temperature, setTemperature] = useState(22);
	const [thermostats, setThermostats] = useState([]);
	const [loading, setLoading] = useState(true);

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
			{thermostats.length === 0 ? (
				<View style={styles.centered}>
					<Text>No paired thermostats found.</Text>
				</View>
			) : (
				<View style={styles.thermostatsList}>
					{thermostats.map((thermostat) => (
						<Text key={thermostat.id} style={styles.thermostatId}>
							Thermostat ID: {thermostat.thermostatId}
						</Text>
					))}
				</View>
			)}

			<Button title="Add Thermostat" onPress={openImagePicker} />

			<View style={styles.tempControl}>
				<TouchableOpacity
					onPress={() => {
						setTemperature((prevTemp) => prevTemp - 0.5);
						handlePress(temperature - 0.5);
					}}
				>
					<Text style={styles.tempButton}>-</Text>
				</TouchableOpacity>

				<Text style={styles.temperature}>
					{" "}
					{temperature.toFixed(1)}{" "}
				</Text>

				<TouchableOpacity
					onPress={() => {
						setTemperature((prevTemp) => prevTemp + 0.5);
						handlePress(temperature + 0.5);
					}}
				>
					<Text style={styles.tempButton}>+</Text>
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
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	thermostatsList: {
		marginBottom: 20,
	},
	thermostatId: {
		fontSize: 18,
		marginVertical: 5,
	},
	tempControl: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	tempButton: {
		fontSize: 40,
		marginHorizontal: 20,
	},
	temperature: {
		fontSize: 40,
	},
});

export default HomeScreen;
