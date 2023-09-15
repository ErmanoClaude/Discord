import { NavLink, Outlet } from 'react-router-dom';


export default function RootLayout({user}) {

    return (
        <div className="root-layout">
            <header>
            { user && (
                <nav>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to='/'>server</NavLink>
                </nav>
            )}
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    )
}