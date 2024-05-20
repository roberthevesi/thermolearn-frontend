// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api"; // Assuming you have an API utility for backend calls
import { jwtDecode } from "jwt-decode";
import { decode as base64Decode } from "base-64";
import { Alert } from "react-native";

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

	if (typeof atob === "undefined") {
		global.atob = (base64) => base64Decode(base64);
	}

	const checkToken = async () => {
		try {
			console.log("Checking token...");
			const token = await AsyncStorage.getItem("userToken");
			if (token) {
				console.log("Token found:", token);

				const decodedToken = jwtDecode(token);

				const currentTime = Date.now() / 1000; // convert to sec
				if (decodedToken.exp && decodedToken.exp > currentTime) {
					console.log("Token is valid");
					setUserToken(token);
					setInitialRoute("Main");
				} else {
					console.log("Token has expired");
					await AsyncStorage.removeItem("userToken");
					Alert.alert(
						"Session Expired",
						"Your session has expired. Please log in again.",
						[
							{
								text: "OK",
								onPress: () => setInitialRoute("Login"),
							},
						]
					);
				}
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
				console.log("Logging in with token:", token);
				await AsyncStorage.setItem("userToken", token);
				var userId = response.data.user.id.toString();
				// console.log("User ID:", userId);
				setUserToken(token);
				return true;
			} else {
				await AsyncStorage.setItem("userEmail", email);
				sendNewRegistrationCode(email);

				return false;
			}

			console.log(response.data.user);
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
		} catch (error) {
			await AsyncStorage.removeItem("userEmail");
			console.error("Registration failed:", error);
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

	const sendForgottenPasswordCode = async (email) => {
		try {
			console.log("Sending forgot password code to:", email);
			const url = `/user/send-forgotten-password-code?email=${encodeURIComponent(
				email
			)}`;
			const response = await api.post(url);
			await AsyncStorage.setItem("userEmail", email);
		} catch (error) {
			await AsyncStorage.removeItem("userEmail");
			console.error("Send forgot password code Failed:", error);
			throw error;
		}
	};

	const verifyForgottenPasswordCode = async (email, code) => {
		try {
			console.log("Verifying forgot password code for:", email);
			const response = await api.post(
				"/user/verify-forgotten-password-code",
				{
					email: email,
					code: code,
				}
			);

			if (response.data == false) {
				return false;
			}
			return true;
		} catch (error) {
			await AsyncStorage.removeItem("userEmail");
			console.error("Verify forgot password Code Failed:", error);
			throw error;
		}
	};

	const resetPassword = async (email, password) => {
		try {
			console.log("Resetting password for:", email);
			const response = await api.post("/user/reset-forgotten-password", {
				email: email,
				password: password,
			});
		} catch (error) {
			await AsyncStorage.removeItem("userEmail");
			console.error("Reset password Failed:", error);
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
				sendNewRegistrationCode,
				verifyRegistrationCode,
				sendForgottenPasswordCode,
				verifyForgottenPasswordCode,
				resetPassword,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
