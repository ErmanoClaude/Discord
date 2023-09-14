import { useState, useEffect } from 'react';
import ErrorModal from '../components/ErrorsModal';



function Login() {
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState([]);

    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    const handleChange = (e) => {
        if (e.target.name) {
            setForm({
                ...form,
                [e.target.name]: e.target.value
            })
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault() // prevents default submit

        // Make api request to sever
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
        })

        const data = await response.json();

        // If request is successfully send to /login
        if (response.ok) {
            console.log('Sent email password to /login success');
            console.log(data);
        } else {
            setErrors(['Unable to send email and password to /login api']);
            setShowModal(true);
        }

        // If user is logged in success:true else success:false
        if (data.success) {
            // Store JWT token from server
            // Redirect to Home with logged in persons
            window.location.href = '/';

        } else {
            setErrors(...data.errors)
            setShowModal(true);
        }

    }

    // Use useEffect to sync the input fields with autofilled data
    useEffect(() => {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (emailInput && emailInput.value !== form.email) {
            setForm({
                ...form,
                email: emailInput.value
            });
        }

        if (passwordInput && passwordInput.value !== form.password) {
            setForm({
                ...form,
                password: passwordInput.value
            });
        }
    }, [form.email, form.password]);

    return (
        <>
            <ErrorModal
                show={showModal}
                errors={errors}
                handleClose={() => setShowModal(false)}
            />
            <div className='login-page'>
                <div className="login">
                    <form className="login-card" onSubmit={handleSubmit}>
                        <div className="mb-3 welcome">
                            <h4>Welcome back!</h4>
                            <p className="secondary">We're so excited to see you again!</p>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">EMAIL ADDRESS <span className="star">*</span></label>
                            <input
                                type="email"
                                className="form-control remove-control"
                                id="email"
                                aria-describedby="emailHelp"
                                required
                                onChange={handleChange}
                                name="email"
                                autoComplete='email'
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">PASSWORD <span className="star">*</span></label>
                            <input
                                type="password"
                                autoComplete='current-password'
                                className="form-control"
                                id="password"
                                required
                                onChange={handleChange}
                                name="password"
                            />
                            <a className="forgot" href="/login">Forgot your password?</a>
                        </div>

                        <button type="submit" className="btn">Log In</button>
                        <p className="account">Need an account? <span><a href="/register">Register</a></span></p>
                    </form>
                </div>
            </div>
        </>

    );
};

export default Login;