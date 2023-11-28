import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import ErrorModal from "./ErrorsModal";
import { Stack } from "react-bootstrap";

import { HiUserRemove } from "react-icons/hi";

function MembersModal(props) {
	const { show, handleClose, owner, members, fetchMembers } = props;
	const { serverId, name } = useParams();
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const [channelType, setChannelType] = useState("text");

	const API_URL = process.env.REACT_APP_API_URL;

	useEffect(() => {}, []);

	const removeFromServer = async (user) => {
		const response = await fetch(API_URL + `/remove/${serverId}/${user}`, {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		});

		const data = await response.json();

		if (!response.ok) {
			setErrors(["Unable to remove member from server"]);
			setShowModal(true);
		}

		if (data.success) {
			fetchMembers();
		} else {
			setErrors(...data.errors);
			setShowModal(true);
		}
	};

	return (
		<>
			<ErrorModal
				show={showModal}
				errors={errors}
				handleClose={() => setShowModal(false)}
			/>
			<Modal
				show={show}
				onHide={handleClose}
			>
				<Modal.Header closeButton>
					<Modal.Title>Members</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Stack>
						{members.map((member) => {
							console.log("POP up count");
							return (
								<div
									key={member.displayName}
									className='member'
								>
									<Stack
										direction='horizontal'
										style={{ width: "100%" }}
									>
										<p className='mx-auto'>{member.displayName}</p>
										{owner && (
											<OverlayTrigger
												placement='top'
												overlay={
													<Tooltip
														id='remove-tooltip'
														style={{ fontSize: "1rem" }}
													>
														Remove From Server
													</Tooltip>
												}
											>
												<div style={{ cursor: "pointer" }}>
													<HiUserRemove
														style={{
															color: "red",
														}}
														onClick={() => {
															removeFromServer(
																member.displayName,
															);
														}}
													/>
												</div>
											</OverlayTrigger>
										)}
									</Stack>
								</div>
							);
						})}
					</Stack>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant='danger'
						onClick={handleClose}
					>
						Back
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}

export default MembersModal;
