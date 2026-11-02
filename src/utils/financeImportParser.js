// src/utils/financeImportParser.js

// DD/MM/YYYY HH:mm:ss -> YYYY-MM-DD
export const parseLegacyDate = (dateRaw) => {
  if (!dateRaw) return new Date().toISOString().split('T')[0];

  const str = String(dateRaw).trim();
  // Jar already YYYY-MM-DD asel tar
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }

  // DD/MM/YYYY format split karne
  const parts = str.split(' ')[0].split(/[/.-]/);
  if (parts.length === 3) {
    let day = parts[0].padStart(2, '0');
    let month = parts[1].padStart(2, '0');
    let year = parts[2];

    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }

  return new Date().toISOString().split('T')[0];
};

export const transformAndValidateRows = (rawRows, existingUsers = []) => {
  const usersByEmail = new Map();
  existingUsers.forEach(u => {
    if (u.email) usersByEmail.set(u.email.trim().toLowerCase(), u);
  });

  const parsedRecords = [];
  const warnings = [];
  let indexCounter = 1;

  for (let row of rawRows) {
    const rawId = row.ID || row.id || '';
    const rawCategory = String(row.Category || row.category || '').trim();
    const rawDesc = String(row.Description || row.description || '').trim();
    const rawAmount = Number(String(row.Amount || row.amount || 0).replace(/,/g, ''));
    const rawDate = row.Date || row.date || '';
    const rawMode = String(row.Mode || row.mode || 'Online').toUpperCase();
    const rawCreatedBy = String(row.Created_By || row.createdBy || '').trim().toLowerCase();
    const rawEntity = String(row.Entity_Name || row.entityName || '').trim();

    // Skip blank or invalid rows
    if (!rawAmount && !rawDesc) continue;

    // 1. Smart Date Parsing
    const cleanDate = parseLegacyDate(rawDate);
    const year = cleanDate.substring(0, 4);

    // 2. Type Detection (Advance vs Expense vs Income)
    let type = 'EXPENSE';
    const isAdvance = rawCategory.toLowerCase().includes('advance') || 
                      rawDesc.toLowerCase().includes('advance');

    if (isAdvance) {
      type = 'ADVANCE_GIVEN';
    } else if (String(row.Type || row.type || '').toUpperCase() === 'INCOME') {
      type = 'INCOME';
    }

    // 3. User Matching
    let assignedUser = usersByEmail.get(rawEntity.toLowerCase()) || 
                       usersByEmail.get(rawCreatedBy) || null;

    let assignedUserId = assignedUser?.id || 'legacy_user';
    let assignedUserName = assignedUser?.name || rawEntity || rawCreatedBy.split('@')[0] || 'संस्था प्रतिनिधी';

    let creatorUser = usersByEmail.get(rawCreatedBy) || null;
    let createdByUserId = creatorUser?.id || 'import_admin';
    let createdByUserName = creatorUser?.name || rawCreatedBy.split('@')[0] || 'सुपर ॲडमिन';

    // 4. Generate Standard Import ID
    const paddedIndex = String(indexCounter).padStart(4, '0');
    const txnId = `SMF-26-CHA-${type === 'ADVANCE_GIVEN' ? 'ADV' : type === 'INCOME' ? 'INC' : 'EXP'}-IMP-${paddedIndex}`;
    indexCounter++;

    // Validation checks
    if (!rawAmount || isNaN(rawAmount) || rawAmount <= 0) {
      warnings.push(`Row ${indexCounter}: Invalid Amount "${row.Amount}" in "${rawDesc}"`);
    }

    parsedRecords.push({
      legacyId: rawId,
      txnId,
      date: cleanDate,
      year,
      type,
      category: rawCategory || 'इतर विविध खर्च',
      eventId: 'chaitra-navratri',
      eventName: 'चैत्र नवरात्री',
      description: rawDesc,
      amount: rawAmount,
      mode: rawMode.includes('CASH') ? 'CASH' : 'ONLINE',
      assignedUserId,
      assignedUserName,
      assignedUserEmail: rawEntity || rawCreatedBy,
      createdByUserId,
      createdByUserName,
      createdByEmail: rawCreatedBy,
      note: row.Note || row.note || 'Imported from Google Sheet App',
      isImported: true,
      isDeleted: false
    });
  }

  return { parsedRecords, warnings };
};