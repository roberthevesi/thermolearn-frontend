import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../utils/AuthContext";

const SettingsScreen = ({ navigation }) => {
	useFocusEffect(
		React.useCallback(() => {
			StatusBar.setBarStyle("dark-content");
		}, [])
	);

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
		<>
			<StatusBar
				animated={true}
				backgroundColor="#61dafb"
				barStyle={"dark-content"}
			/>
			<View style={styles.container}>
				<TouchableOpacity style={styles.button} onPress={handleLogout}>
					<Text style={styles.buttonText}>Logout</Text>
				</TouchableOpacity>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	button: {
		backgroundColor: "tomato",
		paddingVertical: 15,
		paddingHorizontal: 30,
		borderRadius: 5,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 18,
	},
});

export default SettingsScreen;
