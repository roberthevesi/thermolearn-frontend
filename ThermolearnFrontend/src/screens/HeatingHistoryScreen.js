import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	StatusBar,
	ScrollView,
	Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api";

const HeatingHistoryScreen = () => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const userToken = await AsyncStorage.getItem("userToken");
				const thermostatId = await AsyncStorage.getItem("thermostatId");
				const userId = await AsyncStorage.getItem("userId");

				console.log("userToken: ", userToken);
				console.log("thermostatId: ", thermostatId);
				console.log("userId: ", userId);

				if (userToken && thermostatId && userId) {
					console.log("Fetching data...");
					const response = await api.get(
						"/thermostat-log/get-thermostat-status-logs",
						{
							params: {
								thermostatId,
								userId,
							},
							headers: {
								Authorization: `Bearer ${userToken}`,
							},
						}
					);

					console.log("Fetched data  :", response.data);
					setData(response.data);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const formatDataForChart = (data, key) => {
		const formattedLabels = data.map((entry) => {
			const date = new Date(entry.timestamp);
			return `${("0" + date.getDate()).slice(-2)}-${(
				"0" +
				(date.getMonth() + 1)
			).slice(-2)} ${("0" + date.getHours()).slice(-2)}:${(
				"0" + date.getMinutes()
			).slice(-2)}`;
		});

		const dataset = data.map((entry) => entry[key]);

		return {
			labels: formattedLabels,
			datasets: [
				{
					data: dataset,
					color: () => {
						if (key === "temperature") return "red";
						if (key === "humidity") return "blue";
						if (key === "status") return "green";
					},
					strokeWidth: 2,
				},
			],
			legend: [key.charAt(0).toUpperCase() + key.slice(1)],
		};
	};

	const chartConfig = {
		backgroundColor: "#e26a00",
		backgroundGradientFrom: "#fb8c00",
		backgroundGradientTo: "#ffa726",
		decimalPlaces: 2, // optional, defaults to 2dp
		color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
		labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
		style: {
			borderRadius: 16,
		},
		propsForDots: {
			r: "6",
			strokeWidth: "2",
			stroke: "#ffa726",
		},
	};

	const adjustLabels = (labels) => {
		const totalLabels = labels.length;
		const maxLabels = 14; // Maximum number of labels to display
		const interval = Math.ceil(totalLabels / maxLabels);

		return labels.map((label, index) =>
			index % interval === 0 ? label : ""
		);
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<Text>Loading...</Text>
			</View>
		);
	}

	const chartWidth = data.length * 30;

	return (
		<>
			<StatusBar
				animated={true}
				backgroundColor="#61dafb"
				barStyle={"dark-content"}
			/>
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.scrollContent}
			>
				<Text style={styles.subHeader}>Temperature (°C)</Text>
				<ScrollView horizontal>
					<View style={styles.chart}>
						<LineChart
							data={{
								...formatDataForChart(data, "temperature"),
								labels: adjustLabels(
									formatDataForChart(data, "temperature")
										.labels
								),
							}}
							width={Math.max(
								Dimensions.get("window").width,
								chartWidth
							)}
							height={220}
							chartConfig={chartConfig}
							bezier
							style={{
								marginVertical: 8,
								borderRadius: 16,
							}}
						/>
					</View>
				</ScrollView>

				<Text style={styles.subHeader}>Humidity (%)</Text>
				<ScrollView horizontal>
					<View style={styles.chart}>
						<LineChart
							data={{
								...formatDataForChart(data, "humidity"),
								labels: adjustLabels(
									formatDataForChart(data, "humidity").labels
								),
							}}
							width={Math.max(
								Dimensions.get("window").width,
								chartWidth
							)}
							height={220}
							chartConfig={chartConfig}
							bezier
							style={{
								marginVertical: 8,
								borderRadius: 16,
							}}
						/>
					</View>
				</ScrollView>

				<Text style={styles.subHeader}>Status (ON/OFF)</Text>
				<ScrollView horizontal>
					<View style={styles.chart}>
						<LineChart
							data={{
								...formatDataForChart(
									data.map((entry) => ({
										...entry,
										status: entry.status === "ON" ? 1 : 0,
									})),
									"status"
								),
								labels: adjustLabels(
									formatDataForChart(
										data.map((entry) => ({
											...entry,
											status:
												entry.status === "ON" ? 1 : 0,
										})),
										"status"
									).labels
								),
							}}
							width={Math.max(
								Dimensions.get("window").width,
								chartWidth
							)}
							height={220}
							chartConfig={chartConfig}
							bezier
							style={{
								marginVertical: 8,
								borderRadius: 16,
							}}
						/>
					</View>
				</ScrollView>
			</ScrollView>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		paddingLeft: 20,
		paddingRight: 20,
	},
	chartContainer: {
		width: Dimensions.get("window").width * 3,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
		marginVertical: 10,
	},
	subHeader: {
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
		marginVertical: 10,
	},
	chart: {
		marginBottom: 20,
	},
});

export default HeatingHistoryScreen;
