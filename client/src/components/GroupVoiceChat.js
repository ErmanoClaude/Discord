import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSound } from "use-sound";
import ErrorModal from "./ErrorsModal";
import joinSound from "../assets/sounds/discord-join.mp3";
import leaveSound from "../assets/sounds/discord-leave.mp3";

function GroupVoiceChat(props) {
	const { socket, stream, myPeer, peers, setPeers } = props;
	const channelType = "voice";
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const { channelId, channelName, serverId, name } = useParams();
	const [playJoinSound] = useSound(joinSound, { volume: 0.04 });
	const [playLeaveSound] = useSound(leaveSound, { volume: 0.04 });
	const navigate = useNavigate();
	const [roomId, setRoomId] = useState("");

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
						if (roomId !== `voiceroom-${serverId}-${channelId}`) {
							setRoomId((prev) => `voiceroom-${serverId}-${channelId}`);
						}

						socket.emit("join group voice chat", {
							serverId,
							channelId,
							channelName,
							name,
							channelType,
						});
					} else {
						setErrors(...data.errors);
						setShowModal(true);
					}
				})
				.catch((error) => {
					console.log(error);
					setErrors(["Error sending channel check fetch"]);
					setShowModal(true);
				});
		}; // fetchChannel()
		if (socket) {
			fetchChannel();
			const videoElement = document.getElementById("video");
			if (videoElement && stream) {
				videoElement.srcObject = stream;
			}
			socket.on("joined group voice chat", () => {
				playJoinSound();
			});
			// set up receive message listener
			socket.on("where are you?", () => {
				fetchChannel();
				socket.emit("join server", serverId);
			});
			socket.on("left group voice chat", (socketId) => {
				playLeaveSound();
			});
			socket.on("user joined", (payload) => {});
		}
		return () => {
			if (socket) {
				// Remove event listeners off component unmount
				socket.off("where are you?");

				socket.off("user joined");
			}
		};
	}, [socket, channelId, channelName, serverId, name, stream]);

	useEffect(() => {
		console.log("this is my peer", myPeer);
		console.log("this is my peers", peers);
		console.log("this is my peres keys", Object.keys(peers));

		for (const peerId in peers) {
			const peer = peers[peerId];
			const videoElement = document.getElementById(`video-${peerId}`);

			if (videoElement && peer.remoteStream) {
				videoElement.srcObject = peer.remoteStream;
			}
		}
	}, [peers]);

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
			<div className='black-container'>
				<video
					id='video'
					autoPlay
					playsInline
					muted
				/>
				{/* Render video elements for remote streams */}
				{Object.keys(peers).map((peerId) => (
					<video
						key={peerId}
						id={`video-${peerId}`}
						autoPlay
						playsInline
					/>
				))}
			</div>
		</>
	);
}

export default GroupVoiceChat;
