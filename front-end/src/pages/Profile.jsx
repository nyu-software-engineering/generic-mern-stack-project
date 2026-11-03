import profile from '../profile1.json'
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
      <h2>{profile1["university"]}</h2>
      
    </>
  )

}