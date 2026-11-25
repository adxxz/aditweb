
/* =========================================
   BOOKING LAB RPL
   Kapasitas maksimal 25 peserta per tanggal.
   Data booking disimpan di localStorage.
========================================= */

const nomorAdmin = "6289512053318";
const KAPASITAS_MAKSIMAL = 25;
const STORAGE_KEY = "bookingLabRPL";

const bookingForm = document.getElementById("bookingForm");
const tanggalInput = document.getElementById("tanggal");
const jumlahInput = document.getElementById("jumlah");
const formMessage = document.getElementById("formMessage");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const jadwalContainer = document.getElementById("jadwalBooking");

/* =========================================
   FUNGSI TANGGAL
========================================= */

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

/* =========================================
   MENU MOBILE
========================================= */

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");

    const terbuka = mainNav.classList.contains("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(terbuka)
    );

    menuToggle.textContent = terbuka ? "✕" : "☰";
  });

  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });
}

/* =========================================
   TAHUN FOOTER
========================================= */

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* =========================================
   PENYIMPANAN BOOKING
========================================= */

function ambilBooking() {
  try {
    const data = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error("Gagal membaca data booking:", error);
    return [];
  }
}

function simpanBooking(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );

    return true;

  } catch (error) {
    console.error("Gagal menyimpan data booking:", error);
    return false;
  }
}

/* =========================================
   HITUNG PESERTA BERDASARKAN TANGGAL
========================================= */

function hitungPeserta(iso) {
  return ambilBooking()
    .filter(item => item.tanggal === iso)
    .reduce((total, item) => {
      return total + (Number(item.jumlah) || 0);
    }, 0);
}

function sisaKapasitas(iso) {
  return Math.max(
    0,
    KAPASITAS_MAKSIMAL - hitungPeserta(iso)
  );
}

/* =========================================
   PESAN FORM
========================================= */

function tampilkanPesan(pesan, warna = "red") {
  if (!formMessage) return;

  formMessage.textContent = pesan;
  formMessage.style.color = warna;
}

/* =========================================
   MINGGU AKTIF
========================================= */

function awalMinggu(date) {
  const result = new Date(date);

  result.setHours(12, 0, 0, 0);

  const day = result.getDay();

  result.setDate(
    result.getDate() + (day === 0 ? -6 : 1 - day)
  );

  return result;
}

let mingguAktif = awalMinggu(new Date());

function ubahMinggu(jumlahMinggu) {
  mingguAktif.setDate(
    mingguAktif.getDate() + jumlahMinggu * 7
  );

  tampilkanJadwal();
}

/* =========================================
   TAMPILKAN JADWAL DALAM BENTUK TABEL
========================================= */

function tampilkanJadwal() {
  if (!jadwalContainer) return;

  jadwalContainer.innerHTML = "";

  const labelMinggu = document.getElementById("labelMinggu");

  if (labelMinggu) {
    const akhirMinggu = new Date(mingguAktif);

    akhirMinggu.setDate(
      akhirMinggu.getDate() + 4
    );

    const awalISO = buatTanggalISO(mingguAktif);
    const akhirISO = buatTanggalISO(akhirMinggu);

    labelMinggu.textContent =
      `${formatTanggal(awalISO, {
        weekday: undefined
      })} – ${formatTanggal(akhirISO, {
        weekday: undefined
      })}`;
  }

  const namaHari = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat"
  ];

  const hariIni = tanggalHariIni();

  for (let i = 0; i < 5; i++) {
    const date = new Date(mingguAktif);

    date.setDate(
      mingguAktif.getDate() + i
    );

    const iso = buatTanggalISO(date);

    const terpakai = hitungPeserta(iso);
    const sisa = sisaKapasitas(iso);

    const penuh = sisa <= 0;
    const lewat = iso < hariIni;

    const nonaktif = penuh || lewat;

    let status;
    let statusClass;
    let teksTombol;

    if (penuh) {
      status = "PENUH";
      statusClass = "status-penuh";
      teksTombol = "Booking Penuh";

    } else if (lewat) {
      status = "SUDAH LEWAT";
      statusClass = "status-lewat";
      teksTombol = "Tidak Tersedia";

    } else {
      status = "TERSEDIA";
      statusClass = "status-tersedia";
      teksTombol = "Pilih Hari";
    }

    const row = document.createElement("tr");

    row.innerHTML = `
      <td data-label="Hari">
        <strong>${namaHari[i]}</strong>
      </td>

      <td data-label="Tanggal">
        ${formatTanggal(iso, {
          weekday: undefined,
          year: undefined
        })}
      </td>

      <td data-label="Peserta">
        ${terpakai}/${KAPASITAS_MAKSIMAL} orang
      </td>

      <td data-label="Sisa Kapasitas">
        ${sisa} orang
      </td>

      <td data-label="Status">
        <span class="jadwal-status ${statusClass}">
          ${status}
        </span>
      </td>

      <td data-label="Aksi">
        <button
          type="button"
          class="jadwal-button"
          ${nonaktif ? "disabled" : ""}>
          ${teksTombol}
        </button>
      </td>
    `;

    const button = row.querySelector("button");

    if (!nonaktif) {
      button.addEventListener("click", () => {
        pilihTanggal(iso);
      });
    }

    jadwalContainer.appendChild(row);
  }

  const tombolSebelumnya = document.getElementById(
    "mingguSebelumnya"
  );

  if (tombolSebelumnya) {
    tombolSebelumnya.disabled =
      buatTanggalISO(mingguAktif) <=
      buatTanggalISO(awalMinggu(new Date()));
  }
}

/* =========================================
   PILIH TANGGAL DARI TABEL
   LANGSUNG MENUJU FORM PESANAN
========================================= */

function pilihTanggal(iso) {
  if (!tanggalInput) return;

  // Periksa kapasitas
  const sisa = sisaKapasitas(iso);

  if (sisa <= 0) {
    tampilkanPesan(
      "Maaf, kapasitas pada tanggal tersebut sudah penuh."
    );

    tampilkanJadwal();
    return;
  }

  // Masukkan tanggal otomatis
  tanggalInput.value = iso;

  // Sesuaikan jumlah peserta
  if (jumlahInput) {
    jumlahInput.max = sisa;
    jumlahInput.value = "";
  }

  // Tampilkan pesan
  tampilkanPesan(
    `Tanggal ${formatTanggal(iso)} berhasil dipilih. Silakan isi formulir pesanan.`,
    "green"
  );

  // Ambil elemen form pesanan
  const formPesanan = document.getElementById("bookingForm");

  if (formPesanan) {

    // Arahkan langsung ke formulir
    formPesanan.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    // Fokus ke kolom nama setelah scroll
    setTimeout(() => {
      const kolomNama = document.getElementById("nama");

      if (kolomNama) {
        kolomNama.focus({
          preventScroll: true
        });
      }
    }, 700);
  }
}

/* =========================================
   NAVIGASI MINGGU
========================================= */

document
  .getElementById("mingguSebelumnya")
  ?.addEventListener("click", () => {
    ubahMinggu(-1);
  });

document
  .getElementById("mingguBerikutnya")
  ?.addEventListener("click", () => {
    ubahMinggu(1);
  });

/* =========================================
   VALIDASI TANGGAL MANUAL
========================================= */

if (tanggalInput) {
  tanggalInput.min = tanggalHariIni();

  tanggalInput.addEventListener("change", () => {
    const iso = tanggalInput.value;

    if (!iso) return;

    if (iso < tanggalHariIni()) {
      tampilkanPesan(
        "Tanggal peminjaman tidak boleh sudah lewat."
      );

      tanggalInput.value = "";
      return;
    }

    if (!cekHariKerja(iso)) {
      tampilkanPesan(
        "Booking hanya tersedia hari Senin sampai Jumat."
      );

      tanggalInput.value = "";
      return;
    }

    const sisa = sisaKapasitas(iso);

    if (sisa <= 0) {
      tampilkanPesan(
        `Maaf, ${formatTanggal(iso)} sudah penuh. Pilih tanggal lain.`
      );

      tanggalInput.value = "";
      return;
    }

    if (jumlahInput) {
      jumlahInput.max = sisa;
    }

    tampilkanPesan(
      `Tanggal ${formatTanggal(iso)} masih tersedia. Sisa kapasitas ${sisa} orang.`,
      "green"
    );
  });
}

/* =========================================
   VALIDASI JUMLAH PESERTA
========================================= */

if (jumlahInput) {
  jumlahInput.addEventListener("input", () => {
    const tanggal = tanggalInput?.value;

    if (!tanggal) return;

    const sisa = sisaKapasitas(tanggal);

    jumlahInput.max = sisa;

    if (Number(jumlahInput.value) > sisa) {
      tampilkanPesan(
        `Jumlah peserta melebihi kapasitas. Sisa hanya ${sisa} orang.`
      );
    }
  });
}

/* =========================================
   PROSES BOOKING
========================================= */

if (bookingForm) {
  bookingForm.addEventListener("submit", event => {
    event.preventDefault();

    const nama = document
      .getElementById("nama")
      .value.trim();

    const kelas = document
      .getElementById("kelas")
      .value.trim();

    const tanggal = tanggalInput?.value || "";

    const jumlah = Number(
      jumlahInput?.value
    );

    const keperluan = document
      .getElementById("keperluan")
      .value.trim();

    // Validasi data
    if (
      !nama ||
      !kelas ||
      !tanggal ||
      !jumlah ||
      !keperluan
    ) {
      tampilkanPesan(
        "Mohon lengkapi semua data booking."
      );

      return;
    }

    // Validasi jumlah
    if (
      !Number.isInteger(jumlah) ||
      jumlah < 1 ||
      jumlah > KAPASITAS_MAKSIMAL
    ) {
      tampilkanPesan(
        "Jumlah peserta harus antara 1 sampai 25 orang."
      );

      return;
    }

    // Validasi tanggal
    if (tanggal < tanggalHariIni()) {
      tampilkanPesan(
        "Tanggal peminjaman tidak boleh sudah lewat."
      );

      return;
    }

    if (!cekHariKerja(tanggal)) {
      tampilkanPesan(
        "Booking hanya tersedia hari Senin sampai Jumat."
      );

      return;
    }

    // Cek ulang kapasitas
    const sisa = sisaKapasitas(tanggal);

    if (sisa <= 0) {
      tampilkanPesan(
        `Maaf, ${formatTanggal(tanggal)} sudah penuh.`
      );

      tampilkanJadwal();
      return;
    }

    if (jumlah > sisa) {
      tampilkanPesan(
        `Kapasitas tersisa pada tanggal tersebut hanya ${sisa} orang.`
      );

      return;
    }

    // Data booking baru
    const bookingBaru = {
      id: Date.now(),
      nama: nama,
      kelas: kelas,
      tanggal: tanggal,
      jumlah: jumlah,
      keperluan: keperluan,
      status: "Menunggu konfirmasi"
    };

    const semuaBooking = ambilBooking();

    semuaBooking.push(bookingBaru);

    // Simpan data
    if (!simpanBooking(semuaBooking)) {
      tampilkanPesan(
        "Data booking gagal disimpan. Silakan coba lagi."
      );

      return;
    }

    // Pesan WhatsApp
    const pesan = `
HALO ADMIN LABORATORIUM RPL

Saya ingin mengajukan peminjaman laboratorium.

Nama: ${nama}
Kelas/Organisasi: ${kelas}
Tanggal: ${formatTanggal(tanggal)}
Jumlah Peserta: ${jumlah} orang

Keperluan:
${keperluan}

Status: Menunggu konfirmasi admin.

Mohon konfirmasi pengajuan peminjaman ini.

Terima kasih.
`;

    const linkWhatsApp =
      `https://wa.me/${nomorAdmin}?text=${encodeURIComponent(pesan)}`;

    // Tampilkan pesan berhasil
    tampilkanPesan(
      "Pengajuan tersimpan di browser ini. Silakan kirim pesan WhatsApp dan tunggu konfirmasi admin.",
      "green"
    );

    // Perbarui tabel
    tampilkanJadwal();

    // Buka WhatsApp
    window.open(linkWhatsApp, "_blank");

    // Kosongkan formulir
    bookingForm.reset();

    tanggalInput.min = tanggalHariIni();

    if (jumlahInput) {
      jumlahInput.max = KAPASITAS_MAKSIMAL;
    }
  });
}

/* =========================================
   TAMPILKAN JADWAL PERTAMA KALI
========================================= */

tampilkanJadwal();
