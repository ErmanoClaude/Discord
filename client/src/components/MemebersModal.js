import { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { BiHash } from "react-icons/bi";
import { HiSpeakerWave } from "react-icons/hi2";
import ErrorModal from "./ErrorsModal";

function MembersModal(props) {
	const { show, handleClose, fetchChannelList } = props;
	const { serverId, name } = useParams();
	const [members, setMembers] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const [channelType, setChannelType] = useState("text");
	const API_URL = process.env.REACT_APP_API_URL;

	const fetchMembers = async () => {
		// make api call to create sever in db
		const response = await fetch(API_URL + `/members/${serverId}`, {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		});

		const data = await response.json();

		if (response.ok) {
		} else {
			setErrors([
				"Unable to send serverId to create channel in this server",
			]);
			setShowModal(true);
		}

		if (data.success === true) {
			setMembers(data.members);
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
				<Modal.Body></Modal.Body>
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
