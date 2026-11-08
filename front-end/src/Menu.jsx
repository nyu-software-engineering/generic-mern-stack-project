
import { useNavigate } from 'react-router-dom'
import './Menu.css'

function Menu() {
    const navigate = useNavigate()

    return (
        <div className="menu-overlay">
            <div className="menu-panel">
                <button className="close-button" onClick={() => navigate(-1)}>
                    Close
                </button>

                <p className="menu-user">Guest</p>

                <button className="menu-link" onClick={() => navigate("/home")}>
                    New Map
                </button>

                <button className="menu-link" onClick={() => navigate("/MyMaps")}>
                    My Maps
                </button>

                <button className="menu-link" onClick={() => navigate("/login")}>
                    Sign Out
                </button>
            </div>
        </div>
    )
}

export default Menu
