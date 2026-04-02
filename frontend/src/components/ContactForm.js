import React from 'react';

export default function ContactForm() {
  return (
    <div className="contact-container-fixed">
      <h2 className="section-title-center cursive-font bordeaux-text">Une question ? Nous contacter directement</h2>
      <form className="maquette-form-center">
        <div className="form-grid-mmi">
          <div className="form-group-mmi">
            <label className="cursive-font bordeaux-text">Nom complet :</label>
            <input type="text" className="maquette-input-pill" />
          </div>
          <div className="form-group-mmi">
            <label className="cursive-font bordeaux-text">Email :</label>
            <input type="email" className="maquette-input-pill" />
          </div>
          <div className="form-group-mmi">
            <label className="cursive-font bordeaux-text">Sujet :</label>
            <select className="maquette-input-pill">
              <option>Admission</option>
              <option>Partenariat</option>
            </select>
          </div>
          <div className="form-group-mmi">
            <label className="cursive-font bordeaux-text">Message :</label>
            <textarea className="maquette-textarea-pill"></textarea>
          </div>
        </div>
        
        {/* BOUTON CENTRÉ ICI */}
        <div className="btn-center-wrapper">
          <button type="submit" className="maquette-btn-black-pill">
            ENVOYER LE MESSAGE
          </button>
        </div>
      </form>
    </div>
  );
}