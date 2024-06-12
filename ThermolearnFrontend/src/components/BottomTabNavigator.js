import React from "react";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import WiFiScreen from "../screens/WiFiScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ color, size }) => {
					let iconName;

					if (route.name === "Home") {
						iconName = "home";
					} else if (route.name === "WiFiScreen") {
						iconName = "wifi";
					} else if (route.name === "Settings") {
						iconName = "settings";
					}

					return (
						<MaterialIcons
							name={iconName}
							size={size}
							color={color}
						/>
					);
				},
				tabBarActiveTintColor: "tomato",
				tabBarInactiveTintColor: "gray",
				tabBarStyle: [
					{
						display: "flex",
					},
					null,
				],
			})}
		>
			<Tab.Screen
				name="Home"
				component={HomeScreen}
				options={{ headerShown: false }}
			/>
			<Tab.Screen name="WiFi Screen" component={WiFiScreen} />
			<Tab.Screen name="Settings" component={SettingsScreen} />
		</Tab.Navigator>
	);
};

export default BottomTabNavigator;
