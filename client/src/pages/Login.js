import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ErrorModal from "../components/ErrorsModal";
import "../pages/pagesCSS/login.css";

function Login(props) {
	const { updateServers, connectSocket } = props;
	const API_URL = process.env.REACT_APP_API_URL;
	const [showModal, setShowModal] = useState(false);
	const [errors, setErrors] = useState([]);
	const navigate = useNavigate();

	const [form, setForm] = useState({
		email: "",
		password: "",
	});

	const handleChange = (e) => {
		if (e.target.name) {
			setForm({
				...form,
				[e.target.name]: e.target.value,
			});
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault(); // prevents default submit
		// Make api request to sever

		console.log(
			"The url",
			API_URL + "/login",
			"Type of API_URL",
			typeof API_URL,
			"Type of API URL /login",
			typeof (API_URL + "/login"),
		);
		const response = await fetch(API_URL + "/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(form),
		});

		const data = await response.json();

		// If request is successfully send to /login
		if (response.ok) {
		} else {
			setErrors(["Unable to send email and password to /login api"]);
			setShowModal(true);
		}

		// If user is logged in success:true else success:false
		if (data.success === true) {
			// Store JWT token from server
			// Redirect to Home with logged in persons
			localStorage.setItem("token", data.token);
			localStorage.setItem("displayname", data.displayName);
			// Get the servers the user is when user is changed
			async function fetchServers() {
				const res = await fetch(API_URL + "/servers", {
					method: "GET",
					headers: {
						"x-access-token": localStorage.getItem("token") || "",
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				});
				const dat = await res.json();
				updateServers(dat.servers);
				navigate("/");
				window.location.reload();
			}

			fetchServers();
		} else {
			setErrors(...data.errors);
			setShowModal(true);
		}
	};

	// Use useEffect to sync the input fields with autofilled data
	useEffect(() => {
		const emailInput = document.getElementById("email");
		const passwordInput = document.getElementById("password");

		if (emailInput && emailInput.value !== form.email) {
			setForm({
				...form,
				email: emailInput.value,
			});
		}

		if (passwordInput && passwordInput.value !== form.password) {
			setForm({
				...form,
				password: passwordInput.value,
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
				<div className='login'>
					<form
						className='login-card'
						onSubmit={handleSubmit}
					>
						<div className='mb-3 welcome'>
							<h4>Welcome back!</h4>
							<p className='secondary'>
								We're so excited to see you again!
							</p>
						</div>
						<div className='mb-3'>
							<label
								htmlFor='email'
								className='form-label'
							>
								EMAIL ADDRESS <span className='star'>*</span>
							</label>
							<input
								type='email'
								className='form-control remove-control'
								id='email'
								aria-describedby='emailHelp'
								required
								onChange={handleChange}
								name='email'
								autoComplete='email'
							/>
						</div>
						<div className='mb-3'>
							<label
								htmlFor='password'
								className='form-label'
							>
								PASSWORD <span className='star'>*</span>
							</label>
							<input
								type='password'
								autoComplete='current-password'
								className='form-control'
								id='password'
								required
								onChange={handleChange}
								name='password'
							/>
							<a
								className='forgot'
								href='/login'
							>
								Forgot your password?
							</a>
						</div>

						<button
							type='submit'
							className='btn'
						>
							Log In
						</button>
						<p className='account'>
							Need an account?{" "}
							<span>
								<a href='/register'>Register</a>
							</span>
						</p>
					</form>
				</div>
			</div>
		</>
	);
}

export default Login;
