import "./EditSaved.css";

function EditSaved(props){
    return(
        <div className="edit-page-wrapper">
            <article className="edit-card">
            <div className="edit-image_and_edit">
                {props.imageSrc ? (
                <img className="edit-card-image" src={props.imageSrc} alt="" />
                ) : (
                <div className="edit-card-image"> Place Holder Image</div>
                )}
                <button style={{flex:1}} onClick={props.goBack}>Back</button>
            </div>
            <div className="edit-card-info">{props.description}</div>
            </article>
        </div>
    )
}

export default EditSaved