import { useState, useEffect } from 'react';
import ErrorModal from '../components/ErrorsModal';

function Home() {
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
      handleClose={()=> setShowModal(false)}
      />

      <p></p>
    </div>
  );
};

export default Home;