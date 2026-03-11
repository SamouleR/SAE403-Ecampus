export default function TeacherDashboard() {
  return (
    <div>
      <h1>👨‍🏫 Espace Enseignant</h1>
      <button>➕ Créer une nouvelle SAE</button>
      <table>
        <thead><tr><th>SAE</th><th>Étudiants</th><th>Actions</th></tr></thead>
        <tbody>{/* Liste des SAE créées par le prof */}</tbody>
      </table>
    </div>
  );
}