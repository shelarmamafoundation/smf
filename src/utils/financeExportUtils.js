// src/utils/financeExportUtils.js

// 1. Excel Export (CSV / Table format)
export const exportToExcel = (records, title = "Jama_Kharch_Report") => {
  if (!records || records.length === 0) {
    alert("Export karnyasathi konthich nond uplabdh nahi!");
    return;
  }

  const headers = ["Tarikh", "Pawti No", "Prakar", "Event", "Tapasheel", "Vargavari", "Pratinidhi", "Mode", "Rakkam (Rs)"];
  
  const rows = records.map(r => [
    `"${r.date || ''}"`,
    `"${r.txnId || ''}"`,
    `"${r.type === 'INCOME' ? 'JAMA' : r.type === 'EXPENSE' ? 'KHARCH' : 'ADVANCE'}"`,
    `"${r.eventName || ''}"`,
    `"${(r.description || '').replace(/"/g, '""')}"`,
    `"${r.category || ''}"`,
    `"${r.assignedUserName || ''}"`,
    `"${r.mode || ''}"`,
    r.amount || 0
  ]);

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
    + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${title}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 2. Side-by-Side (Jama vs Kharch) PDF / Print View
export const printSideBySideReport = ({
  records,
  reportTitle = "वार्षिक जमा-खर्च हिशोब पत्रक",
  subTitle = "आर्थिक वर्ष: १ एप्रिल ते ३१ मार्च",
  totals = {}
}) => {
  // Jama aani Kharch veg-vegle karne
  const incomeList = records.filter(r => r.type === 'INCOME');
  const expenseList = records.filter(r => r.type === 'EXPENSE' || r.type === 'ADVANCE_GIVEN');

  const maxRows = Math.max(incomeList.length, expenseList.length);

  let rowsHtml = '';
  let sumIncome = 0;
  let sumExpense = 0;

  for (let i = 0; i < maxRows; i++) {
    const inc = incomeList[i];
    const exp = expenseList[i];

    if (inc) sumIncome += Number(inc.amount || 0);
    if (exp) sumExpense += Number(exp.amount || 0);

    rowsHtml += `
      <tr>
        <!-- JAMA COLUMN -->
        <td style="width: 4%; text-align: center;">${inc ? i + 1 : ''}</td>
        <td style="width: 10%;">${inc ? inc.date : ''}</td>
        <td style="width: 24%; font-weight: 500;">
          ${inc ? inc.description : ''} 
          ${inc && inc.category ? `<br><small style="color:#666;">(${inc.category})</small>` : ''}
        </td>
        <td style="width: 12%; text-align: right; font-weight: bold; color: #166534;">
          ${inc ? '₹ ' + Number(inc.amount).toLocaleString('en-IN') : ''}
        </td>

        <!-- DIVIDER -->
        <td style="width: 1%; background-color: #e5e7eb; padding: 0;"></td>

        <!-- KHARCH COLUMN -->
        <td style="width: 4%; text-align: center;">${exp ? i + 1 : ''}</td>
        <td style="width: 10%;">${exp ? exp.date : ''}</td>
        <td style="width: 23%; font-weight: 500;">
          ${exp ? exp.description : ''}
          ${exp && exp.category ? `<br><small style="color:#666;">(${exp.category})</small>` : ''}
          ${exp && exp.assignedUserName ? `<br><small style="color:#854d0e;">[${exp.assignedUserName}]</small>` : ''}
        </td>
        <td style="width: 12%; text-align: right; font-weight: bold; color: #991b1b;">
          ${exp ? '₹ ' + Number(exp.amount).toLocaleString('en-IN') : ''}
        </td>
      </tr>
    `;
  }

  const netBal = sumIncome - sumExpense;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: 'Noto Sans Devanagari', 'Arial', sans-serif; font-size: 11px; color: #111; margin: 0; padding: 10px; }
          .header { text-align: center; border-bottom: 2px solid #580a1a; padding-bottom: 8px; margin-bottom: 12px; }
          .header h1 { margin: 0; font-size: 18px; color: #580a1a; }
          .header p { margin: 2px 0 0 0; font-size: 11px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th, td { border: 1px solid #cbd5e1; padding: 5px 6px; }
          th { background-color: #f8fafc; font-size: 11px; }
          .th-jama { background-color: #f0fdf4; color: #166534; }
          .th-kharch { background-color: #fef2f2; color: #991b1b; }
          .footer-box { margin-top: 15px; display: flex; justify-content: space-between; border-top: 2px solid #333; padding-top: 8px; font-size: 12px; font-weight: bold; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; text-align: right;">
          <button onclick="window.print()" style="padding: 6px 14px; background: #580a1a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">🖨️ Print / Save as PDF</button>
        </div>

        <div class="header">
          <h1>शेलारमामा फाऊंडेशन</h1>
          <p><strong>${reportTitle}</strong></p>
          <p>${subTitle} | दिनांक: ${new Date().toLocaleDateString('mr-IN')}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th colspan="4" class="th-jama">जमा बाजू (INCOME / RECEIPTS)</th>
              <th style="background-color: #e5e7eb; border: none;"></th>
              <th colspan="4" class="th-kharch">खर्च बाजू (EXPENSES / PAYMENTS)</th>
            </tr>
            <tr>
              <th>अ.क्र.</th>
              <th>दिनांक</th>
              <th>तपशील</th>
              <th>रक्कम (₹)</th>
              <th style="background-color: #e5e7eb; border: none;"></th>
              <th>अ.क्र.</th>
              <th>दिनांक</th>
              <th>तपशील</th>
              <th>रक्कम (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="9" style="text-align:center; padding: 20px;">कोणत्याही नोंदी आढळल्या नाहीत.</td></tr>'}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8fafc; font-weight: bold;">
              <td colspan="3" style="text-align: right;">एकूण जमा:</td>
              <td style="text-align: right; color: #166534; font-size: 12px;">₹ ${sumIncome.toLocaleString('en-IN')}</td>
              <td style="background-color: #e5e7eb; border: none;"></td>
              <td colspan="3" style="text-align: right;">एकूण खर्च:</td>
              <td style="text-align: right; color: #991b1b; font-size: 12px;">₹ ${sumExpense.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        <div class="footer-box">
          <div>
            <span>एकूण शिल्लक (Net Balance): </span>
            <span style="color: ${netBal >= 0 ? '#166534' : '#991b1b'};">₹ ${netBal.toLocaleString('en-IN')}</span>
          </div>
          <div style="margin-top: 35px; display: flex; justify-content: space-between; width: 100%;">
            <span>तयार करणार: _________________</span>
            <span>तपासणार: _________________</span>
            <span>अध्यक्ष / खजिनदार स्वाक्षरी: _________________</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};