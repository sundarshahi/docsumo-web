const MTAnalyticsTooltipData = {
  title: {
    data: 'Field Name',
    tooltipType: 'sm',
  },
  accuracy: {
    data: '% of correct predictions by model.',
    tooltipType: 'sm',
  },
  precision: {
    data: 'If the model predicts 10 L labels, out of which 8 are actually correct label L, then precision is 8/10 -> 0.8 (80%)',
    tooltipType: 'sm',
  },
  recall: {
    data: 'If there are originally 20 L labels, out of which model identifies 8 correctly, then recall is 8/20 -> 0.4 (40%)',
    tooltipType: 'sm',
  },
  f1Score: {
    data: 'Harmonic mean between precision and recall F1 -> 2 * p * r/(p+r) -> 2 * 0.8 * 0.4/(0.8 + 0.4) -> 0.64/1.2 -> 0.533',
    tooltipType: 'sm',
  },
  support: {
    data: 'No. of fields in Documents.',
    tooltipType: 'sm',
  },
};

export { MTAnalyticsTooltipData };
