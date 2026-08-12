export const GLOBAL_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f7f4ef; }
  .wrap { max-width: 640px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }

  h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.8rem; font-weight: 400; color: #2c2418; }
  .subtitle { font-family: 'DM Mono', monospace; font-size: 0.63rem; color: #9a8f7e; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.2rem; margin-bottom: 0.5rem; }

  /* Nav links */
  .page-links { display: flex; gap: 1.25rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
  .rules-link { font-family: 'DM Mono', monospace; font-size: 0.63rem; letter-spacing: 0.06em; color: #b07d3a; text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0; }
  .rules-link:hover { color: #8a5f28; }
  .log-today-btn { font-family: 'DM Mono', monospace; font-size: 0.63rem; letter-spacing: 0.08em; text-transform: uppercase; background: none; border: 1px solid #3d3228; color: #3d3228; padding: 0.35rem 0.8rem; border-radius: 2px; cursor: pointer; margin-left: auto; }
  .log-today-btn:hover { background: #3d3228; color: #f7f4ef; }

  /* Summary table */
  .tbl { width: 100%; border-collapse: collapse; }
  .tbl thead th { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: #b5a898; padding: 0 0.5rem 0.6rem; text-align: right; }
  .tbl thead th:first-child { text-align: left; }
  .tbl tbody tr { border-top: 1px solid #e8e2d8; cursor: pointer; transition: background 0.1s; }
  .tbl tbody tr:hover { background: #eee9e0; }
  .tbl tbody td { padding: 0.65rem 0.5rem; font-family: 'DM Mono', monospace; text-align: right; color: #6b5f52; vertical-align: middle; }
  .tbl tbody td:first-child { text-align: left; }
  .date-str { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #3d3228; }
  .cell-main { font-size: 1rem; color: #2c2418; font-weight: 500; line-height: 1.2; display: inline; }
  .cell-small { font-size: 0.78rem; color: #2c2418; font-weight: 400; line-height: 1.2; display: inline; }
  .cell-sub { font-size: 0.78rem; color: #b5a898; line-height: 1.2; display: block; margin-top: 0.1rem; }
  .deficit-pos { color: #3a7d44; font-weight: 600; font-size: 1.05rem; }
  .deficit-neg { color: #b84040; font-weight: 600; font-size: 1.05rem; }
  .protein-big { font-family: 'DM Mono', monospace; font-size: 1.05rem; font-weight: 600; color: #2c2418; }

  /* Back link */
  .back-link { font-family: 'DM Mono', monospace; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: #9a8f7e; background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 1.25rem; display: inline-block; }
  .back-link:hover { color: #b07d3a; }

  /* Rules / info pages */
  .rules-page h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.15rem; font-weight: 400; color: #2c2418; margin: 1.25rem 0 0.4rem; }
  .rules-page h2:first-of-type { margin-top: 0; }
  .rules-page p { font-size: 0.88rem; line-height: 1.55; color: #4a4036; margin-bottom: 0.5rem; }
  .rules-page ul { margin: 0.3rem 0 0.5rem 1.1rem; }
  .rules-page li { font-size: 0.85rem; line-height: 1.55; color: #4a4036; margin-bottom: 0.25rem; }
  .rules-page .num { font-family: 'DM Mono', monospace; color: #b07d3a; }

  /* Sheet overlay */
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 10; transition: opacity 0.3s ease; }
  .overlay.hidden { opacity: 0; }
  .sheet { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 16px 16px 0 0; z-index: 20; max-height: 82vh; overflow: hidden; box-shadow: 0 -4px 24px rgba(0,0,0,0.1); }
  .sheet-handle-zone { padding: 16px 0 12px; touch-action: none; cursor: grab; }
  .sheet-handle { width: 36px; height: 4px; background: #d6cfc4; border-radius: 2px; margin: 0 auto; }
  .sheet-panel { width: 50%; flex-shrink: 0; box-sizing: border-box; padding: 0 1.25rem 2.5rem; overflow-y: auto; max-height: calc(82vh - 36px); }
  .sheet-date { font-family: 'Playfair Display', Georgia, serif; font-size: 1.15rem; font-style: italic; color: #2c2418; margin-bottom: 0.9rem; }
  .sheet-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.9rem; }
  .sheet-nav-btn { font-family: 'DM Mono', monospace; background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #9a8f7e; padding: 0 0.4rem; }
  .sheet-nav-btn:disabled { opacity: 0.2; cursor: default; }

  /* Stat cards */
  .sheet-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 1.25rem; }
  .stat-card { background: #f7f4ef; border-radius: 6px; padding: 0.6rem 0.75rem; }
  .stat-label { font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: #b5a898; margin-bottom: 0.2rem; }
  .stat-val { font-family: 'Playfair Display', Georgia, serif; font-size: 1.3rem; color: #2c2418; line-height: 1.1; }
  .stat-val.amber { color: #b07d3a; }
  .stat-val.green { color: #3a7d44; }
  .stat-val.red { color: #b84040; }
  .stat-sub { font-family: 'DM Mono', monospace; font-size: 0.6rem; color: #b5a898; margin-top: 0.1rem; }

  /* Workout row */
  .workout-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; padding: 0.6rem 0.75rem; background: #eaf2eb; border-radius: 6px; }
  .workout-label { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: #3a7d44; flex: 1; letter-spacing: 0.04em; }
  .workout-edit-btn { font-family: 'DM Mono', monospace; font-size: 0.65rem; background: transparent; border: none; color: #3a7d44; cursor: pointer; text-decoration: underline; }
  .log-workout-btn { font-family: 'DM Mono', monospace; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; background: transparent; border: 1px solid #3d3228; color: #3d3228; padding: 0.45rem 1rem; cursor: pointer; border-radius: 2px; margin-bottom: 1.25rem; }
  .log-workout-btn:hover { background: #3d3228; color: #f7f4ef; }

  /* Food entries */
  .section-label { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: #b5a898; margin-bottom: 0.6rem; }
  .meal-label { font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.08em; text-transform: uppercase; color: #d6cfc4; margin: 0.65rem 0 0.2rem; }
  .sheet-entry { display: flex; align-items: baseline; gap: 0; padding: 0.6rem 0; border-bottom: 1px solid #f0ebe3; }
  .sheet-name { flex: 1; font-size: 0.86rem; color: #3d3228; line-height: 1.4; padding-right: 0.75rem; }
  .sheet-cal { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #b07d3a; white-space: nowrap; width: 2.75rem; text-align: right; flex-shrink: 0; }
  .sheet-protein { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #6b5f52; white-space: nowrap; width: 3.25rem; text-align: right; flex-shrink: 0; }
  .sheet-del { background: none; border: none; color: #d6cfc4; cursor: pointer; font-size: 1rem; padding: 0 0 0 0.4rem; line-height: 1; width: 1.4rem; flex-shrink: 0; }
  .sheet-del:hover { color: #c0392b; }
  .sheet-empty { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #d6cfc4; padding: 1rem 0; }
  .sheet-add-btn { font-family: 'DM Mono', monospace; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; background: transparent; border: 1px solid #d6cfc4; color: #9a8f7e; padding: 0.5rem 1rem; cursor: pointer; border-radius: 2px; margin-top: 1rem; }
  .sheet-add-btn:hover { border-color: #b07d3a; color: #b07d3a; }

  /* Add form */
  .form { background: #f7f4ef; border: 1px solid #e8e2d8; border-radius: 3px; padding: 1rem; margin-top: 0.75rem; display: grid; gap: 0.65rem; }
  .form input, .form select { font-family: 'DM Mono', monospace; font-size: 0.78rem; background: #fff; border: 1px solid #d6cfc4; color: #2c2418; padding: 0.5rem 0.65rem; border-radius: 2px; width: 100%; }
  .form input:focus, .form select:focus { outline: none; border-color: #b07d3a; }
  .form-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem; }
  .form-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; }
  .form-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
  .btn-primary { font-family: 'DM Mono', monospace; font-size: 0.7rem; background: #b07d3a; color: #fff; border: none; padding: 0.5rem 1rem; cursor: pointer; border-radius: 2px; }
  .btn-cancel { font-family: 'DM Mono', monospace; font-size: 0.7rem; background: transparent; color: #9a8f7e; border: 1px solid #d6cfc4; padding: 0.5rem 1rem; cursor: pointer; border-radius: 2px; }

  /* Smoothie */
  .smth-search { position: relative; margin-top: 1.25rem; margin-bottom: 1.5rem; }
  .smth-input { width: 100%; padding: 0.55rem 0.75rem; font-family: 'DM Mono', monospace; font-size: 0.82rem; border: 1px solid #d8d0c4; border-radius: 6px; background: #faf8f5; color: #3d3228; outline: none; }
  .smth-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #fff; border: 1px solid #d8d0c4; border-radius: 6px; z-index: 100; max-height: 220px; overflow-y: auto; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
  .smth-option { padding: 0.5rem 0.75rem; font-family: 'DM Mono', monospace; font-size: 0.78rem; color: #3d3228; cursor: pointer; border-bottom: 1px solid #f5f2ee; display: flex; justify-content: space-between; align-items: center; }
  .smth-option:hover { background: #f7f4ef; }
  .smth-option-sub { color: #b5a898; font-size: 0.68rem; margin-left: 0.75rem; flex-shrink: 0; }
  .smth-tbl { width: 100%; border-collapse: collapse; }
  .smth-tbl th { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: #b5a898; padding: 0 0.4rem 0.6rem; text-align: right; }
  .smth-tbl th:first-child { text-align: left; }
  .smth-tbl td { padding: 0.5rem 0.4rem; font-family: 'DM Mono', monospace; font-size: 0.76rem; color: #3d3228; vertical-align: middle; }
  .smth-tbl tr.entry-row { border-top: 1px solid #f0ebe3; }
  .smth-divider { border-top: 2px solid #d8d0c4; }
  .smth-total-row { background: #f7f4ef; }
  .smth-after-row { background: #eaf2eb; }
  .smth-num-input { width: 52px; font-family: 'DM Mono', monospace; font-size: 0.72rem; background: #fff; border: 1px solid #d6cfc4; color: #2c2418; padding: 0.18rem 0.3rem; border-radius: 2px; text-align: right; }
  .smth-unit { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: #b5a898; margin-left: 0.2rem; }
  .smth-add-row-btn { font-family: 'DM Mono', monospace; font-size: 0.68rem; letter-spacing: 0.06em; color: #6b5f52; background: none; border: 1px solid #d6cfc4; border-radius: 3px; cursor: pointer; padding: 0.25rem 0.65rem; }
  .smth-add-row-btn:hover { border-color: #b07d3a; color: #b07d3a; }
  .smth-custom-input { width: 100%; font-family: 'DM Mono', monospace; font-size: 0.72rem; border: 1px solid #d8d0c4; border-radius: 3px; padding: 0.3rem 0.4rem; background: #faf8f5; }
  .smth-confirm-btn { font-family: 'DM Mono', monospace; font-size: 0.65rem; background: #2c2418; color: #fff; border: none; border-radius: 3px; padding: 0.25rem 0.4rem; cursor: pointer; margin-right: 0.2rem; }
  .smth-cancel-btn { font-family: 'DM Mono', monospace; font-size: 0.65rem; background: none; border: 1px solid #d6cfc4; color: #9a8f7e; border-radius: 3px; padding: 0.25rem 0.4rem; cursor: pointer; }
  .smth-generate-btn { font-family: 'DM Mono', monospace; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: #fff; border: none; padding: 0.55rem 1.25rem; border-radius: 3px; cursor: pointer; }
  .smth-copy-area { width: 100%; font-family: 'DM Mono', monospace; font-size: 0.75rem; background: #f5f0ea; border: 1px solid #d6cfc4; border-radius: 3px; padding: 0.5rem; color: #2c2418; resize: none; cursor: text; }

  /* Frequent foods table */
  .freq-tbl { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  .freq-tbl th { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: #b5a898; padding: 0 0.5rem 0.6rem; text-align: right; }
  .freq-tbl th:first-child { text-align: left; }
  .freq-tbl tr { border-top: 1px solid #e8e2d8; }
  .freq-tbl td { padding: 0.65rem 0.5rem; font-family: 'DM Mono', monospace; font-size: 0.82rem; color: #3d3228; }
  .freq-tbl td:not(:first-child) { text-align: right; }

  /* Workout form */
  .wk-form { background: #eaf2eb; border-radius: 6px; padding: 0.85rem; margin-bottom: 1rem; }
  .wk-karvonen { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.6rem; }
  .wk-label { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; color: #5a9b64; display: block; margin-bottom: 0.2rem; }
  .wk-input { font-family: 'DM Mono', monospace; font-size: 0.78rem; background: #fff; border: 1px solid #a8d4ad; color: #2c2418; padding: 0.35rem 0.5rem; border-radius: 2px; width: 100%; }
  .wk-calc-btn { font-family: 'DM Mono', monospace; font-size: 0.65rem; background: transparent; border: 1px solid #3a7d44; color: #3a7d44; padding: 0.3rem 0.75rem; border-radius: 2px; cursor: pointer; }
  .wk-save-btn { font-family: 'DM Mono', monospace; font-size: 0.68rem; background: #3a7d44; color: #fff; border: none; padding: 0.4rem 0.9rem; border-radius: 2px; cursor: pointer; }
  .wk-delete-btn { font-family: 'DM Mono', monospace; font-size: 0.68rem; background: none; border: 1px solid #c0392b; color: #c0392b; padding: 0.4rem 0.75rem; border-radius: 2px; cursor: pointer; }
`;
