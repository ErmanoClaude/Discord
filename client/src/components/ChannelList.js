import { useParams, NavLink, useNavigate } from "react-router-dom";
import { Stack } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import { useState, useEffect, useRef, forwardRef } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import CreateChannelModal from "./CreateChannelModal";
import ErrorModal from "./ErrorsModal";
import { Accordion, Button } from "react-bootstrap";

// React icons
import { FaChevronDown } from "react-icons/fa6";
import {
	BsFillPersonPlusFill,
	BsFillArrowLeftCircleFill,
} from "react-icons/bs";
import { AiFillPlusCircle } from "react-icons/ai";
import { BiHash } from "react-icons/bi";
import { HiSpeakerWave } from "react-icons/hi2";
import { MdClose } from "react-icons/md";
import { PiPlusBold } from "react-icons/pi";
import { BsFillPeopleFill } from "react-icons/bs";
import { FaSignOutAlt } from "react-icons/fa";

import InvitePeopleModal from "./InvitePeopleModal";
import MembersModal from "./MemebersModal";

function ChannelList(props) {
	let { serverId, name } = useParams();
	const { socket, fetchServers, displayname, myPeer, setIsLoggedIn } = props;
	const [isOwner, setIsOwner] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const toggleRef = useRef(null);
	const [show, setShow] = useState(false);
	const [showInvitePeople, setShowInvitePeople] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [showMembersModal, setShowMembersModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const [channels, setChannels] = useState([]);
	const [owner, setOwner] = useState(false);
	const [members, setMembers] = useState([]);
	const handleOpen = () => setShow(true);
	const handleClose = () => setShow(false);
	const handlePeopleModalOpen = () => setShowInvitePeople(true);
	const handlePeopleModalClose = () => setShowInvitePeople(false);
	const handleMembersModalOpen = () => setShowMembersModal(true);
	const handleMembersModalClose = () => setShowMembersModal(false);
	const [channelMemebers, setChannelMemebers] = useState({});
	const navigate = useNavigate();
	const API_URL = process.env.REACT_APP_API_URL;

	name = decodeURIComponent(name);

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

	useEffect(() => {
		fetchChannelList();

		channels.forEach((channel) => {});
	}, [serverId, name]);

	useEffect(() => {
		if (socket) {
			socket.on("joined voice room", ({ members }) => {
				setChannelMemebers((prev) => members);
			});
		}
	}, [socket]);

	useEffect(() => {
		if (dropdownOpen) {
			console.log("fetching channel members");
			fetchMembers();
		}
	}, [dropdownOpen]);

	const CustomToggle = forwardRef(({ onClick, children }, ref) => {
		function handleToggle(e) {
			e.stopPropagation();
			onClick(e);
		}
		return (
			<Stack
				direction='horizontal'
				style={{ color: "slategray" }}
				onClick={handleToggle}
			>
				<h5 className='server-name'>{name}</h5>
				{!dropdownOpen ? (
					<FaChevronDown className='ms-auto' />
				) : (
					<MdClose className='ms-auto' />
				)}
				{children}
			</Stack>
		);
	});

	const fetchChannelList = async () => {
		const response = await fetch(API_URL + `/channels/${serverId}`, {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		});

		const data = await response.json();

		if (response.ok) {
		} else {
			setErrors([
				"Unable to send channel name to create channel in this server",
			]);
			setShowModal(true);
		}

		if (data.success === true) {
			setChannels(data.channels);
		} else {
			setErrors(...data.errors);
			setShowModal(true);
		}
	};

	const fetchMembers = async () => {
		// make api call to create sever in db
		const response = await fetch(API_URL + `/members/${serverId}`, {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		});

		const ownerResponse = await fetch(API_URL + `/owner/${serverId}`, {
			method: "GET",
			headers: {
				"x-access-token": localStorage.getItem("token"),
			},
		});

		const ownerData = await ownerResponse.json();

		const data = await response.json();

		if (!response.ok) {
			setErrors(["Unable to check members of channel"]);
			setShowModal(true);
		}

		if (data.success === true) {
			setMembers(data.members);
		} else {
			setErrors(...data.errors);
			setShowModal(true);
		}

		if (!ownerResponse.ok) {
			setErrors(["Unable to check owner status"]);
			setShowModal(true);
		}

		if (ownerData.success) {
			setOwner(ownerData.owner);
			console.log(owner);
		} else {
			setErrors([["Unable to get owner status"]]);
			setShowModal(true);
		}
	};

	const leaveServer = async () => {
		if (!owner) {
			const response = await fetch(API_URL + `/leave/${serverId}`, {
				method: "GET",
				headers: {
					"x-access-token": localStorage.getItem("token"),
				},
			});
			const data = await response.json();
			console.log(data);

			if (data.success) {
				console.log(data.message);
				navigate("/");
				fetchServers();
			} else {
				setErrors([["Unable to leave server. Server Error"]]);
				setShowModal(true);
			}
		}
	};

	return (
		<>
			<CreateChannelModal
				show={show}
				handleClose={handleClose}
				fetchChannelList={fetchChannelList}
			/>
			<ErrorModal
				show={showModal}
				errors={errors}
				handleClose={() => setShowModal(false)}
			/>
			<InvitePeopleModal
				show={showInvitePeople}
				handleClose={handlePeopleModalClose}
			/>
			<MembersModal
				show={showMembersModal}
				handleClose={handleMembersModalClose}
				owner={owner}
				setOwner={setOwner}
				members={members}
				fetchMembers={fetchMembers}
			/>

			<Stack gap={3}>
				<div className='friends-link p-2 server-main-name'>
					<Stack direction='horizontal'>
						<Dropdown
							style={{ width: "100%", cursor: "pointer" }}
							onToggle={(showDrop) => {
								setDropdownOpen(showDrop);
							}}
						>
							<Dropdown.Toggle
								as={CustomToggle}
								id='dropdown-basic'
								ref={toggleRef}
							></Dropdown.Toggle>

							<Dropdown.Menu
								variant='dark'
								style={{
									minWidth: 200,
									backgroundColor: "black",
								}}
							>
								<Dropdown.Item onClick={handlePeopleModalOpen}>
									<Stack
										direction='horizontal'
										alignitems='flex-start'
									>
										Invite People
										<BsFillPersonPlusFill className='ms-auto' />
									</Stack>
								</Dropdown.Item>
								<Dropdown.Item onClick={handleOpen}>
									{" "}
									<Stack
										direction='horizontal'
										alignitems='flex-start'
									>
										Create Channel{" "}
										<AiFillPlusCircle className='ms-auto' />
									</Stack>
								</Dropdown.Item>
								<Dropdown.Item
									onClick={(event) => {
										handleMembersModalOpen();
									}}
								>
									{" "}
									<Stack
										direction='horizontal'
										alignitems='flex-start'
									>
										Server Members{" "}
										<BsFillPeopleFill className='ms-auto' />
									</Stack>
								</Dropdown.Item>
								{!owner && (
									<Dropdown.Item
										className='leave-server'
										onClick={leaveServer}
									>
										<Stack
											direction='horizontal'
											alignitems='flex-start'
										>
											Leave Server{" "}
											<BsFillArrowLeftCircleFill className='ms-auto' />
										</Stack>
									</Dropdown.Item>
								)}
							</Dropdown.Menu>
						</Dropdown>
					</Stack>
				</div>
				<div className='accordions-container'>
					<Accordion
						flush
						defaultActiveKey='0'
					>
						<Accordion.Item eventKey='0'>
							<Accordion.Header>
								{" "}
								<Stack
									direction='horizontal'
									gap={2}
								>
									<h6 className='direct-message channel-text'>
										TEXT CHANNELS
									</h6>
									<OverlayTrigger
										placement='top'
										overlay={
											<Tooltip
												id='server-tooltip'
												style={{ fontSize: "0.8rem" }}
											>
												Create Channel
											</Tooltip>
										}
									>
										<div
											className='direct-message align-self-center channel-text ms-auto'
											onClick={(e) => {
												e.stopPropagation();
												handleOpen();
											}}
											style={{ cursor: "pointer" }}
										>
											<PiPlusBold />
										</div>
									</OverlayTrigger>
								</Stack>{" "}
							</Accordion.Header>

							<Accordion.Body>
								{" "}
								<Stack gap={1}>
									{channels.map((channel) => {
										if (channel.type === "text") {
											// 'servers/:serverId/:name/text/:channelId/:channelName'
											return (
												<NavLink
													to={`/servers/${serverId}/${name}/text/${channel.id}/${channel.name}`}
													key={channel.id}
													className={({ isActive }) =>
														isActive ? "active-channel" : ""
													}
													style={{
														textDecoration: "none",
														color: "lightgrey",
													}}
												>
													<Stack
														direction='horizontal'
														align='start'
														className='d-flex'
														gap={2}
													>
														<BiHash className='flex-shrink-0' />
														<p
															style={{
																overflow: "hidden",
																textOverflow: "ellipsis",
																whiteSpace: "nowrap",
																marginBottom: "4px",
															}}
														>
															{channel.name}
														</p>
													</Stack>
												</NavLink>
											);
										} else {
											return <></>;
										}
									})}
								</Stack>
							</Accordion.Body>
						</Accordion.Item>
					</Accordion>
					<Accordion
						flush
						defaultActiveKey='0'
					>
						<Accordion.Item eventKey='0'>
							<Accordion.Header>
								<Stack
									direction='horizontal'
									gap={2}
								>
									<h6 className='direct-message channel-text'>
										VOICE CHANNELS
									</h6>
									<OverlayTrigger
										placement='top'
										overlay={
											<Tooltip
												id='server-tooltip'
												style={{ fontSize: "0.8rem" }}
											>
												Create Channel
											</Tooltip>
										}
									>
										<div
											className='direct-message align-self-center channel-text ms-auto'
											onClick={(e) => {
												e.stopPropagation();
												handleOpen();
											}}
											style={{ cursor: "pointer" }}
										>
											<PiPlusBold />
										</div>
									</OverlayTrigger>
								</Stack>
								{/*VOICE CHANNELS Header*/}
							</Accordion.Header>

							<Accordion.Body>
								{" "}
								<Stack gap={1}>
									{channels.map((channel) => {
										if (channel.type === "voice") {
											// 'servers/:serverId/:name/voice/:channelId/:channelName'
											return (
												<>
													<NavLink
														to={`/servers/${serverId}/${name}/voice/${channel.id}/${channel.name}`}
														key={channel.id}
														className={({ isActive }) =>
															isActive ? "active-channel" : ""
														}
														style={{
															textDecoration: "none",
															color: "lightgrey",
														}}
													>
														<Stack
															direction='horizontal'
															align='start'
															className='d-flex'
															gap={2}
														>
															<HiSpeakerWave className='flex-shrink-0' />
															<p
																style={{
																	overflow: "hidden",
																	textOverflow: "ellipsis",
																	whiteSpace: "nowrap",
																	marginBottom: "4px",
																}}
															>
																{channel.name}
															</p>
														</Stack>
													</NavLink>
													<Stack>
														{channelMemebers[channel.id] &&
															[...channelMemebers[channel.id]]
																.sort()
																.map((member) => {
																	return (
																		<p
																			key={member}
																			style={{
																				overflow: "hidden",
																				textOverflow:
																					"ellipsis",
																				whiteSpace:
																					"nowrap",
																				marginBottom: "4px",
																				marginLeft: "15px",
																			}}
																			className='voice-channel-member'
																		>
																			{member}
																		</p>
																	);
																})}
													</Stack>
												</>
											);
										} else {
											return <></>;
										}
									})}
								</Stack>
								{/*VOICE CHANNELS*/}
							</Accordion.Body>
						</Accordion.Item>
					</Accordion>
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

export default ChannelList;
