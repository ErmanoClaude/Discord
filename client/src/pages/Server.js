import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ErrorModal from "../components/ErrorsModal";
import "./pagesCSS/server.css";

function Server(props) {
	const { socket, stream } = props;
	const { serverId, name } = useParams();
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const API_URL = process.env.REACT_APP_API_URL;
	const navigate = useNavigate();

	const fetchServer = async () => {
		fetch(API_URL + `/member/${serverId}`, {
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
			socket.on("where are you?", () => {
				socket.emit("join server", serverId);
			});
		}

		return () => {
			// remove event listener
			if (socket) {
				socket.off("where are you?");
			}
		};
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

			<div className='black-container server-landing'>
				<h1
					style={{ color: "white", textAlign: "center", lineHeight: 1.5 }}
				>
					Welcome
					<br />
					To
					<br />
					<span
						style={{
							maxWidth: "60vw",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							display: "inline-block",
						}}
					>
						{name}
					</span>
				</h1>
			</div>
		</>
	);
}

export default Server;
