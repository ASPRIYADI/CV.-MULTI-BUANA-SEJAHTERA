const STORAGE_KARYAWAN = "presencepro_karyawan";
const STORAGE_ABSENSI = "presencepro_absensi";

let streamKamera = null;
let fotoAbsensi = "";
let lokasiAbsensi = null;

let dataKaryawan =
  JSON.parse(localStorage.getItem(STORAGE_KARYAWAN)) || [
    {
      id: 1,
      nama: "Ricky Astrianto Wijaya",
    },
    {
      id: 2,
      nama: "Puji Hariyani",
    },
    {
      id: 3,
      nama: "Slamet Aspriyadi",
    },
    {
      id: 4,
      nama: "Sutrisno",
    },
    {
      id: 5,
      nama: "Barok Muhyidin",
    },
    {
      id: 6,
      nama: "Budi Wahyudi",
    },
    {
      id: 7,
      nama: "Romi Febrinto",
    },
    {
      id: 8,
      nama: "Sidik Maulana",
    },
    {
      id: 9,
      nama: "Fiki Dermawan",
    },
    {
      id: 10,
      nama: "Dandi Ananda Pradipta",
    },
    {
      id: 11,
      nama: "Ali Mashudi",
    },
    {
      id: 12,
      nama: "Ilman Risyadu Ropik",
    },
  ];

let dataAbsensi =
  JSON.parse(localStorage.getItem(STORAGE_ABSENSI)) || [];

const formAbsensi = document.getElementById("formAbsensi");
const pilihKaryawan = document.getElementById("pilihKaryawan");
const tipeAbsensi = document.getElementById("tipeAbsensi");
const keteranganAbsensi = document.getElementById("keteranganAbsensi");

const videoKamera = document.getElementById("videoKamera");
const canvasFoto = document.getElementById("canvasFoto");
const hasilFoto = document.getElementById("hasilFoto");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");

const btnAktifkanKamera = document.getElementById("btnAktifkanKamera");
const btnAmbilFoto = document.getElementById("btnAmbilFoto");
const btnAmbilLokasi = document.getElementById("btnAmbilLokasi");
const btnResetAbsensi = document.getElementById("btnResetAbsensi");

const statusKamera = document.getElementById("statusKamera");
const statusLokasi = document.getElementById("statusLokasi");
const detailLokasi = document.getElementById("detailLokasi");

const tabelAbsensi = document.getElementById("tabelAbsensi");
const emptyState = document.getElementById("emptyState");
const cariAbsensi = document.getElementById("cariAbsensi");
const filterTanggal = document.getElementById("filterTanggal");
const btnResetFilter = document.getElementById("btnResetFilter");
const btnExportCSV = document.getElementById("btnExportCSV");

const formKaryawan = document.getElementById("formKaryawan");
const namaKaryawanBaru = document.getElementById("namaKaryawanBaru");
const jabatanKaryawanBaru = document.getElementById("jabatanKaryawanBaru");
const daftarKaryawan = document.getElementById("daftarKaryawan");
const jumlahKaryawan = document.getElementById("jumlahKaryawan");

document.addEventListener("DOMContentLoaded", () => {
  simpanDataKaryawan();
  tampilkanKaryawanPilihan();
  tampilkanDaftarKaryawan();
  tampilkanTabelAbsensi();
  updateStatistik();
  jalankanJam();
  aktifkanNavigasi();
});

function simpanDataKaryawan() {
  localStorage.setItem(STORAGE_KARYAWAN, JSON.stringify(dataKaryawan));
}

function simpanDataAbsensi() {
  localStorage.setItem(STORAGE_ABSENSI, JSON.stringify(dataAbsensi));
}

function tanggalHariIni() {
  const sekarang = new Date();
  const offset = sekarang.getTimezoneOffset();

  return new Date(sekarang.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
}

function waktuSekarang() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

function jalankanJam() {
  const perbarui = () => {
    const sekarang = new Date();

    document.getElementById("liveClock").textContent =
      sekarang.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });

    document.getElementById("liveDate").textContent =
      sekarang.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
  };

  perbarui();
  setInterval(perbarui, 1000);
}

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  return new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function tampilkanKaryawanPilihan() {
  const nilaiSekarang = pilihKaryawan.value;

  pilihKaryawan.innerHTML = `
    <option value="">Pilih nama karyawan</option>
  `;

  dataKaryawan.forEach((karyawan) => {
    const pilihan = document.createElement("option");

    pilihan.value = karyawan.id;
    pilihan.textContent = `${karyawan.nama} — ${karyawan.jabatan}`;

    pilihKaryawan.appendChild(pilihan);
  });

  pilihKaryawan.value = nilaiSekarang;
}

function tampilkanDaftarKaryawan() {
  daftarKaryawan.innerHTML = "";
  jumlahKaryawan.textContent = `${dataKaryawan.length} Karyawan`;

  if (dataKaryawan.length === 0) {
    daftarKaryawan.innerHTML = `
      <p style="color:#9aa4b6; font-size:11px; padding:15px 0;">
        Belum ada karyawan.
      </p>
    `;
    return;
  }

  dataKaryawan.forEach((karyawan) => {
    const inisial = ambilInisial(karyawan.nama);
    const elemen = document.createElement("div");

    elemen.className = "employee-item";

    elemen.innerHTML = `
      <div class="employee-item-left">
        <div class="employee-avatar">${inisial}</div>

        <div>
          <strong>${escapeHtml(karyawan.nama)}</strong>
          <small>${escapeHtml(karyawan.jabatan)}</small>
        </div>
      </div>

      <button
        class="employee-delete"
        onclick="hapusKaryawan(${karyawan.id})"
      >
        Hapus
      </button>
    `;

    daftarKaryawan.appendChild(elemen);
  });
}

formKaryawan.addEventListener("submit", (event) => {
  event.preventDefault();

  const nama = namaKaryawanBaru.value.trim();
  const jabatan = jabatanKaryawanBaru.value.trim();

  if (!nama || !jabatan) {
    tampilkanToast("Nama dan jabatan wajib diisi.", "error");
    return;
  }

  const sudahAda = dataKaryawan.some(
    (item) => item.nama.toLowerCase() === nama.toLowerCase()
  );

  if (sudahAda) {
    tampilkanToast(
      "Karyawan dengan nama tersebut sudah terdaftar.",
      "error"
    );
    return;
  }

  dataKaryawan.push({
    id: Date.now(),
    nama,
    jabatan
  });

  simpanDataKaryawan();
  tampilkanKaryawanPilihan();
  tampilkanDaftarKaryawan();

  formKaryawan.reset();

  tampilkanToast("Karyawan baru berhasil ditambahkan.", "success");
});

function hapusKaryawan(id) {
  const karyawan = dataKaryawan.find((item) => item.id === id);

  if (!karyawan) return;

  const yakin = confirm(
    `Hapus ${karyawan.nama} dari daftar karyawan?\n\nData absensi sebelumnya tidak akan dihapus.`
  );

  if (!yakin) return;

  dataKaryawan = dataKaryawan.filter((item) => item.id !== id);

  simpanDataKaryawan();
  tampilkanKaryawanPilihan();
  tampilkanDaftarKaryawan();

  tampilkanToast("Karyawan berhasil dihapus.", "success");
}

btnAktifkanKamera.addEventListener("click", aktifkanKamera);
btnAmbilFoto.addEventListener("click", ambilFoto);
btnAmbilLokasi.addEventListener("click", ambilLokasi);
btnResetAbsensi.addEventListener("click", resetAbsensi);

async function aktifkanKamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    tampilkanToast(
      "Browser ini tidak mendukung akses kamera. Gunakan Safari atau Google Chrome terbaru.",
      "error"
    );
    return;
  }

  try {
    streamKamera = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user"
      },
      audio: false
    });

    videoKamera.srcObject = streamKamera;
    videoKamera.style.display = "block";
    hasilFoto.style.display = "none";
    cameraPlaceholder.style.display = "none";

    btnAmbilFoto.disabled = false;
    btnAktifkanKamera.textContent = "Kamera Aktif";

    tampilkanToast("Kamera berhasil diaktifkan.", "success");
  } catch (error) {
    tampilkanToast(
      "Izin kamera ditolak atau kamera tidak tersedia. Izinkan akses kamera pada browser Anda.",
      "error"
    );
  }
}

function ambilFoto() {
  if (!streamKamera) {
    tampilkanToast("Aktifkan kamera terlebih dahulu.", "error");
    return;
  }

  canvasFoto.width = videoKamera.videoWidth;
  canvasFoto.height = videoKamera.videoHeight;

  const konteks = canvasFoto.getContext("2d");

  konteks.drawImage(
    videoKamera,
    0,
    0,
    canvasFoto.width,
    canvasFoto.height
  );

  fotoAbsensi = canvasFoto.toDataURL("image/jpeg", 0.75);

  hasilFoto.src = fotoAbsensi;
  hasilFoto.style.display = "block";
  videoKamera.style.display = "none";

  streamKamera.getTracks().forEach((track) => track.stop());
  streamKamera = null;

  btnAmbilFoto.disabled = true;
  btnAktifkanKamera.textContent = "Ambil Ulang Foto";

  statusKamera.classList.add("verified");
  statusKamera.querySelector("small").textContent =
    "Foto selfie berhasil diambil";

  tampilkanToast("Foto absensi berhasil diambil.", "success");
}

function ambilLokasi() {
  if (!navigator.geolocation) {
    tampilkanToast(
      "Browser Anda tidak mendukung fitur lokasi.",
      "error"
    );
    return;
  }

  btnAmbilLokasi.textContent = "Mengambil Lokasi...";
  btnAmbilLokasi.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (posisi) => {
      const latitude = posisi.coords.latitude.toFixed(6);
      const longitude = posisi.coords.longitude.toFixed(6);
      const akurasi = Math.round(posisi.coords.accuracy);

      lokasiAbsensi = {
        latitude,
        longitude,
        akurasi,
        label: `${latitude}, ${longitude}`
      };

      detailLokasi.innerHTML = `
        <span class="location-icon">✓</span>
        <div>
          <strong>Lokasi berhasil diverifikasi</strong>
          <small>
            ${latitude}, ${longitude} · Akurasi ±${akurasi}m
          </small>
        </div>
      `;

      statusLokasi.classList.add("verified");
      statusLokasi.querySelector("small").textContent =
        "Koordinat berhasil direkam";

      btnAmbilLokasi.textContent = "Perbarui Lokasi";
      btnAmbilLokasi.disabled = false;

      tampilkanToast("Lokasi berhasil diambil.", "success");
    },
    () => {
      btnAmbilLokasi.textContent = "⌖ Ambil Lokasi Saat Ini";
      btnAmbilLokasi.disabled = false;

      tampilkanToast(
        "Lokasi tidak dapat diambil. Pastikan Anda mengizinkan akses lokasi pada browser.",
        "error"
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    }
  );
}

formAbsensi.addEventListener("submit", (event) => {
  event.preventDefault();

  const idKaryawan = Number(pilihKaryawan.value);
  const karyawan = dataKaryawan.find((item) => item.id === idKaryawan);

  const jenis = tipeAbsensi.value;
  const hariIni = tanggalHariIni();

  if (!karyawan) {
    tampilkanToast("Silakan pilih nama karyawan.", "error");
    return;
  }

  const absensiHariIni = dataAbsensi.find(
    (item) =>
      item.karyawanId === idKaryawan &&
      item.tanggal === hariIni
  );

  if (jenis === "Masuk") {
    if (absensiHariIni && absensiHariIni.jamMasuk !== "-") {
      tampilkanToast(
        "Karyawan ini sudah melakukan check-in hari ini.",
        "error"
      );
      return;
    }

    if (!fotoAbsensi) {
      tampilkanToast("Ambil foto selfie terlebih dahulu.", "error");
      return;
    }

    if (!lokasiAbsensi) {
      tampilkanToast("Ambil lokasi saat ini terlebih dahulu.", "error");
      return;
    }

    const jamMasuk = waktuSekarang();
    const status = tentukanStatus(jamMasuk);

    dataAbsensi.push({
      id: Date.now(),
      tanggal: hariIni,
      karyawanId: karyawan.id,
      nama: karyawan.nama,
      jabatan: karyawan.jabatan,
      tipe: "Masuk",
      jamMasuk,
      jamKeluar: "-",
      status,
      lokasi: lokasiAbsensi,
      foto: fotoAbsensi,
      keterangan: keteranganAbsensi.value.trim() || "-"
    });

    simpanDataAbsensi();
    tampilkanTabelAbsensi();
    updateStatistik();
    resetAbsensi();

    tampilkanToast(
      `Check-in ${karyawan.nama} berhasil dicatat sebagai ${status}.`,
      "success"
    );

    return;
  }

  if (jenis === "Izin" || jenis === "Sakit") {
    if (absensiHariIni) {
      tampilkanToast(
        "Karyawan ini sudah memiliki data absensi hari ini.",
        "error"
      );
      return;
    }

    dataAbsensi.push({
      id: Date.now(),
      tanggal: hariIni,
      karyawanId: karyawan.id,
      nama: karyawan.nama,
      jabatan: karyawan.jabatan,
      tipe: jenis,
      jamMasuk: "-",
      jamKeluar: "-",
      status: jenis,
      lokasi: null,
      foto: "",
      keterangan:
        keteranganAbsensi.value.trim() ||
        `Pengajuan ${jenis.toLowerCase()}`
    });

    simpanDataAbsensi();
    tampilkanTabelAbsensi();
    updateStatistik();
    resetAbsensi();

    tampilkanToast(
      `Data ${jenis.toLowerCase()} berhasil disimpan.`,
      "success"
    );
  }
});

function tentukanStatus(jam) {
  const batasMasuk = "09:00:00";

  return jam > batasMasuk ? "Terlambat" : "Hadir";
}
function hitungDurasiKerja(tanggal, jamMasuk, jamKeluar) {
  if (!jamMasuk || jamMasuk === "-" || !jamKeluar || jamKeluar === "-") {
    return {
      menit: 0,
      teks: "Sedang bekerja",
      status: "Belum Check-out"
    };
  }

  const waktuMasuk = new Date(`${tanggal}T${jamMasuk}`);
  const waktuKeluar = new Date(`${tanggal}T${jamKeluar}`);

  let selisihMilidetik = waktuKeluar - waktuMasuk;

  if (selisihMilidetik < 0) {
    selisihMilidetik += 24 * 60 * 60 * 1000;
  }

  const totalMenit = Math.floor(selisihMilidetik / (1000 * 60));
  const jam = Math.floor(totalMenit / 60);
  const menit = totalMenit % 60;

  const minimalJamKerja = 8 * 60;

  return {
    menit: totalMenit,
    teks: `${jam}j ${menit}m`,
    status:
      totalMenit >= minimalJamKerja
        ? "Jam Kerja Lengkap"
        : "Jam Kerja Kurang"
  };
}

function tampilkanTabelAbsensi() {
  const kataKunci = cariAbsensi.value.toLowerCase().trim();
  const tanggalFilter = filterTanggal.value;

  const dataTampil = [...dataAbsensi]
    .filter((item) => {
      const cocokKata = `
        ${item.nama}
        ${item.jabatan}
        ${item.status}
        ${item.keterangan}
      `
        .toLowerCase()
        .includes(kataKunci);

      const cocokTanggal = tanggalFilter
        ? item.tanggal === tanggalFilter
        : true;

      return cocokKata && cocokTanggal;
    })
    .sort((a, b) => b.id - a.id);

  tabelAbsensi.innerHTML = "";

  if (dataTampil.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  dataTampil.forEach((item) => {
    const baris = document.createElement("tr");
    const inisial = ambilInisial(item.nama);

    const lokasiTampil = item.lokasi
      ? `
        <span
          class="location-tag"
          title="${item.lokasi.label}"
        >
          Terverifikasi
        </span>
      `
      : `<span style="color:#a0a9bb">-</span>`;

    const fotoTampil = item.foto
      ? `
        <img
          class="photo-thumb"
          src="${item.foto}"
          alt="Foto ${escapeHtml(item.nama)}"
        >
      `
      : `<div class="no-photo">-</div>`;

    const tombolCheckout =
      item.jamMasuk !== "-" && item.jamKeluar === "-"
        ? `
          <button
            class="btn-checkout-row"
            onclick="checkOut(${item.id})"
          >
            Check Out
          </button>
        `
        : "";
        const durasiKerja = hitungDurasiKerja(
  item.tanggal,
  item.jamMasuk,
  item.jamKeluar
);

const kelasStatusPulang =
  durasiKerja.status === "Jam Kerja Lengkap"
    ? "status-pulang-lengkap"
    : durasiKerja.status === "Jam Kerja Kurang"
    ? "status-pulang-kurang"
    : "status-belum-pulang";

    baris.innerHTML = `
      <td>
        <div class="employee-cell">
          <div class="employee-avatar">${inisial}</div>
          <div>
            <strong>${escapeHtml(item.nama)}</strong>
            <small>${escapeHtml(item.jabatan)}</small>
          </div>
        </div>
      </td>

      <td>${formatTanggal(item.tanggal)}</td>
      <td>${item.jamMasuk}</td>
<td>${item.jamKeluar}</td>

<td>
  <strong>${durasiKerja.teks}</strong>
</td>

<td>
  <span class="status-badge ${kelasStatus(item.status)}">
    ${item.status}
  </span>
</td>

<td>
  <span class="status-badge ${kelasStatusPulang}">
    ${durasiKerja.status}
  </span>
</td>

      <td>${lokasiTampil}</td>
      <td>${fotoTampil}</td>

      <td title="${escapeHtml(item.keterangan)}">
        ${potongTeks(item.keterangan, 28)}
      </td>

      <td>
        ${tombolCheckout}
        <button
          class="btn-delete-row"
          onclick="hapusAbsensi(${item.id})"
        >
          Hapus
        </button>
      </td>
    `;

    tabelAbsensi.appendChild(baris);
  });
}

function checkOut(id) {
  const data = dataAbsensi.find((item) => item.id === id);

  if (!data) return;

  const yakin = confirm(
    `Konfirmasi check-out untuk ${data.nama} pada pukul ${waktuSekarang()}?`
  );

  if (!yakin) return;

  data.jamKeluar = waktuSekarang();

  simpanDataAbsensi();
  tampilkanTabelAbsensi();

  tampilkanToast(
    `Check-out ${data.nama} berhasil dicatat.`,
    "success"
  );
}

function hapusAbsensi(id) {
  const data = dataAbsensi.find((item) => item.id === id);

  if (!data) return;

  const yakin = confirm(
    `Hapus riwayat absensi ${data.nama} pada ${formatTanggal(data.tanggal)}?`
  );

  if (!yakin) return;

  dataAbsensi = dataAbsensi.filter((item) => item.id !== id);

  simpanDataAbsensi();
  tampilkanTabelAbsensi();
  updateStatistik();

  tampilkanToast("Data absensi berhasil dihapus.", "success");
}

function kelasStatus(status) {
  const statusKecil = status.toLowerCase();

  if (statusKecil === "hadir") return "status-hadir";
  if (statusKecil === "terlambat") return "status-terlambat";
  if (statusKecil === "izin") return "status-izin";
  if (statusKecil === "sakit") return "status-sakit";

  return "status-alfa";
}

function updateStatistik() {
  const hariIni = tanggalHariIni();

  const dataHariIni = dataAbsensi.filter(
    (item) => item.tanggal === hariIni
  );

  const hadir = dataHariIni.filter(
    (item) => item.status === "Hadir"
  ).length;

  const terlambat = dataHariIni.filter(
    (item) => item.status === "Terlambat"
  ).length;

  const izinSakit = dataHariIni.filter(
    (item) => item.status === "Izin" || item.status === "Sakit"
  ).length;

  const karyawanSudahAbsen = new Set(
    dataHariIni.map((item) => item.karyawanId)
  ).size;

  const belumAbsen = Math.max(
    dataKaryawan.length - karyawanSudahAbsen,
    0
  );

  document.getElementById("statHadir").textContent = hadir;
  document.getElementById("statTerlambat").textContent = terlambat;
  document.getElementById("statIzinSakit").textContent = izinSakit;
  document.getElementById("statBelumAbsen").textContent = belumAbsen;
}

function resetAbsensi() {
  formAbsensi.reset();

  fotoAbsensi = "";
  lokasiAbsensi = null;

  if (streamKamera) {
    streamKamera.getTracks().forEach((track) => track.stop());
    streamKamera = null;
  }

  videoKamera.srcObject = null;
  videoKamera.style.display = "none";

  hasilFoto.style.display = "none";
  hasilFoto.src = "";

  cameraPlaceholder.style.display = "flex";

  btnAktifkanKamera.textContent = "Aktifkan Kamera";
  btnAmbilFoto.disabled = true;

  statusKamera.classList.remove("verified");
  statusKamera.querySelector("small").textContent =
    "Belum mengambil foto";

  statusLokasi.classList.remove("verified");
  statusLokasi.querySelector("small").textContent =
    "Belum mengambil lokasi";

  detailLokasi.innerHTML = `
    <span class="location-icon">⌖</span>
    <div>
      <strong>Lokasi belum diverifikasi</strong>
      <small>Klik tombol untuk mengambil koordinat Anda.</small>
    </div>
  `;
}

cariAbsensi.addEventListener("input", tampilkanTabelAbsensi);

filterTanggal.addEventListener("change", tampilkanTabelAbsensi);

btnResetFilter.addEventListener("click", () => {
  cariAbsensi.value = "";
  filterTanggal.value = "";

  tampilkanTabelAbsensi();
});

btnExportCSV.addEventListener("click", exportCSV);

function exportCSV() {
  if (dataAbsensi.length === 0) {
    tampilkanToast(
      "Belum ada data absensi untuk diexport.",
      "error"
    );
    return;
  }

  const header = [
    "No",
    "Tanggal",
    "Nama Karyawan",
    "Jabatan",
    "Check In",
    "Check Out",
    "Status",
    "Koordinat Lokasi",
    "Keterangan"
  ];

  const rows = [...dataAbsensi]
    .sort((a, b) => b.id - a.id)
    .map((item, index) => [
      index + 1,
      formatTanggal(item.tanggal),
      item.nama,
      item.jabatan,
      item.jamMasuk,
      item.jamKeluar,
      item.status,
      item.lokasi ? item.lokasi.label : "-",
      item.keterangan
    ]);

  const csv = [header, ...rows]
    .map((baris) =>
      baris
        .map((nilai) => `"${String(nilai).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const file = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(file);
  const tautan = document.createElement("a");

  tautan.href = url;
  tautan.download = `laporan-absensi-${tanggalHariIni()}.csv`;

  document.body.appendChild(tautan);
  tautan.click();
  document.body.removeChild(tautan);

  URL.revokeObjectURL(url);

  tampilkanToast("Laporan CSV berhasil diunduh.", "success");
}

function ambilInisial(nama) {
  return nama
    .split(" ")
    .filter((kata) => kata.length > 0)
    .slice(0, 2)
    .map((kata) => kata.charAt(0).toUpperCase())
    .join("");
}

function escapeHtml(teks) {
  const div = document.createElement("div");

  div.textContent = teks || "";

  return div.innerHTML;
}

function potongTeks(teks, panjang) {
  if (!teks || teks === "-") return "-";

  const aman = escapeHtml(teks);

  return aman.length > panjang
    ? `${aman.substring(0, panjang)}...`
    : aman;
}

function tampilkanToast(pesan, tipe = "success") {
  const toast = document.getElementById("toast");

  toast.textContent = pesan;
  toast.style.background =
    tipe === "error" ? "#b73e53" : "#1f2e55";

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

function aktifkanNavigasi() {
  const linkNavigasi = document.querySelectorAll(".nav-link");

  linkNavigasi.forEach((link) => {
    link.addEventListener("click", () => {
      linkNavigasi.forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");
    });
  });
}

document.getElementById("btnTema").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  const modeGelapAktif =
    document.body.classList.contains("dark-mode");

  tampilkanToast(
    modeGelapAktif
      ? "Mode gelap diaktifkan."
      : "Mode terang diaktifkan.",
    "success"
  );
});

document.querySelectorAll(".tab-button").forEach((tombol) => {
  tombol.addEventListener("click", () => {
    const target = tombol.dataset.tab;

    document.querySelectorAll(".tab-button").forEach((item) => {
      item.classList.remove("active");
    });

    document.querySelectorAll(".tab-content").forEach((item) => {
      item.classList.remove("active");
    });

    tombol.classList.add("active");

    document
      .getElementById(`tab${hurufBesarPertama(target)}`)
      .classList.add("active");
  });
});

function hurufBesarPertama(teks) {
  return teks.charAt(0).toUpperCase() + teks.slice(1);
}