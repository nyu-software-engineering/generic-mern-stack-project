import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Home.css'

const PostElement = props => {
  const [showOptions, setShowOptions] = useState(false)

  const toggleOptions = () => {
    props.setCurr(props.count - 1 - props.id)
    props.setShowAllOptions(prev => !prev)
    setShowOptions(prev => !prev)
  }

  const closeOptions = () => {
    setShowOptions(false)
    props.setShowAllOptions(false)
  }

    return(
        <>
        <div className="docs">
          <div className='header'>
            <div className='profile'>
              <img className='icon' src={props.pfp} alt="" />
              <p>{props.username}</p>
            </div>
            <button 
              className={props.showAllOptions ? 'closeSettings' : 'settings'} 
              onClick={toggleOptions}>...</button>
          </div>
          {/* doesn't work yet. needs to be based on ids not text, but yeah it works for demo */}
          {showOptions && <div className='buttons'>
            {(props.username === 'You') && <Link className="option" to={`/edit-post/${props.id}`} style={{textDecoration: 'none'}}>Edit</Link>}
            {(props.username === 'You') && <Link className="option" to={`/resolve-post/${props.id}`} style={{textDecoration: 'none'}}>Resolve</Link>}
            {(props.username !== 'You') && <Link className="option" to={`/messages/${props.id}`} style={{textDecoration: 'none'}}>Message</Link>}
          </div>}
          {showOptions && <div className='closeOptions' onClick={closeOptions}></div>}
          <div className='content'>
            <div className='title'>
              <h2>{props.title} | {props.category.at(0).toUpperCase() + props.category.slice(1)}</h2>
              <p>{props.desc}</p>
            </div>
            {props.date && <p><strong>Date:</strong> {props.date}</p>}
            {props.time && <p><strong>Time:</strong> {props.time}</p>}
            {props.location && <p><strong>Location:</strong> {props.location}</p>}
          </div>
          <div className='bounty-image-grouping'>
            {props.image && <img className='bounty-image' src={props.image} alt="" />}
            {props.category !== 'found' && <h2>{props.includeBounty ? 'BOUNTY' : 'NO BOUNTY'}</h2>}
            {props.category !== 'found' && <h3>{props.bounty}</h3>}
          </div>
          
        </div>
    </>
    )
}

const Home = props => {
  const navigate = useNavigate()
  const [showAllOptions, setShowAllOptions] = useState(false)

  useEffect(() => {
    if (!props.isLoggedIn) {
      navigate('/login')
    }
  }, [])

  const [titleFilter, setTitleFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const handleFilter = () => {
    const categorySelect = document.getElementById("categorySelect")
    setCategoryFilter(categorySelect.value)
  }
  const titleFilterHandler = () => {
    const search = document.getElementById("searchFilter")
    setTitleFilter(search.value)
  }
  return (
    <div id='bg'>
      <div id="search">
        <input
          type='text'
          id='searchFilter'
          placeholder="Search"
          onChange={() => titleFilterHandler()}
        />
        <button
          type="button"
          className="btn"
          command="show-modal" commandfor="dialog"
        >
          Filter
        </button>
      </div>

      <section id="next-steps">
        {props.postsData.length === 0 && <p>No Posts</p>}
        {props.postsData.length !== 0 && props.postsData.filter(e => {
          console.log(e.category)
          if((e.category == categoryFilter || categoryFilter == "all")
          && (e.title.toLowerCase().includes(titleFilter.toLowerCase()) || titleFilter == "")){
            return e
          }
        }).map((element, index) => {
          return (
            <PostElement 
              key={index}
              id={props.count - 1 - index}
              username={element.username} 
              pfp={element.pfp}
              category={element.category}
              title={element.title}
              desc={element.desc}
              date={element.date}
              time={element.time}
              location={element.location} 
              image={element.image}
              includeBounty={element.includeBounty} 
              bounty={element.category === 'found' ? '' : element.bounty} 
              setCurr={props.setCurr}
              postsData={props.postsData}
              count={props.count}
              showAllOptions={showAllOptions}
              setShowAllOptions={setShowAllOptions}
            />
          )
        })}
      </section>
      <dialog id="dialog">
        <p>Item Status</p>

        <select id="categorySelect">
          <option value="all"></option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
          <option value="request">Request</option>
        </select>
        <button commandfor="dialog" command="close" onClick={() => handleFilter()}>Apply Filter</button>
        <button commandfor="dialog" command="close" >Cancel</button>
      </dialog>
    </div>
  )
}

export default Home
