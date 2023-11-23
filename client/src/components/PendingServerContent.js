import { useState, useEffect } from "react";
import React from "react";
import ErrorModal from "./ErrorsModal";
import Stack from "react-bootstrap/Stack";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { BiCheck } from "react-icons/bi";
import { IoClose } from "react-icons/io5";

function PendingServerContent(props) {
	const { fetchServers } = props;
	const [pendingRequest, setPendingRequest] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const API_URL = process.env.REACT_APP_API_URL;

	// make request to back end get pending request
	// Gets incomming request and outgoing request back
	async function fetchRequest() {
		const res = await fetch(API_URL + "/serverinvite", {
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
			console.log(data);
			setPendingRequest(data.invites);
		}
	}

	async function acceptServerRequest(serverId) {
		fetch(API_URL + `/serverinvite/${serverId}`, {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		})
			.then(() => {
				// Delete the cancelled pendingRequest
				const newRequest = pendingRequest.filter(
					(server) => server.id !== serverId,
				);
				setPendingRequest(newRequest);
				fetchRequest();
				fetchServers();
			})
			.catch((error) => {
				console.log("Error in accept");
			});
	}

	async function declineServerRequest(serverId) {
		fetch(API_URL + `/serverinvites/${serverId}`, {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		})
			.then(() => {
				// Delete the cancelled pendingRequest
				const newRequest = pendingRequest.filter(
					(server) => server.id !== serverId,
				);
				setPendingRequest(newRequest);
				fetchRequest();
			})
			.catch((error) => {
				console.log("Error in cancel");
			});
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
				Pending Server Invites
			</h6>
			<hr
				className='mb-5'
				style={{ color: "lightgrey" }}
			></hr>
			<Stack>
				{pendingRequest.map((request) => {
					return (
						<Stack
							key={request.name}
							direction='horizontal'
							gap={3}
						>
							<Stack
								flex={1}
								className='friend-request-name'
							>
								<h5 style={{ color: "white" }}>{request.name}</h5>
							</Stack>
							<OverlayTrigger
								placement='top'
								overlay={
									<Tooltip
										id='cancel-button'
										style={{ fontSize: "14px" }}
									>
										Decline
									</Tooltip>
								}
							>
								<div
									onClick={() =>
										declineServerRequest(request.serverId)
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
									onClick={() => acceptServerRequest(request.serverId)}
									className='request-button accept-button'
								>
									<BiCheck />
								</div>
							</OverlayTrigger>
						</Stack>
					);
				})}
			</Stack>
		</>
	);
}

export default PendingServerContent;
