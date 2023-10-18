import { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { BiHash } from "react-icons/bi";
import { HiSpeakerWave } from "react-icons/hi2";
import ErrorModal from "./ErrorsModal";

function InvitePeopleModal(props) {
  const { show, handleClose } = props;
  const { serverId, name } = useParams();
  const [displayname, setDisplayname] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Trim whiteSpaces
    const trimmedName = displayname.trim();
    if (displayname === "") {
      return;
    }

    // "/serverinvite/:serverId/:receiver"
    const response = await fetch(`/serverinvite/${serverId}/${displayname}`, {
      method: "POST",
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });

    const data = await response.json();

    if (response.ok) {
    } else {
      setErrors(["Unable to send server invite to user."]);
      setShowModal(true);
    }

    if (data.success === true) {
      setDisplayname("");
      handleClose();
    } else {
      setErrors(...data.errors);
      setShowModal(true);
      setDisplayname("");
    }
  };

  return (
    <>
      <ErrorModal
        show={showModal}
        errors={errors}
        handleClose={() => setShowModal(false)}
      />
      <Modal
        show={show}
        onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Invite People</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group
              className='mb-3'
              controlId='channel-name'>
              <Form.Label></Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter displayname'
                value={displayname}
                onChange={(e) => setDisplayname(e.target.value)}
                autoFocus
                pattern='[a -zA-Z0-9]{1,20}$'
                title='Displayname can only contain letters, numbers and up to 20 characters.'
                autoComplete='off'
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='danger'
            onClick={handleClose}>
            Back
          </Button>
          <Button
            type='submit'
            variant='success'
            onClick={handleSubmit}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default InvitePeopleModal;
