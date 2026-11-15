import EditSaved from "./EditSaved";
import "./Saved.css";
import { useState } from "react";
import { useSaved } from "../shared_content/SavedContent";
import Card from "../components/Card";

function Saved() {
  {/* use the useState to load up the saved array from db when we get a db */}
  const { savedItems, loading, error, removeSaved, updateDescription } = useSaved();

  const [filterText, setFilterText] = useState("");
  const visibleItems = savedItems.filter((item) =>
    [item.name, item.location, item.date, item.description]
      .join(" ")
      .toLowerCase()
      .includes(filterText.toLowerCase())
  );

  const [currentView, setCurrentView] = useState('noEdit');

  const [activeItemEdit, setActiveItemEdit] = useState(null);

  const handleEdit = (item) => {
    setCurrentView("edit");
    setActiveItemEdit(item);
  }

  const handleGoBack = () => {
    setCurrentView("noEdit");
    setActiveItemEdit(null);
  }

  {/*modify for data base later*/}
  const handleSave = async (id, newDescription) => {
    try {
      await updateDescription(id, newDescription);
      handleGoBack();
    } catch (err) {
      console.err(err.message);
    }
  };

  {/*modify for data base later*/}
  const handleDelete = async (id) => {
    try {
      await removeSaved(id);      
      handleGoBack();
    } catch (err) {
      alert(err.message);
    }
  };

  if(currentView === 'noEdit'){
    return (
      <div className="page-wrapper">
        <header className='saved-header'>
          <div style={{flex:3}}>
            <img src="https://picsum.photos/340/180" style={{ width: '100%', height: '100%', objectFit: 'cover'}}/>
          </div>
          <div className="saved-header-info">
            <input
              id="saved-filter"
              className="saved-filter-input"
              type="text"
              placeholder="Name, location, date..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
         </div>
        </header>

        <h2>Saved Hotels</h2>
        
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Couldn't load saved hotels: {error}</p>
      ) : savedItems.length === 0 ? (
        <p>You haven't saved any hotels yet!</p>
      ) : visibleItems.length === 0 ? (
        <p>No saved hotels match "{filterText}".</p>
      ) : (
        visibleItems.map((item) => (
          <Card key={item.id} description={item.description} location={item.location} date={item.date} name={item.name} Edit={()=>handleEdit(item)}/>
        ))
      )}

        <div className="list-end-spacer"/>
      </div>
    );
  } else return <EditSaved id={activeItemEdit.id} name={activeItemEdit.name} location={activeItemEdit.location} date={activeItemEdit.date} description={activeItemEdit.description} goBack={handleGoBack} onSave={handleSave} onDelete={handleDelete}/>
}

export default Saved;