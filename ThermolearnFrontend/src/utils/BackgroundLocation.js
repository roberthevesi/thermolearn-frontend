// src/utils/backgroundLocation.js

import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import api from "./api";

const LOCATION_TASK_NAME = "BACKGROUND_LOCATION_TASK";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
	if (error) {
		console.error(error);
		return;
	}
	if (data) {
		const { locations } = data;
		const location = locations[0];
		const currentLocation = {
			latitude: location.coords.latitude,
			longitude: location.coords.longitude,
		};

		const homeLatitude = await AsyncStorage.getItem("homeLatitude");
		const homeLongitude = await AsyncStorage.getItem("homeLongitude");

		if (homeLatitude && homeLongitude) {
			const homeLocation = {
				latitude: parseFloat(homeLatitude),
				longitude: parseFloat(homeLongitude),
			};

			const distance = getDistanceFromLatLonInM(
				currentLocation.latitude,
				currentLocation.longitude,
				homeLocation.latitude,
				homeLocation.longitude
			);

			const isAtHome = await AsyncStorage.getItem("isAtHome");

			if (distance > 25 && isAtHome === "true") {
				await AsyncStorage.setItem("isAtHome", "false");
				logEvent("OUT");
			} else if (distance <= 25 && isAtHome === "false") {
				await AsyncStorage.setItem("isAtHome", "true");
				logEvent("IN");
			}
		}
	}
});

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

const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
	const R = 6371; // radius of the earth in km
	const dLat = deg2rad(lat2 - lat1);
	const dLon = deg2rad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) *
			Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c * 1000; // distance in meters
	return d;
};

const deg2rad = (deg) => {
	return deg * (Math.PI / 180);
};
