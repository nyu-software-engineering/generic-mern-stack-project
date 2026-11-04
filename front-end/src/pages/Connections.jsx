import { mockUsers } from "../mocks/users";
import "./Connections.css";

export default function Connections() {
  const pendingRequests = mockUsers.slice(0, 3);
  const connectedUsers = mockUsers.slice(3, 9);

  return (
    <main className="connections-page">
      <div className="connections-container">
        <h1>Connections</h1>

        <section className="connections-section">
          <h2>Pending requests</h2>

          {pendingRequests.map((user) => (
            <div className="doin-card connection-user" key={user.id}>
              <img src={user.imageUrl} alt={user.name} />
              <span>{user.name}</span>
              <span>Pending</span>
            </div>
          ))}
        </section>

        <section className="connections-section">
          <h2>Your connections</h2>

          {connectedUsers.map((user) => (
            <div className="doin-card connection-user" key={user.id}>
              <img src={user.imageUrl} alt={user.name} />
              <span>{user.name}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
