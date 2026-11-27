import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Home.css'

const PostElement = props => {
  const [showOptions, setShowOptions] = useState(false)

  const toggleOptions = () => {
    props.setCurr(props.count - 1 - props.id)
    props.setShowAllOptions(prev => !prev)
    setShowOptions(prev => !prev)
    console.log(props.count - 1 - props.id)
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
            {(props.email === props.currentUser.email) && <Link className="option" to={`/edit-post/${props.id}`} style={{textDecoration: 'none'}}>Edit</Link>}
            {(props.email === props.currentUser.email) && <Link className="option" to={`/resolve-post/${props.id}`} style={{textDecoration: 'none'}}>Resolve</Link>}
            {(props.email !== props.currentUser.email) && <Link className="option" to="/messages" onClick={e => { e.preventDefault(); closeOptions(); props.onMessage() }} style={{textDecoration: 'none'}}>Message</Link>}         
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

  // as soon as profile is updated, go back and update old posts
  useEffect(() => {
    props.postsData.forEach(post => {
      if (post.email === props.currentUser.email) {
        post.username = props.currentUser.name
        post.pfp = props.currentUser.picture
      }
    })
  }, [])

  const openChat = post => {
    props.startConversation(post)
      .then(id => navigate(`/messages/${id}`))
      .catch(err => console.error(err))
  }

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
          className="filter-btn"
          command="show-modal" commandfor="dialog"
        >
          Filter
        </button>
      </div>

      <section id="next-steps">
        {props.postsData.length === 0 && <p>No Posts</p>}
        {props.postsData.length !== 0 && props.postsData
        .filter(e => {
          console.log(e.category)
          if((e.category == categoryFilter || categoryFilter == "all")
          && (e.title.toLowerCase().includes(titleFilter.toLowerCase()) || titleFilter == "")){
            return e
          }
        })
        .map((element, index) => {
          return (
            <PostElement 
              key={index}
              id={props.count - 1 - index}
              email={element.email}
              // username={element.username} 
              // pfp={element.pfp}
              username={element.email === props.currentUser.email ? 
                props.currentUser.name : element.username} 
              pfp={element.email === props.currentUser.email ? 
                props.currentUser.picture : element.pfp}
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
              curr={props.curr}
              postsData={props.postsData}
              count={props.count}
              showAllOptions={showAllOptions}
              setShowAllOptions={setShowAllOptions}
              onMessage={() => openChat(element)}
              currentUser={props.currentUser}
            />
          )
        })}
      </section>
      <dialog id="dialog">
        <div id='dialog-contents'>
          <p>Item Category</p>

          <select id="categorySelect">
            <option value="all"></option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="request">Request</option>
          </select>
          <button commandfor="dialog" command="close" onClick={() => handleFilter()} id='filter'>Apply Filter</button>
          <button commandfor="dialog" command="close" >Cancel</button>
        </div>
      </dialog>
    </div>
  )
}

export default Home
