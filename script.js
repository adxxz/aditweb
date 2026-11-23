

const nomorAdmin = "6289512053318";
const KAPASITAS_MAKSIMAL = 25;
const STORAGE_KEY = "bookingLabRPL";

const bookingForm = document.getElementById("bookingForm");
const tanggalInput = document.getElementById("tanggal");
const formMessage = document.getElementById("formMessage");

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

const tombolBooking = bookingForm.querySelector(
  'button[type="submit"]'
);

// Tanggal minimal hari ini
function tanggalHariIni() {
  const today = new Date();
  return new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().split("T")[0];
}

if (tanggalInput) {
  tanggalInput.min = tanggalHariIni();
}

// Menu navigasi HP
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Tahun otomatis
const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Mengambil data booking
function ambilBooking() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// Menghitung jumlah peserta pada jadwal yang bertabrakan
function hitungPeserta(tanggal, mulai, selesai) {
  const semuaBooking = ambilBooking();

  return semuaBooking
    .filter(booking => {
      const tanggalSama = booking.tanggal === tanggal;

      const jamBertabrakan =
        mulai < booking.selesai &&
        selesai > booking.mulai;

      return tanggalSama && jamBertabrakan;
    })
    .reduce((total, booking) => total + Number(booking.jumlah), 0);
}

// Form booking
bookingForm.addEventListener("submit", function(event) {
  event.preventDefault();

  formMessage.textContent = "";
  formMessage.style.color = "#b42318";

  const nama = document.getElementById("nama").value.trim();
  const kelas = document.getElementById("kelas").value.trim();
  const tanggal = tanggalInput.value;
  const jumlah = Number(document.getElementById("jumlah").value);
  const mulai = document.getElementById("mulai").value;
  const selesai = document.getElementById("selesai").value;
  const keperluan = document.getElementById("keperluan").value.trim();

  if (
    !nama || !kelas || !tanggal || !jumlah ||
    !mulai || !selesai || !keperluan
  ) {
    formMessage.textContent = "Mohon lengkapi semua kolom formulir.";
    return;
  }

  if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > 25) {
    formMessage.textContent =
      "Jumlah peserta harus antara 1 sampai 25 orang.";
    return;
  }

  if (tanggal < tanggalHariIni()) {
    formMessage.textContent =
      "Tanggal peminjaman tidak boleh sebelum hari ini.";
    return;
  }

  if (selesai <= mulai) {
    formMessage.textContent =
      "Jam selesai harus lebih besar daripada jam mulai.";
    return;
  }

  if (!/^62\d{8,15}$/.test(nomorAdmin)) {
    formMessage.textContent =
      "Nomor WhatsApp admin belum benar.";
    return;
  }

  // Periksa kapasitas
  const pesertaTerisi = hitungPeserta(tanggal, mulai, selesai);
  const sisaTempat = KAPASITAS_MAKSIMAL - pesertaTerisi;

  if (jumlah > sisaTempat) {
    formMessage.textContent =
      sisaTempat <= 0
        ? "Maaf, jadwal ini sudah penuh. Silakan pilih jadwal lain."
        : `Maaf, tempat tersisa hanya ${sisaTempat} orang. Kurangi jumlah peserta atau pilih jadwal lain.`;
    return;
  }

  // Simpan pengajuan pada browser
  const bookingBaru = {
    nama,
    kelas,
    tanggal,
    jumlah,
    mulai,
    selesai,
    keperluan
  };

  const semuaBooking = ambilBooking();
  semuaBooking.push(bookingBaru);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(semuaBooking)
  );

  // Format tanggal
  const tanggalTampil = new Date(
    tanggal + "T00:00:00"
  ).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Pesan WhatsApp
  const pesan = [
    "Halo Admin Lab RPL, saya ingin mengajukan peminjaman laboratorium.",
    "",
    "DATA PENGAJUAN BOOKING LAB RPL",
    "Nama pemesan: " + nama,
    "Kelas/organisasi: " + kelas,
    "Tanggal: " + tanggalTampil,
    "Jumlah peserta: " + jumlah + " orang",
    "Jam mulai: " + mulai,
    "Jam selesai: " + selesai,
    "Keperluan: " + keperluan,
    "",
    "Mohon konfirmasi ketersediaan jadwal. Terima kasih."
  ].join("\n");

  const whatsappUrl =
    "https://wa.me/" + nomorAdmin +
    "?text=" + encodeURIComponent(pesan);

  window.open(whatsappUrl, "_blank");

  formMessage.style.color = "#147a3d";
  formMessage.textContent =
    "Pengajuan dicatat di browser. Periksa WhatsApp dan tekan Kirim.";
});
