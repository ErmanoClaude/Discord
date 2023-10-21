import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Stack } from "react-bootstrap";
import ErrorModal from "./ErrorsModal";
import { BiHash } from "react-icons/bi";

function GroupChat(props) {
	const { socket } = props;
	const { channelId, channelName, serverId, name } = useParams();
	const [showModal, setShowModal] = useState(false);
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [errors, setErrors] = useState([]);
	const navigate = useNavigate();
	let currentDay = null;
	const [displayname, setDisplayname] = useState("");

	// Use useRef to get a reference to the chat-box div
	const chatBoxRef = useRef(null);

	// Gets displayname of user
	const fetchDisplay = async () => {
		fetch("/displayname", {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error("Error getting displayname fetch");
				}
			})
			.then((data) => {
				if (data.success) {
					console.log(data);
					setDisplayname(data.displayname);
				} else {
					setErrors(["Error fetching displayname"]);
					setShowModal(true);
				}
			})
			.catch((error) => {
				setErrors(["Error fetching displayname"]);
				setShowModal(true);
			});
	};

	const sendMessage = async (e) => {
		e.preventDefault();

		if (!newMessage.trim()) {
			// If empty, do not proceed with submitting
			return;
		}

		try {
			let currentTimestamp = new Date();
			const newMessageObj = {
				author: displayname,
				content: newMessage,
				timestamp: currentTimestamp,
			};

			setNewMessage("");
			if (socket) {
				// Emit an event to the server to store the message in the database
				socket.emit("send group message", {
					author: displayname,
					message: newMessageObj,
					channelId: channelId,
				});
			}
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	const renderDateDivider = (day) => {
		return (
			<div
				className='date-divider'
				style={{
					color: "white",
					display: "flex",
					alignItems: "center",
				}}>
				<hr style={{ flexGrow: 1 }} />
				<p style={{ margin: "0 1rem" }}>{day}</p>
				<hr style={{ flexGrow: 1 }} />
			</div>
		);
	};

	const getDate = (timestamp) => {
		return timestamp.toDateString();
	};

	const renderMessage = (message, index) => {
		return (
			<Stack
				direction='horizontal'
				key={index}>
				<p
					className='mx-2'
					style={{ color: "white", alignSelf: "flex-start" }}>
					{message.author}
				</p>
				<p
					className='message'
					style={{ color: "lightgrey" }}>
					{message.content}
				</p>
			</Stack>
		);
	};

	const renderMessages = () => {
		return messages.map((message, index) => {
			const messageDay = getDate(message.timestamp);

			if (messageDay !== currentDay) {
				currentDay = messageDay;

				return (
					<>
						{renderDateDivider(currentDay)}
						{renderMessage(message, index)}
					</>
				);
			}

			return renderMessage(message);
		});
	};

	useEffect(() => {
		// Clear messages in chat-box
		setMessages([]);

		const fetchChannel = async () => {
			let channelType = "text";
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
						socket.emit("join group chat", {
							serverId,
							channelId,
							channelName,
							name,
							channelType,
						});
						const formattedMessages = data.chatLogs.map(
							(message) => ({
								...message,
								timestamp: new Date(message.timestamp),
							}),
						);
						setMessages(formattedMessages);
						fetchDisplay();
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
			socket.on("joined group chat");
			// set up receive message listener
			socket.on("receive group message", (message) => {
				message.timestamp = new Date(message.timestamp);
				setMessages([...messages, message]);
			});
		}
	}, [socket, channelId, channelName, serverId, name]);
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
			<Stack style={{ height: "98%" }}>
				<div className='friend-name mb-1'>
					<Stack
						direction='horizontal'
						gap={3}>
						<BiHash
							style={{
								fontSize: "1.6rem",
								color: "lightgrey",
								marginTop: "-4px",
							}}
						/>
						<h5 style={{ color: "white" }}>{channelName}</h5>
						<div
							className='vr'
							style={{ color: "white" }}></div>
					</Stack>
					<hr
						className='hr'
						style={{ color: "white" }}
					/>
				</div>
				<div
					className='chat-box overflow-auto'
					ref={chatBoxRef}
					style={{
						minHeight: "75vh",
						maxHeight: "75vh",
						overflowY: "auto",
					}}>
					{renderMessages()}
				</div>
				<form
					className='input-group mt-auto'
					onSubmit={sendMessage}
					style={{ width: "98%" }}>
					<input
						type='text'
						className='form-control'
						placeholder='Type a message...'
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
					/>
					<button
						type='submit'
						className='btn btn-primary'>
						Send
					</button>
				</form>
			</Stack>
		</>
	);
}

export default GroupChat;
