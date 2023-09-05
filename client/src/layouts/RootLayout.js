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
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    )
}