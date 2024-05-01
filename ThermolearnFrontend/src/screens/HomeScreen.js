import React, { useState, useRef } from "react";
import { View, Alert, Text, TouchableOpacity } from "react-native";
import api from "../utils/api";
import { useAuth } from "../utils/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

const HomeScreen = () => {
	const navigation = useNavigation();

	const [temperature, setTemperature] = useState(22);
	const timeoutId = useRef(null);

	const { isAuthenticated, logout } = useAuth();

	useEffect(() => {
		if (!isAuthenticated) {
			const timeout = setTimeout(() => {
				navigation.reset({
					index: 0,
					routes: [{ name: "Login" }],
				});
			}, 100); // Small delay
			return () => clearTimeout(timeout);
		}
	}, [isAuthenticated, navigation]);

	const handlePress = async (temp) => {
		if (timeoutId.current) {
			clearTimeout(timeoutId.current);
		}

		timeoutId.current = setTimeout(async () => {
			try {
				const response = await api.post(
					`/demo?mode=manual&desiredTemp=${temp}`
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

	const handleLogout = () => {
		setTimeout(() => {
			logout();
		}, 100);
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
