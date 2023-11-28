import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSound } from "use-sound";
import ErrorModal from "./ErrorsModal";
import joinSound from "../assets/sounds/discord-join.mp3";
import leaveSound from "../assets/sounds/discord-leave.mp3";

import OwlCarousel from "react-owl-carousel";
import "../../node_modules/owl.carousel/dist/assets/owl.carousel.css";
import "../../node_modules/owl.carousel/dist/assets/owl.theme.default.css";
import { Stack } from "react-bootstrap";

//icons
import { HiPhoneXMark } from "react-icons/hi2";
import { FaMicrophone } from "react-icons/fa6";
import { FaMicrophoneSlash } from "react-icons/fa6";
import { HiVideoCamera } from "react-icons/hi2";
import { HiVideoCameraSlash } from "react-icons/hi2";

function GroupVoiceChat(props) {
	const {
		socket,
		stream,
		myPeer,
		peers,
		audioTrack,
		setAudioTrack,
		videoTrack,
		setVideoTrack,
	} = props;
	const channelType = "voice";
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const API_URL = process.env.REACT_APP_API_URL;
	const { channelId, channelName, serverId, name } = useParams();
	const [playJoinSound] = useSound(joinSound, { volume: 0.04 });
	const [playLeaveSound] = useSound(leaveSound, { volume: 0.04 });
	const navigate = useNavigate();
	const carouselRef = useRef(null);
	const currentSlideRef = useRef(null);
	const [roomId, setRoomId] = useState("");
	const [audio, setAudio] = useState(true);
	const [videoCam, setVideoCam] = useState(true);

	const handleClick = (slide) => {
		carouselRef.current.to(slide, 300);
	};

	const handleVideoClick = (event) => {
		event.preventDefault();
	};

	const handleChanged = (event) => {
		currentSlideRef.current = event.item.index;
	};

	const hangUpCall = () => {
		Object.keys(peers).forEach((peer) => {
			peers[peer].close();
			console.log(peers[peer]);
		});

		socket.emit("hang up");
		navigate("../");
	};

	const changeMic = () => {
		setAudioTrack((prev) => {
			prev.enabled = !prev.enabled;
			setAudio(prev.enabled);
			return prev;
		});
	};
	const changeVideo = () => {
		setVideoTrack((prev) => {
			prev.enabled = !prev.enabled;
			setVideoCam(prev.enabled);
			return prev;
		});
	};
	useEffect(() => {
		const fetchChannel = async () => {
			fetch(API_URL + "/channelcheck", {
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

			// set your stream on the screen

			const videoElements = document.getElementsByClassName("my-video");

			if (stream) {
				for (const videoElement of videoElements) {
					videoElement.srcObject = stream;
				}
				setAudio(audioTrack.enabled);
				setVideoCam(videoTrack.enabled);
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

		// set your stream on the screen

		const videoElements = document.getElementsByClassName("my-video");

		if (stream) {
			for (const videoElement of videoElements) {
				videoElement.srcObject = stream;
			}
		}

		for (const peerId in peers) {
			const peer = peers[peerId];
			const videoElements = document.getElementsByClassName(
				`video-${peerId}`,
			);

			if (peer.remoteStream) {
				for (const videoElement of videoElements) {
					videoElement.srcObject = peer.remoteStream;
				}
			}
		}

		if (Object.keys(peers).length === 1) {
			carouselRef.current.to(2, 300);
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
				<Stack style={{ width: "100px" }}>
					{/* Render video elements for remote streams */}

					<div>
						<OwlCarousel
							ref={carouselRef}
							key={Object.keys(peers).length}
							id='sync1'
							className='owl-theme'
							items={1}
							dots={false}
							onChanged={handleChanged}
						>
							<div className='item'>
								<video
									className='video top-video my-video'
									autoPlay
									playsInline
									muted
									controls
									disablePictureInPicture
									disableRemotePlayback
									controlsList='noremoteplayback'
									onClick={handleVideoClick}
									style={{
										border: "1px solid grey", // Grey border
									}}
								/>
								<div
									style={{
										position: "absolute",
										top: 10,
										right: 10,
										backgroundColor: "rgba(255, 255, 255, 0.3)",
										color: "black",
										padding: "5px",
										maxWidth: "50%",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										borderRadius: "3px",
									}}
								>
									Me
								</div>
							</div>

							{Object.keys(peers).map((peerId) => {
								return (
									<div
										key={peerId}
										className='item'
									>
										<video
											className={`video top-video video-${peerId}`}
											autoPlay
											playsInline
											controls
											disablePictureInPicture
											disableRemotePlayback
											controlsList='noremoteplayback'
											onClick={handleVideoClick}
											muted
											style={{
												border: "1px solid grey", // Grey border
											}}
										/>
										<div
											style={{
												position: "absolute",
												top: 10,
												right: 10,
												backgroundColor: "rgba(255, 255, 255, 0.3)",
												color: "black",
												padding: "5px",
												maxWidth: "50%",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
												borderRadius: "3px",
											}}
										>
											{peers[peerId].metadata.displayname}
										</div>
									</div>
								);
							})}
						</OwlCarousel>
					</div>

					<div>
						<OwlCarousel
							id='sync2'
							className='owl-theme'
							key={Object.keys(peers).length}
							items={4}
						>
							<div
								className='item'
								onClick={() => handleClick(0)}
							>
								<video
									className='video my-video'
									autoPlay
									playsInline
									muted
									style={{
										border: "1px solid grey", // Grey border
									}}
								/>
								<div
									style={{
										position: "absolute",
										top: 10,
										right: 10,
										backgroundColor: "rgba(255, 255, 255, 0.3)",
										color: "black",
										padding: "5px",
										maxWidth: "50%",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										borderRadius: "3px",
									}}
								>
									Me
								</div>
							</div>

							{Object.keys(peers).map((peerId, index) => {
								return (
									<div
										key={peerId}
										className='item'
										onClick={() => handleClick(index + 1)}
									>
										<video
											className={`video video-${peerId}`}
											autoPlay
											playsInline
											muted
											style={{
												border: "1px solid grey", // Grey border
											}}
										/>
										<div
											style={{
												position: "absolute",
												top: 10,
												right: 10,
												backgroundColor: "rgba(255, 255, 255, 0.3)",
												color: "black",
												padding: "5px",
												maxWidth: "50%",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
												borderRadius: "3px",
											}}
										>
											{peers[peerId].metadata.displayname}
										</div>
									</div>
								);
							})}
						</OwlCarousel>
					</div>
					<Stack
						direction='horizontal'
						style={{ alignSelf: "center" }}
					>
						<div
							className={`control-buttons mx-auto mt-3 call-buttons ${videoTrack.enabled}`}
							onClick={() => changeVideo()}
						>
							{videoCam ? (
								<HiVideoCamera
									size={30}
									style={{ color: "white" }}
								/>
							) : (
								<HiVideoCameraSlash
									size={30}
									style={{ color: "white" }}
								/>
							)}
						</div>
						<div
							className='control-buttons mx-4 mt-3 call-buttons'
							onClick={() => changeMic()}
						>
							{audio ? (
								<FaMicrophone
									size={30}
									style={{ color: "white" }}
								/>
							) : (
								<FaMicrophoneSlash
									size={30}
									style={{ color: "white" }}
								/>
							)}
						</div>
						<div
							className='control-buttons mx-auto mt-3 close-call-button'
							onClick={() => hangUpCall()}
						>
							<HiPhoneXMark
								size={30}
								style={{ color: "white" }}
							/>
						</div>
					</Stack>
				</Stack>
			</div>
		</>
	);
}

export default GroupVoiceChat;
