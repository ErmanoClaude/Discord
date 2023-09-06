import { useState, useEffect } from 'react';
import { getDaysInMonth } from 'date-fns';


function Register() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        displayName: '',
        month: '',
        day: '',
        year: ''
    });

    // errors to show for password
    const [passErrors, setPassErrors] = useState([]);

    // disabled or enable form based on password validation
    const [formDisabled, setFormDisabled] = useState(false);

    // Days array with default of 31 days array
    const [days, setDays] = useState([...Array(31).keys()].map(x => x + 1))

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    // password validation
    // if password don't meet requirements submit button get disabled
    const handlePassword = (e) => {
        handleChange(e);
        validatePassword(e.target.value);

    }

    const handleSubmit = async (event) => {
        event.preventDefault() // prevents default submit

        // Make api call to sever
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
        }).then((data) => {
            console.log(data.json().success);
        })
    }

    // Validate password
    function validatePassword(value) {
        let errors = []
        if (!value) errors.push("Password is required");

        if (value.length < 6) errors.push("Password must be at least 6 characters");

        if (!/[A-Z]/.test(value)) errors.push("Password must have an uppercase letter");

        if (!/[a-z]/.test(value)) errors.push("Password must have a lowercase letter");

        if (!/\d/.test(value)) errors.push("Password must have a number");

        setPassErrors(errors);

        // Disables button if password requirements aren't meet
        // Only after first change of password box
        if(errors.length > 0){
            setFormDisabled(true);
        } else {
            setFormDisabled(false);
        }
    }


    const years = [];
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    // Fill years 1920 - 2020
    for (let year = 2020; year >= 1920; year--) {
        years.push(year);
    }

    // Set proper days each month with matching leap years
    // setsDays to an array with each day in every month
    useEffect(() => {
        if (form.year === "") {
            let countDays = getDaysInMonth(new Date(2023, months.indexOf(form.month)));
            setDays([...Array(countDays).keys()].map(x => x + 1));
        } else {
            let countDays = getDaysInMonth(new Date(form.year, months.indexOf(form.month)));
            setDays([...Array(countDays).keys()].map(x => x + 1));
        }
    }, [form.month, form.year])

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
                    <label htmlFor="diplay-name" className="form-label">DISPLAY NAME <span className="star">*</span></label>
                    <input
                        type="text"
                        className='form-control'
                        pattern="[A-Za-z0-9]+"
                        title="Only alphanumeric characters allowed"
                        minLength="2"
                        maxLength="20"
                        onChange={handleChange}
                        name="displayName"
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
                        onChange={handlePassword}
                        name="password"
                        minLength='6'
                        required
                    />
                    {passErrors.map((error) => {
                        return <p key={error} className='password-error mb-0'>{error}</p>
                    })}
                </div>

                <div className='row mb-4'>
                    <p className="secondary mb-2">DATE OF BIRTH <span className='star'>*</span></p>
                    <div className="col pe-1">
                        <select
                            id="Month"
                            className="form-select secondary"
                            defaultValue=""
                            onChange={handleChange}
                            name="month"
                            required
                        >
                            <option key='default' value="" disabled selected>Month</option>
                            {months.map((month) => { return <option key={month} value={month}>{month}</option> })}
                        </select>
                    </div>
                    <div className="col px-2">
                        <select
                            className="form-select secondary"
                            defaultValue=""
                            name='day'
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled key='default' selected>Day</option>
                            {days.map((day) => {
                                return <option value={day} key={day}>{day}</option>
                            })}
                        </select>
                    </div>
                    <div className="col ps-1">
                        <select
                            className="form-select secondary"
                            defaultValue=""
                            name='year'
                            onChange={handleChange}
                            required
                        >
                            <option key='default' value="" disabled selected>Year</option>
                            {
                                // Display valid years
                                years.map((year) => {
                                    return <option key={year} value={year}>{year}</option>
                                }
                                )
                            }
                        </select>
                    </div>

                </div>

                <button
                    type="submit" className="btn mb-1" disabled={formDisabled}>Continue</button>
                <a href="/login">Already Have an account?</a>
            </form>
        </div>
    );
};

export default Register;