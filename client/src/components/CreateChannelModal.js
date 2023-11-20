import { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { BiHash } from "react-icons/bi";
import { HiSpeakerWave } from "react-icons/hi2";
import ErrorModal from "./ErrorsModal";

function CreateChannelModal(props) {
  const { show, handleClose, fetchChannelList } = props;
  const { serverId, name } = useParams();
  const [channelName, setChannelName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState([]);
  const [channelType, setChannelType] = useState("text");

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Trim whiteSpaces
    const trimmedName = channelName.trim();
    if (channelName === "") {
      return;
    }

    // make api call to create sever in db
    const response = await fetch("/channels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        serverId: serverId,
        serverName: name,
        channelName: trimmedName,
        channelType: channelType,
      }),
    });

    const data = await response.json();

    if (response.ok) {
    } else {
      setErrors([
        "Unable to send channel name to create channel in this server",
      ]);
      setShowModal(true);
    }

    if (data.success === true) {
      fetchChannelList();
      handleClose();
    } else {
      setErrors(...data.errors);
      setShowModal(true);
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
          <Modal.Title>Create Channel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Channel Type</Form.Label>
              <div
                className='radio-channel-type mb-2'
                onClick={() => setChannelType("text")}>
                <BiHash size={22} />
                <span className='mx-2'>Text</span>
                <Form.Check
                  type='radio'
                  label=''
                  name='channelType'
                  value='text'
                  checked={channelType === "text"}
                  className='ms-auto radio-input'
                  onChange={() => {}}
                />
              </div>
              <div
                className='radio-channel-type mb-4'
                onClick={() => setChannelType("voice")}>
                <HiSpeakerWave size={22} />
                <span className='mx-2'>Voice</span>
                <Form.Check
                  type='radio'
                  label=''
                  name='channelType'
                  value='voice'
                  checked={channelType === "voice"}
                  className='ms-auto radio-input'
                  onChange={() => {}}
                />
              </div>
            </Form.Group>

            <Form.Group
              className='mb-3'
              controlId='channel-name'>
              <Form.Label>Channel Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter Channel name'
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                autoFocus
                pattern='[a -zA-Z0-9 ]{1,100}$'
                title='Channel name can only contain letters, numbers, and spaces, up to 100 characters'
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

export default CreateChannelModal;
