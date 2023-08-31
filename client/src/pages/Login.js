import { useState } from 'react'



function Login() {
    const [form, setForm] = useState({
        email:'',
        password: ''
    })

    const handleChange = (e) => {
        if(e.target.name){
            setForm({
                ...form,
                [e.target.name] : e.target.value
            })
        }
    }

    const handleSubmit = async (event) => {
        console.log(form)
        event.preventDefault() // prevents default submit
        
        // Make api call to sever
        const response = await fetch('/login', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
        })

        if (response.ok) {
            console.log('sent me your info')
        } else {
            console.log('incorrect password')
        }
    }

    return (
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
                    <p className="account">Need an account? <span><a href="/login">Register</a></span></p>
                </form>
            </div>
    );
};

export default Login;