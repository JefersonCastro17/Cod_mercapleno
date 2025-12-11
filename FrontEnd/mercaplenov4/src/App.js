import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Registro from './registro.jsx';
import Login from './Login.jsx';
import Catalogo from './catalogo.jsx';
import CRUD1 from "./usuarioC.jsx"; // <--- CRUD Usuarios
import Estadisticas from "./estadisticas.jsx"; // <--- NUEVO componente
import Lista_productos  from './Lista_productos.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/Lista_productos" element={<Lista_productos/>} />

        {/* CRUD de Usuarios */}
        <Route path="/usuarioC" element={<CRUD1 />} />

        {/* NUEVA RUTA: Estadísticas */}
        <Route path="/estadisticas" element={<Estadisticas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
