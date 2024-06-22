// BottomNavigationBar.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const BottomNavigationBar = ({ state, descriptors, navigation }) => {
	return (
		<View
			style={{
				flexDirection: "row",
				justifyContent: "space-around",
				padding: 10,
			}}
		>
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key];
				const isFocused = state.index === index;

				const onPress = () => {
					const event = navigation.emit({
						type: "tabPress",
						target: route.key,
						canPreventDefault: true,
					});

					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name);
					}
				};

				return (
					<TouchableOpacity
						key={index}
						onPress={onPress}
						style={{ flex: 1, alignItems: "center", padding: 10 }}
					>
						<Text style={{ color: isFocused ? "#673ab7" : "#222" }}>
							{options.title || route.name}
						</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

export default BottomNavigationBar;
