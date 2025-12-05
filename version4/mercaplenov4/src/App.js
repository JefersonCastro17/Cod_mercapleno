import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Registro from './registro.jsx';
import Login from './Login.jsx';
import Catalogo from './catalogo.jsx';
import CRUD1 from "./usuarioC.jsx"; // <--- CRUD Usuarios
import Estadisticas from "./estadisticas.jsx"; // <--- NUEVO componente

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/catalogo" element={<Catalogo />} />

        {/* CRUD de Usuarios */}
        <Route path="/usuarioC" element={<CRUD1 />} />

        {/* NUEVA RUTA: Estadísticas */}
        <Route path="/estadisticas" element={<Estadisticas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
