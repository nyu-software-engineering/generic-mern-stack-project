import { useState} from 'react'
import { useNavigate } from 'react-router-dom'


function MyMaps(){
    const [maps, setMaps] = useState([
        { number: 1,
          name: "Map Title",
          image: "https://picsum.photos/100/100"
        },
        { number: 2,
          name: "Map Title",
          image: "https://picsum.photos/100/100"
        },
        { number: 3,
          name: "Map Title",
          image: "https://picsum.photos/100/100"
        }
    ])
    const [newMap,setNewMap]=useState(" ")
    function createNewMap(){
        if (newMap.trim()==="") return
        const map = {
               number: maps.length+1,
               name: newMap, 
               image: "https://picsum.photos/100/100" 
        }
        setMaps([...maps, map])
        setNewMap("")
        navigate("/Map-Editor", { state: { map:map } })
        


    }


    const navigate=useNavigate()
    return(
        <div className="my-maps">
            <header>
                <h2>
                Logo
                </h2>
                <button onClick={()=>navigate("/menu")}>
                Menu
                </button>
            </header>
            
        <h1>My Maps</h1>
         <div className="map-list">
            {maps.map((map)=>(
            <div
                className="map-card"
                key={map.number}
                onClick={() => navigate("/Map-Editor", { state: {  map:map } })}
            > 
                <div className="map-picture">
                <img
                src={map.image}
                alt="Map Preview"
                />
                </div>
                <div className="map-name">
                    <p>{map.name}</p>

                </div>
                
                </div>
            ))}
            
        </div>

        <div className="create-new-map">
            <input type="text" 
            placeholder="Create a New Map" 
            value={newMap}
            onChange={(event) => setNewMap(event.target.value)} /> 
            
            <button onClick={createNewMap}>
            Send
            </button>
        </div>
      

        </div>
    )


}
export default MyMaps