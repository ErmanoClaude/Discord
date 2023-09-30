import { useState } from 'react';
import Stack from 'react-bootstrap/Stack';
import Form from 'react-bootstrap/form';
import { Button } from 'react-bootstrap';
import ErrorModal from './ErrorsModal';



function AddTabContent() {
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState([]);
    const [displayName, setDisplayName] = useState('');
    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await fetch('/friends', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ 'displayName': displayName })
        });

        const data = await response.json();
        console.log(data);
        if(!data.success){
            setErrors([data.errors]);
            setShowModal(!data.success)
        } else {
            
        }


    }
    return (
        <>
            <ErrorModal
                show={showModal}
                errors={errors}
                handleClose={() => setShowModal(false)}
            />
            <Stack className=''>
                <h6 style={{ "color": "white" }}>ADD FRIEND</h6>
                <p>You can add friends with their Discord username.</p>
                <Form onSubmit={handleSubmit} autoComplete='off'>
                    <Form.Group className="mb-3" controlId="displayName" style={{ "width": "75%" }}>
                        <Stack direction='horizontal'>
                            <Form.Control
                                type="text"
                                placeholder="You can add friends with their Discord username."
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                autoFocus

                                // validation
                                pattern='[a-zA-Z0-9]+$'
                                title="User name may only contain letters and numbers"
                                required
                            />
                            <Button
                                style={{
                                    whiteSpace: 'nowrap'
                                }}
                                variant="primary"
                                type="submit"
                            >
                                Send Friend Request
                            </Button>
                        </Stack>
                    </Form.Group>
                </Form>
            </Stack>
        </>
    )
}

export default AddTabContent;