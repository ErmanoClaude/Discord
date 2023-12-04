import { useState } from "react";
import Stack from "react-bootstrap/Stack";

import { Button } from "react-bootstrap";
import ErrorModal from "./ErrorsModal";

function AddTabContent() {
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const [displayName, setDisplayName] = useState("");
	const [borderColor, setBorderColor] = useState("");
	const API_URL = process.env.REACT_APP_API_URL;

	const handleSubmit = async (event) => {
		event.preventDefault();
		const response = await fetch(API_URL + "/friends", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-access-token": localStorage.getItem("token"),
			},
			body: JSON.stringify({ displayName: displayName }),
		});

		const data = await response.json();
		console.log(data);
		if (!data.success) {
			setErrors([data.errors]);
			setShowModal(!data.success);
		} else {
			setDisplayName("");
			setBorderColor("lightgreen");
		}
		setDisplayName("");
	};
	return (
		<>
			<ErrorModal
				show={showModal}
				errors={errors}
				handleClose={() => setShowModal(false)}
			/>
			<Stack className=''>
				<h6 style={{ color: "white" }}>ADD FRIEND</h6>
				<p className='add-text'>
					You can add friends with their Discord username.
				</p>
				<form
					onSubmit={handleSubmit}
					autoComplete='off'
				>
					<div
						className='mb-3'
						style={{ width: "75%" }}
					>
						<Stack direction='horizontal'>
							<input
								type='text'
								className='form-control'
								placeholder='You can add friends with their Discord username.'
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								autoFocus
								style={{ borderColor: borderColor }}
								// validation
								pattern='[a-zA-Z0-9]+$'
								title='User name may only contain letters and numbers'
								required
							/>
							<Button
								style={{
									whiteSpace: "nowrap",
								}}
								variant='primary'
								type='submit'
							>
								Send Friend Request
							</Button>
						</Stack>
					</div>
				</form>
			</Stack>
		</>
	);
}

export default AddTabContent;
