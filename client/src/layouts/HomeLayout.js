import { Outlet } from "react-router-dom";
import LeftNavBar from "../components/LeftNavBar";
import Axios from "axios";
import FriendList from "../components/FriendList";
import "../pages/pagesCSS/home.css";
import { useEffect } from "react";
Axios.defaults.withCredentials = true;

function HomeLayout(props) {
  const { user, servers, fetchServers, friends, fetchFriends } = props;

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div className='home'>
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
