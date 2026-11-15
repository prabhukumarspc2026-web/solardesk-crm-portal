const roundMoney = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export function calculateInvoiceTotals(items, discountAmount = 0, taxMode = 'split') {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Add at least one invoice item.');
  }
  if (!['split', 'igst'].includes(taxMode)) {
    throw new Error('Tax mode must be split GST or IGST.');
  }
  const normalizedItems = items.map(item => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const gstRate = Number(item.gstRate);
    if (!String(item.description || '').trim() || !Number.isFinite(quantity) || quantity <= 0
      || !Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isFinite(gstRate)
      || gstRate < 0 || gstRate > 100) {
      throw new Error('Invoice items require a description, positive quantity, valid price and GST rate.');
    }
    return { ...item, description: String(item.description).trim(), quantity, unitPrice, gstRate,
      lineTotal: roundMoney(quantity * unitPrice) };
  });
  const subtotal = roundMoney(normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0));
  const discount = Number(discountAmount);
  if (!Number.isFinite(discount) || discount < 0 || discount > subtotal) {
    throw new Error('Discount must be between zero and the invoice subtotal.');
  }
  const taxableAmount = roundMoney(subtotal - discount);
  const weightedGst = subtotal
    ? normalizedItems.reduce((sum, item) => sum + item.lineTotal * item.gstRate, 0) / subtotal
    : 0;
  const taxAmount = roundMoney(taxableAmount * weightedGst / 100);
  const igstAmount = taxMode === 'igst' ? taxAmount : 0;
  const cgstAmount = taxMode === 'igst' ? 0 : roundMoney(taxAmount / 2);
  const sgstAmount = roundMoney(taxAmount - igstAmount - cgstAmount);
  return {
    items: normalizedItems,
    subtotal,
    discountAmount: roundMoney(discount),
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    taxAmount,
    totalAmount: roundMoney(taxableAmount + taxAmount)
  };
}

export function getInvoiceStatus(invoice, payments, today) {
  if (invoice.status === 'Draft' || invoice.status === 'Cancelled') return invoice.status;
  const total = Number(invoice.totalAmount) || 0;
  const paid = roundMoney((payments || [])
    .filter(payment => payment.invoiceId === invoice.id
      && ['Verified', 'Received', 'Disbursed'].includes(payment.status))
    .reduce((sum, payment) => sum + (Number(payment.totalAmount ?? payment.amount) || 0), 0));
  if (paid >= total) return 'Paid';
  if (paid > 0) return 'Partially Paid';
  return invoice.dueDate && invoice.dueDate < today ? 'Overdue' : 'Issued';
}

export function financialYearStart(date) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error('A valid invoice date is required.');
  return parsed.getUTCMonth() >= 3 ? parsed.getUTCFullYear() : parsed.getUTCFullYear() - 1;
}

export function formatInvoiceNumber(prefix, counter, date) {
  const year = financialYearStart(date);
  const safePrefix = String(prefix || 'INV').trim().replace(/[^A-Za-z0-9-]/g, '') || 'INV';
  const sequence = Number(counter);
  if (!Number.isSafeInteger(sequence) || sequence < 1) throw new Error('Invoice sequence must be a positive integer.');
  return `${safePrefix}/${year}-${String(year + 1).slice(-2)}/${String(sequence).padStart(4, '0')}`;
}
