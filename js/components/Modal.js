// js/components/Modal.js
// Modal Dialog System für Bestätigungen

const Modal = {
  confirm: function(options) {
    return new Promise((resolve) => {
      const { 
        title = 'Bestätigung', 
        message = '', 
        confirmText = 'Bestätigen', 
        cancelText = 'Abbrechen',
        type = 'warning' // warning, danger, info
      } = options;

      const icons = {
        warning: '<svg class="modal-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
        danger: '<svg class="modal-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
        info: '<svg class="modal-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
      };

      const iconColors = {
        warning: 'text-yellow-600',
        danger: 'text-red-600',
        info: 'text-blue-600'
      };

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-container">
          <div class="modal-header">
            <div class="${iconColors[type]}">${icons[type]}</div>
            <h3 class="modal-title">${title}</h3>
          </div>
          <div class="modal-body">
            <p class="modal-message">${message}</p>
          </div>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal-overlay').dispatchEvent(new CustomEvent('modal-cancel'))">${cancelText}</button>
            <button class="modal-btn modal-btn-confirm" onclick="this.closest('.modal-overlay').dispatchEvent(new CustomEvent('modal-confirm'))">${confirmText}</button>
          </div>
        </div>
      `;

      overlay.addEventListener('modal-confirm', () => {
        overlay.remove();
        resolve(true);
      });

      overlay.addEventListener('modal-cancel', () => {
        overlay.remove();
        resolve(false);
      });

      // Close on overlay click (outside modal)
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.remove();
          resolve(false);
        }
      });

      document.body.appendChild(overlay);
      
      // Focus confirm button
      setTimeout(() => {
        const confirmBtn = overlay.querySelector('.modal-btn-confirm');
        if (confirmBtn) confirmBtn.focus();
      }, 100);
    });
  },

  warn: function(options) {
    return this.confirm({
      ...options,
      type: 'warning',
      confirmText: options.confirmText || 'Trotzdem fortfahren',
      cancelText: options.cancelText || 'Abbrechen'
    });
  },

  open: function(content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'customModal';
    overlay.innerHTML = `
      <div class="modal-container">
        ${content}
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    document.body.appendChild(overlay);
  },

  close: function() {
    const modal = document.getElementById('customModal');
    if (modal) {
      modal.remove();
    }
  }
};