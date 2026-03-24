module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        // Category scores are normalised (0–1) and stable across environments —
        // safe to use as hard gates. Individual audits (bf-cache, unused-javascript,
        // etc.) are environment-sensitive on a local static server and are omitted.
        'categories:performance':    ['error', { minScore: 0.9 }],
        'categories:accessibility':  ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo':            ['warn',  { minScore: 0.8 }],
        // Timing metrics as warnings — CI machine CPU varies and would cause
        // spurious failures if set to error.
        'first-contentful-paint':    ['warn',  { maxNumericValue: 2000 }],
        'interactive':               ['warn',  { maxNumericValue: 3500 }],
        'total-blocking-time':       ['warn',  { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
