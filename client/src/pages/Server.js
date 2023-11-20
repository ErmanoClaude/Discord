import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ErrorModal from "../components/ErrorsModal";
import "./pagesCSS/server.css";

import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import { Stack } from "react-bootstrap";

function Server(props) {
	const { socket, stream } = props;
	const { serverId, name } = useParams();
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const carouselRef = useRef(null);
	const currentSlideRef = useRef(null);
	const [currentSlide, setCurrentSlide] = useState(0);
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

	const handleClick = (slide) => {
		carouselRef.current.to(slide, 300);
	};

	const handleVideoClick = (event) => {
		event.preventDefault();
	};

	const handleChanged = (event) => {
		currentSlideRef.current = event.item.index;
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
				<Stack style={{ width: "100px" }}>
					<div>
						<OwlCarousel
							ref={carouselRef}
							id='sync1'
							className='owl-theme'
							items={1}
							dots={false}
							onChanged={handleChanged}
						>
							<div className='item'>
								<video
									id='my-video'
									className='video top-video my-video'
									autoPlay
									playsInline
									muted
									controls
									disablePictureInPicture
									disableRemotePlayback
									controlsList='noremoteplayback'
									onClick={handleVideoClick}
								/>
							</div>
							<div className='item'>
								<h4>2</h4>
							</div>
							<div className='item'>
								<h4>3</h4>
							</div>
							<div className='item'>
								<h4>4</h4>
							</div>
							<div className='item'>
								<h4>5</h4>
							</div>
							<div className='item'>
								<h4>6</h4>
							</div>
							<div className='item'>
								<h4>7</h4>
							</div>
							<div className='item'>
								<h4>8</h4>
							</div>
						</OwlCarousel>
					</div>

					<div>
						<OwlCarousel
							id='sync2'
							className='owl-theme'
							items={4}
						>
							<div
								className='item'
								onClick={() => handleClick(0)}
							>
								<video
									className='video'
									autoPlay
									playsInline
									muted
								/>
							</div>
							<div
								className='item'
								onClick={() => handleClick(1)}
							>
								<h4>2</h4>
							</div>
							<div
								className='item'
								onClick={() => handleClick(2)}
							>
								<h4>3</h4>
							</div>
							<div
								className='item'
								onClick={() => handleClick(3)}
							>
								<h4>4</h4>
							</div>
							<div
								className='item'
								onClick={() => handleClick(4)}
							>
								<h4>5</h4>
							</div>
							<div
								className='item'
								onClick={() => handleClick(5)}
							>
								<h4>6</h4>
							</div>
							<div
								className='item'
								onClick={() => handleClick(6)}
							>
								<h4>7</h4>
							</div>
							<div
								className='item'
								onClick={() => handleClick(7)}
							>
								<h4>8</h4>
							</div>
						</OwlCarousel>
					</div>
				</Stack>
			</div>
		</>
	);
}

export default Server;
