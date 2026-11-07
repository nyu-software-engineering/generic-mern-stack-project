import React from "react";

export default function TextField(props) {
  return (
    <div className="input-group">
      {props.label && <label>{props.label}</label>}
      <input
        type={props.type || "text"}
        placeholder={props.placeholder || ""}
        value={props.value || ""}
        onChange={props.onChange}
      />
    </div>
  );
}