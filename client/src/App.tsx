import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Login from "./pages/Login";
import Account from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Loading from "./components/loading";
import PublicRoutes from "./components/PublicRoutes";
import ProtectedRoutes from "./components/ProtectedRoutes";
import AnalysePage from "./pages/Analyse";
import JobMatcherPage from "./pages/JobsMatcher";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

const App = () => {
  const { loading } = useAppData();

  if (loading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route path="/account" element={<Account />} />
          <Route path="/analyse" element={<AnalysePage />} />
          <Route path="/jobmatcher" element={<JobMatcherPage />} />
        </Route>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;
