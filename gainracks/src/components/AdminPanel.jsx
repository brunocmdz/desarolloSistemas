import './styles/homePrivate.css';
import './styles/AdminPanel.css';

import TemplateManagement from './management/TemplateManagement';
import UserManagement from './management/UserManagement';

function AdminPanel() {
  return (
    <div>
      {/* Componente contenedor que delega en componentes más pequeños */}
      <TemplateManagement />
      <UserManagement />
    </div>
  );
}

export default AdminPanel;
