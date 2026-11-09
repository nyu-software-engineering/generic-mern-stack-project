import { useEffect, useState } from 'react';
import './MemberQuickView.css'
const MemberQuickView = ( { member } ) => {
    return(
       <div className='quickViewContainer'>
            <div className='quickViewHeader'>
                <p className="memberNameQVP"> {member.first_name} {member.last_name}</p>
                <p className="memberEmail"> {member.email}</p>
            </div>
            <div className='quickViewInfo'>
                <p className="memberInfoEmail"> Name: {member.first_name} {member.last_name}</p>
                <div className="paymentInfo">
                    <p className="routingNum"> Bank Routing Number: {member.routing_num}</p>
                </div>
               
            </div>
       </div> 
    )
}
export default MemberQuickView