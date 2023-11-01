import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSound } from "use-sound";
import ErrorModal from "./ErrorsModal";
import joinSound from "../assets/sounds/discord-join.mp3";
import leaveSound from "../assets/sounds/discord-leave.mp3";
import Peer from "simple-peer";
import styled from "styled-components";
import { BsSignDeadEnd } from "react-icons/bs";

const Container = styled.div`
	padding: 20px;
	display: flex;
	height: 100vh;
	width: 90%;
	margin: auto;
	flex-wrap: wrap;
`;

const StyledVideo = styled.video`
	height: 40%;
	width: 50%;
`;

const Video = (props) => {
	const ref = useRef();

	useEffect(() => {
		ref.current.srcObject = props.peer.streams[0];
	}, []);

	return (
		<StyledVideo
			playsInline
			autoPlay
			ref={ref}
		/>
	);
};

const videoConstraints = {
	height: "50%",
	width: "50%",
};

function GroupVoiceChat(props) {
	const { socket } = props;
	const channelType = "voice";
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const { channelId, channelName, serverId, name } = useParams();
	const [playJoinSound] = useSound(joinSound, { volume: 0.04 });
	const [playLeaveSound] = useSound(leaveSound, { volume: 0.04 });
	const navigate = useNavigate();
	const [roomId, setRoomId] = useState("");
	const [peers, setPeers] = useState([]);
	const userVideo = useRef();
	const peersRef = useRef([]);
	const [stream, setStream] = useState("");

	function createPeer(userToSignal, callerId, stream) {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream,
		});

		peer.on("signal", (signal) => {
			socket.emit("sending signal", { userToSignal, callerId, signal });
		});
		peer.on("stream", (stream) => {
			console.log("Stream received from user:", userToSignal);
		});

		return peer;
	}
	function addPeer(incomingSignal, callerId, stream) {
		console.log("called me", callerId);
		console.log(stream);
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream,
		});
		peer.on("signal", (signal) => {
			socket.emit("returning signal", { signal, callerId });
		});

		peer.signal(incomingSignal);
		return peer;
	}

	useEffect(() => {
		const fetchChannel = async () => {
			console.log("fetched");
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
			socket.on("joined group voice chat", () => {
				playJoinSound();
			});
			// set up receive message listener
			socket.on("where are you?", () => {
				fetchChannel();
				socket.emit("join server", serverId);
			});
			socket.on("left group voice chat", (socketid) => {
				console.log(socketid);
				playLeaveSound();
			});
			socket.on("all users", (userIds) => {
				console.log(userIds);
				const peers = [];
				const peersRefs = [];
				userIds.forEach((userId) => {
					const peer = createPeer(userId, socket.id, stream);
					peersRefs.push({
						peerId: userId,
						peer,
					});
					peers.push(peer);
				});
				peersRef.current = [...peersRefs];
				setPeers(peers);
			});
			socket.on("user joined", (payload) => {
				// Check if the peer with the newUserId already exists
				const existingPeer = peersRef.current.find(
					(peer) => peer.peerId === payload.callerId,
				);
				console.log(existingPeer);
				if (!existingPeer) {
					console.log("hello");
					const peer = addPeer(payload.signal, payload.callerId, stream);
					peersRef.current.push({
						peerId: payload.callerId,
						peer,
					});
					setPeers((users) => [...users, peer]);
				}
			});
			socket.on("receiving returned signal", (payload) => {
				const item = peersRef.current.find((p) => p.peerId === payload.id);
				if (item) {
					item.peer.signal(payload.signal);
				}
			});
		}
		return () => {
			if (socket) {
				// Remove event listeners off component unmount
				socket.off("where are you?");
				socket.off("all users");
				socket.off("user joined");
			}
		};
	}, [socket, channelId, channelName, serverId, name]);

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({ video: videoConstraints, audio: true })
			.then((stream) => {
				setStream(stream);
				userVideo.current.srcObject = stream;
			});
	}, [roomId]);

	useEffect(() => {
		console.log(peersRef.current);
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
			<div
				style={{
					width: "100vw",
					height: "100vh",
					margin: "-10px",
					backgroundColor: "black",
				}}
			>
				<Container>
					<StyledVideo
						muted
						ref={userVideo}
						autoPlay
						playsInline
					/>
					{peers.map((peer, index) => {
						return (
							<Video
								key={index}
								peer={peer}
							/>
						);
					})}
				</Container>
			</div>
		</>
	);
}

export default GroupVoiceChat;
