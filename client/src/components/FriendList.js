import { NavLink } from "react-router-dom";
import "../pages/pagesCSS/friendList.css";
import { BsFillPeopleFill } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import Stack from "react-bootstrap/Stack";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

function FriendList(props) {
	const { friends = [], displayname, setIsLoggedIn, myPeer, socket } = props;

	const handleLogout = () => {
		if (socket) {
			socket.disconnect();
		}
		if (myPeer) {
			myPeer.destroy();
		}

		localStorage.removeItem("token");

		// Update the state to reflect that the user is logged out
		setIsLoggedIn(false);

		window.location.href = "/login";
	};

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
				<div className='sub-column'>
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
									className={({ isActive }) =>
										isActive
											? "active-channel friend-name"
											: "friend-name"
									}
								>
									{friend.displayName}
								</NavLink>
							);
						} else {
							return <></>;
						}
					})}
				</div>
				{displayname && (
					<div>
						<Stack direction='horizontal'>
							<div
								className='display logout'
								style={{ color: "green" }}
							>
								<h6>User:</h6>
								<h6>{displayname}</h6>
							</div>
							<div className='icon-container ms-auto'>
								<OverlayTrigger
									placement='top'
									overlay={
										<Tooltip
											id='logout-tooltip'
											style={{ fontSize: "0.8rem" }}
										>
											Logout
										</Tooltip>
									}
								>
									<div
										className='direct-message align-self-center channel-text'
										onClick={(e) => {
											e.stopPropagation();
										}}
										style={{ cursor: "pointer" }}
									>
										<div
											className='logout-button'
											onClick={handleLogout}
										>
											<FaSignOutAlt syle={{ color: "red!" }} />
										</div>
									</div>
								</OverlayTrigger>
							</div>
						</Stack>
					</div>
				)}
			</Stack>
		</>
	);
}

export default FriendList;
