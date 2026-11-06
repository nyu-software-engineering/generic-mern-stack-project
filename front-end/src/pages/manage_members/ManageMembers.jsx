import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SplitLeaseLogo from '../../assets/splitlease-blank-background-logo.png'
import './ManageMembers.css'
const ManageMembersPage = () => {
    const [members, setMembers] = useState([]);
    const[memberSelected, setMemberSelected] = useState(false);
    const[copyCodeSelected, setCopyCodeSelected] = useState(false);
    return(
        <div> {/* Parent div */}

            <div className='sectionContainer'> {/* Members List Section */}
                <button onClick={setCopyCodeSelected = true}> Copy Invite Code </button>
                <h2 className="sectionTitle">Members List</h2>
                <div> {/* Actual members list */}

                </div>
            </div>

            <div className='sectionContainer'>{/* Profile info */}

            </div>
        </div>

    );
}