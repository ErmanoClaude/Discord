import { useState } from "react";
import AllTabContent from "../components/AllTabContent";
import PendingTabContent from "../components/PendingTabContent";
import AddTabContent from "../components/AddTabContent";
import { Stack } from "react-bootstrap";
import { BsFillPeopleFill } from "react-icons/bs";
import PendingServerContent from "../components/PendingServerContent";

function Home(props) {
  const { friends, fetchFriends, fetchServers } = props;
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div>
      <Stack
        gap={5}
        direction='horizontal'
        className='tab-buttons mb-4'>
        <div className='second-friends-title'>
          <Stack
            direction='horizontal'
            gap={3}>
            <BsFillPeopleFill />
            <h5 style={{ color: "white" }}>Friends</h5>
          </Stack>
        </div>
        <div
          className='vr'
          style={{ color: "white" }}></div>
        <div
          className={`${activeTab === "all" ? "active-tab" : ""} `}
          style={{ cursor: "pointer" }}
          onClick={() => setActiveTab("all")}>
          <h5>All Friends</h5>
        </div>
        <div
          className={`${activeTab === "pending" ? "active-tab" : ""} `}
          style={{ cursor: "pointer" }}
          onClick={() => setActiveTab("pending")}>
          <h5>Pending</h5>
        </div>
        <div
          className={`${activeTab === "invite" ? "active-tab" : ""} `}
          onClick={() => setActiveTab("invite")}>
          <h5>Server Invites</h5>
        </div>
        <h5
          className={`${activeTab === "add" ? "active-tab" : ""} `}
          onClick={() => setActiveTab("add")}>
          Add Friend
        </h5>
      </Stack>

      <div className='tab-content'>
        {activeTab === "all" && <AllTabContent friends={friends} />}
        {activeTab === "pending" && (
          <PendingTabContent fetchFriends={fetchFriends} />
        )}
        {activeTab === "invite" && (
          <PendingServerContent fetchServers={fetchServers} />
        )}
        {activeTab === "add" && <AddTabContent />}
      </div>
    </div>
  );
}

export default Home;
