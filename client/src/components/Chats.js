import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Stack } from "react-bootstrap";
import ErrorModal from "./ErrorsModal";

function Chats(props) {
	const { socket } = props;
	const [messages, setMessages] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const [success, setSuccess] = useState(false);
	const [newMessage, setNewMessage] = useState("");
	const { displayname } = useParams();
	const [myDisplayname, setMyDisplayname] = useState("");
	const navigate = useNavigate();
	const API_URL = process.env.REACT_APP_API_URL;
	let currentDay = null;

	// Use useRef to get a reference to the chat-box div
	const chatBoxRef = useRef(null);

	const fetchChatLogs = async () => {
		try {
			const response = await fetch(API_URL + `/message/${displayname}`, {
				method: "GET",
				headers: {
					"x-access-token": localStorage.getItem("token"),
				},
			});
			const displayResponse = await fetch(API_URL + "/displayname", {
				method: "GET",
				headers: {
					"x-access-token": localStorage.getItem("token"),
				},
			});
			const displayData = await displayResponse.json();

			const data = await response.json();
			if (data.success) {
				setSuccess(true);
				// Convert timestamp strings to Date objects
				const formattedMessages = data.chatLogs.map((message) => ({
					...message,
					timestamp: new Date(message.timestamp),
				}));
				setMessages(formattedMessages);
			} else {
				setErrors(data.errors);
				setShowModal(true);
			}
			if (displayData.success) {
				setMyDisplayname(displayData.displayname);
			} else {
				setErrors(...data.errors);
				setShowModal(true);
			}
		} catch (error) {
			console.error("Error fetching chat logs:", error);
		}
	};

	const sendMessage = async (e) => {
		e.preventDefault();

		if (!newMessage.trim()) {
			// If empty, do not proceed with submitting
			return;
		}

		try {
			// Optimistically update the UI
			let currentTimestamp = new Date();
			const newMessageObj = {
				author: myDisplayname,
				content: newMessage,
				timestamp: currentTimestamp,
			};

			setNewMessage("");

			if (socket) {
				// Emit an event to the server to store the message in the database
				socket.emit("send message", {
					displayname,
					message: newMessageObj,
				});
			}
		} catch (error) {
			setShowModal(true);
			setErrors(["Failed to send message"]);
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
				}}
			>
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
				key={index}
			>
				<p
					className='mx-2'
					style={{ color: "white", alignSelf: "flex-start" }}
				>
					{message.author}
				</p>
				<p
					className='message'
					style={{ color: "lightgrey" }}
				>
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
		setMessages([]);
		fetchChatLogs();
	}, [displayname]);

	useEffect(() => {
		if (success && socket) {
			socket.emit("join chatroom", displayname);
		}
	}, [success, socket, displayname]);

	useEffect(() => {
		if (socket) {
			// set up room joined listener
			socket.on("room joined", (roomId) => {
				// joined room
				console.log(`joined ${roomId}`);
			});

			socket.on("where are you?", () => {
				socket.emit("join chatroom", displayname);
				fetchChatLogs();
			});

			// set up receive message listener
			socket.on("receive message", (message) => {
				message.timestamp = new Date(message.timestamp);
				setMessages((prevMessages) => [...prevMessages, message]);
			});
		}

		return () => {
			// removes event listener when componed unmounted
			if (socket) {
				socket.off("room joined");
				socket.off("receive message");
				socket.off("where are you?");
			}
		};
	}, [socket, messages]);

	// Use useEffect to scroll the chat-box to the bottom when messages change
	useEffect(() => {
		if (chatBoxRef.current) {
			chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
		}
	}, [messages]);

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
						gap={3}
					>
						<h5 style={{ color: "white" }}>{displayname}</h5>
						<div
							className='vr'
							style={{ color: "white" }}
						></div>
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
					}}
				>
					{renderMessages()}
				</div>
				<form
					className='input-group mt-auto'
					onSubmit={sendMessage}
					style={{ width: "98%" }}
				>
					<input
						type='text'
						className='form-control'
						placeholder='Type a message...'
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
					/>
					<button
						type='submit'
						className='btn btn-primary'
					>
						Send
					</button>
				</form>
			</Stack>
		</>
	);
}

export default Chats;
