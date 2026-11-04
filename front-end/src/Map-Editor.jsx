import { useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'


function Map_Editor(){
    const navigate=useNavigate()
    const location=useLocation()
    const map=location.state?.map
    const [instruction, setInstruction] = useState("")

    return(
        <div className="map-editor">
            <header>
                <h2>
                Logo
                </h2>
                <button onClick={()=>navigate("/menu")}>
                Menu
                </button>
            </header>
            
        <h1>{map?.name || "Untitled Map"}</h1>

        <div className="map-preview">
            <img
             src={map?.image || "https://picsum.photos/400/400"}
             alt="Map Preview"
            />
        </div>

        <div className="map-key">
            <div className="map-category">
                <div className="category-color">
                <p>Category 1</p>
                </div>
            </div>
            <div className="map-category">
                <div className="category-color">
                <p>Category 2</p>
                </div>
            </div>
        </div>



        <div className="map-editing-tools">
            <button onClick={()=>navigate("/style")}>
            Style
            </button>
            <button onClick={()=>navigate("/source")}>
            Source
            </button>
            <button onClick={()=>navigate("/edit-text")}>
            Edit Text
            </button>
            <button>
            Export
            </button>

        </div>



        <div className="change map">
            <input type="text" placeholder="Tell MapMaker what to change..." 
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)} 
            />
            
            <button onClick={() => {
                if (instruction.trim() === "") return
                alert("Instruction submitted: " + instruction)
                setInstruction("")
            }}>
            Send
            </button>
        </div>


        </div>
    )


}
export default Map_Editor