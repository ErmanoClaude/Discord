import { useState, useEffect } from "react";
import React from "react";
import ErrorModal from "./ErrorsModal";
import Stack from "react-bootstrap/Stack";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { BiCheck } from "react-icons/bi";
import { IoClose } from "react-icons/io5";

function PendingTabContent(props) {
	const { fetchFriends } = props;
	const [pendingRequest, setPendingRequest] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const API_URL = process.env.REACT_APP_API_URL;

	// make request to back end get pending request
	// Gets incomming request and outgoing request back
	async function fetchRequest() {
		const res = await fetch(API_URL + "/friendRequests", {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		});
		const data = await res.json();
		if (!data.success) {
			setErrors(data.errors);
			setShowModal(true);
		} else {
			setPendingRequest(data.friendRequest);
		}
	}

	async function acceptFriendRequest(displayname) {
		fetch(API_URL + "/acceptRequest", {
			method: "POST",
			headers: {
				"x-access-token": localStorage.getItem("token"),
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ displayname: displayname }),
		})
			.then(() => {})
			.catch((error) => {
				console.log("Error in accept");
			});
		// Delete the accepted request from pendingRequest
		const newRequest = pendingRequest.filter(
			(friend) => friend.displayName !== displayname,
		);
		setPendingRequest(newRequest);
		fetchFriends();
	}

	async function cancelFriendRequest(displayname) {
		fetch(API_URL + "/cancelRequest", {
			method: "POST",
			headers: {
				"x-access-token": localStorage.getItem("token"),
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ displayname: displayname }),
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log(data);
			})
			.catch((error) => {
				console.log("Error in cancel");
			});

		// Delete the cancelled pendingRequest
		const newRequest = pendingRequest.filter(
			(friend) => friend.displayName !== displayname,
		);
		setPendingRequest(newRequest);
	}

	useEffect(() => {
		fetchRequest();
	}, []);

	return (
		<>
			<ErrorModal
				show={showModal}
				errors={errors}
				handleClose={() => setShowModal(false)}
			/>
			<h6
				className='mb-2'
				style={{ color: "lightgrey" }}
			>
				Pending Friend Requests
			</h6>
			<hr
				className='mb-5'
				style={{ color: "lightgrey" }}
			></hr>
			<Stack>
				{pendingRequest.map((request) => {
					return (
						<Stack
							key={request.displayName}
							direction='horizontal'
							gap={3}
						>
							<Stack
								flex={1}
								className='friend-request-name'
							>
								<h5 style={{ color: "white" }}>
									{request.displayName}
								</h5>
								<p style={{ color: "lightgrey" }}>
									{request.requestType} friend request
								</p>
							</Stack>

							{request.requestType === "Outgoing" && (
								<OverlayTrigger
									placement='top'
									overlay={
										<Tooltip
											id='cancel-button'
											style={{ fontSize: "14px" }}
										>
											Cancel
										</Tooltip>
									}
								>
									<div
										onClick={() =>
											cancelFriendRequest(request.displayName)
										}
										className='request-button'
									>
										<IoClose />
									</div>
								</OverlayTrigger>
							)}

							{request.requestType === "Incoming" && (
								<>
									<OverlayTrigger
										placement='top'
										overlay={
											<Tooltip
												id='cancel-button'
												style={{ fontSize: "14px" }}
											>
												Cancel
											</Tooltip>
										}
									>
										<div
											onClick={() =>
												cancelFriendRequest(request.displayName)
											}
											className='request-button cancel-button'
										>
											<IoClose />
										</div>
									</OverlayTrigger>

									<OverlayTrigger
										placement='top'
										overlay={
											<Tooltip
												id='accept-button'
												style={{ fontSize: "14px" }}
											>
												Accept
											</Tooltip>
										}
									>
										<div
											onClick={() =>
												acceptFriendRequest(request.displayName)
											}
											className='request-button accept-button'
										>
											<BiCheck />
										</div>
									</OverlayTrigger>
								</>
							)}
						</Stack>
					);
				})}
			</Stack>
		</>
	);
}

export default PendingTabContent;
