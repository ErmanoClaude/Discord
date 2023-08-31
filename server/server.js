const express = require('express');
const app = express()

// Body parser middleware
app.use(express.json());

app.get('/api', (req, res) => {
    res.json({"users": ["userOne", "userTwo", "userThree"]})
})

app.post('/login', (req, res) => {
    // Get data from body
    const { email,  password } = req.body;

    // Validate credentials
    if (email && password) {
        // successfull login
        console.log({ email, password })
        res.json({
            success: true,
            message: `Welcome ${email}`
        })
    } else {
        // unsccessful login response
        res.json({
            success: false,
            message: `failed to login`
        })

    }

})

app.listen(5000,() => console.log("Server started on port 5000"))