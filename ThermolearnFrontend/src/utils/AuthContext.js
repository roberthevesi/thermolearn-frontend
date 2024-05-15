// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api"; // Assuming you have an API utility for backend calls

const AuthContext = createContext();

export function useAuth() {
	return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
	const [userToken, setUserToken] = useState(null);
	const [initialRoute, setInitialRoute] = useState("Login");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		checkToken();
	}, []);

	const checkToken = async () => {
		try {
			const token = await AsyncStorage.getItem("userToken");
			if (token) {
				console.log("Token found:", token);
				setUserToken(token);
				setInitialRoute("Main");
			} else {
				console.log("No token found");
				setInitialRoute("Login");
			}

			setLoading(false);
		} catch (error) {
			console.log("Failed to fetch token from storage:", error);
			setLoading(false);
		}
	};

	const login = async (email, password) => {
		try {
			const response = await api.post("/user/authenticate", {
				email: email,
				password: password,
			});
			const isAccountVerified = response.data.user.accountVerified;
			if (isAccountVerified) {
				const { token } = response.data;
				await AsyncStorage.setItem("userToken", token);
				// const token2 = await AsyncStorage.getItem("userToken");
				// console.log("Logged in...", token2);
				setUserToken(token);
				return true;
			} else {
				await AsyncStorage.setItem("userEmail", email);
				sendNewRegistrationCode(email);

				return false;
				// navigation.navigate("VerifyRegistrationCode");
			}

			console.log(response.data.user);
			// setInitialRoute("Main");
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		}
	};

	const register = async (email, password, firstName, lastName) => {
		try {
			const response = await api.post("/user/register", {
				email: email,
				password: password,
				firstName: firstName,
				lastName: lastName,
			});
			await AsyncStorage.setItem("userEmail", email);
			// const { token } = response.data;
			// await AsyncStorage.setItem("userToken", token);
			// const token2 = await AsyncStorage.getItem("userToken");
			// console.log("Registered...", token2);
			// setUserToken(token);
			// setInitialRoute("Main");
		} catch (error) {
			await AsyncStorage.removeItem("userEmail");
			console.error("Registration failed:", error);
			throw error;
		}
	};

	const verifyRegistrationCode = async (email, code) => {
		try {
			const response = await api.post("/user/verify-registration-code", {
				email: email,
				code: code,
			});
			if (response.data == false) {
				throw error;
			}
		} catch (error) {
			console.error("Verify Registration Code Failed:", error);
			throw error;
		}
	};

	const sendNewRegistrationCode = async (email) => {
		try {
			console.log("Sending new registration code to:", email);
			const url = `/user/send-new-registration-code?email=${encodeURIComponent(
				email
			)}`;
			const response = await api.post(url);
		} catch (error) {
			console.error("Send New Registration Code Failed:", error);
			throw error;
		}
	};

	if (loading) {
		return null;
	}

	const logout = async () => {
		try {
			var token = await AsyncStorage.getItem("userToken");
			console.log("Logging out...", token);
			await AsyncStorage.removeItem("userToken");
			setUserToken(null);

			token = await AsyncStorage.getItem("userToken");
			console.log("Done logging out...", token);
			setInitialRoute("Login");
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated: !!userToken,
				initialRoute,
				login,
				register,
				verifyRegistrationCode,
				sendNewRegistrationCode,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
