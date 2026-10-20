/**
 * HABIB AI Service — Advanced AI Assistant & Voice Engine for NOVA GLASS
 * Habib Ramadhan (BibTzy) Portfolio
 * 
 * Capabilities:
 * 1. Gemini AI Integration with Fallback System
 * 2. Strict Indonesian Language Enforcement in System Instruction & Local Fallback
 * 3. Real-Time Web Speech Recognition (STT) with Mic Permission UX (id-ID default)
 * 4. Speech Synthesis (TTS) with Indonesian Voice Selection, Rate & Interrupt Controls
 * 5. Smart Owner Assistant (Profile, Skills, Projects, Education, Certificates, Contact)
 * 6. Chat Session Memory (Session Retention, Clear, Export)
 * 7. Coding Tutor Mode (Clean code, Indonesian step-by-step guidance)
 * 8. AI Project Generator (Categorized Indonesian project blueprints)
 * 9. Rate Limiting & Audio Duration Guards
 */

import { profileService } from './profileService.js';
import { skillService } from './skillService.js';
import { projectService } from './projectService.js';
import { educationService } from './educationService.js';
import { certificateService } from './certificateService.js';
import { storageService } from './storageService.js';
import { ownerKnowledgeService } from './ownerKnowledgeService.js';

// ─── Environment & Constants ──────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const MAX_AUDIO_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 12;
const RATE_LIMIT_WINDOW_MS = 60_000;
const CHAT_STORAGE_KEY = 'nova_ai_chat_history_v2';
const VOICE_SETTINGS_KEY = 'nova_ai_voice_settings_v3';

// ─── Instruksi Sistem Mandatori (Backend AI Instruction) ───────────────────────
export const MANDATORY_SYSTEM_INSTRUCTION = `Kamu adalah NOVA AI, asisten pintar dari website NOVA GLASS. Kamu wajib menjawab menggunakan bahasa Indonesia dalam semua situasi secara default. Gunakan bahasa Indonesia yang natural, jelas, ramah, dan mudah dipahami. Jika pengguna bertanya dalam bahasa Inggris atau bahasa lain, tetap jawab dalam bahasa Indonesia. Hanya gunakan bahasa lain jika pengguna secara eksplisit meminta jawaban dalam bahasa tersebut. Untuk istilah teknis pemrograman, nama teknologi, kode, dan nama produk, pertahankan istilah aslinya jika diperlukan, tetapi jelaskan artinya dalam bahasa Indonesia. Jangan mengarang informasi tentang owner, proyek, pendidikan, atau sertifikat. Jika informasi tidak tersedia, katakan dengan jujur bahwa informasi tersebut belum tersedia.`;

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.timestamps = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }
    this.timestamps.push(now);
    return true;
  }

  getCooldownSeconds() {
    if (this.timestamps.length === 0) return 0;
    const oldest = this.timestamps[0];
    const diff = this.windowMs - (Date.now() - oldest);
    return Math.max(1, Math.ceil(diff / 1000));
  }
}

const aiRateLimiter = new RateLimiter(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);

// ─── Owner Knowledge Base (Truth Grounding) ───────────────────────────────────
export function getOwnerKnowledge() {
  const profile = profileService.getProfile();
  const skills = skillService.getSkills();
  const projects = projectService.getProjects();
  const timeline = educationService.getTimeline();
  const certificates = certificateService.getCertificates();

  const skillsGrouped = skills.reduce((acc, s) => {
    const cat = s.category || 'Lainnya';
    acc[cat] = acc[cat] || [];
    acc[cat].push(`${s.name} (${s.levelLabel || 'Menengah'}, ${s.proficiency}%)`);
    return acc;
  }, {});

  const skillsSummary = Object.entries(skillsGrouped)
    .map(([cat, list]) => `• ${cat}: ${list.join(', ')}`)
    .join('\n');

  const projectsSummary = projects.length > 0
    ? projects.map(p => `• [${p.category || 'Web'}] ${p.title}: ${p.shortDesc || 'Proyek portofolio'}${p.liveUrl ? ` (Demo: ${p.liveUrl})` : ''}`).join('\n')
    : '• Proyek unggulan sedang aktif dikembangkan di katalog portofolio.';

  const eduItems = timeline.filter(t => t.type === 'education');
  const educationSummary = eduItems.length > 0
    ? eduItems.map(e => `• ${e.institution} - ${e.role} (${e.startDate} - ${e.endDate}): ${e.description}`).join('\n')
    : `• ${profile.school} - ${profile.major} (Kelas ${profile.class})`;

  const expItems = timeline.filter(t => t.type === 'experience');
  const experienceSummary = expItems.length > 0
    ? expItems.map(e => `• ${e.institution} - ${e.role} (${e.startDate} - ${e.endDate}): ${e.description}`).join('\n')
    : '• Pengalaman kolaborasi proyek sekolah dan kegiatan kejuruan.';

  const certsSummary = certificates.length > 0
    ? certificates.map(c => `• ${c.title} — Penerbit: ${c.issuer} (${c.issueDate || 'Tervalidasi'}) | ID Kredensial: ${c.credentialId || 'Tersedia'}`).join('\n')
    : '• Belum ada sertifikat tambahan yang dipublikasikan.';

  const customKnowledgeText = ownerKnowledgeService.formatKnowledgeForSystemPrompt();

  return {
    profile,
    skills,
    projects,
    timeline,
    certificates,
    text: `
DATA RESMI OWNER (HABIB RAMADHAN / BIBTZY):
- Nama Lengkap: ${profile.name}
- Nama Panggilan / Alias: BibTzy
- Status: ${profile.status}
- Kelas: ${profile.class}
- Jurusan: ${profile.major} (Pengembangan Perangkat Lunak dan Gim)
- Sekolah: ${profile.school}
- Lokasi: ${profile.location}
- Slogan / Tagline: "${profile.tagline}"
- Bio: "${profile.bio}"
- Minat: ${(profile.interests || []).join(', ')}
- Cita-cita / Tujuan Karier: "${profile.careerGoal}"
- Bahasa yang Dikuasai: ${(profile.languages || []).join(', ')}
- Tanggal Lahir / Ulang Tahun: ${profile.birthDate || '25 Agustus 2009'}
- Teman Dekat / Sahabat: ${(profile.closeFriends && (Array.isArray(profile.closeFriends) ? profile.closeFriends.length > 0 : profile.closeFriends.trim())) ? (Array.isArray(profile.closeFriends) ? profile.closeFriends.join(', ') : profile.closeFriends) : 'Rekan-rekan siswa sekelas di XI PPLG 3 SMK Negeri 1 Ciomas'}
- Kontak:
  * Email: ${profile.email}
  * WhatsApp: ${profile.whatsapp}
  * GitHub: ${profile.github}
  * Instagram: ${profile.instagram}

Riwayat Pendidikan:
${educationSummary}

Riwayat Pengalaman & Organisasi:
${experienceSummary}

Keahlian Teknologi:
${skillsSummary}

Sertifikat & Lisensi Resmi:
${certsSummary}

Proyek Portofolio:
${projectsSummary}

${customKnowledgeText}

Website ini bernama NOVA GLASS, dibangun dengan React 19, Vite, dan desain Liquid Glassmorphism Dark Navy & Cyan.
`
  };
}

// ─── System Prompts by Mode ───────────────────────────────────────────────────
export function createSystemInstruction(mode, currentRoute = '/') {
  const ownerKnowledge = getOwnerKnowledge();

  switch (mode) {
    case 'owner':
      return `
${MANDATORY_SYSTEM_INSTRUCTION}

${ownerKnowledge.text}

MODE AKTIF: SMART OWNER ASSISTANT (Tanya Owner)
Tugas utama kamu adalah menjadi representasi asisten untuk menjawab seputar Habib Ramadhan (BibTzy):
- Riwayat sekolah & jurusan SMK PPLG di SMKN 1 Ciomas
- Pengalaman organisasi & kolaborasi proyek
- Keahlian teknis (HTML, CSS, JS, React, PHP, Laravel, MySQL, Git, Figma)
- Sertifikat resmi yang telah diraih (misal: Dicoding)
- Proyek portofolio
- Visi & cita-cita karier
- Kontak & kolaborasi

ATURAN BAHASA & KEBENARAN:
- WAJIB selalu menjawab dalam BAHASA INDONESIA secara default.
- Jika pengguna bertanya dalam bahasa Inggris atau bahasa lain, tetap jawab dalam Bahasa Indonesia secara ramah dan jelas.
- Jawab strictly berdasar fakta data resmi di atas.
- Jangan mengarang data sekolah, sertifikat, atau informasi pribadi yang tidak tercantum. Jika tidak tersedia, katakan dengan jujur bahwa informasi tersebut belum tersedia.
`.trim();

    case 'coding':
      return `
${MANDATORY_SYSTEM_INSTRUCTION}

MODE AKTIF: CODING TUTOR (Tutor Pemrograman)
Tugasmu:
- Membantu pengunjung dan siswa SMK PPLG belajar pemrograman web & software (HTML, CSS, JavaScript, React, SQL, PHP, Git, REST API, arsitektur database).
- Berikan penjelasan dalam Bahasa Indonesia yang ramah, sistematis, dan mudah dipahami.
- Jika pengguna bertanya dalam bahasa Inggris, tetap berikan penjelasan dalam BAHASA INDONESIA.
- Untuk istilah teknis pemrograman (seperti variable, function, props, state, hook, array, async/await, database query, commit, push), pertahankan istilah aslinya tanpa diterjemahkan secara kaku, tetapi berikan penjelasan maksudnya dalam bahasa Indonesia.
- Berikan contoh kode bersih dengan penamaan variabel yang baik dan komentar ringkas.
- Bila ada kode yang bermasalah (debugging), jelaskan penyebab error lalu beri solusinya.
- Selalu bungkus kode dalam markdown block \`\`\`bahasa ... \`\`\`.
`.trim();

    case 'project':
      return `
${MANDATORY_SYSTEM_INSTRUCTION}

MODE AKTIF: AI PROJECT GENERATOR
Tugasmu: Menghasilkan ide proyek dan rencana pengembangan terstruktur untuk kategori: Website, UI/UX, Game, Mobile App, atau AI.
Semua penjelasan, fitur, langkah pengerjaan, dan tips WAJIB ditulis dalam Bahasa Indonesia yang kreatif dan terstruktur.

Format respons ide proyek:
🚀 **Nama Proyek**: [Nama keren & modern]
🎯 **Tujuan & Masalah**: [Apa yang diselesaikan]
✨ **Fitur Kunci**: [3-5 fitur unggulan]
🛠️ **Teknologi Rekomendasi**: [Frontend, Backend, Database/Tools]
📑 **Struktur Halaman**: [Halaman/Screen utama]
📋 **Tahap Pengerjaan**: [Langkah 1 sampai selesai]
💡 **Tips Ekstra**: [Tips khusus siswa SMK/pemula]

Jika pengguna meminta "kembangkan ide ini lebih detail", buat breakdown spesifikasi teknis dan estimasi waktu pengerjaan dalam Bahasa Indonesia.
`.trim();

    default:
      return `
${MANDATORY_SYSTEM_INSTRUCTION}

${ownerKnowledge.text}

Halaman yang sedang dibuka pengguna di website saat ini: "${currentRoute}".
Tugasmu:
1. Menjawab pertanyaan seputar Habib Ramadhan (BibTzy) dan portofolio NOVA GLASS.
2. Memandu navigasi website (Home, About, Projects, Skills, Education, Certificates, CV, Contact, Settings).
3. Menjawab pertanyaan seputar pemrograman & teknologi.
4. Memberikan saran ide proyek.
5. SELALU gunakan Bahasa Indonesia yang ramah, sopan, dan jelas secara default.
6. Jika pengguna bertanya dalam bahasa Inggris atau bahasa lain, tetap balas dalam BAHASA INDONESIA, kecuali jika pengguna secara eksplisit meminta dijawab dalam bahasa asing.
`.trim();
  }
}

// ─── Local Fallback Knowledge Engine (Offline / No API Key) ───────────────────
export function generateLocalAnswer(userPrompt, mode = 'general', currentRoute = '/', history = []) {
  const text = (userPrompt || '').toLowerCase();
  const { profile, skills, projects, timeline, certificates } = getOwnerKnowledge();

  // 1. Cek basis data pengetahuan terverifikasi owner & pencarian semantik kontekstual
  const knowledgeAnswer = ownerKnowledgeService.generateAnswer(userPrompt, history);
  if (knowledgeAnswer) {
    return knowledgeAnswer;
  }

  // Mode: Coding Tutor fallback
  if (mode === 'coding') {
    if (text.includes('html')) {
      return `### 📝 Pengenalan Struktur Dasar HTML5\n\nHTML (HyperText Markup Language) adalah kerangka dasar website.\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="id">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Website Pertamaku</title>\n</head>\n<body>\n  <h1>Halo Dunia! 👋</h1>\n  <p>Selamat datang di pembelajaran HTML5.</p>\n</body>\n</html>\n\`\`\`\n\n**Penjelasan Komponen:**\n1. \`<!DOCTYPE html>\`: Memberi tahu browser bahwa dokumen memakai standar HTML5.\n2. \`<meta name="viewport">\`: Menjaga tampilan responsive di smartphone.\n3. \`<h1>\` & \`<p>\`: Elemen heading dan paragraf konten utama.`;
    }
    if (text.includes('flexbox') || text.includes('grid') || text.includes('css')) {
      return `### 🎨 CSS Flexbox vs CSS Grid\n\n- **Flexbox (1 Dimensi)**: Ideal untuk mengatur elemen secara horizontal (baris) atau vertikal (kolom), misal navbar atau tombol berdampingan.\n- **CSS Grid (2 Dimensi)**: Ideal untuk layout keseluruhan yang punya baris DAN kolom sekaligus (seperti galeri foto atau kartu dashboard).\n\n\`\`\`css\n/* Contoh Flexbox (tengah sempurna) */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 1rem;\n}\n\n/* Contoh CSS Grid (kartu responsive) */\n.grid-cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n}\n\`\`\``;
    }
    if (text.includes('async') || text.includes('await') || text.includes('javascript') || text.includes('js')) {
      return `### ⚡ Async / Await di JavaScript (ES6+)\n\n\`async/await\` adalah cara modern menangani operasi asynchronous (seperti mengambil data dari server) agar kode terbaca seperti kode sinkron.\n\n\`\`\`javascript\nasync function ambilDataUser(userId) {\n  try {\n    console.log('Sedang mengambil data...');\n    const response = await fetch(\`https://api.example.com/users/\${userId}\`);\n    \n    if (!response.ok) {\n      throw new Error('Gagal menghubungi server!');\n    }\n    \n    const data = await response.json();\n    console.log('Data diterima:', data);\n    return data;\n  } catch (error) {\n    console.error('Terjadi kesalahan:', error.message);\n  }\n}\n\`\`\`\n\n**Keuntungan:** Bebas dari *callback hell* dan penanganan error rapi menggunakan blok \`try...catch\`.`;
    }
    if (text.includes('react') || text.includes('hook') || text.includes('usestate')) {
      return `### ⚛️ React Hooks: useState & useEffect\n\n\`useState\` untuk menyimpan state dinamis, sedangkan \`useEffect\` untuk efek samping (side effects) seperti fetch data saat komponen dipasang.\n\n\`\`\`jsx\nimport React, { useState, useEffect } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = \`Klik ke-\${count}\`;\n  }, [count]); // Berjalan setiap count berubah\n\n  return (\n    <div className="card">\n      <h3>Jumlah Klik: {count}</h3>\n      <button onClick={() => setCount(prev => prev + 1)}>\n        Tambah +1\n      </button>\n    </div>\n  );\n}\n\`\`\``;
    }
    if (text.includes('git')) {
      return `### 🐙 Alur Kerja Dasar Git & GitHub\n\n1. Inisialisasi: \`git init\`\n2. Cek status: \`git status\`\n3. Rekam perubahan: \`git add .\`\n4. Simpan commit: \`git commit -m "feat: tambah fitur baru"\`\n5. Hubungkan repo remote: \`git remote add origin URL_GITHUB\`\n6. Unggah kode: \`git push -u origin main\``;
    }
    if (text.includes('sql') || text.includes('database') || text.includes('mysql')) {
      return `### 🗄️ Query Dasar SQL (CRUD)\n\n\`\`\`sql\n-- Create (Tambah data)\nINSERT INTO siswa (nama, kelas, jurusan) \nVALUES ('Habib Ramadhan', 'XI PPLG 3', 'PPLG');\n\n-- Read (Ambil data)\nSELECT * FROM siswa WHERE jurusan = 'PPLG';\n\n-- Update (Perbarui data)\nUPDATE siswa SET kelas = 'XII PPLG 3' WHERE nama = 'Habib Ramadhan';\n\n-- Delete (Hapus data)\nDELETE FROM siswa WHERE id = 1;\n\`\`\``;
    }
    return `### 💻 NOVA Coding Tutor\n\nSaya siap membantumu belajar pemrograman web & software dalam Bahasa Indonesia!\n\nTopik populer yang bisa kamu tanyakan:\n• **HTML5**: Struktur semantik & form accessibility\n• **CSS3**: Glassmorphism, Flexbox, Grid, Animasi\n• **JavaScript**: ES6+, Async/Await, Array Methods, DOM\n• **React.js**: Hooks (useState, useEffect, useMemo), Props, Router\n• **Backend & DB**: PHP, Laravel, MySQL, REST API\n• **Git**: Branching, Commit, Pull Request, Resolusi Konflik\n\n_Ketik pertanyaan spesifik atau tempel kode yang ingin kamu pelajari!_`;
  }

  // Mode: Project Generator fallback
  if (mode === 'project' || text.includes('ide proyek') || text.includes('proyek baru') || text.includes('project idea')) {
    if (text.includes('game')) {
      return `🚀 **Nama Proyek**: Neon Cyber Runner 2D\n🎯 **Tujuan**: Game endless runner bertema futuristik cyber glass untuk mengasah logika physics 2D dan tabrakan objek.\n✨ **Fitur Kunci**:\n• Kontrol karakter lari, lompat ganda, dan slide\n• Rintangan acak (procedural obstacles) berkecepatan dinamis\n• Skor tertinggi tersimpan di LocalStorage / Leaderboard\n• Efek partikel neon dan sound effect futuristik\n🛠️ **Teknologi**: HTML5 Canvas / Phaser.js / JavaScript murni\n📑 **Struktur Halaman**: Menu Utama, Game Canvas, Game Over Modal, Leaderboard\n📋 **Tahap Pengerjaan**:\n1. Desain sprite karakter & rintangan di Aseprite / Figma\n2. Bangun game loop (update & render 60fps)\n3. Terapkan deteksi tabrakan AABB collision\n4. Tambahkan audio dan scoring system\n💡 **Tips**: Mulai dengan kotak warna solid sebelum mengganti ke aset grafis detail!`;
    }
    if (text.includes('ui') || text.includes('ux') || text.includes('desain') || text.includes('design')) {
      return `🚀 **Nama Proyek**: EcoTrack — Smart Waste & Recycling App UI/UX\n🎯 **Tujuan**: Antarmuka aplikasi mobile untuk memilah sampah dan menukarkan poin daur ulang menjadi saldo e-wallet.\n✨ **Fitur Kunci**:\n• Scan barcode sampah untuk panduan daur ulang\n• Peta drop point bank sampah terdekat\n• Dompet poin ramah lingkungan & katalog reward\n• Gamifikasi badge & leaderboard kebersihan\n🛠️ **Teknologi**: Figma, Design System, Auto-Layout, FigJam\n📑 **Struktur Halaman**: Onboarding, Dashboard, Scan Scanner, Peta Lokasi, Dompet Poin\n📋 **Tahap Pengerjaan**:\n1. User persona & user journey mapping\n2. Wireframing low-fidelity (sketsa alur)\n3. Color palette alam & typography modern\n4. High-fidelity interactive prototype\n💡 **Tips**: Gunakan gaya Neo-Glassmorphism dengan palet hijau emerald dan frosted glass.`;
    }
    if (text.includes('ai') || text.includes('kecerdasan buatan')) {
      return `🚀 **Nama Proyek**: BrainWave — AI Study Note Summarizer\n🎯 **Tujuan**: Aplikasi web cerdas untuk meringkas materi pelajaran SMK dan membuat kuis pilihan ganda otomatis.\n✨ **Fitur Kunci**:\n• Input teks catatan atau upload dokumen PDF\n• Ringkasan otomatis dalam 3 level (Singkat, Sedang, Mendalam)\n• Generator kuis interaktif dengan skor instan\n• Flashcards untuk menghafal istilah pemrograman\n🛠️ **Teknologi**: React.js, Tailwind CSS, Google Gemini API, Web Speech API\n📑 **Struktur Halaman**: Beranda, Editor Ringkasan, Ruang Kuis, Riwayat Belajar\n📋 **Tahap Pengerjaan**:\n1. Desain wireframe antarmuka catatan\n2. Integrasikan API Gemini untuk prompt ringkasan teks\n3. Buat modul state kuis dinamis\n4. Deploy ke Vercel\n💡 **Tips**: Pasang limit panjang teks agar tidak melebihi kuota API gratis.`;
    }
    return `🚀 **Nama Proyek**: EduPPLG — Interactive Code Lab & Portfolio Hub\n🎯 **Tujuan**: Platform belajar dan pamer karya proyek pemrograman khusus untuk siswa SMK PPLG.\n✨ **Fitur Kunci**:\n• Live code editor (HTML, CSS, JS preview langsung)\n• Showcase proyek siswa dengan filter kategori & tombol like\n• Jalur belajar (roadmap) interaktif dengan checklist\n• Sistem sertifikat digital yang bisa diunduh PDF\n🛠️ **Teknologi**: React 19, Vite, Vanilla Glass CSS, Supabase / IndexedDB\n📑 **Struktur Halaman**: Home, Live Playground, Project Gallery, Roadmap, Profile\n📋 **Tahap Pengerjaan**:\n1. Bangun arsitektur frontend dengan komponen reusable\n2. Pasang iframe live preview untuk compiler mini\n3. Hubungkan penyimpanan database untuk simpan proyek\n4. Optimasi performa dan Glassmorphism UI\n💡 **Tips**: Sangat cocok dijadikan portofolio unggulan kelulusan atau lomba LKS SMK!`;
  }

  // "Jelaskan Halaman Ini" context-aware
  if (text.includes('jelaskan halaman') || text.includes('halaman ini') || text.includes('dimana saya') || text.includes('explain page')) {
    const routeInfo = {
      '/': 'Kamu sedang di **Halaman Home** (Beranda Utama NOVA GLASS). Halaman ini menampilkan sambutan profil Habib Ramadhan, status siswa SMK PPLG, sorotan keahlian, dan tombol eksplorasi cepat.',
      '/about': 'Kamu berada di **Halaman About** (Profil Pemilik). Di sini kamu bisa membaca biografi lengkap, visi karier, latar belakang pendidikan di SMKN 1 Ciomas, serta minat Habib.',
      '/projects': 'Kamu berada di **Halaman Projects** (Katalog Portofolio). Di sini terdapat galeri karya aplikasi web, desain, dan eksperimen coding yang dibuat oleh Habib dengan filter kategori dan link demo.',
      '/skills': 'Kamu berada di **Halaman Skills** (Keahlian Teknologi). Menampilkan tingkat kemahiran (persentase) teknologi frontend, backend, database, dan tools desain.',
      '/education': 'Kamu berada di **Halaman Education** (Riwayat Pendidikan). Menampilkan jejak studi di SMKN 1 Ciomas jurusan PPLG dan kompetensi kejuruan.',
      '/certificates': 'Kamu berada di **Halaman Certificates** (Sertifikat & Lisensi). Berisi bukti pencapaian kursus dan kompetensi yang telah diraih.',
      '/cv': 'Kamu berada di **Halaman CV Builder**. Di sini kamu bisa melihat ringkasan Curriculum Vitae resmi Habib dan mengunduhnya dalam format PDF.',
      '/contact': 'Kamu berada di **Halaman Contact** (Hubungi Saya). Menyediakan formulir pesan langsung terhubung ke email Habib, nomor WhatsApp, serta tautan media sosial.',
      '/settings': 'Kamu berada di **Halaman Settings** (Pengaturan Website). Kamu bisa mengganti tema aksen, wallpaper kustom (video/gambar), efek suara, dan preferensi animasi.'
    };
    return routeInfo[currentRoute] || `Kamu saat ini berada di rute: \`${currentRoute}\` pada portofolio digital NOVA GLASS. Ingin saya bantu jelaskan fitur di halaman ini?`;
  }

  // Sertifikat & Lisensi
  if (text.includes('sertifikat') || text.includes('certificate') || text.includes('lisensi') || text.includes('dicoding')) {
    if (certificates.length === 0) {
      return `📜 Saat ini informasi sertifikat resmi sedang diperbarui di katalog website. Kamu dapat memantau sertifikat terbaru di halaman **Certificates**!`;
    }
    const certList = certificates.map(c => `• **${c.title}** diterbitkan oleh ${c.issuer} (${c.issueDate || 'Tervalidasi'})`).join('\n');
    return `📜 Sertifikat resmi yang dimiliki Habib Ramadhan:\n\n${certList}\n\nUntuk melihat bukti kredensial dan link verifikasi resmi, silakan buka halaman **Certificates**!`;
  }

  // Riwayat Pendidikan & Pengalaman
  if (text.includes('pendidikan') || text.includes('education') || text.includes('riwayat') || text.includes('osis') || text.includes('pengalaman')) {
    const eduList = timeline.map(t => `• **${t.institution}** — ${t.role} (${t.startDate} - ${t.endDate})`).join('\n');
    return `🎓 Riwayat pendidikan dan pengalaman organisasi Habib Ramadhan:\n\n${eduList}\n\nSelengkapnya dapat kamu lihat pada halaman **Education**!`;
  }

  // Pertanyaan jurusan & sekolah
  if (text.includes('jurusan') || text.includes('pplg') || text.includes('major')) {
    return `📚 Habib Ramadhan mengambil jurusan **${profile.major}** (Pengembangan Perangkat Lunak dan Gim) di ${profile.school}.\n\nJurusan ini mempelajari logika pemrograman, perancangan web, pengembangan mobile, arsitektur database, dan pengembangan game.`;
  }

  if (text.includes('sekolah') || text.includes('smk') || text.includes('ciomas') || text.includes('school')) {
    return `🏫 Habib bersekolah di **${profile.school}**, ${profile.location}. Beliau berada di kelas **${profile.class}** pada kompetensi keahlian PPLG.`;
  }

  // Keahlian / Skills
  if (text.includes('keahlian') || text.includes('skill') || text.includes('teknologi') || text.includes('bisa apa')) {
    const topSkills = skills.slice(0, 6).map(s => `• **${s.name}** — ${s.levelLabel || 'Menengah'} (${s.proficiency}%)`).join('\n');
    return `💻 Keahlian teknologi yang dikuasai Habib Ramadhan antara lain:\n\n${topSkills}\n\nHabib juga menguasai tools kolaborasi seperti **Git, GitHub, dan Figma**. Selengkapnya bisa kamu lihat di halaman **Skills**!`;
  }

  // Proyek Portofolio
  if (text.includes('proyek') || text.includes('project') || text.includes('karya') || text.includes('portfolio')) {
    if (projects.length === 0) {
      return `🚀 Salah satu proyek terbaik yang dibangun adalah website **NOVA GLASS** ini — portofolio interaktif berbasis React dengan dark liquid glassmorphism, AI assistant suara, dan offline storage.\n\nKoleksi proyek lainnya sedang aktif diperbarui di halaman **Projects**!`;
    }
    const sample = projects.slice(0, 3).map(p => `• **${p.title}** (${p.category}): ${p.shortDesc || 'Proyek portofolio'}`).join('\n');
    return `🚀 Beberapa proyek unggulan Habib Ramadhan:\n\n${sample}\n\nKunjungi halaman **Projects** untuk melihat demo langsung dan source code!`;
  }

  // Cita-cita / Karier
  if (text.includes('cita') || text.includes('karier') || text.includes('tujuan') || text.includes('goal') || text.includes('career')) {
    return `🎯 Cita-cita dan tujuan karier Habib Ramadhan:\n\n_"${profile.careerGoal}"_\n\nHabib terus memperdalam ilmu di bidang web engineering dan siap berkontribusi pada proyek digital bermanfaat.`;
  }

  // Ulang tahun / Tanggal lahir
  if (text.includes('ulang tahun') || text.includes('ultah') || text.includes('birthday') || text.includes('kapan lahir') || text.includes('tanggal lahir') || text.includes('kapan dia lahir') || text.includes('kapan dia ulang tahun')) {
    if (profile.birthDate) {
      return `🎂 Ulang tahun **${profile.name}** adalah pada tanggal **${profile.birthDate}**! 🎉`;
    }
    return `🎂 Tanggal ulang tahun resmi **${profile.name}** belum dicantumkan secara publik di profil website ini. Kamu bisa menanyakannya langsung kepada Habib melalui WhatsApp atau Instagram di halaman **Contact**! ✨`;
  }

  // Teman dekat / Sahabat
  if (text.includes('teman dekat') || text.includes('sahabat') || text.includes('bestie') || text.includes('teman') || text.includes('temen') || text.includes('kawan') || text.includes('close friend')) {
    if (profile.closeFriends && (Array.isArray(profile.closeFriends) ? profile.closeFriends.length > 0 : profile.closeFriends.trim())) {
      const friendsList = Array.isArray(profile.closeFriends) ? profile.closeFriends.join(', ') : profile.closeFriends;
      return `👥 Teman dekat / sahabat **${profile.name}** antara lain: **${friendsList}**.\n\nHabib juga berteman akrab dan sering berkolaborasi dengan rekan-rekan siswa kelas **${profile.class}** jurusan **${profile.major}** di ${profile.school}! 🤝`;
    }
    return `👥 Habib Ramadhan berteman akrab dan aktif berkolaborasi dengan teman-teman sekelasnya di **${profile.class}** jurusan **${profile.major}** di **${profile.school}**, terutama saat berkolaborasi mengerjakan proyek pembuatan website dan tugas kejuruan! 💻🤝`;
  }

  // Kontak
  if (text.includes('kontak') || text.includes('hubungi') || text.includes('whatsapp') || text.includes('email') || text.includes('sosmed') || text.includes('contact')) {
    return `📱 Kamu bisa menghubungi Habib Ramadhan secara langsung melalui:\n\n• 📧 **Email**: \`${profile.email}\`\n• 💬 **WhatsApp**: \`${profile.whatsapp}\`\n• 🐙 **GitHub**: [${profile.github}](${profile.github})\n• 📸 **Instagram**: [${profile.instagram}](${profile.instagram})\n\nAtau kirimkan pesan lewat formulir di halaman **Contact**!`;
  }

  // Pertanyaan identitas / owner umum (bahasa Indonesia & Inggris)
  if (
    text.includes('siapa') || text.includes('nama') || text.includes('owner') ||
    text.includes('bibtzy') || text.includes('habib') || text.includes('who are you') ||
    text.includes('who is')
  ) {
    return `👋 Owner NOVA GLASS adalah **${profile.name}**, yang akrab dikenal dengan nama panggilan **BibTzy**.\n\nBeliau adalah ${profile.status} kelas **${profile.class}** jurusan **${profile.major}** di **${profile.school}**, berdomisili di ${profile.location}.\n\n_"${profile.tagline}"_`;
  }

  // Pengaturan bahasa (pertanyaan tentang bahasa)
  if (text.includes('bahasa apa') || text.includes('can you speak english') || text.includes('speak english')) {
    return `Halo! Sesuai pengaturan sistem default, saya sebagai **NOVA AI** selalu menjawab dalam **Bahasa Indonesia**. Jika kamu membutuhkan bantuan penjelasan istilah teknis pemrograman atau sintaks kode tertentu, silakan tanyakan dan saya akan menjelaskannya secara ramah dalam Bahasa Indonesia! ✨`;
  }

  // Default friendly response
  return `Halo! 👋 Saya **NOVA AI**, asisten cerdas untuk website portofolio NOVA GLASS milik **${profile.name}** (BibTzy).\n\nSaya selalu siap membantumu dalam **Bahasa Indonesia**. Ada yang bisa saya bantu hari ini?\n• **Tanya Owner**: Informasi profil, keahlian, sekolah, sertifikat, dan proyek Habib\n• **Bicara Suara**: Mode percakapan suara atau kirim Voice Note\n• **Coding Tutor**: Penjelasan kode HTML, CSS, JavaScript, React, SQL\n• **Project Generator**: Ide dan blueprint pembuatan proyek baru\n• **Jelaskan Halaman Ini**: Penjelasan fitur halaman yang sedang kamu lihat`;
}

// ─── Gemini Cloud API Caller ──────────────────────────────────────────────────
export async function sendNovaChatMessage({ message, history = [], mode = 'general', currentRoute = '/' }) {
  if (!message || !message.trim()) {
    throw new Error('Pesan tidak boleh kosong.');
  }

  // Check rate limiter
  if (!aiRateLimiter.canMakeRequest()) {
    const wait = aiRateLimiter.getCooldownSeconds();
    throw new Error(`Batas permintaan tercapai. Silakan tunggu ${wait} detik sebelum mengirim lagi.`);
  }

  // Prioritas Utama: Pencarian Semantik pada Basis Pengetahuan Owner Terverifikasi
  // Mencegah model AI mengarang fakta (Anti-Halusinasi) dan menyelesaikan konteks percakapan multi-turn
  const searchMatch = ownerKnowledgeService.searchFact(message, history);
  if (searchMatch.isConfident || searchMatch.isRelational || searchMatch.resolved?.detectedTopic) {
    const directFactualAnswer = ownerKnowledgeService.generateAnswer(message, history);
    if (directFactualAnswer) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        content: directFactualAnswer,
        isLocalEngine: true,
        timestamp: new Date().toISOString()
      };
    }
  }

  // If no Gemini API Key is configured, gracefully use the intelligent local engine
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' || GEMINI_API_KEY.trim() === '') {
    // Artificial small delay for realistic UX feeling
    await new Promise(resolve => setTimeout(resolve, 450));
    const localContent = generateLocalAnswer(message, mode, currentRoute, history);
    return {
      content: localContent,
      isLocalEngine: true,
      timestamp: new Date().toISOString()
    };
  }

  const systemPrompt = createSystemInstruction(mode, currentRoute);

  // Build clean history for Gemini (strip internal flags)
  const geminiContents = [];

  // Add previous conversational turns (up to last 14 messages for speed & tokens)
  const recentHistory = history.slice(-14);
  for (const item of recentHistory) {
    if (item.role === 'user') {
      geminiContents.push({
        role: 'user',
        parts: [{ text: item.content }]
      });
    } else if (item.role === 'assistant') {
      geminiContents.push({
        role: 'model',
        parts: [{ text: item.content }]
      });
    }
  }

  // Add the current user message
  geminiContents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: geminiContents,
    generationConfig: {
      temperature: mode === 'project' ? 0.85 : 0.65,
      maxOutputTokens: 1500,
      topP: 0.95
    }
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);

    const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 429) {
        throw new Error('Kuota layanan AI sedang padat. Mengalihkan ke asisten lokal...');
      }
      throw new Error(errData?.error?.message || `Gagal menghubungi server AI (${res.status})`);
    }

    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Respon AI kosong.');
    }

    return {
      content: responseText,
      isLocalEngine: false,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.warn('[NOVA AI] Gemini request failed, using intelligent local engine:', err.message);
    // Intelligent fallback so user never gets a broken experience
    const localContent = generateLocalAnswer(message, mode, currentRoute, history);
    return {
      content: localContent,
      isLocalEngine: true,
      errorNotice: err.name === 'AbortError' ? 'Koneksi timeout, dijawab via memori lokal NOVA.' : null,
      timestamp: new Date().toISOString()
    };
  }
}

// ─── Voice Note Helpers & Audio Processing ────────────────────────────────────
export function getSupportedAudioMimeType() {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return '';
  }
  const candidateTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/aac'
  ];
  for (const t of candidateTypes) {
    if (MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return '';
}

export async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const parts = result.split(',');
        resolve(parts[1] || '');
      } else {
        resolve('');
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function generateLocalAudioAnswer(mode, currentRoute = '/') {
  const { profile } = getOwnerKnowledge();
  return `🎙️ **Pesan Suara (Voice Note) Diterima**\n\nTerima kasih telah mengirimkan rekaman suara! Pesan suaramu berhasil diterima dan diproses oleh sistem NOVA AI.\n\nSesuai pengaturan default sistem, NOVA AI selalu menjawab menggunakan **Bahasa Indonesia**. Kamu dapat menanyakan seputar:\n• 👤 Profil, keahlian, riwayat sekolah, dan sertifikat **${profile.name}** (${profile.major})\n• 💻 Panduan belajar coding web (HTML, CSS, React, JS, SQL)\n• 💡 Pembuatan ide dan rencana proyek portofolio.\n\nSilakan lanjutkan obrolan melalui Chat Teks atau Voice Note berikutnya!`;
}

export async function sendNovaAudioMessage({
  audioBlob,
  mimeType,
  history = [],
  mode = 'general',
  currentRoute = '/'
}) {
  if (!audioBlob) {
    throw new Error('File rekaman suara (audioBlob) tidak ditemukan.');
  }

  // Check rate limiter
  if (!aiRateLimiter.canMakeRequest()) {
    const wait = aiRateLimiter.getCooldownSeconds();
    throw new Error(`Batas permintaan tercapai. Silakan tunggu ${wait} detik sebelum mengirim lagi.`);
  }

  // If no Gemini API Key is configured, gracefully use the intelligent local engine
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' || GEMINI_API_KEY.trim() === '') {
    await new Promise(resolve => setTimeout(resolve, 500));
    const localContent = generateLocalAudioAnswer(mode, currentRoute);
    return {
      content: localContent,
      isLocalEngine: true,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const base64Data = await blobToBase64(audioBlob);
    const resolvedMime = (mimeType || audioBlob.type || 'audio/webm').split(';')[0];
    const systemPrompt = createSystemInstruction(mode, currentRoute);

    const geminiContents = [];
    const recentHistory = history.slice(-10);
    for (const item of recentHistory) {
      if (item.role === 'user' && item.content) {
        geminiContents.push({
          role: 'user',
          parts: [{ text: item.content }]
        });
      } else if (item.role === 'assistant' && item.content) {
        geminiContents.push({
          role: 'model',
          parts: [{ text: item.content }]
        });
      }
    }

    geminiContents.push({
      role: 'user',
      parts: [
        {
          text: `Berikut adalah rekaman pesan suara (Voice Note) dari pengguna (dalam bahasa Indonesia atau bahasa lainnya).
Dengarkan isi audionya dengan seksama, transkripsikan dan pahami maksud pembicaraan pengguna, lalu berikan jawaban yang cerdas, ramah, solutif, dan terstruktur sebagai NOVA AI.
ATURAN BAHASA & KEBENARAN FAKTA MUTLAK:
- Wajib selalu menjawab menggunakan BAHASA INDONESIA secara default.
- Jika pengguna berbicara dalam bahasa Inggris atau bahasa lain, tetap jawab dalam BAHASA INDONESIA, kecuali jika pengguna secara eksplisit meminta jawaban dalam bahasa tersebut.
- GROUNDING FAKTA OWNER: Jika pengguna menanyakan seputar owner (Habib Ramadhan / BibTzy), teman dekat, sekolah, atau preferensinya, kamu WAJIB STRICTLY berpegang pada data resmi di System Instruction.
- ANTI-HALUSINASI: Makanan favorit owner adalah nasgor, minuman favorit matcha milk, hobi ngedit, game Free Fire. Teman dekat: Bibztzy, Ilham, dan Rafli. Makanan favorit Bibztzy BELUM DIKETAHUI (dilarang mengarang!). Umur owner dibatasi (restricted demi privasi). Fakta yang tidak tercantum (seperti warna favorit, musik, film) JANGAN DITEBAK, melainkan jawab jujur bahwa informasinya belum tersedia.
- Jangan menerjemahkan istilah teknis pemrograman atau nama kode secara sembarangan.
- Format jawaban menggunakan Markdown yang rapi.`
        },
        {
          inlineData: {
            mimeType: resolvedMime,
            data: base64Data
          }
        }
      ]
    });

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: geminiContents,
      generationConfig: {
        temperature: mode === 'project' ? 0.85 : 0.65,
        maxOutputTokens: 1500,
        topP: 0.95
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gagal menghubungi server AI (${res.status})`);
    }

    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Respon audio dari AI kosong.');
    }

    return {
      content: responseText,
      isLocalEngine: false,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.warn('[NOVA AI] Audio processing via Gemini failed, falling back to local engine:', err.message);
    const localContent = generateLocalAudioAnswer(mode, currentRoute);
    return {
      content: localContent,
      isLocalEngine: true,
      errorNotice: err.name === 'AbortError' ? 'Koneksi timeout, dijawab via memori lokal NOVA.' : null,
      timestamp: new Date().toISOString()
    };
  }
}

// ─── Voice Engine (STT & TTS) ─────────────────────────────────────────────────
export const voiceEngine = {
  recognition: null,
  isListening: false,
  isSpeaking: false,
  activeUtterance: null,

  isSpeechRecognitionSupported() {
    return typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  },

  isSpeechSynthesisSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  getSavedVoiceSettings() {
    const defaultSettings = {
      lang: 'id-ID', // Default Bahasa Indonesia
      rate: 1.0,
      volume: 1.0,
      autoRead: false,
      voiceName: ''
    };
    const saved = storageService.get(VOICE_SETTINGS_KEY, null);
    if (!saved) return defaultSettings;
    return {
      ...defaultSettings,
      ...saved,
      lang: saved.lang || 'id-ID',
      autoRead: saved.autoRead === true ? true : false
    };
  },

  saveVoiceSettings(settings) {
    storageService.set(VOICE_SETTINGS_KEY, settings);
  },

  async requestMicrophonePermission() {
    if (!navigator?.mediaDevices?.getUserMedia) {
      return { ok: false, error: 'Browser Anda tidak mendukung akses mikrofon.' };
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately after granting permission
      stream.getTracks().forEach(track => track.stop());
      return { ok: true };
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        return { ok: false, error: 'Izin mikrofon ditolak oleh pengguna atau browser.' };
      }
      if (err.name === 'NotFoundError') {
        return { ok: false, error: 'Mikrofon fisik tidak terdeteksi pada perangkat ini.' };
      }
      return { ok: false, error: err.message || 'Gagal meminta izin mikrofon.' };
    }
  },

  startListening({ onTranscript, onInterim, onError, onStateChange, lang = 'id-ID' }) {
    if (!this.isSpeechRecognitionSupported()) {
      onError?.('Fitur Speech Recognition tidak didukung di browser ini. Disarankan memakai Google Chrome atau Microsoft Edge.');
      return false;
    }

    // Stop existing listening or speaking
    this.stopListening();
    this.stopSpeaking();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();

    rec.lang = lang || 'id-ID';
    rec.continuous = false; // Turn-based for precision
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let finalTranscript = '';

    rec.onstart = () => {
      this.isListening = true;
      onStateChange?.('listening');
    };

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }
      if (interim) {
        onInterim?.(interim);
      }
      if (finalTranscript) {
        onTranscript?.(finalTranscript);
      }
    };

    rec.onerror = (event) => {
      this.isListening = false;
      const errorMap = {
        'no-speech': 'Tidak ada suara yang terdeteksi. Silakan coba berbicara lebih dekat ke mikrofon.',
        'audio-capture': 'Gagal menangkap input audio. Periksa mikrofon perangkat Anda.',
        'not-allowed': 'Akses mikrofon ditolak. Buka pengaturan browser untuk mengizinkan.',
        'network': 'Gangguan jaringan saat memproses ucapan suara.',
        'aborted': null // Pengguna menghentikan secara manual
      };
      const msg = errorMap[event.error];
      if (msg) {
        onError?.(msg);
        onStateChange?.('error');
      } else {
        onStateChange?.('idle');
      }
    };

    rec.onend = () => {
      this.isListening = false;
      this.recognition = null;
      onStateChange?.('idle');
    };

    try {
      rec.start();
      this.recognition = rec;
      return true;
    } catch (e) {
      console.warn('SpeechRecognition start error:', e);
      onError?.('Gagal memulai mikrofon: ' + e.message);
      return false;
    }
  },

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (_) {}
      this.recognition = null;
      this.isListening = false;
    }
  },

  speakText({ text, lang = 'id-ID', rate = 1.0, volume = 1.0, onStart, onEnd, onError }) {
    if (!this.isSpeechSynthesisSupported()) {
      onError?.('Text-to-speech tidak didukung di browser ini.');
      return;
    }

    this.stopSpeaking();

    // Clean text from Markdown tags, code snippets, and URL symbols so it sounds natural
    const cleanSpeechText = text
      .replace(/```[\s\S]*?```/g, ' Berikut contoh kodenya. ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/•/g, ', ')
      .replace(/-{3,}/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanSpeechText) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.lang = lang || 'id-ID';
    utterance.rate = Math.max(0.7, Math.min(rate || 1.0, 1.8));
    utterance.volume = Math.max(0, Math.min(volume || 1.0, 1.0));
    utterance.pitch = 1.05;

    // Pick a preferred natural voice, prioritising Indonesian language
    const voices = window.speechSynthesis.getVoices();
    const idVoices = voices.filter(v => v.lang === 'id-ID' || v.lang.toLowerCase().startsWith('id'));
    const matchedVoice = idVoices.find(v => v.localService) || idVoices[0] || voices.find(v => v.lang.startsWith((lang || 'id').split('-')[0])) || voices[0];
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.activeUtterance = utterance;
      onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.activeUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.activeUtterance = null;
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        onError?.(`TTS Error: ${e.error}`);
      }
    };

    this.activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking() {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.activeUtterance = null;
    }
  }
};

// ─── Chat History Storage Helpers ─────────────────────────────────────────────
export const chatHistoryStorage = {
  load() {
    return storageService.get(CHAT_STORAGE_KEY, [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Halo! 👋 Saya **NOVA AI**, asisten cerdas website portofolio **NOVA GLASS** milik Habib Ramadhan (BibTzy).\n\nSaya selalu siap membantu kamu dalam **Bahasa Indonesia**. Kamu bisa bertanya tentang latar belakang owner, sertifikat, belajar coding, meminta ide proyek, atau mengirim pesan suara!`,
        timestamp: new Date().toISOString()
      }
    ]);
  },

  save(history) {
    // Only keep up to 40 recent messages to prevent storage bloat
    const trimmed = history.slice(-40);
    storageService.set(CHAT_STORAGE_KEY, trimmed);
    return trimmed;
  },

  clear() {
    storageService.remove(CHAT_STORAGE_KEY);
    return [
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Percakapan baru telah dimulai. ✨ Riwayat obrolan sebelumnya sudah dibersihkan. Ada yang ingin kamu diskusikan dengan NOVA AI dalam Bahasa Indonesia?`,
        timestamp: new Date().toISOString()
      }
    ];
  }
};
