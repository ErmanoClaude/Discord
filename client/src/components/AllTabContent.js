import React from "react";
import Stack from "react-bootstrap/Stack";

function AllTabContent(props) {
  const { friends } = props;

  return (
    <>
      <h6
        className='mb-2'
        style={{ color: "lightgrey" }}>
        Friends
      </h6>
      <hr
        className='mb-5'
        style={{ color: "lightgrey" }}></hr>
      <Stack>
        {friends.map((friend) => {
          return (
            <Stack
              key={friend.displayName}
              direction='horizontal'
              gap={3}>
              <Stack
                flex={1}
                className='friend-request-name'>
                <h5 style={{ color: "white" }}>{friend.displayName}</h5>
                <p style={{ color: "lightgrey" }}>{friend.availability}</p>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </>
  );
}

export default AllTabContent;

/*
 */
