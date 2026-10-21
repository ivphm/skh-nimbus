/** Copy for I8 error states, shared by both experiences. */
export const ERROR_COPY = {
  'face-not-recognised': { title: 'Face not recognised', body: 'Tap your staff card on the reader instead.' },
  'card-not-read': { title: 'Card not read', body: 'Hold the card flat on the reader and try again.' },
  'part-not-found': { title: 'Part not found', body: 'Search by name or part number instead.' },
  'out-of-stock': { title: 'Out of stock', body: 'The ledger shows none left. A reorder flag has been raised.' },
  'location-unknown': { title: 'Location unknown', body: 'This part has no shelf mapped yet. Ask a lead to map it.' },
  'strip-not-responding': { title: 'Light strip not responding', body: 'Use the shelf label shown on screen.' },
  'work-order-not-found': { title: 'Work order not found', body: 'It may have been closed. Pick another one.' },
  'loan-closed': { title: 'Part already closed', body: 'Someone closed this loan a moment ago.' },
} as const

export type ErrorCode = keyof typeof ERROR_COPY
