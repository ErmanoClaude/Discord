import { useState  } from 'react';
import { useRoutes } from 'react-router-dom';
import ErrorModal from '../components/ErrorsModal';
import LeftNavBar from '../components/LeftNavBar';
import Axios from 'axios';
import ChannelList from '../components/ChannelList';
Axios.defaults.withCredentials = true;



function ServerLayout(props) {
  const { user, servers, fetchServers } = props;
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState(false); // Change "let" to "const" for best practices
  const [showModal, setShowModal] = useState(false);
  


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
            <ChannelList />
        </div>

        <div className='col content'>
          <h1>Main content</h1>
        </div>

      </div>
    </div>
  );
};

export default ServerLayout;

