import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SplitLeaseLogo from '../../assets/splitlease-blank-background-logo.png';

const JoinHousehold = () => {
    const [inviteCode, setInviteCode] = useState();

    return(
        <div>
            <div className="inviteCode">
                        <label htmlFor="inviteCode">Invite Code</label>
                        <input
                            type="text"
                            id="inviteCode"
                            value={formData.name}
                            placeholder="Enter Invite Code Here"
                            onChange={handleChange}
                        />
                    </div>
        </div>
    )

}
export default JoinHousehold;