import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { BsDiscord } from 'react-icons/bs';
import { useState } from 'react';

const LeftNavbar = () => {
  const [isHovered, setisHovered] = useState(false);
  const verticalLineStyle = {
    height: isHovered ? '5px' : '30px'
  }
  return (
    <Nav className="flex-column sideNav" style={{ gap: '12px' }}>

      <div className='nav-row'>
        <div className='vertical-line'></div>
        <div
          onMouseEnter={console.log("Mouse is in here")}
          onMouseLeave={console.log("Mouse left")}
         className='server-link'>
          <Nav.Link href="/"><BsDiscord /></Nav.Link>
        </div>
      </div>

      <div className='linebreak'></div>

      <div className='nav-row'>
        <div className='vertical-line'></div>
        <Nav.Link href="/products">Ns</Nav.Link>
      </div>

      <div className='nav-row'>
        <div className='vertical-line'></div>
        <Nav.Link href="/services">Ss</Nav.Link>
      </div>

    </Nav>
  );
}

export default LeftNavbar;
