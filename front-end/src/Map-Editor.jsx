import { useRef, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import './Map-Editor.css'


function Map_Editor({ onRenameMap }){
    const navigate=useNavigate()
    const location=useLocation()
    const map=location.state?.map
    const [instruction, setInstruction] = useState("")
    const [title, setTitle] = useState(map?.name || "Untitled Map")
    const [style, setStyle] = useState("none")
    const [tool, setTool] = useState("")
    const imageRef = useRef(null)

    function rename(value){
        setTitle(value)
        if (map) onRenameMap(map.number, value)
    }

    function exportMap(){
        const image = imageRef.current
        if (!image?.complete || !image.naturalWidth) {
            alert("Map image is still loading. Please try again.")
            return
        }
        try {
            const canvas = document.createElement("canvas")
            canvas.width = 500
            canvas.height = 480
            const context = canvas.getContext("2d")
            context.fillStyle = "white"
            context.fillRect(0, 0, 500, 480)
            context.fillStyle = "black"
            context.font = "bold 22px Arial"
            context.fillText(title, 20, 32, 460)
            context.filter = style
            context.drawImage(image, 50, 50, 400, 400)
            const link = document.createElement("a")
            link.download = "map.png"
            link.href = canvas.toDataURL("image/png")
            link.click()
        } catch {
            alert("Could not export the image. Please try again.")
        }
    }

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
            
        <h1>{title}</h1>

        <div className="map-preview">
            <img
             ref={imageRef}
             crossOrigin="anonymous"
             src={map?.image || "https://picsum.photos/400/400"}
             alt="Map Preview"
             style={{ filter: style }}
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
            <button onClick={()=>setTool("Style")}>
            Style
            </button>
            <button onClick={()=>setTool("Source")}>
            Source
            </button>
            <button onClick={()=>setTool("Edit Text")}>
            Edit Text
            </button>
            <button onClick={exportMap}>
            Export
            </button>

        </div>

        {tool && <div className="tool-panel">
            <h2>{tool}</h2>
            {tool === "Style" && [
                ["Original", "none"], ["Black and white", "grayscale(1)"], ["Warm", "sepia(0.6)"]
            ].map(([label, filter]) => <button key={label} onClick={()=>setStyle(filter)}>{label}</button>)}
            {tool === "Edit Text" && <input aria-label="Map title" value={title}
                onChange={(event)=>rename(event.target.value)} />}
            {tool === "Source" && <p>Placeholder photo from <a href="https://picsum.photos/"
                target="_blank" rel="noopener noreferrer">Picsum Photos</a>.</p>}
            <button onClick={()=>setTool("")}>Close</button>
        </div>}



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
