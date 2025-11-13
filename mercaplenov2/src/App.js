import { BrowserRouter, Routes, Route, } from "react-router-dom";
import Login from "./Login";
import Registro from "./registro";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
