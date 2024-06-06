import axios from "axios";

const api = axios.create({
	// baseURL: "http://localhost:8080/api/v1",
	baseURL: "http://3.75.188.235:8080/api/v1",
	headers: {
		"Content-Type": "application/json",
	},
});

export default api;
