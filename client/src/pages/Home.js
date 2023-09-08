import { useState } from 'react';
import ErrorModal from '../components/ErrorsModal';

function Home() {

    const [modalOpen, setModalOpen] = useState(false);

    const openModal = () => {
      setModalOpen(true);
    }
  
    return (
      <>
        <ErrorModal 
          show={modalOpen}
          onClose={() => setModalOpen(false)} 
        />
  
        <button onClick={openModal}>Open Modal</button>
      </>
    )
};

export default Home;