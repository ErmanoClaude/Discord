import React from "react";
import Stack from "react-bootstrap/Stack";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { BiSolidMessage } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ErrorModal from "./ErrorsModal";

function AllTabContent(props) {
	const { friends = [], setFriends } = props;
	const [showModal, setShowModal] = React.useState(false);
	const [errors, setErrors] = React.useState([]);
	const navigate = useNavigate();
	const API_URL = process.env.REACT_APP_API_URL;

	const deleteFriend = async (displayname) => {
		const response = await fetch(API_URL + `/delete/${displayname}`, {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		});

		const data = await response.json();

		if (data.success) {
			fetchFriends();
		} else {
			setErrors(...data.errors);
			setShowModal(true);
		}
	};
	async function fetchFriends() {
		await fetch(API_URL + "/friends", {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		})
			.then((result) => {
				return result.json();
			})
			.then((data) => {
				setFriends(data.friends);
				console.log(data);
			})
			.catch((err) => {
				console.log(err);
				console.log("Error in fetching friends");
			});
	}

	return (
		<>
			<ErrorModal
				show={showModal}
				errors={errors}
				handleClose={() => {
					setShowModal(false);
				}}
			/>
			<h6
				className='mb-2'
				style={{ color: "lightgrey" }}
			>
				Friends
			</h6>
			<hr
				className='mb-5'
				style={{ color: "lightgrey" }}
			></hr>
			<Stack>
				{friends.map((friend) => {
					return (
						<Stack
							key={friend.displayName}
							direction='horizontal'
							gap={3}
						>
							<Stack
								flex={1}
								className='friend-request-name'
							>
								<h5 style={{ color: "white" }}>{friend.displayName}</h5>
								<p style={{ color: "lightgrey" }}>
									{friend.availability}
								</p>
							</Stack>
							<OverlayTrigger
								placement='top'
								overlay={
									<Tooltip
										id='cancel-button'
										style={{ fontSize: "14px" }}
									>
										Message
									</Tooltip>
								}
							>
								<div
									onClick={() => {
										navigate("/message/" + friend.displayName);
									}}
									className='request-button cancel-button friends-button'
								>
									<BiSolidMessage />
								</div>
							</OverlayTrigger>
							<OverlayTrigger
								placement='top'
								overlay={
									<Tooltip
										id='cancel-button'
										style={{ fontSize: "14px" }}
									>
										Delete Friend
									</Tooltip>
								}
							>
								<div
									onClick={() => {
										deleteFriend(friend.displayName);
									}}
									className='request-button cancel-button'
								>
									<IoClose style={{ color: "red" }} />
								</div>
							</OverlayTrigger>
						</Stack>
					);
				})}
			</Stack>
		</>
	);
}

export default AllTabContent;

/*
 */
