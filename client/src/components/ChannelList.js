import { useParams, NavLink } from "react-router-dom";
import { Stack } from "react-bootstrap";
function ChannelList() {
  let { serverId, name } = useParams();
  name = decodeURIComponent(name);

  return (
    <>
      <Stack gap={3}>
        <NavLink
          to='/'
          className='friends-link p-2'>
          <div className='friends-title'>
            <Stack direction='horizontal'>
              <h5>{name}</h5>
            </Stack>
          </div>
        </NavLink>

        <Stack direction='horizontal'>
          <h6 className='direct-message'>Direct Messages </h6>
        </Stack>
      </Stack>
    </>
  );
}

export default ChannelList;
