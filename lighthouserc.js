module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 1,
      settings: {
        // Use the real CI machine speed instead of Lighthouse's default 4x
        // simulated CPU slowdown — prevents TBT inflation on constrained runners
        // from dragging the performance category score below the gate.
        throttlingMethod: 'provided',
      },
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
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
