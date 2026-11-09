import { useNavigate } from 'react-router-dom';
import SplitLeaseLogo from "../assets/splitlease-blank-background-logo.png";
import "./HeaderButtons.css";
const HeaderButtons = ({ backTo }) => {

    const navigate = useNavigate();

    const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
    }

    return(
        <div className='headerButtons'>
                            <img
                                  src={SplitLeaseLogo}
                                  alt="SplitLease logo"
                                  className="logo"
                                  onClick={() => navigate('/home')}
                            />
            
                            <button className="backButtonC" onClick={handleBack}> Back </button>
                            
                        </div>
    )
}
export default HeaderButtons;