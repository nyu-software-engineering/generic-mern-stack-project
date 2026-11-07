import { useNavigate } from 'react-router-dom'
import Home from './Home'
import './Menu.css'

function Menu(){
    const navigate=useNavigate()
    const user = { name: "Maria Lopez" }

    return(
        <div>
            <Home />
            <div className="menu-overlay">
                <div className="menu-panel">
                    <button className="close-button" onClick={()=>navigate(-1)}>Close</button>
                    <p className="menu-user">{user.name}</p>
                    <button className="menu-link" onClick={()=>navigate("/")}>New map</button>
                    <button className="menu-link" onClick={()=>navigate("/MyMaps")}>My maps</button>
                    <button className="menu-link" onClick={()=>navigate("/login")}>Sign out</button>
                </div>
            </div>
        </div>
    )
}
export default Menu