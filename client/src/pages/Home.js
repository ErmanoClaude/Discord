import { useState, useEffect } from 'react';
import ErrorModal from '../components/ErrorsModal';
import LeftNavBar from '../components/LeftNavBar';

function Home(props) {
  const { user } = props;
  const [success, setSuccess] = useState(false); // Change "let" to "const" for best practices
  const [showModal, setShowModal] = useState(false);
  const errors = [
    'this is one error',
    'this is another error',
    'this is third error'
  ];

  return (
    <div className="home">
      <ErrorModal
        show={showModal}
        errors={errors}
        handleClose={() => setShowModal(false)}
      />
      <div className='row main-content' >

        <div className='col servers' style={{ flex: '0 0 85px' }}>
          <LeftNavBar/>
        </div>

        <div className='col friends-channels' style={{ flex: '0 0 240px' }}>
          <h1>Friends</h1>
        </div>

        <div className='col content' style={{ flex: '1' }}>
          <h1>Main content</h1>
        </div>

      </div>
    </div>
  );
};

export default Home;