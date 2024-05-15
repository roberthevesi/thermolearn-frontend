import React, { useState, useRef } from "react";
import { View, Alert, Text, TouchableOpacity } from "react-native";
import api from "../utils/api";
import { useAuth } from "../utils/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }) => {
	const [temperature, setTemperature] = useState(22);
	const timeoutId = useRef(null);
	const { logout } = useAuth();

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

	const handleLogout = async () => {
		try {
			await logout();
			navigation.navigate("Login");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "row",
			}}
		>
			<TouchableOpacity
				onPress={() => {
					setTemperature((prevTemp) => prevTemp - 0.5);
					handlePress(temperature - 0.5);
				}}
			>
				<Text style={{ fontSize: 40 }}>-</Text>
			</TouchableOpacity>

			<Text style={{ fontSize: 40 }}> {temperature.toFixed(1)} </Text>

			<TouchableOpacity
				onPress={() => {
					setTemperature((prevTemp) => prevTemp + 0.5);
					handlePress(temperature + 0.5);
				}}
			>
				<Text style={{ fontSize: 40 }}>+</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={handleLogout}>
				<Text>Logout</Text>
			</TouchableOpacity>
		</View>
	);
};

export default HomeScreen;
