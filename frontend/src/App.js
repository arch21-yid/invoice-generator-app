import React, { useState, useEffect } from 'react';
import InvoiceForm from './InvoiceForm';
import InvoiceList from './InvoiceList';
import './App.css';

function App() {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('light');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingInvoice, setEditingInvoice] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleInvoiceSaved = () => {
    setRefreshTrigger((prev) => prev + 1);
    setEditingInvoice(null);
  };

  return (
    <div className="app-container" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Welcome to InvoicePro</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn-ui" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button className="btn-ui" onClick={() => setLang('en')}>EN</button>
          <button className="btn-ui" onClick={() => setLang('am')}>AM</button>
        </div>
      </header>
      <p>Quickly create professional invoices for your clients.</p>

      <InvoiceForm
        lang={lang}
        onInvoiceSaved={handleInvoiceSaved}
        editingInvoice={editingInvoice}
        onCancelEdit={() => setEditingInvoice(null)}
      />
      <InvoiceList
        refreshTrigger={refreshTrigger}
        lang={lang}
        onEditInvoice={(inv) => setEditingInvoice(inv)}
      />
    </div>
  );
}

export default App;