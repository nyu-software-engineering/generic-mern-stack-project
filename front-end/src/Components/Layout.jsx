
import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <div className="page-content">
        {children}
      </div>
      <Navbar />
    </div>
  );
}

export default Layout;
