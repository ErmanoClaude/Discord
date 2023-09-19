import { Outlet } from 'react-router-dom';


export default function RootLayout({user}) {

    return (
        <div className="root-layout">
            <main>
                <Outlet />
            </main>
        </div>
    )
}