import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Registro from './registro.jsx';
import Login from './Login.jsx';
import Catalogo from './catalogo.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/catalogo" element={<Catalogo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
