document.getElementById("simulateurForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const foyer = parseInt(document.getElementById("foyer").value);
  const revenu = parseFloat(document.getElementById("revenu").value);
  const ageLogement = document.getElementById("ageLogement").value;

  // Barèmes jusqu'à 5 personnes (selon tableau PDF)
  const basePlafonds = {
    bleu: [17173, 25115, 30026, 35285, 40388],
    jaune: [22015, 32227, 38719, 45163, 51775],
    violet: [30449, 44407, 50471, 56335, 62400]
  };

  // Majoration par personne au-delà de 5
  const majoration = {
    bleu: 5094,
    jaune: 6252,
    violet: 9165
  };

  function getSeuil(profil, foyer) {
    if (foyer <= 5) return basePlafonds[profil][foyer - 1];
    return basePlafonds[profil][4] + (foyer - 5) * majoration[profil];
  }

  // Détermination du profil
  let profil = "rose";
  if (revenu <= getSeuil("bleu", foyer)) profil = "bleu";
  else if (revenu <= getSeuil("jaune", foyer)) profil = "jaune";
  else if (revenu <= getSeuil("violet", foyer)) profil = "violet";

  // Aides par type
  const travaux = [
    {
      type: "combles",
      label: "Isolation des combles perdus",
      cee: { bleu: 11.05, jaune: 10.2, violet: 10.2, rose: 10.2 },
      renov: { bleu: 0, jaune: 0, violet: 0, rose: 0 },
      input: "surfaceCombles",
      checkbox: "combles"
    },
    {
      type: "rampants",
      label: "Isolation des rampants/toiture",
      cee: { bleu: 11.05, jaune: 10.2, violet: 10.2, rose: 10.2 },
      renov: { bleu: 25, jaune: 15, violet: 15, rose: 0 },
      input: "surfaceRampants",
      checkbox: "rampants"
    },
    {
      type: "mursExt",
      label: "Isolation des murs extérieurs",
      cee: { bleu: 10.40, jaune: 9.6, violet: 9.6, rose: 9.6 },
      renov: { bleu: 75, jaune: 40, violet: 40, rose: 0 },
      input: "surfaceMurs",
      checkbox: "mursExt"
    },
    {
      type: "plancher",
      label: "Isolation du plancher bas",
      cee: { bleu: 7.37, jaune: 7.37, violet: 7.37, rose: 7.37 },
      renov: { bleu: 0, jaune: 0, violet: 0, rose: 0 },
      input: "surfacePlancher",
      checkbox: "plancher"
    }
  ];

  let totalCEE = 0;
  let totalRenov = 0;
  let resultText = "";

  if (ageLogement === "-2") {
    document.getElementById("resultat").innerHTML = `
      <p style="color:red;"><strong>Votre logement a moins de 2 ans : vous n'êtes pas éligible aux aides.</strong></p>
    `;
    return;
  }

  travaux.forEach(t => {
    if (!document.getElementById(t.checkbox).checked) return;

    const surface = parseFloat(document.getElementById(t.input).value) || 0;
    const surfaceRenov = (t.type === "mursExt") ? Math.min(surface, 100) : surface;

    const montantCEE = t.cee[profil] * surface;
    const montantRenov = ageLogement === "+15" ? t.renov[profil] * surfaceRenov : 0;

    totalCEE += montantCEE;
    totalRenov += montantRenov;

    resultText += `
      <p><strong>${t.label}</strong> : ${surface} m²</p>
      <p>Prime CEE : ${montantCEE.toFixed(2)} €<br>
         MaPrimeRénov’ : ${montantRenov.toFixed(2)} €</p><hr>`;
  });

  const total = totalCEE + totalRenov;

  document.getElementById("resultat").innerHTML = `
    <p><strong>Total estimé Prime CEE :</strong> ${totalCEE.toFixed(2)} €</p>
    <p><strong>Total estimé MaPrimeRénov’ :</strong> ${totalRenov.toFixed(2)} €</p>
    <p><strong>Montant total estimé :</strong> ${total.toFixed(2)} €</p>
  `;
});
