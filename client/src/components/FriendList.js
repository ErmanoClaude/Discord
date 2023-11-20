import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../pages/pagesCSS/friendList.css";
import { BsFillPeopleFill } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { BsDiscord } from "react-icons/bs";
import Stack from "react-bootstrap/Stack";

function FriendList(props) {
	const { friends } = props;

	return (
		<>
			<Stack gap={3}>
				<NavLink
					to='/'
					className='friends-link p-2'
				>
					<div className='friends-title'>
						<Stack direction='horizontal'>
							<BsFillPeopleFill className='friends-icon' />
							<h5>Friends</h5>
						</Stack>
					</div>
				</NavLink>

				<Stack direction='horizontal'>
					<h6 className='direct-message'>Direct Messages </h6>
					<FaPlus className='mx-auto plus-icon' />
				</Stack>
				{friends.map((friend) => {
					if (friend.status === "accepted") {
						return (
							<NavLink
								key={friend.displayName}
								to={"/message/" + friend.displayName}
								style={{
									textDecoration: "none",
									color: "lightgrey",
									marginLeft: "10px",
								}}
								className='friend-name'
							>
								{friend.displayName}
							</NavLink>
						);
					} else {
						return <></>;
					}
				})}
			</Stack>
		</>
	);
}

export default FriendList;
