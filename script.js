
// GANTI dengan nomor WhatsApp admin.
// Format: 628xxxxxxxxxx
// Jangan menggunakan tanda + atau angka 0 di depan.

const nomorAdmin = "089512053318";

const bookingForm = document.getElementById("bookingForm");
const tanggalInput = document.getElementById("tanggal");
const formMessage = document.getElementById("formMessage");

// Tanggal minimal hari ini
if (tanggalInput) {
  const today = new Date();

  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().split("T")[0];

  tanggalInput.min = localToday;
}

// Menu navigasi HP
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Tahun otomatis
document.getElementById("year").textContent =
  new Date().getFullYear();

// Form booking WhatsApp
bookingForm.addEventListener("submit", function(event) {
  event.preventDefault();

  formMessage.textContent = "";
  formMessage.style.color = "#b42318";

  const nama = document.getElementById("nama").value.trim();
  const kelas = document.getElementById("kelas").value.trim();
  const tanggal = document.getElementById("tanggal").value;
  const jumlah = document.getElementById("jumlah").value;
  const mulai = document.getElementById("mulai").value;
  const selesai = document.getElementById("selesai").value;
  const keperluan = document.getElementById("keperluan").value.trim();

  // Validasi data
  if (
    !nama || !kelas || !tanggal || !jumlah ||
    !mulai || !selesai || !keperluan
  ) {
    formMessage.textContent =
      "Mohon lengkapi semua kolom formulir.";
    return;
  }

  // Validasi jumlah peserta
  if (Number(jumlah) < 1 || Number(jumlah) > 100) {
    formMessage.textContent =
      "Jumlah peserta harus antara 1 sampai 100.";
    return;
  }

  // Validasi tanggal
  if (tanggal < tanggalInput.min) {
    formMessage.textContent =
      "Tanggal peminjaman tidak boleh sebelum hari ini.";
    return;
  }

  // Validasi jam
  if (selesai <= mulai) {
    formMessage.textContent =
      "Jam selesai harus lebih besar daripada jam mulai.";
    return;
  }

  // Validasi nomor admin
  if (!/^62\d{8,15}$/.test(nomorAdmin)) {
    formMessage.textContent =
      "Nomor WhatsApp admin belum diatur di script.js.";
    return;
  }

  // Format tanggal Indonesia
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

  window.open(
    whatsappUrl,
    "_blank",
    "noopener,noreferrer"
  );

  formMessage.style.color = "#147a3d";
  formMessage.textContent =
    "WhatsApp dibuka. Periksa pesan, lalu tekan Kirim.";
});
