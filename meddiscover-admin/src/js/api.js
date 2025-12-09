const BASE_URL = "http://localhost:3000";

export async function fetchClinics() {
  const response = await fetch(`${BASE_URL}/api/clinics`);

  if (!response.ok) {
    throw new Error(`Admin API hatası: ${response.status}`);
  }

  return response.json();
}
