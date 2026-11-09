import { useEffect, useState } from 'react';
import './ManageMemberRow.css';
const ManageMemberRow = (
    {
        first_name,
        last_name,
        onView
    }
) => {

    return(
        <div className='rowContainer'>
            <p className='memberNm'> {first_name} {last_name} </p>
            <button className='viewButton' onClick={onView}> View </button>
        </div>
    )
}
export default ManageMemberRow;