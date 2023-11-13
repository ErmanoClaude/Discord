import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Carousel from "react-bootstrap/Carousel";
import ErrorModal from "../components/ErrorsModal";
import "./pagesCSS/server.css";

function Server(props) {
	const { socket, stream } = props;
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

	useEffect(() => {
		const videoElements = document.getElementsByClassName("video");

		if (stream) {
			for (const videoElement of videoElements) {
				videoElement.srcObject = stream;
			}
		}
	}, [stream]);
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
				<Carousel
					interval={null}
					style={{ width: "100%" }}
				>
					<Carousel.Item>
						<video
							className='video carousel-videos mx-auto'
							autoPlay
							playsInline
							muted
							style={{ width: "94%" }}
						/>
						<Carousel.Caption>
							<h3>First slide label</h3>
							<p>
								Nulla vitae elit libero, a pharetra augue mollis
								interdum.
							</p>
						</Carousel.Caption>
					</Carousel.Item>
					<Carousel.Item>
						<video
							className='video'
							autoPlay
							playsInline
							muted
						/>
						<Carousel.Caption>
							<h3>Second slide label</h3>
							<p>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit.
							</p>
						</Carousel.Caption>
					</Carousel.Item>
					<Carousel.Item>
						<video
							className='video'
							autoPlay
							playsInline
							muted
						/>
						<Carousel.Caption>
							<h3>Third slide label</h3>
							<p>
								Praesent commodo cursus magna, vel scelerisque nisl
								consectetur.
							</p>
						</Carousel.Caption>
					</Carousel.Item>
				</Carousel>
			</div>
		</>
	);
}

export default Server;
