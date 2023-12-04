import { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";

import Modal from "react-bootstrap/Modal";

import ErrorModal from "./ErrorsModal";

function InvitePeopleModal(props) {
	const { show, handleClose } = props;
	const { serverId } = useParams();
	const [displayname, setDisplayname] = useState("");
	const [showModal, setShowModal] = useState(false);
	const API_URL = process.env.REACT_APP_API_URL;
	const [errors, setErrors] = useState([]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		// Trim whiteSpaces
		const trimmedName = displayname.trim();
		if (trimmedName === "") {
			return;
		}

		// "/serverinvite/:serverId/:receiver"
		const response = await fetch(
			API_URL + `/serverinvite/${serverId}/${displayname}`,
			{
				method: "POST",
				headers: {
					"x-access-token": localStorage.getItem("token"),
				},
			},
		);

		const data = await response.json();

		if (response.ok) {
		} else {
			setErrors(["Unable to send server invite to user."]);
			setShowModal(true);
		}

		if (data.success === true) {
			setDisplayname("");
			handleClose();
		} else {
			setErrors(...data.errors);
			setShowModal(true);
			setDisplayname("");
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
					<Modal.Title>Invite People: Enter Displayname</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form onSubmit={handleSubmit}>
						<div className='mb-3'>
							<label
								htmlFor='channel-name'
								className='form-label'
							></label>
							<input
								type='text'
								className='form-control'
								id='channel-name'
								placeholder='Enter displayname'
								value={displayname}
								onChange={(e) => setDisplayname(e.target.value)}
								autoFocus
								pattern='[a-zA-Z0-9]{1,20}$'
								title='Displayname can only contain letters, numbers and up to 20 characters.'
								autoComplete='off'
								required
							/>
						</div>
					</form>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant='danger'
						onClick={handleClose}
					>
						Back
					</Button>
					<Button
						type='submit'
						variant='success'
						onClick={handleSubmit}
					>
						Create
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}

export default InvitePeopleModal;
