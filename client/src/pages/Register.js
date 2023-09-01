import { useState } from 'react'



function Register() {
    const [form, setForm] = useState({
        email:'',
        password: '',
        displayName:'',
        month:'',
        day:'',
        year:''
    });

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
            console.log('sent me your info');
        } else {
            console.log('incorrect password');
        } 
    }

    return (
            <div className="login">
                <form className="login-card" onSubmit={handleSubmit}>
                    <div className="mb-3 welcome">
                        <h4>Create an account</h4>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">EMAIL <span className="star">*</span></label>
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
                    <div className='mb-3'>
                        <label htmlfor="diplay-name" className="form-label">DISPLAY NAME <span className="star">*</span></label>
                        <input
                        type="text"
                        className='form-control'
                        pattern="[A-Za-z0-9]+"
                        minLength="2"
                        maxLength="20"
                        required 
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
                    </div>

                    <div className='mb-3 .row.g-2'>
                        <div className="col-md">
                            <select className="form-select">
                                <option>Month</option>
                            </select>
                        </div>
                        <div className="col-md">
                            <select className="form-select">
                                <option>Day</option>
                            </select>
                        </div>
                        <div className="col-md">
                            <select className="form-select">
                                <option>Year</option>
                            </select>
                        </div>
                        

                    </div>
                    
                    <button type="submit" className="btn">Continue</button>
                    <a href="/login">Already Have an account?</a>
                </form>
            </div>
    );
};

export default Register;