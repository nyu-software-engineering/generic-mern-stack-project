import React, { useState, useEffect } from 'react'
import  './CreateHousehold.css'
const CreateHousehold = props => {

    return(
        <div className = "createHouseholdContainer">
            <h1>Create Household</h1>

            <div className="inputFieldContainer">
                <p className="fieldText">Enter Household Name</p>
                <input type="text" className="textInput" placeholder="enter name here"/>
            </div>
            <button className="createButton" type="button">Create</button>
        </div>
    )
}

export default CreateHousehold;