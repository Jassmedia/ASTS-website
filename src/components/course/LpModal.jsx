import React from 'react';

/** Hidden LearnPress confirmation dialog printed at the end of every course page on the current site. */
export default function LpModal() {
  return (
    <div className="lp-overlay" style={{ display: 'none' }}>
      <div className="lp-modal-dialog">
        <div className="lp-modal-content">
          <div className="lp-modal-header">
            <h3 className="modal-title">Modal title</h3>
          </div>
          <div className="lp-modal-body">
            <div className="main-content">Main Content</div>
          </div>
          <div className="lp-modal-footer">
            <button type="button" className="lp-button btn-no">
              No
            </button>
            <button type="button" className="lp-button btn-yes">
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
