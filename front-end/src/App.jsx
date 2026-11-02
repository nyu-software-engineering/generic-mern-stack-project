import "./App.css";
import Explore from "./pages/Explore";
import ReviewForm from "./components/ReviewForm";

function App() {
  return (
    <div className="app">
      <header>
        <h1>Sublet Search</h1>
      </header>

      <main>
        <Explore />
        <ReviewForm userName="Alex" />
      </main>
    </div>
  );
}

export default App;
