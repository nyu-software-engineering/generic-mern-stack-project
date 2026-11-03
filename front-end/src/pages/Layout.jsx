import {useNavigate} from "react-router-dom";

export default function Layout (){
    const navigate = useNavigate();

    return (
        <div>
            <p>
                Sublet Search
            </p>
            <button onClick = {() => navigate("/explore")}>
                Explore
            </button>
            <button onClick = {() => navigate("/saved")}>
                Saved
            </button>
            <button onClick = {() => navigate("/profile")}>
                Profile
            </button>
            <button onClick = {() => navigate("/messages")}>
                Messages
            </button>
            <button onClick = {() => navigate("/post")}>
                Post
            </button>
                
        </div>
    )
        
    
}