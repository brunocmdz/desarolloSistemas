import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HomePrivate = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [records, setRecords] = useState([]);

  // Al montar, traer las plantillas desde el backend
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
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get('http://localhost:3000/records', { headers: { Authorization: userId } });
      setRecords(res.data || []);
    } catch (err) {
      console.error('Error fetching records:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar por extensión en vez de tipo MIME
      if (file.name.endsWith('.txt')) {
        setSelectedFile(file);
      } else {
        alert('Por favor selecciona un archivo .txt');
        setSelectedFile(null);
      }
    }
  };

  const uploadFile = async () => {
    try {
      const userId = localStorage.getItem('userId');
  
      if (!selectedFile) {
        alert('No se ha seleccionado un archivo válido.');
        return;
      }
  
      if (!selectedId) {
        alert('Por favor selecciona una plantilla.');
        return;
      }

      // Leer el contenido del archivo usando FileReader
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(selectedFile);
      });

      if (!fileContent || fileContent.trim().length === 0) {
        alert('El archivo está vacío. Por favor selecciona un archivo con contenido.');
        return;
      }
  
      await axios.post('http://localhost:3000/fixFile', {
        userId,
        fileName: selectedFile.name,
        fileContent: fileContent,
        templateId: selectedId,
      });
  
      alert('Archivo y plantilla enviados con éxito');
      setSelectedFile(null);
      fetchRecords(); // Recargar la lista de records
    } catch (err) {
      console.error('Error al subir el archivo y la plantilla:', err);
      alert('Error al procesar el archivo');
    }
  };

  return (
    <div className="home-private-container">
      <div className="home-private-section">
        <h2>Plantilla</h2>
        <div className="home-private-drop">
          {/* Menú para seleccionar una plantilla existente */}
          <select
            className="home-private-select"
            value={selectedId || ''}
            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">-- Seleccioná una plantilla --</option>
            {templates.map((t) => (
              <option key={t.idPlantilla || t.id} value={t.idPlantilla || t.id}>
                {t.nameTemplate} (v{t.versionTemplate})
              </option>
            ))}
          </select>
        </div>

        <div className="file-upload-section">
          <h3>Subir archivo</h3>
          <div className="file-input-wrapper">
            <input 
              type="file" 
              accept=".txt" 
              onChange={handleFileChange}
              id="file-input"
              className="real-file-input"
            />
            <label htmlFor="file-input" className="file-label">
              Seleccionar archivo .txt
            </label>
            {selectedFile && <span className="file-name">{selectedFile.name}</span>}
          </div>
          <button className="upload-btn" onClick={uploadFile}>Subir archivo</button>
        </div>
      </div>

      {/* Nueva sección con tabla de records */}
      <div className="home-private-section">
        <h2>Historial de Archivos Corregidos</h2>
        <div className="records-table-wrapper">
          <table className="records-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Contenido</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>No hay archivos procesados</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id_record || r.id}>
                    <td>{r.id_record || r.id}</td>
                    <td>{r.name}</td>
                    <td className="content-cell">
                      {r.content?.substring(0, 100)}{r.content?.length > 100 ? '...' : ''}
                    </td>
                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomePrivate;