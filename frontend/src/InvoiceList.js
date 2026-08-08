import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

function InvoiceList({ refreshTrigger, lang, onEditInvoice }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInvoices = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [refreshTrigger]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(lang === 'am' ? 'ሁኔታው ተቀይሯል!' : 'Status updated!');
        fetchInvoices();
      } else {
        toast.error(lang === 'am' ? 'ሁኔታውን መቀየር አልተቻለም' : 'Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Connection error.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lang === 'am' ? 'እርግጠኛ ነዎት ይህን ኢንቮይስ መሰረዝ ይፈልጋሉ?' : 'Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(lang === 'am' ? 'ኢንቮይሱ ተሰርዟል!' : 'Invoice deleted successfully!');
        fetchInvoices();
      } else {
        toast.error(lang === 'am' ? 'ማሰረዝ አልተቻለም' : 'Failed to delete invoice.');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Connection error.');
    }
  };

  const exportToCSV = () => {
    if (invoices.length === 0) return;

    const headers = ["Invoice #,Client Name,Email,Due Date,Status,Grand Total (ETB)\n"];
    const rows = invoices.map(inv => 
      `"${inv.invoiceNumber}","${inv.clientName}","${inv.clientEmail}","${inv.dueDate || ''}","${inv.status || 'Pending'}","ETB ${inv.grandTotal ? inv.grandTotal.toFixed(2) : '0.00'}"`
    );

    const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredInvoices = invoices.filter((inv) =>
    (inv.clientName && inv.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const avgValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  if (loading) return <p>{lang === 'am' ? 'በመጫን ላይ...' : 'Loading saved invoices...'}</p>;

  return (
    <div style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '180px', padding: '15px', border: '1px solid var(--border-hard)', borderRadius: '8px' }}>
          <h4>{lang === 'am' ? 'ጠቅላላ ኢንቮይሶች' : 'Total Invoices'}</h4>
          <h2>{totalInvoices}</h2>
        </div>
        <div style={{ flex: 1, minWidth: '180px', padding: '15px', border: '1px solid var(--border-hard)', borderRadius: '8px' }}>
          <h4>{lang === 'am' ? 'ጠቅላላ ገቢ' : 'Total Revenue'}</h4>
          <h2>ETB {totalRevenue.toFixed(2)}</h2>
        </div>
        <div style={{ flex: 1, minWidth: '180px', padding: '15px', border: '1px solid var(--border-hard)', borderRadius: '8px' }}>
          <h4>{lang === 'am' ? 'አማካኝ ዋጋ' : 'Avg Invoice Value'}</h4>
          <h2>ETB {avgValue.toFixed(2)}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          {lang === 'am' ? 'የተቀመጡ ኢንቮይሶች ታሪክ' : 'Saved Invoices History'}
        </h3>
        <button className="btn-ui" onClick={exportToCSV}>
          📊 {lang === 'am' ? 'ወደ CSV ላክ' : 'Export CSV'}
        </button>
      </div>

      <input
        type="text"
        className="form-input"
        placeholder={lang === 'am' ? 'በስም ወይም በቁጥር ይፈልጉ...' : 'Search by client or invoice #...'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '15px', width: '100%' }}
      />

      {filteredInvoices.length === 0 ? (
        <p>{lang === 'am' ? 'ምንም የተቀመጠ ኢንቮይስ አልተገኘም።' : 'No invoices found.'}</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '8px' }}>{lang === 'am' ? 'የክፍያ ቁጥር #' : 'Invoice #'}</th>
              <th style={{ padding: '8px' }}>{lang === 'am' ? 'ደንበኛ' : 'Client'}</th>
              <th style={{ padding: '8px' }}>{lang === 'am' ? 'የመክፈያ ቀን' : 'Due Date'}</th>
              <th style={{ padding: '8px' }}>{lang === 'am' ? 'ሁኔታ' : 'Status'}</th>
              <th style={{ padding: '8px' }}>{lang === 'am' ? 'ጠቅላላ' : 'Grand Total'}</th>
              <th style={{ padding: '8px' }}>{lang === 'am' ? 'ተግባር' : 'Action'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.id || inv.invoiceNumber} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{inv.invoiceNumber}</td>
                <td style={{ padding: '8px' }}>{inv.clientName}</td>
                <td style={{ padding: '8px' }}>{inv.dueDate || 'N/A'}</td>
                <td style={{ padding: '8px' }}>
                  <select
                    className="form-input"
                    value={inv.status || 'Pending'}
                    onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                    style={{ padding: '2px 6px', fontSize: '0.9em' }}
                  >
                    <option value="Pending">{lang === 'am' ? 'በመጠባበቅ ላይ' : 'Pending'}</option>
                    <option value="Paid">{lang === 'am' ? 'ተከፍሏል' : 'Paid'}</option>
                    <option value="Overdue">{lang === 'am' ? 'ጊዜው ያለፈበት' : 'Overdue'}</option>
                  </select>
                </td>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>
                  ETB {inv.grandTotal ? inv.grandTotal.toFixed(2) : '0.00'}
                </td>
                <td style={{ padding: '8px', display: 'flex', gap: '6px' }}>
                  <button
                    className="btn-ui"
                    onClick={() => onEditInvoice(inv)}
                    style={{ padding: '4px 10px' }}
                  >
                    {lang === 'am' ? 'አርትዕ' : 'Edit'}
                  </button>
                  <button
                    className="btn-ui"
                    onClick={() => handleDelete(inv.id)}
                    style={{ backgroundColor: '#ff4d4f', color: '#fff', padding: '4px 10px' }}
                  >
                    {lang === 'am' ? 'ሰርዝ' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default InvoiceList;