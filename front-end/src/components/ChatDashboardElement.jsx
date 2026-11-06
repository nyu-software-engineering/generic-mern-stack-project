
export default function ChatDashboardElement({sublessor, subletName, lastActive, onOpen}){
    return (
        <button className="chat-dashboard-element" type="button" onClick={onOpen}>
            <h2>{sublessor}</h2>
            <p>{subletName}</p>
            <span className="last-active">{lastActive}</span>
        </button>
    );
}