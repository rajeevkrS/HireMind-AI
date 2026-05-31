import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Login from "./pages/Login";
import Account from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Loading from "./components/loading";

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
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;
