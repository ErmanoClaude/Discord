import { useParams } from "react-router-dom";

function ChannelList() {
  const { serverId } = useParams();
  return (
    <>
      <h1>Channels {serverId}</h1>
    </>
  );
}

export default ChannelList;
