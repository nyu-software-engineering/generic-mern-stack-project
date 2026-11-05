import ProfileServiceCard from './ProfileServiceCard'
import { Link } from 'react-router'
import './Profile.css'
import './Header.css'



export default function Profile(props) {
  const profile1 = props.profile
  const userServices = props.services.filter(service => profile1.services.includes(service.id))
  console.log(userServices)
  const numListings = userServices.length

  return (
    <>
      <header className="site-header">
        <strong>CampusMart</strong>
        <button className="logout-button" type="button" onClick={() => props.setUser(null)}>
          Log Out
        </button>
      </header>
      <h1>{profile1["full_name"]}</h1>
      <img src={profile1["profile_picture"]}></img>
      <h3>{profile1["university"]}</h3>
      <p>{profile1["email"]}</p>
      <p>{profile1["bio"]}</p>
      <Link className="profile-button" to="/profile/edit">Edit Profile</Link>
      <h2>Offered Services</h2>
      {userServices.map(service => <ProfileServiceCard key={service.id} service={service}/>)}
      <Link className="profile-button" to="/profile/services">Manage my services · {numListings} listings</Link>
      <h2>Past Requested Services</h2>
      <h2>Manage Bookings</h2>
      
    </>
  )

}