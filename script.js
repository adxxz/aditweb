
/* =========================================
   BOOKING LAB RPL
   Kapasitas maksimal 25 peserta per tanggal,
   gabungan seluruh jam booking.
========================================= */

const nomorAdmin = "6289512053318";
const KAPASITAS_MAKSIMAL = 25;
const STORAGE_KEY = "bookingLabRPL";

const bookingForm = document.getElementById("bookingForm");
const tanggalInput = document.getElementById("tanggal");
const formMessage = document.getElementById("formMessage");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const jadwalContainer = document.getElementById("jadwalBooking");

/* TANGGAL LOKAL */
function tanggalHariIni() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

function buatTanggalISO(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function tanggalDariISO(iso) {
  return new Date(iso + "T12:00:00");
}

function cekHariKerja(iso) {
  const day = tanggalDariISO(iso).getDay();
  return day >= 1 && day <= 5;
}

function formatTanggal(iso, options = {}) {
  return tanggalDariISO(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options
  });
}

/* MENU MOBILE */
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
    const open = mainNav.classList.contains("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "✕" : "☰";
  });

  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });
}

/* TAHUN FOOTER */
const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

/* PENYIMPANAN BROWSER */
function ambilBooking() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Gagal membaca data booking:", error);
    return [];
  }
}

function simpanBooking(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Gagal menyimpan data booking:", error);
    return false;
  }
}

/* HITUNG SEMUA BOOKING PADA TANGGAL YANG SAMA */
function hitungPeserta(iso) {
  return ambilBooking()
    .filter(item => item.tanggal === iso)
    .reduce((total, item) => total + (Number(item.jumlah) || 0), 0);
}

function sisaKapasitas(iso) {
  return Math.max(0, KAPASITAS_MAKSIMAL - hitungPeserta(iso));
}

function tampilkanPesan(pesan, warna = "red") {
  if (!formMessage) return;
  formMessage.textContent = pesan;
  formMessage.style.color = warna;
}

/* MINGGU YANG SEDANG DITAMPILKAN */
function awalMinggu(date) {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);
  const day = result.getDay();
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  return result;
}

let mingguAktif = awalMinggu(new Date());

function ubahMinggu(jumlahMinggu) {
  mingguAktif.setDate(mingguAktif.getDate() + jumlahMinggu * 7);
  tampilkanJadwal();
}

/* TAMPILKAN JADWAL SENIN-JUMAT */
function tampilkanJadwal() {
  if (!jadwalContainer) return;

  jadwalContainer.innerHTML = "";

  const labelMinggu = document.getElementById("labelMinggu");
  if (labelMinggu) {
    const akhir = new Date(mingguAktif);
    akhir.setDate(akhir.getDate() + 4);
    labelMinggu.textContent =
      `${formatTanggal(buatTanggalISO(mingguAktif), { weekday: undefined })} – ${formatTanggal(buatTanggalISO(akhir), { weekday: undefined })}`;
  }

  const namaHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const hariIni = tanggalHariIni();

  for (let i = 0; i < 5; i++) {
    const date = new Date(mingguAktif);
    date.setDate(mingguAktif.getDate() + i);
    const iso = buatTanggalISO(date);

    const terpakai = hitungPeserta(iso);
    const sisa = sisaKapasitas(iso);
    const penuh = sisa <= 0;
    const lewat = iso < hariIni;
    const nonaktif = penuh || lewat;

    const card = document.createElement("article");
    card.className = "jadwal-card";

    const status = penuh ? "PENUH" : lewat ? "SUDAH LEWAT" : "TERSEDIA";
    const statusClass = penuh ? "status-penuh" : lewat ? "status-lewat" : "status-tersedia";

    card.innerHTML = `
      <h3>${namaHari[i]}</h3>
      <p class="jadwal-tanggal">${formatTanggal(iso, {
        weekday: undefined,
        year: undefined
      })}</p>
      <p class="jadwal-jam">07.00–15.00</p>
      <span class="jadwal-status ${statusClass}">${status}</span>
      <p class="jadwal-kapasitas">${terpakai}/${KAPASITAS_MAKSIMAL} peserta</p>
      <button type="button" class="jadwal-button" ${nonaktif ? "disabled" : ""}>
        ${penuh ? "Booking Penuh" : lewat ? "Tidak Tersedia" : "Pilih Hari"}
      </button>
    `;

    const button = card.querySelector("button");
    if (!nonaktif) {
      button.addEventListener("click", () => {
        if (tanggalInput) tanggalInput.value = iso;
        tampilkanPesan(`Tanggal ${formatTanggal(iso)} dipilih.`, "green");
        document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
      });
    }

    jadwalContainer.appendChild(card);
  }

  const prev = document.getElementById("mingguSebelumnya");
  if (prev) {
    prev.disabled = buatTanggalISO(mingguAktif) <= buatTanggalISO(awalMinggu(new Date()));
  }
}

/* NAVIGASI MINGGU */
document.getElementById("mingguSebelumnya")?.addEventListener("click", () => ubahMinggu(-1));
document.getElementById("mingguBerikutnya")?.addEventListener("click", () => ubahMinggu(1));

/* VALIDASI SAAT TANGGAL DIPILIH MANUAL */
if (tanggalInput) {
  tanggalInput.min = tanggalHariIni();

  tanggalInput.addEventListener("change", () => {
    const iso = tanggalInput.value;
    if (!iso) return;

    if (iso < tanggalHariIni()) {
      tampilkanPesan("Tanggal peminjaman tidak boleh sudah lewat.");
      tanggalInput.value = "";
      return;
    }

    if (!cekHariKerja(iso)) {
      tampilkanPesan("Booking hanya tersedia hari Senin sampai Jumat.");
      tanggalInput.value = "";
      return;
    }

    if (sisaKapasitas(iso) <= 0) {
      tampilkanPesan(`Maaf, ${formatTanggal(iso)} sudah penuh. Pilih tanggal lain.`);
      tanggalInput.value = "";
      return;
    }

    tampilkanPesan(`Tanggal ${formatTanggal(iso)} masih tersedia.`, "green");
  });
}

/* PROSES PENGAJUAN BOOKING */
if (bookingForm) {
  bookingForm.addEventListener("submit", event => {
    event.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const kelas = document.getElementById("kelas").value.trim();
    const tanggal = tanggalInput?.value || "";
    const jumlah = Number(document.getElementById("jumlah").value);
    const mulai = document.getElementById("mulai").value;
    const selesai = document.getElementById("selesai").value;
    const keperluan = document.getElementById("keperluan").value.trim();

    if (!nama || !kelas || !tanggal || !mulai || !selesai || !keperluan) {
      tampilkanPesan("Mohon lengkapi semua data booking.");
      return;
    }

    if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > KAPASITAS_MAKSIMAL) {
      tampilkanPesan("Jumlah peserta harus antara 1 sampai 25 orang.");
      return;
    }

    if (tanggal < tanggalHariIni()) {
      tampilkanPesan("Tanggal peminjaman tidak boleh sudah lewat.");
      return;
    }

    if (!cekHariKerja(tanggal)) {
      tampilkanPesan("Booking hanya tersedia hari Senin sampai Jumat.");
      return;
    }

    if (selesai <= mulai) {
      tampilkanPesan("Jam selesai harus lebih besar dari jam mulai.");
      return;
    }

    /* CEK ULANG SEBELUM MENYIMPAN */
    const sisa = sisaKapasitas(tanggal);
    if (sisa <= 0) {
      tampilkanPesan(`Maaf, ${formatTanggal(tanggal)} sudah penuh.`);
      tampilkanJadwal();
      return;
    }

    if (jumlah > sisa) {
      tampilkanPesan(`Kapasitas tersisa pada tanggal tersebut hanya ${sisa} orang.`);
      return;
    }

    const bookingBaru = {
      id: Date.now(),
      nama,
      kelas,
      tanggal,
      jumlah,
      mulai,
      selesai,
      keperluan,
      status: "Menunggu konfirmasi"
    };

    const semuaBooking = ambilBooking();
    semuaBooking.push(bookingBaru);

    if (!simpanBooking(semuaBooking)) {
      tampilkanPesan("Data booking gagal disimpan. Silakan coba lagi.");
      return;
    }

    const pesan = `
HALO ADMIN LABORATORIUM RPL

Saya ingin mengajukan peminjaman laboratorium.

Nama: ${nama}
Kelas/Organisasi: ${kelas}
Tanggal: ${formatTanggal(tanggal)}
Jumlah Peserta: ${jumlah} orang
Jam Mulai: ${mulai}
Jam Selesai: ${selesai}

Keperluan:
${keperluan}

Status: Menunggu konfirmasi admin.

Mohon konfirmasi pengajuan peminjaman ini.

Terima kasih.
`;

    const linkWhatsApp =
      `https://wa.me/${nomorAdmin}?text=${encodeURIComponent(pesan)}`;

    tampilkanPesan(
      "Pengajuan tersimpan di browser ini. Silakan kirim pesan WhatsApp dan tunggu konfirmasi admin.",
      "green"
    );

    tampilkanJadwal();
    window.open(linkWhatsApp, "_blank");
    bookingForm.reset();

    if (tanggalInput) tanggalInput.min = tanggalHariIni();
  });
}

/* RENDER AWAL */
tampilkanJadwal();