import "../pagesCSS/login.css"

function Login() {

    return (
        <body>
            <link rel="stylesheet" href="../pagesCSS/login.css"/>
            <div className="login">
                <form clasName="login-card">
                    <div className="mb-3">
                        <label for="exampleInputEmail1" className="form-label">Email address</label>
                        <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                        <label for="exampleInputPassword1" className="form-label">Password</label>
                        <input type="password" className="form-control" id="exampleInputPassword1" />
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </div>
        </body>
    );
};

export default Login;