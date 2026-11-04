import profile from '../profile1.json'
import services from '../services.json'
import './Profile.css'

const profile1 = profile[0]

export default function Profile(props) {
  
  return (
    <>
      <header className="top-bar">
        <strong>CampusMart</strong>
        <button type="button" onClick={() => props.setUser(null)}>
          Log Out
        </button>
      </header>
      <h1>{profile1["full_name"]}</h1>
      <img src="https://picsum.photos/200/200"></img>
      <h3>{profile1["university"]}</h3>
      <button id="edit-profile">Edit Profile</button>
      <h2>Offered Services</h2>
      {}
      <h2>Past Requested Services</h2>
      <h2>Manage Bookings</h2>
      
    </>
  )

}