import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import ErrorModal from "../components/ErrorsModal";
import LeftNavBar from "../components/LeftNavBar";
import Axios from "axios";
import FriendList from "../components/FriendList";
import "../pages/pagesCSS/home.css";
Axios.defaults.withCredentials = true;

function HomeLayout(props) {
  const { user, servers, fetchServers } = props;
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Friends includes friends request that are pending
  // Format of friends
  // [{displayName: 'displayName', status:'pending'},
  // [{displayName: 'displayName', status:'accepted'},
  const [friends, setFriends] = useState([]);
  useEffect(() => {
    async function fetchFriends() {
      const res = await fetch("/friends", {
        method: "GET",
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      setFriends(data.friends);
    }
    fetchFriends();
  }, []);

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
          <FriendList friends={friends} />
        </div>

        <div className='col content'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default HomeLayout;
