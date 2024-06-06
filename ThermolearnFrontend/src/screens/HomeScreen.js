import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Alert, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import api from "../utils/api";
import * as FileSystem from "expo-file-system";
import { useAuth } from "../utils/AuthContext";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import moment from "moment";
import { ScrollView } from "react-native-gesture-handler";
import { Modal } from "react-native";
import { Dimensions } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
	const R = 6371;
	const dLat = deg2rad(lat2 - lat1);
	const dLon = deg2rad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) *
			Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c * 1000;
	return d;
};

const deg2rad = (deg) => {
	return deg * (Math.PI / 180);
};

const HOME_RADIUS = 25; // meters

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
	const [lastUpdate, setLastUpdate] = useState("");

	const [isTracking, setIsTracking] = useState(false);
	const [homeLocation, setHomeLocation] = useState(null);
	const [currentLocation, setCurrentLocation] = useState(null);
	const [distanceToHome, setDistanceToHome] = useState(null);
	const [showMap, setShowMap] = useState(false);
	const [tempHomeLocation, setTempHomeLocation] = useState(null);
	const [isAtHome, setIsAtHome] = useState(true); // Track if the user is at home or away

	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		(async () => {
			const { status: foregroundStatus } =
				await Location.requestForegroundPermissionsAsync();
			if (foregroundStatus !== "granted") {
				console.log(
					"Permission to access location in the foreground was denied"
				);
				return;
			}

			setIsTracking(true);

			const homeLatitude = await AsyncStorage.getItem("homeLatitude");
			const homeLongitude = await AsyncStorage.getItem("homeLongitude");

			if (homeLatitude && homeLongitude) {
				setHomeLocation({
					latitude: parseFloat(homeLatitude),
					longitude: parseFloat(homeLongitude),
				});
			}
		})();
	}, []);

	useEffect(() => {
		const getLocation = async () => {
			const location = await Location.getCurrentPositionAsync({});
			setCurrentLocation({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			});
			if (homeLocation) {
				const distance = getDistanceFromLatLonInM(
					location.coords.latitude,
					location.coords.longitude,
					homeLocation.latitude,
					homeLocation.longitude
				);
				setDistanceToHome(distance);

				setIsAtHome((prevIsAtHome) => {
					if (distance > HOME_RADIUS && prevIsAtHome) {
						logEvent("OUT");
						Alert.alert(
							"Distance Alert",
							"You are more than 25 meters away from home."
						);
						return false;
					} else if (distance <= HOME_RADIUS && !prevIsAtHome) {
						logEvent("IN");
						Alert.alert(
							"Distance Alert",
							"You are within 25 meters of home."
						);
						return true;
					}
					return prevIsAtHome;
				});
			}
		};

		const interval = setInterval(getLocation, 1000);
		return () => clearInterval(interval);
	}, [homeLocation]);

	useEffect(() => {
		(async () => {
			const { status: foregroundStatus } =
				await Location.requestForegroundPermissionsAsync();
			if (foregroundStatus !== "granted") {
				console.log(
					"Permission to access location in the foreground was denied"
				);
				return;
			}

			setIsTracking(true);

			const homeLatitude = await AsyncStorage.getItem("homeLatitude");
			const homeLongitude = await AsyncStorage.getItem("homeLongitude");

			if (homeLatitude && homeLongitude) {
				setHomeLocation({
					latitude: parseFloat(homeLatitude),
					longitude: parseFloat(homeLongitude),
				});
			}
		})();
	}, []);

	useEffect(() => {
		const getLocation = async () => {
			const location = await Location.getCurrentPositionAsync({});
			setCurrentLocation({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			});
			if (homeLocation) {
				const distance = getDistanceFromLatLonInM(
					location.coords.latitude,
					location.coords.longitude,
					homeLocation.latitude,
					homeLocation.longitude
				);
				setDistanceToHome(distance);

				setIsAtHome((prevIsAtHome) => {
					if (distance > HOME_RADIUS && prevIsAtHome) {
						logEvent("OUT");
						Alert.alert(
							"Distance Alert",
							"You are more than 25 meters away from home."
						);
						return false;
					} else if (distance <= HOME_RADIUS && !prevIsAtHome) {
						logEvent("IN");
						Alert.alert(
							"Distance Alert",
							"You are within 25 meters of home."
						);
						return true;
					}
					return prevIsAtHome;
				});
			}
		};

		const interval = setInterval(getLocation, 1000);
		return () => clearInterval(interval);
	}, [homeLocation]);

	const handleMapPress = (event) => {
		const { latitude, longitude } = event.nativeEvent.coordinate;
		setTempHomeLocation({ latitude, longitude });
	};

	const handleConfirmLocation = async () => {
		setHomeLocation(tempHomeLocation);
		await AsyncStorage.setItem(
			"homeLatitude",
			tempHomeLocation.latitude.toString()
		);
		await AsyncStorage.setItem(
			"homeLongitude",
			tempHomeLocation.longitude.toString()
		);
		updateUserHomeLocation();
		setShowModal(false);
	};

	const openModal = () => {
		setShowModal(true);
	};

	const logEvent = async (eventType) => {
		try {
			const userId = await AsyncStorage.getItem("userId");
			const userToken = await AsyncStorage.getItem("userToken");
			const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

			const response = await api.post(
				"/log/save-log",
				{
					userId: parseInt(userId),
					eventType,
					timestamp,
				},
				{
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				}
			);

			console.log("Log event response:", response.data);
		} catch (error) {
			console.error("Error logging event:", error);
		}
	};

	const updateUserHomeLocation = async (eventType) => {
		try {
			const userId = await AsyncStorage.getItem("userId");
			const userToken = await AsyncStorage.getItem("userToken");
			const homeLatitude = tempHomeLocation.latitude;
			const homeLongitude = tempHomeLocation.longitude;

			const response = await api.post(
				"/user/update-user-home-location",
				{
					userId: parseInt(userId),
					homeLatitude,
					homeLongitude,
				},
				{
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				}
			);

			console.log("Log event response:", response.data);
		} catch (error) {
			console.error("Error logging event:", error);
		}
	};

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
			if (!thermostatId || !isLoggedIn) return;
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

				const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
				setLastUpdate(currentTime);
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
		} else if (temperature <= 100) {
			return "#ed4524";
		} else {
			return "#fff";
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
				setThermostatId(thermostatId);

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
				fetchPairedThermostats();
			} else {
				Alert.alert("Error", "Something went wrong. Please try again.");
			}
		} catch (error) {
			console.error("Failed to pair thermostat", error);
			Alert.alert("Error", "Something went wrong. Please try again.");
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

							const token =
								await AsyncStorage.getItem("userToken");
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
							setAmbientTemp(null);
							setHumidity(null);
							setHeatingStatus(null);
							setTargetTemp(null);

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
			<ScrollView contentContainerStyle={styles.scrollViewContainer}>
				{thermostats.length === 0 ? (
					<>
						<Text style={styles.greetingNotPaired}>
							Hello, {firstName ? firstName : "-"}! 🙂
						</Text>
						<View style={styles.noThermostatContainer}>
							<Text style={styles.noThermostatText}>
								Looks like you don't have any associated
								thermostats. Add one now!
							</Text>
							<TouchableOpacity
								style={styles.addButton}
								onPress={openImagePicker}
							>
								<Text style={styles.buttonText}>
									Add Thermostat
								</Text>
							</TouchableOpacity>
						</View>
					</>
				) : (
					<>
						<Text style={styles.greeting}>
							Hello, {firstName ? firstName : "-"}! 🙂
						</Text>
						<View style={styles.thermostatContainer}>
							<View style={styles.temperatureOutsideCircle}>
								<View style={styles.temperatureCircle}>
									<View style={styles.temperatureColumn}>
										<Text style={[styles.labelText]}>
											Target
										</Text>
										<Text
											style={[styles.temperatureTextGrey]}
										>
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
						</View>
						<Text style={styles.updateText}>
							Status updated at: {lastUpdate}
						</Text>
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

						<View style={styles.menuContainer}>
							<TouchableOpacity
								style={styles.menuItem}
								onPress={() => navigation.navigate("Schedule")}
							>
								<MaterialIcons
									name="schedule"
									size={30}
									color="#fff"
								/>
								<Text style={styles.menuItemText}>
									Schedule
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.menuItem}
								onPress={openModal}
							>
								<AntDesign name="home" size={30} color="#fff" />
								<Text style={styles.menuItemText}>
									Home Location
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.menuItem}
								onPress={() =>
									handleUnpairThermostat(
										thermostats[0].thermostatId
									)
								}
							>
								<Ionicons
									name="remove-circle-outline"
									size={30}
									color="#fff"
								/>
								<Text style={styles.menuItemText}>Unpair</Text>
							</TouchableOpacity>
						</View>
					</>
				)}
			</ScrollView>
			<Modal visible={showModal} animationType="slide">
				<View style={styles.modalContainer}>
					{currentLocation && (
						<MapView
							style={styles.map}
							initialRegion={currentLocation}
							onPress={handleMapPress}
						>
							{currentLocation && (
								<Marker
									coordinate={currentLocation}
									title="Your Location"
									tracksViewChanges={false}
								/>
							)}
							{homeLocation && (
								<Marker
									coordinate={homeLocation}
									pinColor="blue"
									title="Home Location"
									tracksViewChanges={false}
								/>
							)}
							{tempHomeLocation && (
								<Marker
									coordinate={tempHomeLocation}
									pinColor="green"
									title="Temporary Home Location"
									tracksViewChanges={false}
								/>
							)}
						</MapView>
					)}
					<TouchableOpacity
						style={styles.confirmButton}
						onPress={handleConfirmLocation}
					>
						<Text style={styles.buttonText}>
							Confirm Home Location
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.cancelButton}
						onPress={() => setShowModal(false)}
					>
						<Text style={styles.buttonText}>Cancel</Text>
					</TouchableOpacity>
				</View>
			</Modal>
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
		fontSize: 26,
		margin: 10,
		color: "#fff",
	},
	greetingNotPaired: {
		fontSize: 26,
		margin: 10,
		color: "#000",
	},
	noThermostatContainer: {
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#f5f5f5",
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 5,
		elevation: 5,
	},
	noThermostatText: {
		fontSize: 16,
		color: "#333",
		textAlign: "center",
		marginBottom: 10,
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
		padding: 15,
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
		position: "absolute",
		bottom: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		margin: 10,
		width: "100%",
		paddingHorizontal: 20,
	},
	translucentButton: {
		flex: 1,
		marginHorizontal: 10,
		padding: 10,
		borderRadius: 5,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		alignItems: "center",
		justifyContent: "center",
		margin: 10,
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
	scrollViewContainer: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	mapContainer: {
		width: "100%",
		height: 300,
	},
	map: {
		flex: 1,
	},
	confirmButton: {
		backgroundColor: "#28a745",
		padding: 10,
		borderRadius: 5,
		marginVertical: 10,
		alignSelf: "center",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	map: {
		width: Dimensions.get("window").width,
		height: Dimensions.get("window").height / 2,
	},
	cancelButton: {
		backgroundColor: "#d9534f",
		padding: 10,
		borderRadius: 5,
		marginVertical: 10,
	},
	updateText: {
		fontSize: 14,
		color: "#fff",
	},
	menuContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		margin: 20,
		backgroundColor: "rgba(255, 255, 255, 0.3)", // Translucent background
		paddingVertical: 10,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 5,
		width: Dimensions.get("window").width * 0.8, // Make it almost as wide as the screen
		alignSelf: "center",
	},
	menuItem: {
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
	},
	menuItemText: {
		color: "#fff",
		marginTop: 5,
		fontSize: 14,
	},
});

export default HomeScreen;
