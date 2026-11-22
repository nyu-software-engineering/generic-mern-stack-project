import "./EditSaved.css";
import { useState } from "react";

function EditSaved(props) {
  const [draft, setDraft] = useState(props.description);

  return (
    <div className="edit-page-wrapper">
      <div id="edit-card-container">
        <article className="edit-card">
          <div className="edit-image-and-edit">
            <div className="edit-card-image">
              <img
                src={props.imageSrc || "https://picsum.photos/400/225"}
                alt="Picture"
              />
            </div>
            <button id="EditSaved-BackBtn" onClick={props.goBack}>
              Back
            </button>
          </div>

          <div className="edit-card-info">
            <h3 className="edit-card-name">{props.name}</h3>
            <div className="edit-card-meta">
              {props.location && <span>{props.location}</span>}
              {props.date && <span>{props.date}</span>}
            </div>
            <textarea
              className="edit-card-textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>
        </article>
      </div>

      <div id="edit-card-actions-container">
        <button
          className="EditSaved-Btn"
          onClick={() => props.onDelete(props.id)}
        >
          Delete
        </button>
        <button
          className="EditSaved-Btn"
          onClick={() => props.onSave(props.id, draft)}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default EditSaved;
