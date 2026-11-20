// Clinical & Operational Intelligence Logic Engine for ApexCare Hospital Management

/**
 * 1. Emergency Severity Index (ESI) & Clinical Vitals Triage Logic
 * Evaluates patient physiological vitals and symptoms into 5 standard clinical acuity tiers:
 * Level 1: Immediate Resuscitation (Code Red)
 * Level 2: Emergent (High Risk / Severely Altered)
 * Level 3: Urgent (Multiple diagnostic resources needed)
 * Level 4: Less Urgent (Single resource needed)
 * Level 5: Non-urgent (Exam / Refill only)
 */
export function calculateTriageScore(vitals = {}, symptoms = '') {
  const {
    heartRate = 75,
    systolicBP = 120,
    diastolicBP = 80,
    spo2 = 98,
    temperature = 98.6,
    painScale = 0,
    isUnresponsive = false
  } = vitals;

  const hr = parseInt(heartRate, 10);
  const sys = parseInt(systolicBP, 10);
  const dia = parseInt(diastolicBP, 10);
  const oxygen = parseInt(spo2, 10);
  const temp = parseFloat(temperature);
  const pain = parseInt(painScale, 10);
  const symText = (symptoms || '').toLowerCase();

  // Tier 1: Immediate Life Threat (Code Red / Resuscitation)
  if (
    isUnresponsive ||
    oxygen < 88 ||
    hr > 140 ||
    hr < 40 ||
    sys < 70 ||
    symText.includes('cardiac arrest') ||
    symText.includes('unconscious') ||
    symText.includes('severe anaphylaxis')
  ) {
    return {
      esiLevel: 1,
      acuity: 'Level 1: Resuscitation (Immediate)',
      severity: 'critical',
      badgeColor: 'danger',
      recommendedWard: 'Intensive Cardiac Care Unit (ICCU)',
      action: 'Immediate Trauma Resuscitation Bay. Alert code red medical team.',
      estimatedWaitMinutes: 0
    };
  }

  // Tier 2: Emergent / High Risk
  if (
    oxygen < 92 ||
    hr > 120 ||
    hr < 50 ||
    sys > 190 ||
    sys < 90 ||
    pain >= 8 ||
    temp > 103 ||
    symText.includes('chest pain') ||
    symText.includes('stroke') ||
    symText.includes('severe shortness of breath') ||
    symText.includes('uncontrolled bleeding')
  ) {
    return {
      esiLevel: 2,
      acuity: 'Level 2: Emergent (High Risk)',
      severity: 'high',
      badgeColor: 'danger',
      recommendedWard: 'Intensive Cardiac Care Unit (ICCU)',
      action: 'Triage within 10 minutes. Continuous ECG & hemodynamic telemetry.',
      estimatedWaitMinutes: 5
    };
  }

  // Tier 3: Urgent (Needs 2+ Resources: Lab + Imaging + IV)
  if (
    oxygen <= 94 ||
    hr > 100 ||
    sys > 150 ||
    temp > 100.4 ||
    pain >= 5 ||
    symText.includes('fracture') ||
    symText.includes('abdominal pain') ||
    symText.includes('asthma') ||
    symText.includes('infection')
  ) {
    return {
      esiLevel: 3,
      acuity: 'Level 3: Urgent',
      severity: 'moderate',
      badgeColor: 'warning',
      recommendedWard: 'Surgical Recovery Ward',
      action: 'Full diagnostic workup (CBC + BMP + Imaging). Priority OPD queue.',
      estimatedWaitMinutes: 20
    };
  }

  // Tier 4: Less Urgent (Needs 1 Resource)
  if (pain >= 2 || temp > 99.5 || symText.includes('sprain') || symText.includes('rash') || symText.includes('cough')) {
    return {
      esiLevel: 4,
      acuity: 'Level 4: Less Urgent',
      severity: 'low',
      badgeColor: 'info',
      recommendedWard: 'General Ward / Outpatient Clinic',
      action: 'Standard clinical evaluation and single diagnostic check.',
      estimatedWaitMinutes: 35
    };
  }

  // Tier 5: Non-urgent
  return {
    esiLevel: 5,
    acuity: 'Level 5: Non-Urgent (Routine)',
    severity: 'minimal',
    badgeColor: 'success',
    recommendedWard: 'Outpatient Clinic',
    action: 'Routine consultation, medication refill, or health screening.',
    estimatedWaitMinutes: 15
  };
}

/**
 * 2. Intelligent Drug Allergy & Contraindication Safety Engine
 * Cross-checks medication against patient recorded allergies.
 */
export function checkDrugSafety(medicineName = '', patientAllergies = '') {
  const med = (medicineName || '').toLowerCase();
  const allg = (patientAllergies || '').toLowerCase();

  const alerts = [];

  // Beta-Lactam / Penicillin Cross-Reactivity
  if (allg.includes('penicillin')) {
    if (
      med.includes('amoxicillin') ||
      med.includes('ampicillin') ||
      med.includes('augmentin') ||
      med.includes('penicillin') ||
      med.includes('piperacillin')
    ) {
      alerts.push({
        severity: 'CRITICAL_CONTRAINDICATION',
        drug: medicineName,
        matchedAllergy: 'Penicillin',
        message: `SEVERE ALLERGY ALERT: Patient is allergic to Penicillin. ${medicineName} is a beta-lactam penicillin class derivative with high anaphylaxis risk!`,
        recommendation: 'Switch to Macrolide (e.g. Azithromycin) or Fluoroquinolone under physician order.'
      });
    }
  }

  // Sulfa Drugs
  if (allg.includes('sulfa')) {
    if (med.includes('sulfamethoxazole') || med.includes('bactrim') || med.includes('sulfadiazine')) {
      alerts.push({
        severity: 'CRITICAL_CONTRAINDICATION',
        drug: medicineName,
        matchedAllergy: 'Sulfa',
        message: `SEVERE ALLERGY ALERT: Patient has documented Sulfa allergy. ${medicineName} is contraindicated!`,
        recommendation: 'Use alternative non-sulfonamide antimicrobial.'
      });
    }
  }

  // Aspirin / NSAID Cross-Reactivity
  if (allg.includes('aspirin') || allg.includes('nsaid')) {
    if (med.includes('ibuprofen') || med.includes('aspirin') || med.includes('naproxen') || med.includes('diclofenac')) {
      alerts.push({
        severity: 'HIGH_RISK_WARNING',
        drug: medicineName,
        matchedAllergy: 'Aspirin / NSAIDs',
        message: `NSAID ALLERGY RISK: Patient has Aspirin/NSAID sensitivity. Potential bronchospasm or urticaria.`,
        recommendation: 'Use Acetaminophen / Paracetamol as alternative analgesic.'
      });
    }
  }

  return {
    isSafe: alerts.length === 0,
    hasCriticalWarning: alerts.some(a => a.severity === 'CRITICAL_CONTRAINDICATION'),
    alerts
  };
}

/**
 * 3. Dynamic Patient Queue Position & Live ETA Logic
 */
export function calculateQueueETA(appointments = [], doctorId, appointmentId) {
  const today = new Date().toISOString().split('T')[0];
  const docApts = appointments.filter(
    a => a.doctor_id === doctorId && a.appointment_date === today && a.status !== 'cancelled'
  );

  // Sort chronologically by time slot
  docApts.sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''));

  const targetIndex = docApts.findIndex(a => a.id === appointmentId);
  const completedCount = docApts.filter(a => a.status === 'completed').length;

  if (targetIndex === -1) {
    return {
      queuePosition: 1,
      totalWaiting: docApts.length,
      estimatedWaitMins: 15,
      liveStatus: 'Scheduled'
    };
  }

  const aheadOfYou = Math.max(0, targetIndex - completedCount);
  const avgMinutesPerPatient = 15;
  const estimatedWaitMins = aheadOfYou * avgMinutesPerPatient;

  return {
    queuePosition: aheadOfYou + 1,
    totalWaiting: Math.max(0, docApts.length - completedCount),
    estimatedWaitMins,
    liveStatus: aheadOfYou === 0 ? 'Consulting Now / Next' : `${aheadOfYou} patients ahead`
  };
}

/**
 * 4. Insurance Coverage Co-Pay & Auto-Split Engine
 */
export function calculateInsuranceSplit(totalAmount = 0, insuranceProvider = 'Self-Pay') {
  const total = parseFloat(totalAmount) || 0;
  const provider = (insuranceProvider || 'Self-Pay').toLowerCase();

  // Tiered insurance policies
  let coveragePercent = 0;
  let deductible = 0;

  if (provider.includes('bluecross') || provider.includes('bcbs')) {
    coveragePercent = 85;
    deductible = 50;
  } else if (provider.includes('aetna')) {
    coveragePercent = 80;
    deductible = 75;
  } else if (provider.includes('medicare')) {
    coveragePercent = 90;
    deductible = 0;
  } else if (provider.includes('united') || provider.includes('uhc')) {
    coveragePercent = 75;
    deductible = 100;
  } else {
    // Self-pay / uninsured
    return {
      totalAmount: total,
      insuranceCovered: 0,
      deductible: 0,
      copayPercentage: 100,
      patientPayable: total,
      policyTier: 'Self-Pay / Non-Insured'
    };
  }

  const billAfterDeductible = Math.max(0, total - deductible);
  const insuranceCovered = (billAfterDeductible * coveragePercent) / 100;
  const patientCopay = billAfterDeductible - insuranceCovered;
  const patientPayable = Math.min(total, patientCopay + Math.min(total, deductible));

  return {
    totalAmount: Math.round(total * 100) / 100,
    insuranceCovered: Math.round(insuranceCovered * 100) / 100,
    deductible: Math.round(deductible * 100) / 100,
    copayPercentage: 100 - coveragePercent,
    patientPayable: Math.round(patientPayable * 100) / 100,
    policyTier: `${insuranceProvider} (Tier 1: ${coveragePercent}% Coverage)`
  };
}

/**
 * 5. Pharmacy Inventory Re-order Point (ROP) & Expiry Risk Logic
 * ROP = (Daily Usage * Supplier Lead Days) + Safety Stock
 */
export function calculateInventoryRisk(stockQty, minStock, expiryDate, dailyConsumption = 8, leadTimeDays = 3) {
  const qty = parseInt(stockQty || 0, 10);
  const min = parseInt(minStock || 20, 10);
  const safetyStock = Math.round(min * 0.5);
  const reorderPoint = Math.round((dailyConsumption * leadTimeDays) + safetyStock);

  const daysOfSupply = dailyConsumption > 0 ? Math.round(qty / dailyConsumption) : 999;
  const needsReorder = qty <= reorderPoint;

  // Expiry Risk
  let expiryRisk = 'SAFE';
  let daysUntilExpiry = 999;

  if (expiryDate) {
    const exp = new Date(expiryDate);
    const now = new Date();
    daysUntilExpiry = Math.round((exp - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0) expiryRisk = 'EXPIRED';
    else if (daysUntilExpiry <= 30) expiryRisk = 'CRITICAL_EXPIRY_RISK';
    else if (daysUntilExpiry <= 90) expiryRisk = 'MODERATE_EXPIRY_RISK';
  }

  return {
    daysOfSupply,
    reorderPoint,
    needsReorder,
    daysUntilExpiry,
    expiryRisk,
    stockHealthScore: Math.min(100, Math.round((qty / (reorderPoint * 2)) * 100))
  };
}
