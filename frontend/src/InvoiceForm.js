import React, { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const formTranslations = {
  en: {
    invoiceDetails: "Invoice Details",
    invoiceNumber: "Invoice #",
    clientName: "Client Name",
    clientEmail: "Client Email",
    status: "Status",
    invoiceDate: "Invoice Date",
    dueDate: "Due Date",
    items: "Line Items",
    description: "Item Description",
    qty: "Qty",
    price: "Price (ETB)",
    addItem: "+ Add Item",
    subtotal: "Subtotal:",
    tax: "Tax (15%):",
    grandTotal: "Grand Total:",
    saveInvoice: "Save Invoice to Database",
    updateInvoice: "Update Invoice",
    cancelEdit: "Cancel Editing",
    downloadPdf: "Download PDF",
    paid: "Paid",
    pending: "Pending",
    overdue: "Overdue"
  },
  am: {
    invoiceDetails: "የክፍያ መጠየቂያ ዝርዝሮች",
    invoiceNumber: "የክፍያ ቁጥር #",
    clientName: "የደንበኛ ስም",
    clientEmail: "የደንበኛ ኢሜይል",
    status: "ሁኔታ",
    invoiceDate: "የተሰጠበት ቀን",
    dueDate: "የመክፈያ ቀን",
    items: "የእቃ / አገልግሎት ዝርዝር",
    description: "የእቃው ዝርዝር",
    qty: "ብዛት",
    price: "ዋጋ (ETB)",
    addItem: "+ እቃ ጨምር",
    subtotal: "ምክትል ጠቅላላ:",
    tax: "ታክስ (15%):",
    grandTotal: "አጠቃላይ ድምር:",
    saveInvoice: "ኢንቮይሱን ወደ ዳታቤዝ አስቀምጥ",
    updateInvoice: "ኢንቮይሱን አዘምን",
    cancelEdit: "ማዘመንን ሰርዝ",
    downloadPdf: "ፒዲኤፍ አውርድ",
    paid: "ተከፍሏል",
    pending: "በመጠባበቅ ላይ",
    overdue: "ጊዜው ያለፈበት"
  }
};

function InvoiceForm({ lang, onInvoiceSaved, editingInvoice, onCancelEdit }) {
  const t = formTranslations[lang] || formTranslations.en;
  const pdfRef = useRef();

  const generateInitialState = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: '',
      clientEmail: '',
      status: 'Pending',
      invoiceDate: today,
      dueDate: nextWeek,
      items: [{ description: '', quantity: 1, price: 0 }]
    };
  };

  const [invoice, setInvoice] = useState(generateInitialState());

  useEffect(() => {
    if (editingInvoice) {
      setInvoice({
        ...editingInvoice,
        status: editingInvoice.status || 'Pending',
        invoiceDate: editingInvoice.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: editingInvoice.dueDate || ''
      });
    } else {
      setInvoice(generateInitialState());
    }
  }, [editingInvoice]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoice.items];
    updatedItems[index][field] = value;
    setInvoice({ ...invoice, items: updatedItems });
  };

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: updatedItems });
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * 0.15;
  const grandTotal = subtotal + tax;

  const handleDownloadPdf = () => {
    const element = pdfRef.current;
    const opt = {
      margin: 10,
      filename: `${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...invoice,
      subtotal,
      tax,
      grandTotal,
    };

    const isEdit = !!invoice.id;
    const url = isEdit
      ? `http://localhost:8080/api/invoices/${invoice.id}`
      : 'http://localhost:8080/api/invoices';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(isEdit ? `Invoice ${data.invoiceNumber} updated!` : `Invoice ${data.invoiceNumber} saved!`);
        setInvoice(generateInitialState());
        if (onInvoiceSaved) onInvoiceSaved();
      } else {
        toast.error('Failed to save invoice.');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Error connecting to Spring Boot backend.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <Toaster position="top-right" />

      <div ref={pdfRef} style={{ padding: '15px', borderRadius: '8px' }}>
        <h3 className="section-title">{t.invoiceDetails}</h3>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">{t.invoiceNumber}</label>
            <input className="form-input" value={invoice.invoiceNumber} readOnly />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">{t.clientName}</label>
            <input
              className="form-input"
              placeholder={t.clientName}
              value={invoice.clientName}
              onChange={(e) => setInvoice({ ...invoice, clientName: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">{t.clientEmail}</label>
            <input
              type="email"
              className="form-input"
              placeholder={t.clientEmail}
              value={invoice.clientEmail}
              onChange={(e) => setInvoice({ ...invoice, clientEmail: e.target.value })}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">{t.invoiceDate}</label>
            <input
              type="date"
              className="form-input"
              value={invoice.invoiceDate}
              onChange={(e) => setInvoice({ ...invoice, invoiceDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">{t.dueDate}</label>
            <input
              type="date"
              className="form-input"
              value={invoice.dueDate}
              onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">{t.status}</label>
            <select
              className="form-input"
              value={invoice.status}
              onChange={(e) => setInvoice({ ...invoice, status: e.target.value })}
            >
              <option value="Pending">{t.pending}</option>
              <option value="Paid">{t.paid}</option>
              <option value="Overdue">{t.overdue}</option>
            </select>
          </div>
        </div>

        <h3 className="section-title" style={{ marginTop: '30px' }}>{t.items}</h3>
        {invoice.items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
            <input
              className="form-input"
              placeholder={t.description}
              style={{ flex: 3 }}
              value={item.description}
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              required
            />
            <input
              type="number"
              className="form-input"
              placeholder={t.qty}
              style={{ flex: 1 }}
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
              required
            />
            <input
              type="number"
              className="form-input"
              placeholder={t.price}
              style={{ flex: 1 }}
              value={item.price}
              onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
              required
            />
            <div style={{ flex: 1, fontWeight: 'bold' }}>
              ETB {(item.quantity * item.price).toFixed(2)}
            </div>
            {invoice.items.length > 1 && (
              <button type="button" className="btn-ui" onClick={() => removeItem(index)}>✕</button>
            )}
          </div>
        ))}

        <div style={{ marginTop: '30px', borderTop: '2px solid var(--border-hard)', paddingTop: '15px', maxWidth: '300px', marginLeft: 'auto' }}>
          <p><strong>{t.subtotal}</strong> ETB {subtotal.toFixed(2)}</p>
          <p><strong>{t.tax}</strong> ETB {tax.toFixed(2)}</p>
          <h3 style={{ marginTop: '10px' }}><strong>{t.grandTotal}</strong> ETB {grandTotal.toFixed(2)}</h3>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button type="button" className="btn-ui" onClick={addItem}>
          {t.addItem}
        </button>
        <button type="button" className="btn-ui" onClick={handleDownloadPdf}>
          📄 {t.downloadPdf}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button type="submit" className="btn-ui btn-primary" style={{ flex: 1 }}>
          {invoice.id ? t.updateInvoice : t.saveInvoice}
        </button>
        {invoice.id && (
          <button
            type="button"
            className="btn-ui"
            onClick={() => {
              setInvoice(generateInitialState());
              if (onCancelEdit) onCancelEdit();
            }}
          >
            {t.cancelEdit}
          </button>
        )}
      </div>
    </form>
  );
}

export default InvoiceForm;