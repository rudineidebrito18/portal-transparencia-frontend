import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import PublicLayout from "../layouts/PublicLayout";

export default function PublicRoutes() {
  return (
    <PublicLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* futuras rotas: servidores, licitações, relatórios */}
        <Route path="*" element={<div>Página não encontrada.</div>} />
      </Routes>
    </PublicLayout>
  );
}
