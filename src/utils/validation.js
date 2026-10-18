export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(candidate);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch (_) {
    return false;
  }
}

export function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function validateFileSize(file, maxMb = 5) {
  if (!file) return { valid: true };
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Ukuran file melebihi batas ${maxMb}MB (File saat ini: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`
    };
  }
  return { valid: true };
}

export function validateFileFormat(file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']) {
  if (!file) return { valid: true };
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Format file tidak didukung (${file.type || 'unknown'}). Gunakan JPG, PNG, WebP, SVG, atau PDF.`
    };
  }
  return { valid: true };
}

export function validateProjectForm(data) {
  const errors = {};
  if (!data.title || !data.title.trim()) {
    errors.title = 'Judul proyek wajib diisi';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Judul minimal 3 karakter';
  }

  if (!data.category || !data.category.trim()) {
    errors.category = 'Kategori proyek wajib dipilih';
  }

  if (!data.shortDesc || !data.shortDesc.trim()) {
    errors.shortDesc = 'Deskripsi singkat wajib diisi';
  }

  if (data.demoUrl && data.demoUrl.trim() && !isValidUrl(data.demoUrl)) {
    errors.demoUrl = 'Format URL Demo tidak valid (harus diawali http:// atau https://)';
  }

  if (data.githubUrl && data.githubUrl.trim() && !isValidUrl(data.githubUrl)) {
    errors.githubUrl = 'Format URL GitHub tidak valid';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateSkillForm(data) {
  const errors = {};
  if (!data.name || !data.name.trim()) {
    errors.name = 'Nama skill wajib diisi';
  }
  if (!data.category || !data.category.trim()) {
    errors.category = 'Kategori skill wajib dipilih';
  }
  const prof = Number(data.proficiency);
  if (isNaN(prof) || prof < 0 || prof > 100) {
    errors.proficiency = 'Tingkat penguasaan harus antara 0 hingga 100';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateEducationForm(data) {
  const errors = {};
  if (!data.institution || !data.institution.trim()) {
    errors.institution = 'Nama sekolah / organisasi wajib diisi';
  }
  if (!data.role || !data.role.trim()) {
    errors.role = 'Program / Jurusan / Posisi wajib diisi';
  }
  if (!data.startDate || !data.startDate.trim()) {
    errors.startDate = 'Tahun / tanggal mulai wajib diisi';
  }
  if (!data.isCurrent && (!data.endDate || !data.endDate.trim())) {
    errors.endDate = 'Tahun / tanggal selesai wajib diisi jika sudah selesai';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateCertificateForm(data) {
  const errors = {};
  if (!data.title || !data.title.trim()) {
    errors.title = 'Judul sertifikat wajib diisi';
  }
  if (!data.issuer || !data.issuer.trim()) {
    errors.issuer = 'Penerbit sertifikat wajib diisi';
  }
  if (!data.issueDate || !data.issueDate.trim()) {
    errors.issueDate = 'Tanggal / tahun perolehan wajib diisi';
  }
  if (data.verificationUrl && data.verificationUrl.trim() && !isValidUrl(data.verificationUrl)) {
    errors.verificationUrl = 'URL verifikasi tidak valid';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateProfileForm(data) {
  const errors = {};
  if (!data.name || !data.name.trim()) {
    errors.name = 'Nama lengkap wajib diisi';
  }
  if (!data.class || !data.class.trim()) {
    errors.class = 'Kelas wajib diisi (misal: XI PPLG 3)';
  }
  if (!data.major || !data.major.trim()) {
    errors.major = 'Jurusan wajib diisi';
  }
  if (!data.school || !data.school.trim()) {
    errors.school = 'Nama sekolah wajib diisi';
  }
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Format alamat email tidak valid';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateContactForm(data) {
  const errors = {};
  if (!data.name || !data.name.trim()) {
    errors.name = 'Nama Anda wajib diisi';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Nama minimal 2 karakter';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email Anda wajib diisi';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Format email tidak valid (contoh: nama@domain.com)';
  }

  if (!data.subject || !data.subject.trim()) {
    errors.subject = 'Subjek pesan wajib diisi';
  }

  if (!data.message || !data.message.trim()) {
    errors.message = 'Isi pesan wajib diisi';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Pesan minimal 10 karakter agar maksud tersampaikan dengan jelas';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
