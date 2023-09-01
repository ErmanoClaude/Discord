import { NavLink, Outlet } from 'react-router-dom';


export default function RootLayout({user}) {

    return (
        <div className="root-layout">
            <header>
            { user && (
                <nav>
                    <h1>Discord</h1>
                    <NavLink to="/">Home</NavLink>
                </nav>
            )}

            {/* BootStrap 5  */}
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossOrigin="anonymous"></link>
            <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossOrigin="anonymous"></script>

            </header>
            <main>
                <Outlet />
            </main>
        </div>
    )
}