import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Alert, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import api from "../utils/api";
import * as FileSystem from "expo-file-system";
import { useAuth } from "../utils/AuthContext";

const HomeScreen = ({ navigation }) => {
	const { isLoggedIn } = useAuth();
	const [temperature, setTemperature] = useState(22);
	const [thermostats, setThermostats] = useState([]);
	const [loading, setLoading] = useState(true);
	const timeoutId = useRef(null);
	const [thermostatId, setThermostatId] = useState(null);
	const [firstName, setFirstName] = useState("");
	const [targetTemp, setTargetTemp] = useState("-");
	const [ambientTemp, setAmbientTemp] = useState("-");
	const [humidity, setHumidity] = useState("-");
	const [heatingStatus, setHeatingStatus] = useState("-");
	const updateTimeout = useRef(null);
	const fetchInterval = useRef(null);

	useEffect(() => {
		const fetchThermostatId = async () => {
			const id = await AsyncStorage.getItem("thermostatId");
			setThermostatId(id);
		};
		fetchThermostatId();
	}, []);

	useEffect(() => {
		const fetchFirstName = async () => {
			const name = await AsyncStorage.getItem("firstName");
			setFirstName(name || "-");
		};
		fetchFirstName();
	}, []);

	useEffect(() => {
		const fetchTemperatures = async () => {
			if (!thermostatId || !isLoggedIn) return; // Check if user is logged in
			console.log("Fetching temperatures...");
			try {
				const token = await AsyncStorage.getItem("userToken");

				const statusResponse = await api.get(
					"/thermostat/get-thermostat-status",
					{
						params: { thermostatId },
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				const { heatingStatus, ambientHumidity, ambientTemperature } =
					statusResponse.data;
				if (heatingStatus) setHeatingStatus(heatingStatus);
				if (ambientHumidity) setHumidity(ambientHumidity);
				if (ambientTemperature) setAmbientTemp(ambientTemperature);
			} catch (error) {
				console.error("Failed to fetch temperatures", error);
				// Alert.alert("Error", "Failed to fetch temperatures.");
			}
		};

		if (thermostatId && isLoggedIn) {
			fetchTemperatures();
			fetchInterval.current = setInterval(fetchTemperatures, 100000); // ms
		} else {
			console.log("No thermostatId or not logged in");
			console.log("thermostatId", thermostatId);
			console.log("isLoggedIn", isLoggedIn);
		}

		return () => {
			if (fetchInterval.current) {
				clearInterval(fetchInterval.current);
			}
		};
	}, [thermostatId, isLoggedIn]);

	const getBackgroundColor = (temperature) => {
		if (temperature <= 15) {
			return "#9ecdff";
		} else if (temperature <= 20) {
			return "#f5e4a2";
		} else if (temperature <= 25) {
			return "#f58236";
		} else {
			return "#ed4524";
		}
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
				"/user/get-user-paired-thermostats",
				{
					params: { userId },
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.data[0]) {
				console.log("No thermostat found");
			} else {
				const thermostatId = response.data[0].thermostatId;
				console.log("Thermostat ID:", thermostatId);
				await AsyncStorage.setItem("thermostatId", thermostatId);
				setThermostatId(thermostatId); // update state after setting AsyncStorage

				try {
					const targetResponse = await api.get(
						"/thermostat/get-target-temperature",
						{
							params: { thermostatId },
							headers: { Authorization: `Bearer ${token}` },
						}
					);

					const formattedTemp = targetResponse.data.toFixed(1);
					setTargetTemp(formattedTemp);
				} catch (error) {
					console.error("Failed to fetch temperatures", error);
					// Alert.alert("Error", "Failed to fetch temperatures.");
				}
			}

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
			"Are you sure you want to unpair this thermostat? This will also delete all your preferences.",
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

							await AsyncStorage.removeItem("thermostatId");
							setThermostatId(null);

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

	const handleUpdateTemperature = async (newTemp) => {
		if (updateTimeout.current) {
			clearTimeout(updateTimeout.current);
		}

		const formattedTemp = newTemp.toFixed(1);
		setTargetTemp(formattedTemp);

		updateTimeout.current = setTimeout(async () => {
			try {
				const token = await AsyncStorage.getItem("userToken");
				const id = await AsyncStorage.getItem("thermostatId");
				console.log("Updating temperature to:", formattedTemp);
				const response = await api.post(
					"/thermostat/update-temperature",
					{
						thermostatId: id,
						temperature: formattedTemp,
					},
					{
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					}
				);

				if (response.status === 200) {
					// Alert.alert("Success", "Temperature updated successfully!");
				} else {
					Alert.alert("Error", "Failed to update temperature.");
				}
			} catch (error) {
				console.error("Failed to update temperature", error);
				Alert.alert("Error", "Failed to update temperature.");
			}
		}, 2000);
	};

	useEffect(() => {
		fetchPairedThermostats();
		return () => {
			if (fetchInterval.current) {
				clearInterval(fetchInterval.current);
			}
		};
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

	const backgroundColor =
		ambientTemp !== "-"
			? getBackgroundColor(parseFloat(ambientTemp))
			: "#f5f5f5";

	return (
		<View style={[styles.container, { backgroundColor }]}>
			{firstName ? (
				<Text style={styles.greeting}>Hello, {firstName}! 😊</Text>
			) : (
				<Text style={styles.greeting}>-</Text>
			)}
			<View>
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
						<View style={styles.temperatureOutsideCircle}>
							<View style={styles.temperatureCircle}>
								<View style={styles.temperatureColumn}>
									<Text style={[styles.labelText]}>
										Target
									</Text>
									<Text style={[styles.temperatureTextGrey]}>
										{targetTemp}°C
									</Text>
								</View>
								<View style={styles.temperatureColumn}>
									<Text
										style={[
											styles.labelText,
											{ color: backgroundColor },
										]}
									>
										Ambient
									</Text>
									<Text
										style={[
											styles.temperatureText,
											{ color: backgroundColor },
										]}
									>
										{ambientTemp}°C
									</Text>
								</View>
							</View>
						</View>
						<View style={styles.buttonContainer}>
							<TouchableOpacity
								style={styles.circleButton}
								onPress={() =>
									handleUpdateTemperature(
										(parseFloat(targetTemp) || 0) - 0.5
									)
								}
							>
								<Text style={styles.circleButtonText}>-</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.circleButton}
								onPress={() =>
									handleUpdateTemperature(
										(parseFloat(targetTemp) || 0) + 0.5
									)
								}
							>
								<Text style={styles.circleButtonText}>+</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.statusContainer}>
							<Text style={styles.statusText}>
								Heating status: {heatingStatus}{" "}
								<View
									style={[
										styles.statusIndicator,
										{
											backgroundColor:
												heatingStatus === "ON"
													? "green"
													: "grey",
										},
									]}
								/>
							</Text>
						</View>
						<Text style={styles.humidityText}>
							Humidity: {humidity !== "-" ? `${humidity}%` : "-"}
						</Text>
						<View style={styles.bottomButtonsContainer}>
							<View>
								<TouchableOpacity
									style={styles.translucentButton}
									onPress={() =>
										handleUnpairThermostat(
											thermostats[0].thermostatId
										)
									}
								>
									<Text style={styles.translucentButtonText}>
										Unpair Thermostat
									</Text>
								</TouchableOpacity>
							</View>
							<View>
								<TouchableOpacity
									style={styles.translucentButton}
									onPress={() =>
										navigation.navigate("Schedule")
									}
								>
									<Text style={styles.translucentButtonText}>
										Go To Schedule
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
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
	scheduleButton: {
		position: "absolute",
		top: 40,
		right: 20,
		padding: 10,
		borderRadius: 5,
		backgroundColor: "#4CAF50",
	},
	greeting: {
		fontSize: 30,
		margin: 10,
		color: "#fff",
		// position: "absolute",
	},
	centered: {
		justifyContent: "center",
		alignItems: "center",
	},
	thermostatContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
	temperatureCircle: {
		width: 300,
		height: 300,
		borderRadius: 150,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(255, 255, 255, 0.8)",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 5,
		elevation: 5,
		flexDirection: "row",
	},
	temperatureOutsideCircle: {
		width: 340,
		height: 340,
		borderRadius: 170,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		margin: 10,
	},
	temperatureColumn: {
		alignItems: "center",
		marginHorizontal: 15,
	},
	temperatureText: {
		fontSize: 40,
	},
	temperatureTextGrey: {
		fontSize: 40,
		color: "#666",
	},
	labelText: {
		fontSize: 16,
		color: "#666",
	},
	addButton: {
		marginTop: 10,
		padding: 10,
		borderRadius: 5,
		backgroundColor: "#4CAF50",
	},
	removeButton: {
		position: "absolute",
		top: 10,
		right: 10,
		padding: 10,
		borderRadius: 5,
		backgroundColor: "#f44336",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
		textAlign: "center",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		margin: 10,
	},
	circleButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		justifyContent: "center",
		alignItems: "center",
		marginHorizontal: 20,
	},
	circleButtonText: {
		color: "#fff",
		fontSize: 48,
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
	bottomButtonsContainer: {
		// bottom: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		margin: 10,
	},
	translucentButton: {
		flex: 1,
		marginHorizontal: 10,
		padding: 10,
		borderRadius: 5,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		alignItems: "center",
	},
	translucentButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	statusContainer: {
		flexDirection: "row",
		alignItems: "center",
		margin: 10,
		marginBottom: -10,
	},
	statusText: {
		fontSize: 18,
		color: "#fff",
	},
	statusIndicator: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginLeft: 5,
	},
	humidityText: {
		fontSize: 18,
		color: "#fff",
		margin: 10,
	},
});

export default HomeScreen;
