import { NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { BsDiscord } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import CreateServerModal from "./CreateServerModal";
import React from "react";

const LeftNavbar = ({ servers = [], fetchServers }) => {
	const [hoveredServer, setHoveredServer] = useState({});
	const [show, setShow] = useState(false);
	const handleOpen = () => setShow(true);
	const handleClose = () => setShow(false);

	const verticalLineStyles = {
		transition: "height 0.2s",
	};

	const handleMouseEnter = (event, index) => {
		event.stopPropagation();

		setHoveredServer((prevState) => {
			// Create new object
			const newState = { ...prevState };

			// Set all to false
			Object.keys(newState).forEach((key) => {
				newState[key] = false;
			});

			// Set entered to true
			newState[index] = true;

			setHoveredServer(newState);
		});

		setHoveredServer({
			...hoveredServer,
			[index]: true,
		});
	};
	const handleMouseLeave = (event, index) => {
		event.stopPropagation();

		setHoveredServer({
			...hoveredServer,
			[index]: false,
		});
	};

	return (
		<Nav className='flex-column sideNav'>
			<CreateServerModal
				show={show}
				handleClose={handleClose}
				fetchServers={fetchServers}
			/>
			{servers[0] && (
				<div className='nav-row mb-3'>
					<div
						className='vertical-line'
						style={{
							height: hoveredServer[0] ? "20px" : "8px",
							...verticalLineStyles,
						}}
					/>
					<OverlayTrigger
						placement='right'
						overlay={
							<Tooltip
								id='server-tooltip'
								style={{
									fontSize: "17px",
									marginLeft: "10px",
								}}
							>
								{servers[0].name}
							</Tooltip>
						}
					>
						<NavLink
							id={0}
							className='nav-link'
							onMouseEnter={(event) => handleMouseEnter(event, 0)}
							onMouseLeave={(event) => {
								handleMouseLeave(event, 0);
							}}
							to='/'
						>
							<BsDiscord className='nav-icons' />
						</NavLink>
					</OverlayTrigger>
				</div>
			)}
			<div className='linebreak mb-3 mx-auto'></div>
			<div className='users-servers'>
				{servers.map((server, index) => {
					return (
						<React.Fragment key={index}>
							{server.name !== "Home" && (
								<div className='nav-row mb-3'>
									<div
										className='vertical-line'
										style={{
											height: hoveredServer[index] ? "20px" : "8px",
											...verticalLineStyles,
										}}
									/>
									<OverlayTrigger
										placement='right'
										overlay={
											<Tooltip
												id='server-tooltip'
												style={{
													fontSize: "17px",
													marginLeft: "10px",
												}}
											>
												{server.name}
											</Tooltip>
										}
									>
										<NavLink
											id={index}
											className='nav-link'
											onMouseEnter={(event) =>
												handleMouseEnter(event, index)
											}
											onMouseLeave={(event) => {
												handleMouseLeave(event, index);
											}}
											to={
												server.name === "Home"
													? "/"
													: `/servers/${
															server.id
													  }/${encodeURIComponent(server.name)}`
											}
										>
											{server.name === "Home" ? (
												<BsDiscord className='nav-icons' />
											) : (
												server.name[0]
											)}
										</NavLink>
									</OverlayTrigger>
								</div>
							)}
							{/* nav-row */}
						</React.Fragment>
					);
				})}
			</div>
			{/* Servers that users own and are in */}
			<div className='nav-row mt-3'>
				<div
					className='vertical-line'
					style={{
						height: hoveredServer[servers.length] ? "20px" : "8px",
						...verticalLineStyles,
					}}
				/>
				<OverlayTrigger
					placement='right'
					overlay={
						<Tooltip
							id='server-tooltip'
							style={{ fontSize: "17px", marginLeft: "10px" }}
						>
							Create a server
						</Tooltip>
					}
				>
					<NavLink
						id={servers.length}
						className='nav-link'
						onMouseEnter={(event) =>
							handleMouseEnter(event, servers.length)
						}
						onMouseLeave={(event) => {
							handleMouseLeave(event, servers.length);
						}}
						onClick={(e) => {
							e.preventDefault();
							handleOpen();
						}}
						href='/'
					>
						<FaPlus
							className='nav-icons'
							style={{ color: "green" }}
						/>
					</NavLink>
				</OverlayTrigger>
				{/* Create Sever */}
			</div>
			{/* nav-row */}
		</Nav>
	);
};

export default LeftNavbar;
