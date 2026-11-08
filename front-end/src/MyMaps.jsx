import { useState} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './MyMaps.css'


function MyMaps({ maps, onCreateMap }){
    const [newMap,setNewMap]=useState("")
    function createNewMap(event){
        event.preventDefault()
        if (newMap.trim()==="") return
        const map = onCreateMap(newMap)
        setNewMap("")
        navigate("/Map-Editor", { state: { map:map } })
        


    }


    const navigate=useNavigate()
    const location = useLocation()
    return(
        <div className="my-maps">
            <header>
                <h2>
                Logo
                </h2>
                <button onClick={() => navigate('/menu', {
                state: { backgroundLocation: location }
                })}>
                Menu
                </button>
            </header>
            
        <h1>My Maps</h1>
         <div className="map-list">
            {maps.map((map)=>(
            <button type="button"
                className="map-card"
                key={map.number}
                onClick={() => navigate("/Map-Editor", { state: {  map:map } })}
            > 
                <div className="map-picture">
                {map.asset ? <img src={map.image} alt="Map Preview" /> : <span>World map</span>}
                </div>
                <div className="map-name">
                    <p>{map.name}</p>

                </div>
                
                </button>
            ))}
            
        </div>

        <form className="create-new-map" onSubmit={createNewMap}>
            <input type="text" 
            placeholder="Create a New Map" 
            value={newMap}
            onChange={(event) => setNewMap(event.target.value)} /> 
            
            <button type="submit">
            Send
            </button>
        </form>
        <button onClick={() => navigate('/search')}>Browse historical maps</button>
      

        </div>
    )


}
export default MyMaps
