import { useState, useEffect } from 'react';
import ErrorModal from '../../components/ErrorsModal';
import LeftNavBar from '../../components/LeftNavBar';
import Axios from 'axios';
Axios.defaults.withCredentials = true;


function Home(props) {
  const { user } = props;

  const [success, setSuccess] = useState(false); // Change "let" to "const" for best practices
  const [showModal, setShowModal] = useState(false);
  const [servers, setServers] = useState([]);
  const errors = [
    'this is one error',
    'this is another error',
    'this is third error'
  ];


  // Get the servers the user is in
  async function fetchServers() {
    const response = await fetch('/servers', {
      method: 'GET',
      headers: {
        'x-access-token': localStorage.getItem('token')
      },
    });
    const data = await response.json();
    setServers(data.servers)
  }

  fetchServers();


  return (
    <div className="home">
      <ErrorModal
        show={showModal}
        errors={errors}
        handleClose={() => setShowModal(false)}
      />
      <div className='row main-content' >

        <div className='col servers'>
          <LeftNavBar servers={servers} fetchServers={fetchServers} />
        </div>

        <div className='col friends-channels'>
        </div>

        <div className='col content'>
          <h1>Main content</h1>
        </div>

      </div>
    </div>
  );
};

export default Home;