
export default function ChatDashboardElement({sublessor, subletName, onOpen}){
    return (
        <button type="button" onClick={onOpen}>
            <h2>{sublessor}</h2>
            <p>{subletName}</p>
        </button>
    );
}