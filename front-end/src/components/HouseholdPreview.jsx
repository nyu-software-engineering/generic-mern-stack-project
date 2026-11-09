import './HouseholdPreview.css'

const HouseholdPreview = ({ household, memberCount, hasSearched, onJoin }) => {
    return(
        <div className="householdPreview">
            {household ? (
            <>
            <div className="householdPreviewInfo">
                <div className="previewSectionTitle">
                    <h2 className="householdPreviewLabel">Household Preview</h2>
                </div>
                
                <h2 className="householdPreviewName"> {household.household_name} </h2>
                <p className="householdPreviewAddress">{household.address}</p>
                <p className="householdPreviewDetail">
                    {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </p>
            </div>
            {onJoin && (
            <button className="householdPreviewJoin" onClick={onJoin}>
              Join This Household
            </button>
            )}
            </>
            ):(
                <p className="householdPreviewEmpty">
                    Search a valid invite code to preview a household
                </p>
            )}
        </div>
    )
} 
export default HouseholdPreview