import {Outlet, useNavigate} from "react-router-dom";

export default function Layout (){
    const navigate = useNavigate();

    return (
        <div>
            <p>
                Sublet Search
            </p>
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
                Messages
            </button>
            <button onClick = {() => navigate("/app/post")}>
                Post
            </button>
            <Outlet />
        </div>
    )
        
    
}