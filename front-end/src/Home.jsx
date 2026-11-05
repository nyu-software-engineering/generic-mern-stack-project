import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home({ onCreateMap }){
    const navigate=useNavigate()
    const [description, setDescription] = useState("")

    function createMap(){
        navigate("/Map-Editor", { state: { map:onCreateMap(description) } })
    }

    return(
        <div className="home">
            <header>
                <h2>Logo</h2>
                <button onClick={()=>navigate("/menu")}>Menu</button>
            </header>

            <h1>Describe a map.</h1>
            <textarea placeholder="Make me a map of..." value={description} onChange={(event)=>setDescription(event.target.value)} />
            <button onClick={createMap}>Generate map</button>
            <button onClick={()=>navigate("/MyMaps")}>My maps</button>
        </div>
    )
}
export default Home
