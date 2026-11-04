import "./EditSaved.css";
import { useState } from "react";

function EditSaved(props){
    const [draft, setDraft] = useState(props.description);

    return(
        <div className="edit-page-wrapper">
            <div id='edit-card-container'>
                <article className="edit-card">
                <div className="edit-image_and_edit">
                    {props.imageSrc ? (
                        <div className="edit-card-image">
                            <img src={props.imageSrc} alt="" />
                        </div>
                    ) : (
                        <div className="edit-card-image">
                            <img
                                src="https://picsum.photos/200/300"
                                alt="Random placeholder from Picsum"
                            />
                        </div>
                    )}
                    <button id='EditSaved-BackBtn' onClick={props.goBack}>Back</button>
                </div>
                <textarea
                    className="edit-card-info"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                />
                </article>
            </div>
            <div id='edit-card-actions-container'>
            <button className='EditSaved-Btn' onClick={() => props.onDelete(props.id)}>Delete</button>
            <button className='EditSaved-Btn' onClick={() => props.onSave(props.id, draft)}>Save Changes</button>
            </div>
        </div>
    )
}

export default EditSaved