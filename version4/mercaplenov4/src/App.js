import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Registro from './registro.jsx';
import Login from './Login.jsx';
import Catalogo from './catalogo.jsx';
import CRUD1 from "./usuarioC.jsx"; // <--- IMPORTA EL CRUD

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/catalogo" element={<Catalogo />} />

        {/* ESTA RUTA FALTABA */}
        <Route path="/usuarioC" element={<CRUD1 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
