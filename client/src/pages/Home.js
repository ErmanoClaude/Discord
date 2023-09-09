import { useState, useEffect } from 'react';
import ErrorModal from '../components/ErrorsModal';

function Home() {
  const [success, setSuccess] = useState(false); // Change "let" to "const" for best practices
  
  return (
    <div className="home">
      <ErrorModal /> {/* Conditionally render the ErrorModal */}
    </div>
  );
};

export default Home;