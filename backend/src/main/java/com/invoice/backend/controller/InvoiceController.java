package com.invoice.backend.controller;

import com.invoice.backend.model.Invoice;
import com.invoice.backend.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class InvoiceController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        if (invoice.getItems() != null) {
            invoice.getItems().forEach(item -> item.setInvoice(invoice));
        }
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return ResponseEntity.ok(savedInvoice);
    }

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceRepository.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable Long id, @RequestBody Invoice updatedInvoice) {
        return invoiceRepository.findById(id).map(existingInvoice -> {
            existingInvoice.setClientName(updatedInvoice.getClientName());
            existingInvoice.setClientEmail(updatedInvoice.getClientEmail());
            existingInvoice.setSubtotal(updatedInvoice.getSubtotal());
            existingInvoice.setTax(updatedInvoice.getTax());
            existingInvoice.setGrandTotal(updatedInvoice.getGrandTotal());
            existingInvoice.setStatus(updatedInvoice.getStatus());
            existingInvoice.setInvoiceDate(updatedInvoice.getInvoiceDate());
            existingInvoice.setDueDate(updatedInvoice.getDueDate());

            existingInvoice.getItems().clear();
            if (updatedInvoice.getItems() != null) {
                updatedInvoice.getItems().forEach(item -> {
                    item.setInvoice(existingInvoice);
                    existingInvoice.getItems().add(item);
                });
            }

            Invoice saved = invoiceRepository.save(existingInvoice);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Invoice> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        return invoiceRepository.findById(id).map(existing -> {
            existing.setStatus(newStatus);
            Invoice saved = invoiceRepository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        if (invoiceRepository.existsById(id)) {
            invoiceRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}