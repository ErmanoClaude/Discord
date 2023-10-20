import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ErrorModal from "../components/ErrorsModal";
import "./pagesCSS/server.css";

function Server(props) {
	const { socket } = props;
	const { serverId, name } = useParams();
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const navigate = useNavigate();

	const fetchServer = async () => {
		fetch(`/member/${serverId}`, {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				if (data.success) {
				} else {
					setErrors(data.errors);
					setShowModal(true);
				}
			})
			.catch((error) => {
				// Handle any errors that occurred during the fetch
				console.error("Fetch error:", error);
			});
	};

	useEffect(() => {
		fetchServer();
		if (socket) {
			socket.emit("join server", serverId);
		}
	}, [socket, serverId, name]);
	return (
		<>
			<ErrorModal
				show={showModal}
				errors={errors}
				handleClose={() => {
					setShowModal(false);
					navigate("/");
				}}
			/>
			<h1>Server Content</h1>
		</>
	);
}

export default Server;
