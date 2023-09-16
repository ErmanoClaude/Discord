import { useState, useEffect } from 'react';
import ErrorModal from '../components/ErrorsModal';
import LeftNavBar from '../components/LeftNavBar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
    <Container className="home">
      <ErrorModal
        show={showModal}
        errors={errors}
        handleClose={() => setShowModal(false)}
      />
      <Row className='main'>
        <Col className='servers' xs={1}>
          <LeftNavBar />
        </Col>
        <Col className='friends-channels' xs={2}>
          <h1>Friends</h1>
        </Col>
        <Col className='content' >
          <h1>Main content</h1>
        </Col>
      </Row>

    </Container>
  );
};

export default Home;