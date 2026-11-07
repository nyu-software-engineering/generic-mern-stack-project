

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

const eventCoordinates = {
  "Brooklyn Boulders": [40.6795, -73.9835],
  "Central Park": [40.7829, -73.9654],
  "Vital Climbing": [40.7178, -73.9594],
  "Hudson River Park, Pier 40": [40.7292, -74.0117],
};

function Map() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/mock/events.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load events");
        }

        return response.json();
      })
      .then((data) => {
        setEvents(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="map-page">
      <h1>Explore Events</h1>
      <p>Find hobby events happening near you!</p>

      <div className="map-filters">
        <button
          className={filter === "all" ? "map-filter-active" : "map-filter"}
          onClick={() => setFilter("all")}
        >
          All Events
        </button>

        <button
          className={filter === "now" ? "map-filter-active" : "map-filter"}
          onClick={() => setFilter("now")}
        >
          Now
        </button>

        <button
          className={filter === "upcoming" ? "map-filter-active" : "map-filter"}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </button>
      </div>

      <MapContainer
        center={[40.7128, -74.0060]}
        zoom={12}
        scrollWheelZoom={false}
        className="hobby-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {events.map((event) => {
          const position = eventCoordinates[event.location];

          if (!position) {
            return null;
          }

          return (
            <Marker key={event.id} position={position}>
              <Popup>
                <strong>{event.title}</strong>
                <p>{event.hobby}</p>
                <p>{event.time}</p>
                <p>{event.location}</p>

                <Link
                  to={`/events/${event.id}`}
                  state={{ from: "/map" }}
                >
                  View Event
                </Link>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default Map;
