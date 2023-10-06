import { useState, useEffect } from "react";
import React from "react";
import ErrorModal from "./ErrorsModal";
import Stack from "react-bootstrap/Stack";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { BiCheck } from "react-icons/bi";
import { IoClose } from "react-icons/io5";

function PendingTabContent() {
  const [pendingRequest, setPendingRequest] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState([]);

  // make request to back end get pending request
  // Gets incomming request and outgoing request back
  async function fetchRequest() {
    const res = await fetch("/friendRequests", {
      method: "GET",
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });
    const data = await res.json();
    if (!data.success) {
      setErrors(data.errors);
      setShowModal(true);
    } else {
      setPendingRequest(data.friendRequest);
    }
  }

  useEffect(() => {
    fetchRequest();
  }, []);

  return (
    <>
      <ErrorModal
        show={showModal}
        errors={errors}
        handleClose={() => setShowModal(false)}
      />
      <h6
        className='mb-2'
        style={{ color: "lightgrey" }}>
        Pending Friend Requests
      </h6>
      <hr
        className='mb-5'
        style={{ color: "lightgrey" }}></hr>
      <Stack>
        {pendingRequest.map((request) => {
          return (
            <Stack
              key={request.displayName}
              direction='horizontal'
              gap={3}>
              <Stack
                flex={1}
                className='friend-request-name'>
                <h5 style={{ color: "white" }}>{request.displayName}</h5>
                <p style={{ color: "lightgrey" }}>
                  {request.requestType} friend request
                </p>
              </Stack>

              {request.requestType === "Outgoing" && (
                <OverlayTrigger
                  placement='top'
                  overlay={
                    <Tooltip
                      id='cancel-button'
                      style={{ fontSize: "14px" }}>
                      Cancel
                    </Tooltip>
                  }>
                  <div className='request-button'>
                    <IoClose />
                  </div>
                </OverlayTrigger>
              )}

              {request.requestType === "Incoming" && (
                <>
                  <OverlayTrigger
                    placement='top'
                    overlay={
                      <Tooltip
                        id='cancel-button'
                        style={{ fontSize: "14px" }}>
                        Cancel
                      </Tooltip>
                    }>
                    <div className='request-button cancel-button'>
                      <IoClose />
                    </div>
                  </OverlayTrigger>

                  <OverlayTrigger
                    placement='top'
                    overlay={
                      <Tooltip
                        id='accept-button'
                        style={{ fontSize: "14px" }}>
                        Accept
                      </Tooltip>
                    }>
                    <div className='request-button accept-button'>
                      <BiCheck />
                    </div>
                  </OverlayTrigger>
                </>
              )}
            </Stack>
          );
        })}
      </Stack>
    </>
  );
}

export default PendingTabContent;

/*
 */
