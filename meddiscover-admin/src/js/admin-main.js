import { fetchClinics } from "./api.js";

function bootstrapAdminApp() {
  const root = document.getElementById("admin-root");
  if (!root) {
    return;
  }

  root.innerHTML = `
    <aside class="sidebar">
      <h2>Panel</h2>
      <ul>
        <li><a href="#">Genel Bakış</a></li>
        <li><a href="#">Klinikler</a></li>
        <li><a href="#">Doktorlar</a></li>
        <li><a href="#">Raporlar</a></li>
      </ul>
    </aside>
    <section class="dashboard-content">
      <div class="widget">
        <h3>Hoş geldiniz</h3>
        <p>Yönetim paneli iskeleti yüklendi.</p>
      </div>
    </section>
  `;

  console.log("MedDiscover admin uygulaması yüklendi.");
}

async function prefetchSampleData() {
  try {
    await fetchClinics();
  } catch (error) {
    console.warn("Klinikler önceden yüklenemedi", error);
  }
}

bootstrapAdminApp();
prefetchSampleData();
