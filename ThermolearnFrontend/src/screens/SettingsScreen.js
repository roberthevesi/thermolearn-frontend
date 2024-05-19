import React from "react";
import { View, Text } from "react-native";
import { useAuth } from "../utils/AuthContext";
import { TouchableOpacity } from "react-native";

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
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "row",
			}}
		>
			<TouchableOpacity onPress={handleLogout}>
				<Text>Logout</Text>
			</TouchableOpacity>
		</View>
	);
};

export default SettingsScreen;
