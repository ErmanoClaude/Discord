import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ErrorModal from './ErrorsModal';

function CreateServerModal(props) {
    const { show, handleClose, fetchServers } = props;
    const [serverName, setServerName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState([]);


    const handleSubmit = async(event) => {
        event.preventDefault();
        // Trim whiteSpaces
        const trimmedName = serverName.trim();

        // Check for "Home"
        if (trimmedName.toLowerCase() === "home") {
            alert('Cannot create server name "Home"');
            return;
        }

        // make api call to create sever in db
        const response = await fetch('/servers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem("token")
            },
            body: JSON.stringify({'serverName':trimmedName})
        });

        const data = await response.json();
        console.log(data);

        // If request is successfully send to /login
        if (response.ok) {
            console.log('Sent serverName');
            console.log(data);
        } else {
            setErrors(['Unable to send serverName to create server']);
            setShowModal(true);
        }

        // If user is logged in success:true else success:false
        if (data.success === true) {
            fetchServers();
            handleClose();
        } else {
            setErrors(...data.errors)
            setShowModal(true);
        }

    }


    return (
        <>
            <ErrorModal
                show={showModal}
                errors={errors}
                handleClose={() => setShowModal(false)}
            />
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create a Server</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="servername">
                            <Form.Label>Server Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Server name"
                                value={serverName}
                                onChange={e => setServerName(e.target.value)}
                                autoFocus

                                // validation
                                pattern='[a-zA-Z0-9 ] +$'
                                title="Server name can onlu contain letters, numbers and spaces"
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleClose}>
                        Back
                    </Button>
                    <Button type='submit' variant="success" onClick={handleSubmit}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CreateServerModal;