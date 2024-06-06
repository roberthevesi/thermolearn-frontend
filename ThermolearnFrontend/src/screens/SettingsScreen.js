import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

import { useAuth } from "../utils/AuthContext";

const SettingsScreen = ({ navigation }) => {
	const { logout } = useAuth();

	const handleLogout = async () => {
		try {
			await logout();
			navigation.navigate("Login");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<View style={styles.container}>
			<Text>abc</Text>
			<AntDesign name="back" size={24} color="black" />

			<TouchableOpacity style={styles.button} onPress={handleLogout}>
				<Text style={styles.buttonText}>Logout</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	button: {
		backgroundColor: "#007BFF",
		padding: 10,
		borderRadius: 5,
		marginVertical: 10,
	},
	buttonText: {
		color: "#FFFFFF",
	},
});

export default SettingsScreen;
