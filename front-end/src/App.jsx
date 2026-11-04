
import { BrowserRouter, Route, Routes, useNavigate, useParams } from "react-router";

import Layout from "./Components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import SelectInterests from "./pages/SelectInterests";
import SetupProfile from "./pages/SetupProfile";
import Welcome from "./pages/Welcome";

import DiscoverPeople from "./DiscoverPeople";
import Explore from "./Explore";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import EventDetails from "./pages/EventDetails";
import PersonDetails from "./PersonDetails";

import Connections from "./pages/Connections";
import EditProfile from "./pages/EditProfile";
import MyEvents from "./pages/MyEvents";
import Profile from "./pages/Profile";
import SearchPage from "./pages/SearchPage";

import mockPeople from "./mockDiscoverPeople";
import mockEvents from "./mockEvents";
import { mockUsers } from "./mocks/users";

// Discover People navigation
function PeoplePage() {
  const navigate = useNavigate();

  return (
    <DiscoverPeople
      onViewProfile={(person) => navigate(`/people/${person.id}`)}
    />
  );
}

// Individual person profile
function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const person = mockPeople.find((person) => String(person.id) === id);

  if (!person) {
    return <h2>Person not found</h2>;
  }

  const profile = {
    ...person,
    hobbies: person.hobbies.split(" • "),
    bio: "Enjoys meeting people and trying new activities.",
    sharedInterests: person.hobbies.split(" • ")
  };

  return (
    <PersonDetails
      person={profile}
      onBack={() => navigate("/people")}
    />
  );
}

// Explore Events navigation
function EventsPage() {
  const navigate = useNavigate();

  return (
    <Explore
      onViewEvent={(event) => navigate(`/events/${event.id}`)}
      onCreateEvent={() => navigate("/events/create")}
    />
  );
}

// Individual event details
function EventPage() {
  const { id } = useParams();
  const event = mockEvents.find((event) => String(event.id) === id);

  if (!event) {
    return <h2>Event not found</h2>;
  }

  const eventDetails = {
    ...event,
    description: "Meet new people and enjoy this activity together.",
    startTime: event.time,
    endTime: "",
    capacity: 20,
    attendeeIds: [],
    organizer: "Doin member",
    imageUrl: event.image
  };

  return (
    <EventDetails
      event={eventDetails}
      users={mockUsers}
      currentUser={mockUsers[0]}
    />
  );
}

// Create Event form
function CreateEventPage() {
  const navigate = useNavigate();

  function handleCreate(event) {
    console.log("Created event:", event);
    navigate("/events");
  }

  return <CreateEvent onCreate={handleCreate} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Welcome and account pages */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/select-interests" element={<SelectInterests />} />
        <Route path="/setup-profile" element={<SetupProfile />} />

        {/* Main app pages with bottom navigation */}
        <Route path="/people" element={<Layout><PeoplePage /></Layout>} />
        <Route path="/discover" element={<Layout><PeoplePage /></Layout>} />
        <Route path="/people/:id" element={<Layout><PersonPage /></Layout>} />

        <Route path="/events" element={<Layout><EventsPage /></Layout>} />
        <Route path="/events/create" element={<Layout><CreateEventPage /></Layout>} />
        <Route path="/events/:id" element={<Layout><EventPage /></Layout>} />
        <Route path="/events/:id/edit" element={<Layout><EditEvent /></Layout>} />
        <Route path="/my-events" element={<Layout><MyEvents /></Layout>} />

        <Route path="/connect" element={<Layout><Connections /></Layout>} />
        <Route path="/connections" element={<Layout><Connections /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/profile/edit" element={<Layout><EditProfile /></Layout>} />
        <Route path="/search" element={<Layout><SearchPage /></Layout>} />

        <Route path="*" element={<h2>Page not found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
