import type { Loan, Part, PartSuggestion, Staff, WorkOrder } from './types'

/** Seed data taken from the Figma screens, used by the mock API and tests. */

export const staff: Staff[] = [
  { id: 's-alex', name: 'Alex Tan', shortName: 'Alex T.', initials: 'AT', role: 'staff', cardId: 'CARD-1001' },
  { id: 's-priya', name: 'Priya Nair', shortName: 'Priya N.', initials: 'PN', role: 'staff', cardId: 'CARD-1002' },
  { id: 's-marcus', name: 'Marcus Tan', shortName: 'Marcus T.', initials: 'MT', role: 'lead', cardId: 'CARD-1003' },
  { id: 's-aisha', name: 'Aisha Rahman', shortName: 'Aisha R.', initials: 'AR', role: 'staff', cardId: 'CARD-1004' },
  { id: 's-jun', name: 'Jun Wei', shortName: 'Jun W.', initials: 'JW', role: 'staff', cardId: 'CARD-1005' },
  { id: 's-mei', name: 'Mei Hui', shortName: 'Mei H.', initials: 'MH', role: 'staff', cardId: 'CARD-1006' },
]

export const parts: Part[] = [
  { id: 'p-012', number: 12, name: 'Pressure transducer', barcode: '880012', category: 'Sensor', machines: ['Infusion pump'], location: { shelf: 'B', slot: 'B3', bin: 12, ledSegment: 7 }, stock: 12, threshold: 4 },
  { id: 'p-013', number: 13, name: 'Occlusion sensor', barcode: '880013', category: 'Sensor', machines: ['Infusion pump'], location: { shelf: 'B', slot: 'B3', bin: 14, ledSegment: 7 }, stock: 9, threshold: 4 },
  { id: 'p-007', number: 7, name: 'Battery pack 7.4V', barcode: '880007', category: 'Power', machines: ['Infusion pump', 'ECG machine'], location: { shelf: 'A', slot: 'A2', bin: 3, ledSegment: 2 }, stock: 6, threshold: 3 },
  { id: 'p-003', number: 3, name: 'Fuse 3.15A', barcode: '880003', category: 'Power', machines: ['Ventilator', 'ECG machine'], location: { shelf: 'C', slot: 'C1', bin: 2, ledSegment: 9 }, stock: 20, threshold: 10 },
  { id: 'p-004', number: 4, name: 'Fuse 5A', barcode: '880004', category: 'Power', machines: ['Ventilator'], location: { shelf: 'C', slot: 'C1', bin: 3, ledSegment: 9 }, stock: 2, threshold: 6 },
  { id: 'p-018', number: 18, name: 'SpO2 sensor cable', barcode: '880018', category: 'Cable', machines: ['Patient monitor'], location: { shelf: 'A', slot: 'A4', ledSegment: 4 }, stock: 5, threshold: 2 },
  { id: 'p-021', number: 21, name: 'Door latch', barcode: '880021', category: 'Mechanical', machines: ['Ventilator'], location: { shelf: 'C', slot: 'C4', ledSegment: 12 }, stock: 3, threshold: 1 },
  { id: 'p-025', number: 25, name: 'ECG lead cable', barcode: '880025', category: 'Cable', machines: ['ECG machine'], location: { shelf: 'A', slot: 'A1', ledSegment: 1 }, stock: 4, threshold: 2 },
  { id: 'p-030', number: 30, name: 'Display ribbon cable', barcode: '880030', category: 'Electrical', machines: ['Ventilator'], location: null, stock: 2, threshold: 1 },
]

const iso = (hoursAgo: number, now = Date.now()) => new Date(now - hoursAgo * 3_600_000).toISOString()

export function makeWorkOrders(now = Date.now()): WorkOrder[] {
  return [
    { id: 'WO-2041', equipment: 'Infusion pump', area: 'Ward 7B', description: 'Alarm keeps sounding, occlusion error on the pump.', requester: 'Nurse Mei Ling', raisedAt: iso(3, now), urgency: 2, status: 'open' },
    { id: 'WO-2042', equipment: 'Ventilator', area: 'ICU bay 3', description: 'Display flickers on startup.', requester: 'Nurse Hafiz', raisedAt: iso(5, now), urgency: 3, status: 'open' },
    { id: 'WO-2043', equipment: 'ECG machine', area: 'Clinic 2', description: 'Lead cable loose, noisy trace.', requester: 'Dr Lim', raisedAt: iso(26, now), urgency: 1, status: 'open' },
    { id: 'WO-2038', equipment: 'Patient monitor', area: 'Ward 5A', description: 'SpO2 reading drops out.', requester: 'Nurse Siti', raisedAt: iso(80, now), urgency: 2, status: 'open' },
    { id: 'WO-2019', equipment: 'Ventilator', area: 'ICU bay 1', description: 'Blown fuse after power surge.', requester: 'Nurse Hafiz', raisedAt: iso(150, now), urgency: 2, status: 'open' },
    { id: 'WO-2044', equipment: 'ECG machine', area: 'A&E', description: 'Runs flat within an hour.', requester: 'Dr Wong', raisedAt: iso(20, now), urgency: 1, status: 'open' },
  ]
}

export function makeLoans(now = Date.now()): Loan[] {
  return [
    { id: 'L-1', partId: 'p-018', qty: 2, workOrderId: 'WO-2038', drawnBy: 's-alex', drawnAt: iso(72, now), status: 'active', confirmed: true },
    { id: 'L-2', partId: 'p-003', qty: 5, workOrderId: 'WO-2019', drawnBy: 's-priya', drawnAt: iso(140, now), status: 'active', confirmed: true },
    { id: 'L-3', partId: 'p-007', qty: 1, workOrderId: 'WO-2044', drawnBy: 's-mei', drawnAt: iso(18, now), status: 'active', confirmed: true },
  ]
}

/** Suggested parts per piece of equipment, from past jobs. */
export const suggestions: Record<string, PartSuggestion[]> = {
  'Infusion pump': [
    { partId: 'p-012', usedIn: 8 },
    { partId: 'p-013', usedIn: 6 },
    { partId: 'p-007', usedIn: 4 },
  ],
  Ventilator: [
    { partId: 'p-030', usedIn: 7 },
    { partId: 'p-004', usedIn: 5 },
    { partId: 'p-021', usedIn: 2 },
  ],
  'ECG machine': [
    { partId: 'p-025', usedIn: 9 },
    { partId: 'p-007', usedIn: 3 },
  ],
  'Patient monitor': [{ partId: 'p-018', usedIn: 8 }],
}
