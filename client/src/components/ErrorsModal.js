import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ErrorModal({ errors, handleClose, show }) {
  // Boilerplate from react-bootstrap modal

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        contentClassName='error-modal'
      >
        <Modal.Header closeButton>
          <Modal.Title>Errors</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            errors.map((error) => {
              return <p key={error}> {error} </p>
            })
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ErrorModal;