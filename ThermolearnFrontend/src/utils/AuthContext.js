import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "react-native";
import { ActivityIndicator } from "react-native";
const AuthContext = createContext({
	isAuthenticated: false,
	setIsAuthenticated: () => {},
	logout: () => {},
});

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkToken = async () => {
			setIsLoading(true);
			const token = await AsyncStorage.getItem("@user_token");
			setIsAuthenticated(!!token);
			setIsLoading(false);
		};

		checkToken();
	}, []);

	const logout = async () => {
		await AsyncStorage.removeItem("@user_token");
		setIsAuthenticated(false);
	};

	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<ActivityIndicator size="large" color="#14293d" />
			</View>
		);
	}

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, setIsAuthenticated, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
