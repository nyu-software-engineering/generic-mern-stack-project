import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SplitLeaseLogo from '../../assets/splitlease-blank-background-logo.png';
// import { Header } from '../../components/'
import axios from 'axios';
import './ManageMembers.css';
import ManageMemberRow from '../../components/ManageMemberRow';
import MemberQuickView from '../../components/MemberQuickView';
import HeaderButtons from "../../components/HeaderButtons";

const ManageMembersPage = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [memberSelected, setMemberSelected] = useState(null);
    const [copyCodeSelected, setCopyCodeSelected] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            try{
                const response = await axios.get(import.meta.env.VITE_MEMBERS_API_URL)
                if (Array.isArray(response.data)) {
                    setMembers(response.data)
                }else {
                    console.error('Members response was not a list:', response.data)
                }
            }catch(e) {
                console.log('Could not fetch the members')
                console.error(e)
            }
        } 
        fetchMembers()
    }, [])
//   members.forEach(member => {
//         console.log(`first name: ${member.first_name}`)
//     })
    // console.log(`members.first_name: ${members.map(member => member.first_name)}`);

    return(
        <div className='mainContainer'> {/* Parent div */}
            <div className="header">
                <HeaderButtons backTo='/household'/>
                <h1 className="pageTitle">Manage Members</h1>
            </div>
                
            
            <div>
                <button className="copyInviteButton" onClick={() => setCopyCodeSelected(true)}> Copy Invite Code </button>
            </div>    
            <div className='sectionContainer'> {/* Members List Section */}
                <h2 className="sectionTitle">Members List</h2>
                <div className="manageMembersList"> {/* Actual members list */}
                    {
                        members.map(member => (
                            <ManageMemberRow 
                                key={member.id}
                                first_name={member.first_name}
                                last_name={member.last_name}
                                onView={() => setMemberSelected(member)}
                            />
                        ))
                    }
                </div>
                {members.length > 4 && (
                    <p className="scrollMessage">Scroll down to see more</p>
                )}
            </div>

            <div className='quickViewProfSection'>{/* Profile info */}
                {memberSelected ? (
                    <div className="quickViewProfInfo">
                        <MemberQuickView member={memberSelected} />
                    </div>
                ):(
                    <p className="emptyQuickViewProf">
                        No Member Selected to View
                    </p>
                )}
            </div>
        </div>

    );
}
export default ManageMembersPage;