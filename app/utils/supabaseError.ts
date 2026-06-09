export function friendlySupabaseError(message?: string | null): string {
  const text = message || "";

  if (
    text.includes("Nomor bon sudah digunakan") ||
    text.includes("duplicate key")
  ) {
    return "Nomor bon sudah digunakan.";
  }

  if (text.includes("bonus belum mencukupi")) {
    return "Bonus belum mencukupi.";
  }

  if (text.includes("pelanggan tidak ditemukan")) {
    return "Pelanggan tidak ditemukan.";
  }

  if (text.includes("minimal satu produk")) {
    return "Minimal satu produk wajib diisi.";
  }

  return "Data belum bisa disimpan. Periksa kembali isian atau coba lagi.";
}
