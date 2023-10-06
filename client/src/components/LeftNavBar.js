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
    <Nav
      className='flex-column sideNav'
      style={{ gap: "12px" }}>
      <CreateServerModal
        show={show}
        handleClose={handleClose}
        fetchServers={fetchServers}
      />
      {servers.map((server, index) => {
        return (
          <React.Fragment key={index}>
            <div
              className='nav-row'
              style={{ marginBottom: "12px" }}>
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
                    style={{ "font-size": "17px", marginLeft: "10px" }}>
                    {server.name}
                  </Tooltip>
                }>
                <NavLink
                  id={index}
                  className='nav-link'
                  onMouseEnter={(event) => handleMouseEnter(event, index)}
                  onMouseLeave={(event) => {
                    handleMouseLeave(event, index);
                  }}
                  to={server.name === "Home" ? "/" : "/servers/" + server.id}>
                  {server.name === "Home" ? (
                    <BsDiscord className='nav-icons' />
                  ) : (
                    server.name[0]
                  )}
                </NavLink>
              </OverlayTrigger>
            </div>{" "}
            {/* nav-row */}
            {index === 0 && <div className='linebreak'></div>}
          </React.Fragment>
        );
      })}
      {/* Servers that users own and are in */}
      <div
        className='nav-row'
        style={{ marginBottom: "12px" }}>
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
              style={{ fontSize: "17px", marginLeft: "10px" }}>
              Create a server
            </Tooltip>
          }>
          <NavLink
            id={servers.length}
            className='nav-link'
            onMouseEnter={(event) => handleMouseEnter(event, servers.length)}
            onMouseLeave={(event) => {
              handleMouseLeave(event, servers.length);
            }}
            onClick={(e) => {
              e.preventDefault();
              handleOpen();
            }}
            href='/'>
            <FaPlus
              className='nav-icons'
              style={{ color: "green" }}
            />
          </NavLink>
        </OverlayTrigger>
      </div>
      {/* nav-row */}
    </Nav>
  );
};

export default LeftNavbar;
