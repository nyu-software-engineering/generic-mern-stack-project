import { useState } from 'react';
import './ManageMemberRow.css';
const ManageMemberRow = (
    {
        first_name,
        last_name,
        onView,
        onRemove,
        removing = false
    }
) => {
    // asks "are you sure?" inside the row before removing someone
    const [confirming, setConfirming] = useState(false);

    const handleConfirm = () => {
        setConfirming(false);
        onRemove();
    };

    return(
        <div className='rowContainer'>
            <p className='memberNm'> {first_name} {last_name} </p>
            <div className='rowButtons'>
                {confirming ? (
                    <>
                        <button className='confirmRemoveButton' onClick={handleConfirm}> Confirm </button>
                        <button className='viewButton' onClick={() => setConfirming(false)}> Cancel </button>
                    </>
                ) : (
                    <>
                        <button className='viewButton' onClick={onView}> View </button>
                        {onRemove && (
                            <button className='removeButton' onClick={() => setConfirming(true)} disabled={removing}>
                                {removing ? 'Removing...' : 'Remove'}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
export default ManageMemberRow;
