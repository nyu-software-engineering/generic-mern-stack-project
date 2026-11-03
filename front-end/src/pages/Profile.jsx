import profile from '../profile1.json'

const profile1 = profile[0]
export default function Profile(props) {
  
  return (
    <>
      <h1>{profile1["full_name"]}</h1>
      <img src="https://picsum.photos/200/200"></img>
      <h2>{profile1["university"]}</h2>
      
    </>
  )

}