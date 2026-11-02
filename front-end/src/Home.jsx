import { useNavigate } from 'react-router-dom'

function Home(){
    const navigate=useNavigate()

    return(
        <div className="home">
            <header>
                <h2>Logo</h2>
                <button onClick={()=>navigate("/menu")}>Menu</button>
            </header>

            <h1>Describe a map.</h1>
            <textarea placeholder="Make me a map of..." />
            <button onClick={()=>navigate("/Map-Editor")}>Generate map</button>
            <button onClick={()=>navigate("/MyMaps")}>My maps</button>
        </div>
    )
}
export default Home