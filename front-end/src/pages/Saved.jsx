import "./Saved.css";
import { useState, useEffect } from 'react';

{/* use the useState to load up the saved array from db when we get a db */}
const savedItems = [
  { id: 1, description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
  { id: 2, description: "Saved Hotel 2" },
  { id: 3, description: "Saved Hotel 3" },
  { id: 4, description: "Saved Hotel 4" },
  { id: 5, description: "Saved Hotel 5" },
];

function Card(props) {
  return (
    <article className="card">
      {props.imageSrc ? (
        <img className="card-image" src={props.imageSrc} alt="" />
      ) : (
        <div className="card-image placeholder"> Place Holder Image</div>
      )}
      <div className="card-info">{props.description}</div>
    </article>
  );
}

function Saved() {
  return (
    <div className="page-wrapper">
      <header class='saved_header'>
        <div style={{flex:3}}>
          <img src="https://picsum.photos/340/180" style={{ width: '100%', height: '100%', objectFit: 'cover'}}/>
        </div>
        <div style={{flex:5, border:'solid'}}></div>
      </header>

      <h2>Saved Hotels</h2>
      
      {savedItems.length > 0 ? (
        savedItems.map((item) => (
          <Card key={item.id} description={item.description} />
        ))
      ) : (
        <p>You haven't saved any hotels yet!</p>
      )}

    </div>
  );
}

export default Saved;