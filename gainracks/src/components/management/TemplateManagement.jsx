import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminPanel.css';

/*
  TemplateManagement
  - Encapsula toda la lógica relacionada con plantillas (templates):
    * Listado desde el backend
    * Formulario para subir una plantilla en .txt (se lee en el cliente)
    * Acciones: Ver, Descargar, Borrar
  - Comentarios: se mantiene la lectura del archivo en el cliente para evitar dependencias multipart en el servidor.
*/
function TemplateManagement() {
  // Estado: lista de plantillas obtenidas del servidor
  const [templates, setTemplates] = useState([]);
  // Estado: valores del formulario de subida
  const [tplName, setTplName] = useState('');
  const [tplVersion, setTplVersion] = useState('1.0');
  const [tplFile, setTplFile] = useState(null);

  // Efecto: al montar, recuperar las plantillas del backend.
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const res = await axios.get('http://localhost:3000/templates', { headers: { Authorization: userId } });
        setTemplates(res.data || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    };
    fetchTemplates();
  }, []);

  // Handler para subir una nueva plantilla.
  // - Lee el .txt en el cliente usando File.text()
  // - Envía { nameTemplate, versionTemplate, content } al endpoint JSON del backend
  // - Actualiza la lista local de plantillas para reflejar el nuevo elemento
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!tplFile) return alert('Seleccioná un archivo .txt');
    if (!tplName) return alert('Ingresá un nombre para la plantilla');
    try {
      const userId = localStorage.getItem('userId');
      const text = await tplFile.text();
      const payload = { nameTemplate: tplName, versionTemplate: tplVersion, content: text };
      const res = await axios.post('http://localhost:3000/templates/upload', payload, { headers: { Authorization: userId } });
      setTemplates((prev) => [res.data, ...prev]);
      setTplName(''); setTplVersion('1.0'); setTplFile(null);
      alert('Plantilla subida');
    } catch (err) {
      console.error('Error subiendo plantilla:', err);
      alert('No se pudo subir la plantilla');
    }
  };

  // Handler para eliminar una plantilla por id.
  // - Pide confirmación al usuario
  // - Llama DELETE al backend y elimina localmente la plantilla si tiene éxito
  const handleDelete = async (id) => {
    if (!window.confirm('Confirmá que querés eliminar la plantilla')) return;
    try {
      const userId = localStorage.getItem('userId');
      await axios.delete(`http://localhost:3000/templates/${id}`, { headers: { Authorization: userId } });
      setTemplates((prev) => prev.filter(p => (p.idPlantilla || p.id) !== id));
      alert('Plantilla eliminada');
    } catch (err) {
      console.error('Error eliminando plantilla:', err);
      alert('No se pudo eliminar la plantilla');
    }
  };

  return (
    <div>
      <h2>Gestión de Plantillas</h2>
      <div className="templates-section">
        <form className="templates-form" onSubmit={handleUpload}>
          <div className="field">
            <label>Nombre plantilla</label>
            <input type="text" value={tplName} onChange={(e) => setTplName(e.target.value)} />
          </div>

          <div className="field">
            <label>Versión</label>
            <input type="text" value={tplVersion} onChange={(e) => setTplVersion(e.target.value)} />
          </div>

          <div className="field file-field">
            <label>Archivo .txt</label>
            <div className="file-control">
              <input id="tplFileInput_mgmt" className="real-file-input" type="file" accept=".txt,text/plain" onChange={(e) => setTplFile(e.target.files?.[0] || null)} />
              <label htmlFor="tplFileInput_mgmt" className="file-btn btn-ghost">Seleccionar archivo</label>
              <span className="file-name">{tplFile?.name ? tplFile.name : 'Sin archivos seleccionados'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <button className="btn btn-primary" type="submit">Subir plantilla</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setTplName(''); setTplVersion('1.0'); setTplFile(null); }}>Limpiar</button>
          </div>
        </form>

        <table className="templates-table" aria-label="Plantillas">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Versión</th>
              <th>Contenido (preview)</th>
              <th style={{ width: 150, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.idPlantilla}>
                <td>{t.nameTemplate}</td>
                <td>{t.versionTemplate}</td>
                <td><div className="template-content">{t.content}</div></td>
                <td className="template-actions">
                  <button className="btn btn-ghost" onClick={() => handleDelete(t.idPlantilla)}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TemplateManagement;
