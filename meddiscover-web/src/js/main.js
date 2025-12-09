import { fetchClinics } from "./api.js";

function renderClinics(clinics) {
  const container = document.getElementById("clinic-list");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!clinics?.length) {
    container.innerHTML = `<p class="clinic-meta">Şu anda listelenecek klinik bulunamadı.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  clinics.forEach((clinic) => {
    const card = document.createElement("article");
    card.className = "clinic-card";

    const name = document.createElement("h3");
    name.textContent = clinic.name ?? "İsimsiz Klinik";

    const city = document.createElement("div");
    city.className = "clinic-meta";
    city.textContent = clinic.city ? `${clinic.city}` : "Şehir bilgisi yok";

    card.appendChild(name);
    card.appendChild(city);

    if (Array.isArray(clinic.specialties) && clinic.specialties.length) {
      const list = document.createElement("div");
      list.className = "clinic-meta";
      list.textContent = clinic.specialties.join(", ");
      card.appendChild(list);
    }

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

async function loadClinics() {
  try {
    const clinics = await fetchClinics();
    renderClinics(clinics);
  } catch (error) {
    console.error(error);
    const container = document.getElementById("clinic-list");
    if (container) {
      container.innerHTML = `<p class="clinic-meta">Klinikler yüklenirken bir sorun oluştu.</p>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", loadClinics);
