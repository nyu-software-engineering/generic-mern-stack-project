import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HeaderButtons from '../../components/HeaderButtons';
import HouseholdPreview from '../../components/HouseholdPreview';
import './join_household.css'


const JoinHousehold = () => {
    const [inviteCode, setInviteCode] = useState('');
    const [households, setHouseholds] = useState([]);
    const [message, setMessage] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [foundHousehold, setFoundHousehold] = useState(null);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [householdsRes, membersRes] = await Promise.all([
                axios.get(import.meta.env.VITE_HOUSEHOLDS_API_URL),
                axios.get(import.meta.env.VITE_MEMBERS_API_URL),
                ])
                if (Array.isArray(householdsRes.data)) setHouseholds(householdsRes.data)
                if (Array.isArray(membersRes.data)) setMembers(membersRes.data)
            } catch (err) {
                console.error('Could not fetch household data', err)
            }
        }
        fetchData()
    }, [])

    const handleSearch = () => {
        setHasSearched(true)
        const code = inviteCode.trim()

        const match = households.find(h => h.invite_code === code)
            if (match) {
                setMessage('')
                setFoundHousehold(match)
            }else{
                setMessage('That invite code is not valid.')
                setFoundHousehold(null)
            }
    }
    const memberCount = foundHousehold? members.filter(member => member.household_id === foundHousehold.household_id).length
                    : 0
    return(
        <div className="joinHouseholdPage">
            <HeaderButtons backTo='/home'/>
                
            <div className="joinHouseholdContainer">
                <h1 className="joinHouseholdTitle">Join Household</h1>

                <div className="joinHouseholdForm">
                    <label htmlFor="inviteCode" className="joinHouseholdLabel">Enter Invite Code</label>
                    <input
                        id="inviteCode"
                        type="text"
                        className="joinHouseholdInput"
                        value={inviteCode}
                        onChange={e => setInviteCode(e.target.value)}
                        placeholder="e.g. K7Q2M"
                    />
                    {message && 
                        <p className="joinHouseholdError">{message}</p>
                    }
                </div>

                <button className="joinHouseholdSubmit" onClick={handleSearch}>
                    Search Invite Code
                </button>

            </div>
            <HouseholdPreview
                household={foundHousehold}
                memberCount={memberCount}
                hasSearched={hasSearched}
                onJoin={() => navigate('/household')}
            />
        </div>
    )

}
export default JoinHousehold;