/**
 * Shared styles for auth form components (login, register)
 * Extracted to eliminate duplication and ensure consistency across auth pages
 */

export const FILM_BG = `background-color:var(--color-cinema-bg);background-image:url("data:image/svg+xml,%3Csvg width='60' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='10' width='10' height='14' rx='2' fill='%23D4A017' fill-opacity='0.055'/%3E%3Crect x='46' y='10' width='10' height='14' rx='2' fill='%23D4A017' fill-opacity='0.055'/%3E%3C/svg%3E");background-size:60px 40px;`;

export const AUTH_FORM_STYLES = `
  .auth-input { width:100%; padding:12px 16px; background:#0a0a0a; border:1px solid var(--color-cinema-border); border-radius:10px; color:var(--color-cinema-text); font-size:13px; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
  .auth-input:focus { border-color:rgba(212,160,23,0.45); }
  .auth-input.ng-invalid.ng-touched { border-color:rgba(224,85,85,0.5); }
  .field-error { display:block; font-size:11px; color:#e05555; margin-top:5px; }
  .auth-btn { width:100%; padding:13px; background:var(--color-cinema-gold); color:var(--color-cinema-bg); border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; transition:filter 0.2s,transform 0.1s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .auth-btn:hover:not(:disabled) { filter:brightness(1.1); }
  .auth-btn:active:not(:disabled) { transform:scale(0.98); }
  .auth-btn:disabled { opacity:0.4; cursor:not-allowed; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .spin { animation:spin 0.8s linear infinite; }
`;
