import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
