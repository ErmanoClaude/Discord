import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { BsDiscord } from 'react-icons/bs';
import { useState} from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const LeftNavbar = () => {
  const userServers = {
    "the ghetto hash": 1,
    "The chosen ones": 32,
    "million dollar": 56,
    "chcink": 32,
    "unilateral": 3,
    "unclearing": 12,
    "altering": 9,
    "Anotnher": 11,
    "This beat is sick": 7,
    "another server": 4,
    "another one": 99,
    "theo von": 87,
    "Kevin hart": 373,
    "you know what": 98,
    "thump wrestling": 7
  }

  const serversArray = Object.keys(userServers);
  const [hoveredServer, setHoveredServer] = useState({});
  const verticalLineStyles = {

    "transition": "height 0.2s"
  }

  const handleMouseEnter = (event, index) => {
    event.stopPropagation();
    console.log('The mouse has entered this area');



    setHoveredServer(prevState => {
      // Create new object 
      const newState = { ...prevState };

      // Set all to false
      Object.keys(newState).forEach(key => {
        newState[key] = false;
      });

      // Set entered to true
      newState[index] = true;

      setHoveredServer(newState);
    });
  
    setHoveredServer({
      ...hoveredServer,
      [index]: true
    });

  }
  const handleMouseLeave = (event, index) => {
    event.stopPropagation();
    console.log("this mouse has left");

    setHoveredServer({
      ...hoveredServer,
      [index]: false
    });

  }
  return (
    <Nav className="flex-column sideNav" style={{ gap: '12px' }}>

      <div className='nav-row'>
        <div className='vertical-line' style={verticalLineStyles}></div>
        <Nav.Link
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          href="/"><BsDiscord /></Nav.Link>
      </div>

      <div className='linebreak'></div>
      <div className='user-servers'>
        {
          serversArray.map((serverName, index) => {
            return (
              <>
                <div className='nav-row' style={{ "margin-bottom": "12px" }}>
                  <div className="vertical-line"
                    style={{ height: hoveredServer[index] ? '20px' : '8px' }}
                  />
                  <OverlayTrigger
                    placement='right'
                    overlay={
                      <Tooltip id='server-tooltip' style={{ "font-size": "17px", "margin-left": "10px" }}>
                        {serverName}
                      </Tooltip>
                    }
                  >
                    <Nav.Link
                      id={index}
                      onMouseEnter={(event) => handleMouseEnter(event, index)}
                      onMouseLeave={(event) => { handleMouseLeave(event, index) }}
                      href="/">{serverName[0]}
                    </Nav.Link>
                  </OverlayTrigger>
                </div>
              </>
            )
          })
        }
      </div>

    </Nav>
  );
}

export default LeftNavbar;
