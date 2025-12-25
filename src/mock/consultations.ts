import { ConsultationSummary } from 'models/Patient';

export const mockConsultations: ConsultationSummary[] = [
  {
    id: 'consultation-001',
    date: '2025-03-18',
    doctorId: 'doctor-123',
    transcript: `
Patient: I've been feeling constant fatigue for the last two months.
Doctor: Is it worse at certain times of the day?
Patient: Mostly in the afternoon, after work.
Doctor: Any sleep issues or stress?
Patient: Yes, irregular sleep and high work stress.
    `.trim(),
    doctorNotes: `
Chronic fatigue and mild headaches reported.
Likely related to stress, irregular sleep, and sedentary lifestyle.
No alarming symptoms at this time.
    `.trim(),
    aiSummary: `
Persistent fatigue mainly in the afternoon with mild headaches.
Likely contributors include high stress levels, poor sleep, and low physical activity.
No red flags identified.
    `.trim(),
    aiRecommendations: [
      'Order CBC to rule out anemia.',
      'Check thyroid function (TSH, FT4).',
      'Encourage regular physical activity.',
      'Advise improved sleep hygiene.',
    ],
  },

  {
    id: 'consultation-002',
    date: '2025-04-02',
    doctorId: 'doctor-123',
    transcript: `
Patient: I’ve had stomach discomfort and bloating after meals.
Doctor: Any specific foods triggering it?
Patient: Mostly dairy and heavy meals.
Doctor: Any nausea or weight loss?
Patient: No nausea, weight stable.
    `.trim(),
    doctorNotes: `
Symptoms suggest possible lactose intolerance or functional dyspepsia.
Advised dietary tracking and temporary dairy avoidance.
    `.trim(),
    aiSummary: `
Postprandial bloating and discomfort associated with dairy intake.
No systemic symptoms present.
    `.trim(),
    aiRecommendations: [
      'Recommend lactose-free diet trial for 2 weeks.',
      'Suggest keeping a food symptom diary.',
      'Consider gastroenterology referral if symptoms persist.',
    ],
  },

  {
    id: 'consultation-003',
    date: '2025-04-20',
    doctorId: 'doctor-123',
    transcript: `
Patient: My blood pressure readings have been high lately.
Doctor: Do you measure them at home?
Patient: Yes, mostly around 150/95.
Doctor: Any headaches or dizziness?
Patient: Occasional headaches.
    `.trim(),
    doctorNotes: `
Elevated blood pressure reported with occasional headaches.
Likely stage 1–2 hypertension.
Discussed lifestyle modification and home BP monitoring.
    `.trim(),
    aiSummary: `
Repeated elevated blood pressure readings with mild symptoms.
Lifestyle factors may be contributing.
    `.trim(),
    aiRecommendations: [
      'Advise daily blood pressure monitoring.',
      'Reduce salt intake and increase physical activity.',
      'Consider antihypertensive therapy if BP remains elevated.',
    ],
  },

  {
    id: 'consultation-004',
    date: '2025-05-05',
    doctorId: 'doctor-123',
    transcript: `
Patient: I’ve been feeling anxious and having trouble sleeping.
Doctor: How long has this been going on?
Patient: About three weeks.
Doctor: Any panic attacks?
Patient: No, just constant worry.
    `.trim(),
    doctorNotes: `
Patient reports anxiety symptoms with insomnia.
No panic attacks or depressive symptoms.
Discussed stress management techniques.
    `.trim(),
    aiSummary: `
Anxiety symptoms with associated insomnia over a three-week period.
No acute psychiatric red flags identified.
    `.trim(),
    aiRecommendations: [
      'Recommend sleep hygiene measures.',
      'Suggest mindfulness or relaxation techniques.',
      'Consider short-term counseling if symptoms persist.',
    ],
  },

  {
    id: 'consultation-005',
    date: '2025-05-21',
    doctorId: 'doctor-123',
    transcript: `
Patient: Just here for a routine follow-up.
Doctor: Any new symptoms since last visit?
Patient: No, feeling fine.
    `.trim(),
    doctorNotes: `
Routine follow-up visit.
Patient reports no new symptoms and feels well.
    `.trim(),
  },
];
