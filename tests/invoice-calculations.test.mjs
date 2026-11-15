import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  calculateInvoiceTotals,
  formatInvoiceNumber,
  getInvoiceStatus
} from '../public/finance.js';

test('calculates split and interstate GST after applying discount', () => {
  const split = calculateInvoiceTotals([
    { description: 'Panels', quantity: 2, unitPrice: 1000, gstRate: 18 }
  ], 200);
  assert.deepEqual(
    [split.subtotal, split.taxableAmount, split.cgstAmount, split.sgstAmount, split.totalAmount],
    [2000, 1800, 162, 162, 2124]
  );
  const interstate = calculateInvoiceTotals([
    { description: 'Panels', quantity: 2, unitPrice: 1000, gstRate: 18 }
  ], 0, 'igst');
  assert.deepEqual(
    [interstate.cgstAmount, interstate.sgstAmount, interstate.igstAmount],
    [0, 0, 360]
  );
});

test('rejects invalid invoice amounts and discounts', () => {
  assert.throws(() => calculateInvoiceTotals([]), /at least one invoice item/i);
  assert.throws(() => calculateInvoiceTotals([
    { description: 'Panels', quantity: 0, unitPrice: 1000, gstRate: 18 }
  ]), /invoice items/i);
  assert.throws(() => calculateInvoiceTotals([
    { description: 'Panels', quantity: 1, unitPrice: 1000, gstRate: 18 }
  ], 1001), /discount/i);
  assert.throws(() => calculateInvoiceTotals([
    { description: 'Panels', quantity: 1, unitPrice: 1000, gstRate: 18 }
  ], 0, 'unknown'), /tax mode/i);
});

test('derives status from confirmed payments and due date', () => {
  const invoice = { id: 'invoice-1', status: 'Issued', totalAmount: 1000, dueDate: '2026-05-01' };
  assert.equal(getInvoiceStatus(invoice, [], '2026-05-02'), 'Overdue');
  assert.equal(getInvoiceStatus(invoice, [
    { invoiceId: invoice.id, status: 'Verified', totalAmount: 400 }
  ], '2026-05-02'), 'Partially Paid');
  assert.equal(getInvoiceStatus(invoice, [
    { invoiceId: invoice.id, status: 'Verified', totalAmount: 1000 }
  ], '2026-05-02'), 'Paid');
  assert.equal(getInvoiceStatus({ ...invoice, status: 'Draft' }, [], '2026-05-02'), 'Draft');
});

test('numbers invoices within the April-to-March financial year', () => {
  assert.equal(formatInvoiceNumber('INV', 1, '2026-04-01'), 'INV/2026-27/0001');
  assert.equal(formatInvoiceNumber('INV', 12, '2027-03-31'), 'INV/2026-27/0012');
  assert.equal(formatInvoiceNumber('INV', 1, '2027-04-01'), 'INV/2027-28/0001');
});
