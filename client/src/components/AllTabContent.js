import React from "react";
import Stack from "react-bootstrap/Stack";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { BiSolidMessage } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
function AllTabContent(props) {
	const { friends = [] } = props;
	const navigate = useNavigate();

	return (
		<>
			<h6
				className='mb-2'
				style={{ color: "lightgrey" }}>
				Friends
			</h6>
			<hr
				className='mb-5'
				style={{ color: "lightgrey" }}></hr>
			<Stack>
				{friends.map((friend) => {
					return (
						<Stack
							key={friend.displayName}
							direction='horizontal'
							gap={3}>
							<Stack
								flex={1}
								className='friend-request-name'>
								<h5 style={{ color: "white" }}>
									{friend.displayName}
								</h5>
								<p style={{ color: "lightgrey" }}>
									{friend.availability}
								</p>
							</Stack>
							<OverlayTrigger
								placement='top'
								overlay={
									<Tooltip
										id='cancel-button'
										style={{ fontSize: "14px" }}>
										Message
									</Tooltip>
								}>
								<div
									onClick={() => {
										navigate(
											"/message/" + friend.displayName,
										);
									}}
									className='request-button cancel-button friends-button'>
									<BiSolidMessage />
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
