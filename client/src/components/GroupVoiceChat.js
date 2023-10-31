import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSound } from "use-sound";
import ErrorModal from "./ErrorsModal";
import joinSound from "../assets/sounds/discord-join.mp3";
import leaveSound from "../assets/sounds/discord-leave.mp3";

function GroupVoiceChat(props) {
	const { socket } = props;
	const channelType = "voice";
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const { channelId, channelName, serverId, name } = useParams();
	const [playJoinSound] = useSound(joinSound, { volume: 0.04 });
	const [playLeaveSound] = useSound(leaveSound, { volume: 0.04 });
	const navigate = useNavigate();
	const peerConnection = new RTCPeerConnection();

	useEffect(() => {
		const fetchChannel = async () => {
			fetch("/channelcheck", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-access-token": localStorage.getItem("token"),
				},
				body: JSON.stringify({
					channelId,
					channelName,
					serverId,
					name,
					channelType,
				}),
			})
				.then((response) => {
					if (response.ok) {
						return response.json();
					} else {
						throw new Error("Error fetching channel check request");
					}
				})
				.then((data) => {
					if (data.success) {
						navigator.mediaDevices
							.getUserMedia({ video: false, audio: true })
							.then((stream) => {
								// Add the stream to the local peer connection
								stream
									.getTracks()
									.forEach((track) =>
										peerConnection.addTrack(track, stream),
									);
								console.log(stream.id);

								socket.emit("join group voice chat", {
									serverId,
									channelId,
									channelName,
									name,
									channelType,
									stream: stream.id,
								});
							})
							.catch((error) =>
								console.error("Error accessing media devices:", error),
							);
					} else {
						setErrors(...data.errors);
						setShowModal(true);
					}
				})
				.catch((error) => {
					setErrors(["Error sending channel check fetch"]);
					setShowModal(true);
				});
		}; // fetchChannel()
		if (socket) {
			fetchChannel();
			socket.on("joined group voice chat", () => {
				playJoinSound();
			});
			// set up receive message listener
			socket.on("where are you?", () => {
				fetchChannel();
				socket.emit("join server", serverId);
			});
			socket.on("left group voice chat", (display) => {
				playLeaveSound();
			});

			// Handle New Stream from Backend
			socket.on("new stream", (incomingStream) => {
				console.log(incomingStream);
				// Add the incoming stream to the peer connection
				/*incomingStream
					.getTracks()
					.forEach((track) =>
						peerConnection.addTrack(track, incomingStream),
					);
				*/
				// Render the incoming stream, e.g., display it in a video element
				// renderIncomingStream(incomingStream);
			});
		}
		return () => {
			if (socket) {
				// Remove event listeners off component unmount
				socket.off("where are you?");
			}
		};
	}, [socket, channelId, channelName, serverId, name]);

	// Black background;
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
			<div
				style={{
					width: "100vw",
					height: "100vh",
					margin: "-10px",
					backgroundColor: "black",
				}}
			></div>
		</>
	);
}

export default GroupVoiceChat;
