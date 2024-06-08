import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	Modal,
	Button,
	Alert,
} from "react-native";
import CheckBox from "expo-checkbox";
import RNPickerSelect from "react-native-picker-select";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DAYS_OF_WEEK = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

const ScheduleScreen = ({ navigation }) => {
	const [schedule, setSchedule] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedDays, setSelectedDays] = useState([]);
	const [time, setTime] = useState(new Date());
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [tempValue, setTempValue] = useState(21);
	const [dayOption, setDayOption] = useState("custom");
	const [thermostatId, setThermostatId] = useState(null);
	const [userId, setUserID] = useState(null);

	useEffect(() => {
		const fetchUserId = async () => {
			try {
				const id = await AsyncStorage.getItem("userId");
				console.log("Fetched user ID:", id);
				setUserID(id);
			} catch (error) {
				console.error("Error fetching user ID:", error);
			}
		};
		fetchUserId();
	}, []);

	useEffect(() => {
		const fetchThermostatId = async () => {
			try {
				const id = await AsyncStorage.getItem("thermostatId");
				console.log("Fetched thermostat ID:", id);
				setThermostatId(id);
			} catch (error) {
				console.error("Error fetching thermostat ID:", error);
			}
		};
		fetchThermostatId();
	}, []);

	useEffect(() => {
		if (thermostatId) {
			console.log("Thermostat ID available, fetching schedules");
			fetchSchedules();
		} else {
			console.log("Thermostat ID is null, not fetching schedules");
			setSchedule([]);
		}
	}, [thermostatId]);

	const fetchSchedules = async () => {
		if (!thermostatId) return;
		try {
			const token = await AsyncStorage.getItem("userToken");
			if (!token) {
				throw new Error("User token is missing");
			}

			const response = await api.get(`/thermostat/get-schedule`, {
				params: {
					userId,
					thermostatId,
				},
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const schedules = response.data.map((item) => ({
				id: item.id,
				day: item.day.charAt(0) + item.day.slice(1).toLowerCase(), // "MONDAY" to "Monday"
				time: item.startTime ? item.startTime.substring(0, 5) : "00:00", // null values
				desiredTemperature: item.desiredTemperature,
				sync: true,
			}));
			setSchedule(schedules);
		} catch (error) {
			console.error("Error fetching schedules:", error);
		}
	};

	const handleAddEntry = async () => {
		const formattedTime = time.toTimeString().split(" ")[0].substring(0, 5); // HH:mm
		const newEntries = selectedDays.map((day) => ({
			id: null,
			day,
			time: formattedTime,
			desiredTemperature: tempValue,
			sync: false,
		}));

		try {
			const token = await AsyncStorage.getItem("userToken");
			await Promise.all(
				newEntries.map((entry) =>
					api.post(
						"/thermostat/add-schedule",
						{
							userId,
							thermostatId,
							day: entry.day.toUpperCase(),
							time: entry.time + ":00", // HH:mm:ss
							desiredTemperature: entry.desiredTemperature,
						},
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					)
				)
			);

			setSchedule((prevSchedule) =>
				[
					...prevSchedule,
					...newEntries.map((entry) => ({ ...entry, sync: true })),
				].sort((a, b) => {
					if (a.day === b.day) {
						return a.time.localeCompare(b.time);
					}
					return (
						DAYS_OF_WEEK.indexOf(a.day) -
						DAYS_OF_WEEK.indexOf(b.day)
					);
				})
			);
			alert("Entry added successfully.");
		} catch (error) {
			console.error("Error adding schedule:", error);
			alert("Failed to add schedule. Please try again.");
		}

		setModalVisible(false);
		resetModal();
	};

	const handleDeleteEntry = async (entry) => {
		Alert.alert(
			"Delete Entry",
			"Are you sure you want to delete this entry?",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							const token = await AsyncStorage.getItem(
								"userToken"
							);
							await api.delete("/thermostat/delete-schedule", {
								headers: {
									Authorization: `Bearer ${token}`,
								},
								data: {
									userId,
									thermostatId,
									day: entry.day.toUpperCase(),
									time: entry.time + ":00", // HH:mm:ss
									desiredTemperature:
										entry.desiredTemperature,
								},
							});
							setSchedule((prevSchedule) =>
								prevSchedule.filter(
									(item) => item.id !== entry.id
								)
							);
							alert("Entry deleted successfully.");
						} catch (error) {
							console.error("Error deleting schedule:", error);
							alert(
								"Failed to delete schedule. Please try again."
							);
						}
					},
				},
			]
		);
	};

	const resetModal = () => {
		setSelectedDays([]);
		setTime(new Date());
		setTempValue(21);
	};

	const toggleDaySelection = (day) => {
		setSelectedDays((prevSelectedDays) =>
			prevSelectedDays.includes(day)
				? prevSelectedDays.filter((d) => d !== day)
				: [...prevSelectedDays, day]
		);
	};

	const handleDayOptionChange = (option) => {
		switch (option) {
			case "weekdays":
				setSelectedDays([
					"Monday",
					"Tuesday",
					"Wednesday",
					"Thursday",
					"Friday",
				]);
				break;
			case "weekends":
				setSelectedDays(["Saturday", "Sunday"]);
				break;
			case "everyday":
				setSelectedDays(DAYS_OF_WEEK);
				break;
			case "custom":
			default:
				setSelectedDays([]);
				break;
		}
		setDayOption(option);
	};

	const roundToNearest5Minutes = (date) => {
		const coeff = 1000 * 60 * 5;
		return new Date(Math.round(date.getTime() / coeff) * coeff);
	};

	return (
		<View style={styles.container}>
			<Button title="Add Entry" onPress={() => setModalVisible(true)} />
			<ScrollView>
				{DAYS_OF_WEEK.map((day) => (
					<View key={day}>
						<Text style={styles.dayTitle}>{day}</Text>
						{schedule
							.filter((entry) => entry.day === day)
							.map((entry, index) => (
								<View key={index} style={styles.entry}>
									<Text>
										{entry.time} -{" "}
										{entry.desiredTemperature}°C
									</Text>
									<Button
										title="Delete"
										color="red"
										onPress={() => handleDeleteEntry(entry)}
									/>
								</View>
							))}
					</View>
				))}
			</ScrollView>

			<Modal
				visible={modalVisible}
				animationType="fade"
				transparent={true}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>
							Add Schedule Entry
						</Text>
						<Text>Select Days:</Text>
						<RNPickerSelect
							onValueChange={(value) =>
								handleDayOptionChange(value)
							}
							items={[
								{ label: "Weekdays", value: "weekdays" },
								{ label: "Weekends", value: "weekends" },
								{ label: "Everyday", value: "everyday" },
								{ label: "Custom", value: "custom" },
							]}
							style={pickerSelectStyles}
							value={dayOption}
						/>
						{dayOption === "custom" && (
							<View style={styles.customDaysContainer}>
								{DAYS_OF_WEEK.map((day) => (
									<View
										key={day}
										style={styles.checkboxContainer}
									>
										<CheckBox
											value={selectedDays.includes(day)}
											onValueChange={() =>
												toggleDaySelection(day)
											}
										/>
										<Text style={styles.checkboxLabel}>
											{day}
										</Text>
									</View>
								))}
							</View>
						)}
						<Text>Time:</Text>
						<TouchableOpacity
							onPress={() => setShowTimePicker(true)}
							style={styles.input}
						>
							<Text>
								{time.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
									hour12: false, // 24-hour format
								})}
							</Text>
						</TouchableOpacity>
						<Modal
							visible={showTimePicker}
							animationType="fade"
							transparent={true}
						>
							<View style={styles.modalContainer}>
								<View style={styles.modalContent}>
									<DateTimePicker
										value={time}
										mode="time"
										display="spinner"
										minuteInterval={5}
										onChange={(event, selectedTime) => {
											if (selectedTime) {
												setTime(
													roundToNearest5Minutes(
														selectedTime
													)
												);
											}
										}}
									/>
									<Button
										title="Done"
										onPress={() => setShowTimePicker(false)}
									/>
								</View>
							</View>
						</Modal>
						<Text>Desired Temperature:</Text>
						<View style={styles.sliderContainer}>
							<Text>{tempValue}°C</Text>
							<Slider
								style={styles.slider}
								minimumValue={14}
								maximumValue={28}
								step={0.5}
								value={tempValue}
								onValueChange={(value) => setTempValue(value)}
							/>
						</View>
						<View style={styles.buttonContainer}>
							<TouchableOpacity
								style={styles.button}
								onPress={handleAddEntry}
							>
								<Text style={styles.buttonText}>Add</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.button}
								onPress={() => {
									setModalVisible(false);
									resetModal();
								}}
							>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		fontSize: 16,
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: "gray",
		borderRadius: 4,
		color: "black",
		paddingRight: 30,
		marginBottom: 10,
		width: "100%",
	},
	inputAndroid: {
		fontSize: 16,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderWidth: 0.5,
		borderColor: "purple",
		borderRadius: 8,
		color: "black",
		paddingRight: 30,
		marginBottom: 10,
		width: "100%",
	},
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
	},
	dayTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 10,
		marginLeft: 10,
	},
	entry: {
		padding: 10,
		backgroundColor: "#f0f0f0",
		marginVertical: 5,
		marginHorizontal: 10,
		borderRadius: 5,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalContent: {
		width: 300,
		padding: 20,
		backgroundColor: "#fff",
		borderRadius: 10,
		alignItems: "center",
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
	},
	input: {
		width: "100%",
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 10,
		marginVertical: 10,
		textAlign: "center",
		borderRadius: 5,
	},
	checkboxContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 5,
	},
	checkboxLabel: {
		marginLeft: 8,
	},
	customDaysContainer: {
		marginVertical: 10,
	},
	sliderContainer: {
		width: "100%",
		alignItems: "center",
	},
	slider: {
		width: "100%",
		height: 40,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		marginTop: 20,
	},
	button: {
		flex: 1,
		padding: 10,
		backgroundColor: "#007BFF",
		borderRadius: 5,
		alignItems: "center",
		marginHorizontal: 5,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
	},
});

export default ScheduleScreen;
