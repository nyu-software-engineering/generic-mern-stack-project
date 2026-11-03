export default function Profile(props) {
  
  return (
    <>
      <h1>{props["full_name"]}</h1>
      <img src="https://picsum.photos/200/200"></img>
      <h2>{props["university"]}</h2>
      
    </>
  )

}