import {Outlet, useNavigate} from "react-router-dom";
import "./Layout.css";

export default function Layout (){
    const navigate = useNavigate();

    return (
        <div className="layout">
            <nav className="layout-nav">
                <p>Sublet Search</p>
                <div className="layout-buttons">
                    <button onClick = {() => navigate("/app/explore")}>
                        Explore
                    </button>
                    <button onClick = {() => navigate("/app/saved")}>
                        Saved
                    </button>
                    <button onClick = {() => navigate("/app/profile")}>
                        Profile
                    </button>
                    <button onClick = {() => navigate("/app/messages")}>
                        Messages <span className="unread-count">0</span>
                    </button>
                    <button onClick = {() => navigate("/app/post")}>
                        Post
                    </button>
                </div>
            </nav>
            <Outlet />
        </div>
    )
}