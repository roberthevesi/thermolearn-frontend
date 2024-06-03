import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Alert,
	Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api"; // Ensure the path is correct for your project structure
import moment from "moment";
import { useAuth } from "../utils/AuthContext";

const HOME_RADIUS = 25; // Radius in meters

const SettingsScreen = ({ navigation }) => {
	const { logout } = useAuth();
	const [isTracking, setIsTracking] = useState(false);
	const [homeLocation, setHomeLocation] = useState(null);
	const [currentLocation, setCurrentLocation] = useState(null);
	const [distanceToHome, setDistanceToHome] = useState(null);
	const [showMap, setShowMap] = useState(false);
	const [tempHomeLocation, setTempHomeLocation] = useState(null);
	const [isAtHome, setIsAtHome] = useState(true); // Track if the user is at home or away

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
		setShowMap(false);
	};

	const handleLogout = async () => {
		try {
			await logout();
			navigation.navigate("Login");
		} catch (error) {
			console.error("Logout failed:", error);
		}
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

	return (
		<View style={styles.container}>
			{/* <Text>
				{isTracking
					? "Tracking location in foreground..."
					: "Not tracking location"}
			</Text> */}
			{showMap && currentLocation && (
				<View style={{ flex: 1, width: "100%" }}>
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
					<TouchableOpacity
						style={styles.confirmButton}
						onPress={handleConfirmLocation}
					>
						<Text style={styles.buttonText}>
							Confirm Home Location
						</Text>
					</TouchableOpacity>
				</View>
			)}
			<View style={styles.locationContainer}>
				<Text>Current Latitude: {currentLocation?.latitude}</Text>
				<Text>Current Longitude: {currentLocation?.longitude}</Text>
				<Text>
					Distance to Home:{" "}
					{distanceToHome !== null
						? `${distanceToHome.toFixed(2)} meters`
						: "Calculating..."}
				</Text>
			</View>
			<TouchableOpacity
				style={styles.button}
				onPress={() => setShowMap(true)}
			>
				<Text style={styles.buttonText}>Update Home Location</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.button} onPress={handleLogout}>
				<Text style={styles.buttonText}>Logout</Text>
			</TouchableOpacity>
		</View>
	);
};

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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	map: {
		width: Dimensions.get("window").width,
		height: Dimensions.get("window").height / 2,
	},
	locationContainer: {
		marginVertical: 20,
	},
	button: {
		backgroundColor: "#007BFF",
		padding: 10,
		borderRadius: 5,
		marginVertical: 10,
	},
	confirmButton: {
		backgroundColor: "#28a745",
		padding: 10,
		borderRadius: 5,
		marginVertical: 10,
		position: "absolute",
		bottom: 10,
		left: "50%",
		transform: [{ translateX: -Dimensions.get("window").width / 4 }],
		width: Dimensions.get("window").width / 2,
		alignItems: "center",
	},
	buttonText: {
		color: "#FFFFFF",
	},
});

export default SettingsScreen;
