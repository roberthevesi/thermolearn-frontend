// WifiInstructionsScreen.js
import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Image,
} from "react-native";
import { useState } from "react";
import { useEffect } from "react";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import WifiDemoImage from "../../assets/wifidemo.png";

const WiFiInstructionsScreen = () => {
	const screenWidth = Dimensions.get("window").width;
	const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const imageUri = Image.resolveAssetSource(WifiDemoImage).uri;
		Image.getSize(imageUri, (width, height) => {
			const aspectRatio = width / height;
			const imageWidth = screenWidth * 0.8;
			const imageHeight = imageWidth / aspectRatio;
			setImageSize({ width: imageWidth, height: imageHeight });
		});
	}, []);

	const navigation = useNavigation();

	const handleConfirmConnection = () => {
		navigation.navigate("WiFi Credentials");
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<Image
				source={WifiDemoImage}
				style={{
					width: imageSize.width,
					height: imageSize.height,
					marginBottom: 20,
				}}
				resizeMode="contain"
			/>
			<Text style={styles.message}>
				To connect the thermostat to the local WiFi network, please go
				to your WiFi Settings and select the network "Thermolearn WiFi
				Network" and come back here.
			</Text>
			<TouchableOpacity
				style={styles.confirmButton}
				onPress={handleConfirmConnection}
			>
				<Text style={styles.confirmButtonText}>Confirm Connection</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "green",
		flex: 1,
		backgroundColor: "white",
		padding: 20,
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	closeButton: {
		position: "absolute",
		top: 40,
		right: 20,
		zIndex: 1,
	},
	message: {
		marginBottom: 40,
		textAlign: "center",
		fontSize: 18,
		color: "#333",
		paddingHorizontal: 20,
	},
	confirmButton: {
		backgroundColor: "tomato",
		paddingVertical: 15,
		paddingHorizontal: 30,
		borderRadius: 5,
	},
	confirmButtonText: {
		color: "white",
		fontSize: 18,
	},
	demoImage: {
		width: "80%",
		height: "10%",
		// aspectRatio: 1,
	},
});

export default WiFiInstructionsScreen;
