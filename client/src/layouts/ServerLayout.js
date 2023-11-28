import { useState } from "react";
import { Outlet, useRoutes } from "react-router-dom";
import ErrorModal from "../components/ErrorsModal";
import LeftNavBar from "../components/LeftNavBar";
import Axios from "axios";
import ChannelList from "../components/ChannelList";
Axios.defaults.withCredentials = true;

function ServerLayout(props) {
	const {
		socket,
		user,
		servers,
		fetchServers,
		displayname,
		setIsLoggedIn,
		myPeer,
	} = props;
	const [errors, setErrors] = useState([]);
	const [success, setSuccess] = useState(false);
	const [showModal, setShowModal] = useState(false);

	return (
		<div className='home'>
			<ErrorModal
				show={showModal}
				errors={errors}
				handleClose={() => setShowModal(false)}
			/>
			<div className='row main-content'>
				<div className='col servers'>
					<LeftNavBar
						servers={servers}
						fetchServers={fetchServers}
					/>
				</div>

				<div className='col friends-channels'>
					<ChannelList
						socket={socket}
						fetchServers={fetchServers}
						displayname={displayname}
						setIsLoggedIn={setIsLoggedIn}
						myPeer={myPeer}
					/>
				</div>

				<div className='col content'>
					<Outlet />
				</div>
			</div>
		</div>
	);
}

export default ServerLayout;
