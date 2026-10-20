/**
 * Owner Knowledge Base & Semantic Context Engine (V5 Upgraded)
 * Habib Ramadhan (BibTzy) — NOVA GLASS Portfolio
 *
 * Core Principles:
 * 1. Strict Grounding: All owner facts are structured and verified.
 * 2. Anti-Hallucination: Never invent or extrapolate favorite foods, drinks, hobbies, games,
 *    colors, music, movies, friends' details, or personal data.
 * 3. Contextual Multi-Turn Resolution: Resolves pronouns ("dia", "mereka", "favoritnya", "yang tadi")
 *    and follow-up ellipsis questions ("kalau minumannya?", "kalau teman dekatnya?", "kalau makanan temannya?").
 * 4. Access Control: Public facts vs Restricted (privacy-protected) facts.
 * 5. Cloud & Local Sync: Hybrid Supabase database support with fast LocalStorage fallback.
 */

import { storageService } from './storageService.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const KNOWLEDGE_STORAGE_KEY = 'owner_knowledge_base_v5';
export const KNOWLEDGE_SYNC_EVENT = 'nova-glass-knowledge-updated';

export const KNOWLEDGE_CATEGORIES = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'identity', label: 'Identitas & Panggilan' },
  { id: 'culinary', label: 'Makanan & Minuman' },
  { id: 'entertainment', label: 'Hobi & Game' },
  { id: 'media', label: 'Musik, Film & Warna' },
  { id: 'skills', label: 'Keahlian & Teknologi' },
  { id: 'projects', label: 'Proyek Portofolio' },
  { id: 'goals', label: 'Cita-cita & Target Belajar' },
  { id: 'friends', label: 'Teman & Relasi' },
  { id: 'education', label: 'Sekolah & Jurusan' },
  { id: 'custom', label: 'Fakta Tambahan' }
];

export const INITIAL_KNOWLEDGE_FACTS = [
  // ─── 1. Identitas & Panggilan ─────────────────────────────────────────────
  {
    id: 'fact_identity_name',
    key: 'nama_owner',
    category: 'identity',
    target_entity: 'owner',
    label: 'Nama Lengkap Owner',
    value: 'Habib Ramadhan',
    keywords: ['nama', 'nama lengkap', 'siapa nama', 'identitas', 'owner', 'pemilik', 'habib', 'nama owner', 'siapa kamu'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fact_identity_nickname',
    key: 'panggilan_owner',
    category: 'identity',
    target_entity: 'owner',
    label: 'Nama Panggilan & Alias',
    value: 'BibTzy (atau Habib)',
    keywords: ['panggilan', 'nama panggilan', 'alias', 'nickname', 'dipanggil', 'bibtzy', 'bibz', 'akrab'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fact_identity_age',
    key: 'umur_owner',
    category: 'identity',
    target_entity: 'owner',
    label: 'Umur / Usia Owner',
    value: '17 tahun',
    keywords: ['umur', 'usia', 'berapa tahun', 'berapa umur', 'umur owner', 'usia owner', 'berumur', 'berapa usia'],
    access_level: 'restricted',
    isPublic: false, // Dibatasi demi privasi: jangan tampilkan kepada pengunjung umum
    verification_status: 'pending',
    isVerified: false,
    known: true,
    notes: 'Umur owner 17 tahun berstatus pending konfirmasi dan memiliki tingkat akses terbatas (restricted).',
    restricted_message: 'Informasi mengenai umur/usia Habib Ramadhan memiliki tingkat akses terbatas (restricted) dan berstatus pending, sehingga tidak ditampilkan kepada pengunjung umum demi menjaga privasi data pribadi.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fact_identity_birthday',
    key: 'ulang_tahun',
    category: 'identity',
    target_entity: 'owner',
    label: 'Tanggal Lahir & Ulang Tahun',
    value: '25 Agustus 2009',
    keywords: ['ulang tahun', 'ultah', 'birthday', 'tanggal lahir', 'lahir', 'kapan lahir', 'hari lahir', '25 agustus', 'agustus', '2009', 'tahun lahir'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'pending',
    isVerified: false,
    known: true,
    notes: 'Ulang tahun: 25 Agustus 2009 berstatus pending karena tahun lahir belum diverifikasi secara resmi oleh owner.',
    updatedAt: new Date().toISOString()
  },

  // ─── 2. Kuliner (Makanan & Minuman) ────────────────────────────────────────
  {
    id: 'fact_culinary_food',
    key: 'makanan_favorit',
    category: 'culinary',
    target_entity: 'owner',
    label: 'Makanan Favorit Owner',
    value: 'nasgor',
    keywords: ['makanan', 'makan', 'makanan kesukaan', 'makanan favorit', 'nasgor', 'nasi goreng', 'kuliner', 'laper', 'food', 'makanan owner', 'suka makan'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fact_culinary_drink',
    key: 'minuman_favorit',
    category: 'culinary',
    target_entity: 'owner',
    label: 'Minuman Favorit Owner',
    value: 'matcha milk',
    keywords: ['minuman', 'minum', 'minuman favorit', 'minuman kesukaan', 'matcha milk', 'matcha', 'haus', 'drink', 'minuman owner', 'suka minum'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    updatedAt: new Date().toISOString()
  },

  // ─── 3. Hiburan, Hobi & Game ──────────────────────────────────────────────
  {
    id: 'fact_entertainment_hobbies',
    key: 'hobi',
    category: 'entertainment',
    target_entity: 'owner',
    label: 'Hobi Owner',
    value: 'ngedit', // Hobi terverifikasi: ngedit (BUKAN ngerit!)
    keywords: ['hobi', 'hobby', 'ngedit', 'edit', 'editing', 'video editing', 'kegiatan luang', 'waktu luang', 'suka ngapain', 'kegemaran', 'aktivitas', 'hobi owner'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fact_entertainment_games',
    key: 'game_favorit',
    category: 'entertainment',
    target_entity: 'owner',
    label: 'Game Favorit Owner',
    value: 'Free Fire',
    keywords: ['game', 'game favorit', 'game kesukaan', 'free fire', 'ff', 'gaming', 'permainan', 'main game', 'game owner'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    updatedAt: new Date().toISOString()
  },

  // ─── 4. Media: Musik, Film & Warna (Belum ditentukan - Anti-Halusinasi) ────
  {
    id: 'fact_media_music',
    key: 'musik_favorit',
    category: 'media',
    target_entity: 'owner',
    label: 'Musik & Lagu Favorit',
    value: '', // Belum ditentukan oleh owner
    keywords: ['musik', 'lagu', 'music', 'song', 'musik favorit', 'lagu kesukaan', 'genre musik', 'playlist', 'dengerin musik'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'pending',
    isVerified: false,
    known: false,
    notes: 'Musik favorit owner belum dicatat secara spesifik. Dilarang mengarang.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fact_media_movie',
    key: 'film_favorit',
    category: 'media',
    target_entity: 'owner',
    label: 'Film Favorit',
    value: '', // Belum ditentukan oleh owner
    keywords: ['film', 'movie', 'film favorit', 'film kesukaan', 'bioskop', 'nonton', 'sinema', 'tontonan'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'pending',
    isVerified: false,
    known: false,
    notes: 'Film favorit owner belum dicatat secara spesifik. Dilarang mengarang.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fact_media_color',
    key: 'warna_favorit',
    category: 'media',
    target_entity: 'owner',
    label: 'Warna Favorit',
    value: '', // Belum ditentukan oleh owner
    keywords: ['warna', 'warna favorit', 'warna kesukaan', 'color', 'favourite color', 'suka warna apa'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'pending',
    isVerified: false,
    known: false,
    notes: 'Warna favorit owner belum ditentukan di database. Dilarang mengarang.',
    updatedAt: new Date().toISOString()
  },

  // ─── 5. Keahlian & Teknologi ──────────────────────────────────────────────
  {
    id: 'fact_skills_tech',
    key: 'keahlian_teknologi',
    category: 'skills',
    target_entity: 'owner',
    label: 'Keahlian & Teknologi yang Dipelajari',
    value: 'HTML5, CSS3, JavaScript (ES6+), React 19, PHP, Laravel, MySQL, Git, GitHub, dan UI/UX Figma dengan spesialisasi Dark Liquid Glassmorphism.',
    keywords: ['keahlian', 'skill', 'teknologi', 'bisa apa', 'bahasa pemrograman', 'stack', 'tech stack', 'framework', 'react', 'javascript', 'php', 'mysql'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    updatedAt: new Date().toISOString()
  },

  // ─── 6. Proyek yang Pernah Dibuat ─────────────────────────────────────────
  {
    id: 'fact_projects_created',
    key: 'proyek_owner',
    category: 'projects',
    target_entity: 'owner',
    label: 'Proyek Portofolio yang Pernah Dibuat',
    value: 'Website Portofolio NOVA GLASS (React 19, Liquid Glassmorphism Dark Navy & Cyan, Asisten Suara NOVA AI, Game Runner, dan Offline-first IndexedDB/Supabase Sync), serta proyek coding tugas kejuruan PPLG.',
    keywords: ['proyek', 'project', 'karya', 'portofolio', 'aplikasi', 'proyek yang dibuat', 'proyek apa', 'bikin apa', 'kodingan'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    updatedAt: new Date().toISOString()
  },

  // ─── 7. Cita-cita & Target Belajar ────────────────────────────────────────
  {
    id: 'fact_goals_career',
    key: 'cita_cita',
    category: 'goals',
    target_entity: 'owner',
    label: 'Cita-cita & Visi Karier',
    value: 'Menjadi seorang Web Developer yang profesional dan mampu menciptakan solusi digital yang bermanfaat bagi masyarakat luas.',
    keywords: ['cita cita', 'cita-cita', 'tujuan', 'karier', 'career', 'mimpi', 'keinginan', 'target masa depan'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fact_goals_learning',
    key: 'target_belajar',
    category: 'goals',
    target_entity: 'owner',
    label: 'Target Belajar & Sedang Belajar Apa',
    value: 'Mendalami pemrograman web React modern, integrasi AI Agent, arsitektur database, dan pengembangan aplikasi berskala industri.',
    keywords: ['belajar apa', 'sedang belajar', 'target belajar', 'lagi belajar apa', 'fokus belajar', 'owner belajar apa', 'mempelajari apa'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    updatedAt: new Date().toISOString()
  },

  // ─── 8. Teman & Relasi (Hanya yang Diizinkan) ─────────────────────────────
  {
    id: 'fact_friends_owner',
    key: 'teman_owner',
    category: 'friends',
    target_entity: 'owner',
    label: 'Teman Dekat Owner',
    value: 'Bibztzy, Ilham, dan Rafli',
    keywords: ['teman', 'temen', 'sahabat', 'teman owner', 'bestie', 'kawan', 'circle', 'siapa teman', 'temannya', 'teman dekat', 'sahabat owner'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fact_friend_bibztzy_food',
    key: 'makanan_bibztzy',
    category: 'friends',
    target_entity: 'bibztzy',
    label: 'Makanan Favorit Bibztzy (Teman Owner)',
    value: '', // Belum diketahui (dilarang mengarang!)
    keywords: ['makanan bibztzy', 'makanan kesukaan bibztzy', 'makanan favorit bibztzy', 'bibztzy suka makan apa', 'makanan temannya bibztzy', 'makanan bibtzy', 'makanan teman owner', 'makanan temannya', 'makanan kesukaan teman', 'makanan favorit temannya'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'pending',
    isVerified: false,
    known: false,
    notes: 'Makanan favorit Bibztzy belum diketahui. Pertahankan status verifikasi pending sampai dikonfirmasi owner. Jangan mengarang jawabannya.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fact_friends_restricted_info',
    key: 'info_teman_dibatasi',
    category: 'friends',
    target_entity: 'friends',
    label: 'Informasi Teman yang Dibatasi',
    value: 'Informasi pribadi atau detail lebih lanjut mengenai teman-teman owner dibatasi dan tidak dibagikan kepada pengunjung umum demi menjaga privasi.',
    keywords: ['info teman', 'data teman', 'kontak teman', 'nomor teman', 'alamat teman', 'privasi teman', 'rahasia teman', 'umur teman'],
    access_level: 'restricted',
    isPublic: false,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    restricted_message: 'Informasi mengenai teman owner tersebut memiliki tingkat akses terbatas (restricted) dan tidak dibagikan kepada pengunjung umum demi menjaga privasi.',
    updatedAt: new Date().toISOString()
  },

  // ─── 9. Sekolah, Kelas & Jurusan ──────────────────────────────────────────
  {
    id: 'fact_education_school',
    key: 'sekolah_jurusan',
    category: 'education',
    target_entity: 'owner',
    label: 'Sekolah, Kelas & Jurusan',
    value: 'Siswa kelas XI PPLG 3 (Pengembangan Perangkat Lunak dan Gim) di SMK Negeri 1 Ciomas.',
    keywords: ['sekolah', 'smk', 'kelas', 'jurusan', 'ciomas', 'pplg', 'rpl', 'smkn 1 ciomas', 'status', 'pendidikan', 'sekolah owner', 'jurusan owner'],
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    known: true,
    updatedAt: new Date().toISOString()
  }
];

export const ownerKnowledgeService = {
  /**
   * Mengambil seluruh data fakta pengetahuan owner dari storage / cache
   */
  getFacts() {
    const stored = storageService.get(KNOWLEDGE_STORAGE_KEY, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveFacts(INITIAL_KNOWLEDGE_FACTS);
      return INITIAL_KNOWLEDGE_FACTS;
    }

    // Pastikan seluruh fakta esensial dari INITIAL_KNOWLEDGE_FACTS ada di stored
    let hasAdditions = false;
    const existingKeys = new Set(stored.map(f => f.key));

    const updatedList = stored.map(f => {
      let fact = { ...f };
      // Pastikan target_entity ada
      if (!fact.target_entity) {
        fact.target_entity = fact.key.includes('bibztzy') ? 'bibztzy' : (fact.category === 'friends' ? 'friends' : 'owner');
        hasAdditions = true;
      }
      // Koreksi hobi: harus 'ngedit'
      if (fact.key === 'hobi' && (fact.value === 'ngerit' || !fact.value.includes('ngedit'))) {
        fact.value = 'ngedit';
        fact.verification_status = 'verified';
        fact.isVerified = true;
        hasAdditions = true;
      }
      // Koreksi umur: harus restricted & pending
      if (fact.key === 'umur_owner' && (fact.isPublic || fact.verification_status !== 'pending')) {
        fact.access_level = 'restricted';
        fact.isPublic = false;
        fact.verification_status = 'pending';
        fact.isVerified = false;
        hasAdditions = true;
      }
      return fact;
    });

    // Tambahkan fakta awal baru jika belum tercatat di stored (e.g. media, projects, nickname)
    for (const initFact of INITIAL_KNOWLEDGE_FACTS) {
      if (!existingKeys.has(initFact.key)) {
        updatedList.push(initFact);
        hasAdditions = true;
      }
    }

    if (hasAdditions) {
      this.saveFacts(updatedList);
      return updatedList;
    }

    return updatedList;
  },

  /**
   * Menyimpan daftar fakta ke LocalStorage dan mendispatch event reaktif
   */
  saveFacts(facts) {
    if (!Array.isArray(facts)) return false;
    storageService.set(KNOWLEDGE_STORAGE_KEY, facts);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(KNOWLEDGE_SYNC_EVENT, { detail: { facts } }));
    }
    return true;
  },

  /**
   * Mengambil fakta berdasarkan ID
   */
  getFactById(id) {
    const facts = this.getFacts();
    return facts.find(f => f.id === id) || null;
  },

  /**
   * Mengambil fakta berdasarkan key unik
   */
  getFactByKey(key) {
    const facts = this.getFacts();
    return facts.find(f => f.key === key) || null;
  },

  /**
   * Tambah atau perbarui fakta (Upsert)
   */
  upsertFact(factData) {
    const facts = this.getFacts();
    const existingIndex = facts.findIndex(f => (factData.id && f.id === factData.id) || f.key === factData.key);

    const accessLevel = factData.access_level || (factData.isPublic === false ? 'restricted' : 'public');
    const verificationStatus = factData.verification_status || (factData.isVerified === false ? 'pending' : 'verified');
    const hasValue = Boolean(factData.value && factData.value.trim().length > 0);

    const updatedFact = {
      id: factData.id || `fact_${Date.now()}`,
      key: factData.key || `custom_${Date.now()}`,
      category: factData.category || 'custom',
      target_entity: factData.target_entity || 'owner',
      label: factData.label || 'Fakta Tambahan',
      value: (factData.value || '').trim(),
      keywords: Array.isArray(factData.keywords)
        ? factData.keywords
        : (factData.keywords || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
      access_level: accessLevel,
      isPublic: accessLevel === 'public',
      verification_status: verificationStatus,
      isVerified: verificationStatus === 'verified',
      known: factData.known !== undefined ? factData.known : hasValue,
      restricted_message: factData.restricted_message || undefined,
      notes: factData.notes || undefined,
      updatedAt: new Date().toISOString()
    };

    let nextFacts = [];
    if (existingIndex >= 0) {
      nextFacts = [...facts];
      nextFacts[existingIndex] = { ...nextFacts[existingIndex], ...updatedFact };
    } else {
      nextFacts = [updatedFact, ...facts];
    }

    this.saveFacts(nextFacts);

    // Asynchronous background sync to Supabase if configured and logged in
    this.syncFactToSupabase(updatedFact).catch(err => {
      console.warn('[ownerKnowledgeService] Supabase sync skipped:', err.message);
    });

    return updatedFact;
  },

  /**
   * Hapus fakta berdasarkan ID
   */
  deleteFact(id) {
    const facts = this.getFacts();
    const factToDelete = facts.find(f => f.id === id);
    const filtered = facts.filter(f => f.id !== id);
    if (filtered.length !== facts.length) {
      this.saveFacts(filtered);
      if (factToDelete && isSupabaseConfigured) {
        supabase.from('owner_knowledge').delete().eq('id', id).then(() => {}).catch(() => {});
      }
      return true;
    }
    return false;
  },

  /**
   * Reset seluruh fakta ke data awal resmi
   */
  resetFacts() {
    this.saveFacts(INITIAL_KNOWLEDGE_FACTS);
    return INITIAL_KNOWLEDGE_FACTS;
  },

  /**
   * Sinkronisasi satu fakta ke tabel Supabase `owner_knowledge`
   */
  async syncFactToSupabase(fact) {
    if (!isSupabaseConfigured) return;
    try {
      const payload = {
        id: fact.id,
        key: fact.key,
        category: fact.category,
        label: fact.label,
        target_entity: fact.target_entity || 'owner',
        value: fact.value || '',
        keywords: fact.keywords || [],
        access_level: fact.access_level || 'public',
        verification_status: fact.verification_status || 'verified',
        is_public: fact.isPublic !== false,
        is_verified: fact.isVerified !== false,
        known: fact.known !== false,
        notes: fact.notes || null,
        restricted_message: fact.restricted_message || null,
        updated_at: new Date().toISOString()
      };
      await supabase.from('owner_knowledge').upsert(payload);
    } catch (err) {
      console.warn('[ownerKnowledgeService] Failed to upsert to Supabase:', err);
    }
  },

  /**
   * Mengambil data fakta dari Supabase (jika online & configured) lalu menyatukannya ke local cache
   */
  async fetchFactsFromSupabase() {
    if (!isSupabaseConfigured) return this.getFacts();
    try {
      const { data, error } = await supabase
        .from('owner_knowledge')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return this.getFacts();
      }

      // Format data Supabase ke bentuk lokal
      const formatted = data.map(item => ({
        id: item.id,
        key: item.key,
        category: item.category,
        target_entity: item.target_entity || 'owner',
        label: item.label,
        value: item.value || '',
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
        access_level: item.access_level || 'public',
        verification_status: item.verification_status || 'verified',
        isPublic: item.is_public !== false,
        isVerified: item.is_verified !== false,
        known: item.known !== false,
        notes: item.notes,
        restricted_message: item.restricted_message,
        updatedAt: item.updated_at
      }));

      this.saveFacts(formatted);
      return formatted;
    } catch (err) {
      console.warn('[ownerKnowledgeService] fetchFactsFromSupabase fallback:', err.message);
      return this.getFacts();
    }
  },

  /**
   * Format fakta resmi untuk System Instruction AI (Grounding Context)
   * Menyaring hanya fakta publik yang terverifikasi dan secara eksplisit melarang halusinasi.
   */
  formatKnowledgeForSystemPrompt() {
    const facts = this.getFacts();
    const publicVerified = facts.filter(f =>
      f.access_level === 'public' &&
      f.isPublic &&
      f.verification_status === 'verified' &&
      f.isVerified &&
      f.known &&
      f.value &&
      f.value.trim()
    );

    const lines = publicVerified.map(f => `• [${f.label}] (${f.target_entity || 'owner'}): ${f.value}`);

    return `
BASIS PENGETAHUAN RESMI & TERVERIFIKASI OWNER (HABIB RAMADHAN / BIBTZY):
(Gunakan fakta di bawah ini sebagai satu-satunya kebenaran. Dilarang mengarang hal baru yang tidak ada pada daftar ini):
${lines.join('\n')}

ATURAN PRIVASI, AKSES, & ANTI-HALUSINASI MUTLAK:
1. NAMA OWNER: Habib Ramadhan. Panggilan akrab: BibTzy atau Habib.
2. SEKOLAH & JURUSAN: Siswa kelas XI PPLG 3 di SMK Negeri 1 Ciomas.
3. MAKANAN FAVORIT OWNER: nasgor (nasi goreng).
4. MINUMAN FAVORIT OWNER: matcha milk.
5. HOBI OWNER: ngedit (Habib Ramadhan suka ngedit video/konten digital, BUKAN ngerit).
6. GAME FAVORIT OWNER: Free Fire (FF).
7. TEMAN DEKAT OWNER: Bibztzy, Ilham, dan Rafli.
8. MAKANAN FAVORIT BIBZTZY (TEMAN OWNER): BELUM DIKETAHUI dan berstatus PENDING konfirmasi owner. JANGAN PERNAH MENGARANG jawabannya!
9. UMUR OWNER: Umur owner (17 tahun) berstatus PENDING dan MEMILIKI AKSES TERBATAS (restricted). JANGAN PERNAH menampilkan umur owner kepada pengunjung umum demi privasi!
10. ULANG TAHUN OWNER: 25 Agustus 2009 dengan status pending karena tahun lahir belum diverifikasi resmi oleh owner.
11. FAKTA YANG BELUM DICATAT (Warna favorit, musik/lagu favorit, film favorit, dll): Jika ditanya fakta yang belum dicatat, jawab dengan jujur dan sopan bahwa informasi tersebut belum tersedia di basis pengetahuan, dan JANGAN menebak!
`.trim();
  },

  /**
   * Normalisasi kata untuk pencarian (Indonesian typo, slang, and inflection handling)
   */
  normalizeText(raw = '') {
    let text = raw.toLowerCase().trim();

    // Mapping slang & singkatan Indonesia
    const slangMap = [
      { regex: /\b(mkn|mknan|makn|ngemil|sarapan|kuliner)\b/g, rep: 'makanan' },
      { regex: /\b(mnm|minuman|ngedrink|haus)\b/g, rep: 'minuman' },
      { regex: /\b(fav|fvt|kesukaan|paling disukai|gemar)\b/g, rep: 'favorit' },
      { regex: /\b(tmn|temen|sahabat|bestie|kawan|circle|sohib)\b/g, rep: 'teman' },
      { regex: /\b(hoby|hobbi|editing|edit|ngedit)\b/g, rep: 'hobi' },
      { regex: /\b(gaming|maen game|main game|permainan)\b/g, rep: 'game' },
      { regex: /\b(skolah|sekolahan)\b/g, rep: 'sekolah' },
      { regex: /\b(jurusan|kejuruan|pplg|rpl)\b/g, rep: 'jurusan' },
      { regex: /\b(proyek|project|karya|portfolio)\b/g, rep: 'proyek' },
      { regex: /\b(lagi belajar|sedang belajar|belajar apa|mempelajari)\b/g, rep: 'target_belajar' },
      { regex: /\b(cita-cita|cita cita|tujuan hidup|karier|career)\b/g, rep: 'cita_cita' },
      { regex: /\b(umur|usia|berapa tahun|berumur)\b/g, rep: 'umur' },
      { regex: /\b(ultah|birthday|tanggal lahir|kapan lahir)\b/g, rep: 'ulang_tahun' },
      { regex: /\b(lagu|musik|music|song)\b/g, rep: 'musik' },
      { regex: /\b(movie|film|bioskop|sinema)\b/g, rep: 'film' },
      { regex: /\b(warna|color|colour)\b/g, rep: 'warna' }
    ];

    for (const item of slangMap) {
      text = text.replace(item.regex, item.rep);
    }

    return text;
  },

  /**
   * Multi-Turn Context Resolver:
   * Mengurai kata ganti ("dia", "mereka", "favoritnya", "kalau minumannya?", "kalau teman dekatnya?")
   * dan pertanyaan lanjutan berdasarkan riwayat obrolan terkini.
   */
  resolveContextualQuery(userPrompt = '', history = []) {
    const raw = (userPrompt || '').trim();
    const query = this.normalizeText(raw);

    const resolved = {
      originalQuery: userPrompt,
      normalizedQuery: query,
      detectedTopic: null,
      targetEntity: 'owner', // 'owner' | 'bibztzy' | 'friend'
      isFollowUp: false,
      isRelationalQuestion: false
    };

    // ─── Deteksi Pertanyaan Relasional / Hubungan Informasi ──────────────────
    if (
      query.includes('hubungan') ||
      query.includes('korelasi') ||
      query.includes('kaitan') ||
      query.includes('apa hubungannya') ||
      query.includes('apa kaitan') ||
      (query.includes('yang sudah dibahas') && (query.includes('sebelumnya') || query.includes('tadi')))
    ) {
      resolved.isRelationalQuestion = true;
      resolved.detectedTopic = 'relational_summary';
      return resolved;
    }

    // ─── Deteksi Pertanyaan Lanjutan (Ellipsis / Follow-up Indicators) ───────
    const followUpPrefixes = [
      /^kalau\s+/i,
      /^terus\s+/i,
      /^lalu\s+/i,
      /^bagaimana\s+dengan\s+/i,
      /^gimana\s+dengan\s+/i,
      /^kalo\s+/i,
      /^kl\s+/i,
      /favoritnya\??$/i,
      /kesukaannya\??$/i,
      /yang\s+tadi/i,
      /kalau\s+yang\s+/i
    ];

    const hasFollowUpCue = followUpPrefixes.some(rx => rx.test(raw)) ||
      (raw.length <= 30 && (query.includes('minuman') || query.includes('makanan') || query.includes('game') || query.includes('hobi') || query.includes('teman') || query.includes('warna') || query.includes('musik') || query.includes('film') || query.includes('sekolah') || query.includes('proyek') || query.includes('belajar')));

    resolved.isFollowUp = hasFollowUpCue;

    // ─── Ekstraksi Konteks dari Riwayat Obrolan Terakhir ─────────────────────
    let lastUserQuery = '';
    let lastAiAnswer = '';
    let lastSubject = 'owner';
    let lastTopic = null;

    if (Array.isArray(history) && history.length > 0) {
      for (let i = history.length - 1; i >= 0; i--) {
        const item = history[i];
        if (item.role === 'user' && !lastUserQuery) {
          lastUserQuery = this.normalizeText(item.content || '');
        } else if (item.role === 'assistant' && !lastAiAnswer) {
          lastAiAnswer = (item.content || '').toLowerCase();
        }
        if (lastUserQuery && lastAiAnswer) break;
      }

      // Evaluasi siapa subject terakhir yang dibahas
      if (lastUserQuery.includes('bibztzy') || lastUserQuery.includes('teman') || lastAiAnswer.includes('bibztzy')) {
        lastSubject = 'friend';
      }
      if (lastUserQuery.includes('makanan') || lastAiAnswer.includes('nasgor')) lastTopic = 'makanan';
      else if (lastUserQuery.includes('minuman') || lastAiAnswer.includes('matcha')) lastTopic = 'minuman';
      else if (lastUserQuery.includes('game') || lastAiAnswer.includes('free fire')) lastTopic = 'game';
      else if (lastUserQuery.includes('hobi') || lastAiAnswer.includes('ngedit')) lastTopic = 'hobi';
    }

    // ─── Resolusi Target Entity ─────────────────────────────────────────────
    // Kasus 1: Secara eksplisit menyebut Bibztzy
    if (query.includes('bibztzy') || query.includes('bibtzy')) {
      // Jika pengguna bertanya "apakah bibtzy nama panggilan owner?", tetap entity owner
      if (query.includes('panggilan') || query.includes('nama owner') || query.includes('siapa bibtzy')) {
        resolved.targetEntity = 'owner';
      } else if (query.includes('makanan') || query.includes('kesukaan') || query.includes('favorit')) {
        resolved.targetEntity = 'bibztzy';
      }
    }

    // Kasus 2: Bertanya tentang "teman dekat owner" atau "temannya"
    const asksAboutFriend = (query.includes('teman') || query.includes('sahabat')) &&
      !query.includes('siapa teman') &&
      !query.includes('teman owner siapa') &&
      (query.includes('makanan') || query.includes('minuman') || query.includes('hobi') || query.includes('game') || query.includes('favorit'));

    if (asksAboutFriend || (resolved.isFollowUp && lastSubject === 'friend' && !query.includes('owner') && !query.includes('habib'))) {
      resolved.targetEntity = 'bibztzy';
    }

    // ─── Klasifikasi Topik Spesifik ─────────────────────────────────────────

    // 1. Makanan Favorit Teman (Bibztzy / Teman Owner)
    if (
      (resolved.targetEntity === 'bibztzy' && query.includes('makanan')) ||
      (query.includes('teman') && query.includes('makanan')) ||
      query.includes('makanan bibztzy') ||
      query.includes('makanan temannya')
    ) {
      resolved.targetEntity = 'bibztzy';
      resolved.detectedTopic = 'makanan_bibztzy';
      return resolved;
    }

    // 2. Teman Dekat Owner (Siapa teman owner / "Kalau teman dekatnya?")
    if (
      query.includes('siapa teman') ||
      query.includes('teman owner') ||
      (resolved.isFollowUp && (query === 'kalau temannya?' || query === 'kalau teman dekatnya?' || query === 'teman dekatnya?' || query === 'kalau temannya' || query.includes('sahabatnya'))) ||
      (!query.includes('makanan') && !query.includes('minuman') && !query.includes('hobi') && !query.includes('game') && (query.includes('teman') || query.includes('sahabat') || query.includes('bestie')))
    ) {
      resolved.targetEntity = 'owner';
      resolved.detectedTopic = 'teman_owner';
      return resolved;
    }

    // 3. Makanan Favorit Owner (Nasgor)
    if (
      query.includes('makanan') ||
      query.includes('nasgor') ||
      query.includes('nasi goreng') ||
      (resolved.isFollowUp && (query.includes('makanannya?') || query.includes('makan apa') || query.includes('makan') || query.includes('laper')))
    ) {
      resolved.targetEntity = 'owner';
      resolved.detectedTopic = 'makanan_favorit';
      return resolved;
    }

    // 4. Minuman Favorit Owner (Matcha Milk)
    if (
      query.includes('minuman') ||
      query.includes('matcha') ||
      (resolved.isFollowUp && (query.includes('minumannya?') || query.includes('minum apa') || query.includes('minum') || query.includes('haus')))
    ) {
      resolved.targetEntity = 'owner';
      resolved.detectedTopic = 'minuman_favorit';
      return resolved;
    }

    // 5. Game Favorit Owner (Free Fire)
    if (
      query.includes('game') ||
      query.includes('free fire') ||
      query.includes('ff') ||
      (resolved.isFollowUp && (query.includes('gamenya?') || query.includes('game apa') || query.includes('main apa')))
    ) {
      resolved.targetEntity = 'owner';
      resolved.detectedTopic = 'game_favorit';
      return resolved;
    }

    // 6. Hobi Owner (Ngedit)
    if (
      query.includes('hobi') ||
      query.includes('ngedit') ||
      (resolved.isFollowUp && (query.includes('hobinya?') || query.includes('suka ngapain')))
    ) {
      resolved.targetEntity = 'owner';
      resolved.detectedTopic = 'hobi';
      return resolved;
    }

    // 7. Media: Musik, Film & Warna (Unrecorded - Anti-Halusinasi)
    if (query.includes('musik') || query.includes('lagu') || (resolved.isFollowUp && query.includes('musiknya?'))) {
      resolved.detectedTopic = 'musik_favorit';
      return resolved;
    }
    if (query.includes('film') || query.includes('movie') || (resolved.isFollowUp && query.includes('filmnya?'))) {
      resolved.detectedTopic = 'film_favorit';
      return resolved;
    }
    if (query.includes('warna') || (resolved.isFollowUp && (query.includes('warnanya?') || query.includes('warna favoritnya')))) {
      resolved.detectedTopic = 'warna_favorit';
      return resolved;
    }

    // 8. Keahlian & Teknologi
    if (
      query.includes('keahlian') ||
      query.includes('skill') ||
      query.includes('teknologi') ||
      query.includes('bisa apa') ||
      query.includes('bahasa pemrograman')
    ) {
      resolved.detectedTopic = 'keahlian_teknologi';
      return resolved;
    }

    // 9. Proyek yang Dibuat / Sedang Dikerjakan
    if (
      query.includes('proyek') ||
      query.includes('project') ||
      query.includes('karya') ||
      query.includes('bikin apa') ||
      query.includes('sedang dikerjakan') ||
      query.includes('sedang dibuat')
    ) {
      resolved.detectedTopic = 'proyek_owner';
      return resolved;
    }

    // 10. Sedang Belajar Apa / Target Belajar
    if (
      query.includes('belajar apa') ||
      query.includes('sedang belajar') ||
      query.includes('target belajar') ||
      query.includes('lagi belajar') ||
      query.includes('mempelajari apa')
    ) {
      resolved.detectedTopic = 'target_belajar';
      return resolved;
    }

    // 11. Cita-cita
    if (query.includes('cita') || query.includes('karier') || query.includes('tujuan') || query.includes('career')) {
      resolved.detectedTopic = 'cita_cita';
      return resolved;
    }

    // 12. Sekolah & Jurusan
    if (
      query.includes('sekolah') ||
      query.includes('jurusan') ||
      query.includes('smk') ||
      query.includes('ciomas') ||
      query.includes('pplg') ||
      query.includes('kelas')
    ) {
      resolved.detectedTopic = 'sekolah_jurusan';
      return resolved;
    }

    // 13. Nama Panggilan / Alias
    if (query.includes('panggilan') || query.includes('alias') || query.includes('nickname') || query.includes('dipanggil')) {
      resolved.detectedTopic = 'panggilan_owner';
      return resolved;
    }

    // 14. Nama Lengkap Owner
    if (
      query.includes('nama lengkap') ||
      query.includes('nama owner') ||
      query.includes('siapa owner') ||
      query.includes('siapa nama') ||
      (query.includes('nama') && !query.includes('panggilan'))
    ) {
      resolved.detectedTopic = 'nama_owner';
      return resolved;
    }

    // 15. Umur Owner (Restricted)
    if (query.includes('umur') || query.includes('usia') || query.includes('berapa tahun') || query.includes('tahun lahir')) {
      resolved.detectedTopic = 'umur_owner';
      return resolved;
    }

    // 16. Ulang Tahun
    if (query.includes('ulang tahun') || query.includes('ultah') || query.includes('birthday') || query.includes('tanggal lahir')) {
      resolved.detectedTopic = 'ulang_tahun';
      return resolved;
    }

    return resolved;
  },

  /**
   * Pencarian Fakta Semantik
   */
  searchFact(query, history = []) {
    const resolved = this.resolveContextualQuery(query, history);
    const facts = this.getFacts();

    // 1. Cek Topik yang terdeteksi secara kontekstual
    if (resolved.detectedTopic) {
      if (resolved.detectedTopic === 'relational_summary') {
        return { fact: null, resolved, isConfident: true, isRelational: true };
      }

      const match = facts.find(f => f.key === resolved.detectedTopic);
      if (match) {
        return { fact: match, resolved, isConfident: true, isRelational: false };
      }
    }

    // 2. Pencarian berbasis skor kecocokan kata kunci dan label
    const words = resolved.normalizedQuery
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);

    let bestFact = null;
    let highestScore = 0;

    for (const fact of facts) {
      let score = 0;
      const factKeywords = (fact.keywords || []).map(k => k.toLowerCase());
      const labelLower = (fact.label || '').toLowerCase();
      const valLower = (fact.value || '').toLowerCase();

      for (const w of words) {
        if (factKeywords.includes(w)) score += 5;
        if (factKeywords.some(k => k.includes(w) || w.includes(k))) score += 2;
        if (labelLower.includes(w)) score += 3;
        if (valLower.includes(w)) score += 1;
      }

      if (score > highestScore) {
        highestScore = score;
        bestFact = fact;
      }
    }

    if (bestFact && highestScore >= 3) {
      return { fact: bestFact, resolved, isConfident: true, isRelational: false };
    }

    return { fact: null, resolved, isConfident: false, isRelational: false };
  },

  /**
   * Menghasilkan Jawaban Relasional Kontekstual:
   * Menjawab pertanyaan "Apa hubungan antara informasi yang sudah dibahas sebelumnya?"
   */
  generateRelationalAnswer(history = []) {
    if (!Array.isArray(history) || history.length < 2) {
      return `🤝 **Korelasi Informasi**:\n\nKita baru saja memulai percakapan. Silakan tanyakan hal-hal seputar profil, keahlian, hobi, atau proyek Habib Ramadhan (BibTzy), dan saya akan dengan senang hati membantu menghubungkan konteks informasinya untuk Anda! 😊`;
    }

    const topicsDiscussed = [];
    const fullText = history.map(h => (h.content || '').toLowerCase()).join(' ');

    if (fullText.includes('nasgor') || fullText.includes('makan')) topicsDiscussed.push('makanan favorit (nasgor)');
    if (fullText.includes('matcha') || fullText.includes('minum')) topicsDiscussed.push('minuman favorit (matcha milk)');
    if (fullText.includes('ngedit') || fullText.includes('hobi')) topicsDiscussed.push('hobi kreatif (ngedit video/konten)');
    if (fullText.includes('free fire') || fullText.includes('game')) topicsDiscussed.push('game favorit (Free Fire)');
    if (fullText.includes('bibztzy') || fullText.includes('ilham') || fullText.includes('teman')) topicsDiscussed.push('lingkaran pertemanan (Bibztzy, Ilham, dan Rafli)');
    if (fullText.includes('ciomas') || fullText.includes('pplg') || fullText.includes('sekolah')) topicsDiscussed.push('pendidikan kejuruan (SMK Negeri 1 Ciomas jurusan PPLG)');
    if (fullText.includes('react') || fullText.includes('belajar') || fullText.includes('coding')) topicsDiscussed.push('pengembangan skill & coding React/Web');

    if (topicsDiscussed.length >= 2) {
      return `🔗 **Keterkaitan Informasi yang Dibahas**:\n\nDari percakapan kita sebelumnya, topik yang telah dibahas meliputi **${topicsDiscussed.join(', ')}**.\n\nHubungannya:\n• Seluruh informasi tersebut merefleksikan karakter dan aktivitas keseharian **Habib Ramadhan (BibTzy)** sebagai siswa SMK jurusan PPLG.\n• Keseimbangan antara hobi digital (ngedit), hiburan (Free Fire bersama sahabat dekat seperti Bibztzy, Ilham, dan Rafli), serta santapan favoritnya (nasgor dan matcha milk) menjadi energi pendukung fokus belajarnya di bidang rekayasa perangkat lunak dan web engineering! 💻✨`;
    }

    return `🔗 **Keterkaitan Informasi**:\n\nTopik-topik yang telah dibahas sebelumnya saling terhubung sebagai bagian dari profil kepribadian, minat, dan keseharian **Habib Ramadhan** dalam menempuh pendidikan kejuruan di SMKN 1 Ciomas.`;
  },

  /**
   * Menghasilkan Jawaban Cerdas, Natural, dan Berbasis Fakta Anti-Halusinasi
   */
  generateAnswer(query, history = []) {
    const { fact, resolved, isConfident, isRelational } = this.searchFact(query, history);

    // Kasus Khusus: Pertanyaan Hubungan Informasi Sebelumnya
    if (isRelational || resolved.detectedTopic === 'relational_summary') {
      return this.generateRelationalAnswer(history);
    }

    // Kasus 1: Fakta ditemukan dan cocok
    if (fact && isConfident) {
      // 1.1 Aturan Access Level Restricted / Private (Contoh: Umur Owner atau Info Privat Teman)
      if (fact.access_level === 'restricted' || fact.isPublic === false) {
        return `🔒 **Informasi Dibatasi (Restricted)**\n\n${fact.restricted_message || `Informasi mengenai **${fact.label}** memiliki tingkat akses terbatas (restricted) dan tidak ditampilkan kepada pengunjung umum demi menjaga privasi data pribadi.`}`;
      }

      // 1.2 Aturan Fakta Belum Diketahui / Status Pending / Empty Value (Anti-Halusinasi)
      // Contoh: Makanan favorit Bibztzy, Warna favorit, Musik favorit, Film favorit
      if (!fact.known || !fact.value || !fact.value.trim() || fact.key === 'makanan_bibztzy') {
        if (fact.key === 'makanan_bibztzy' || fact.target_entity === 'bibztzy') {
          return `ℹ️ **Informasi Belum Diketahui**\n\nMakanan favorit Bibztzy saat ini belum diketahui dan berstatus pending konfirmasi dari owner. Sebagai asisten AI yang akurat, saya tidak mengarang informasinya. 🤝`;
        }

        return `ℹ️ **Informasi Belum Tersedia**\n\nInformasi mengenai **${fact.label}** owner belum dicatat atau belum ditentukan di basis data pengetahuan.\n\nNOVA AI memegang prinsip akurasi data dan tidak mengarang fakta owner. Anda dapat menanyakannya langsung kepada Habib melalui halaman **Contact** ya! 😊`;
      }

      // 1.3 Format Jawaban Natural, Langsung & Kontekstual Sesuai Fakta Resmi
      switch (fact.key) {
        case 'makanan_favorit':
          return `🍜 **Makanan Favorit Habib Ramadhan**:\n\nMakanan favorit owner adalah **${fact.value}** (nasi goreng). Menu lezat dan mengenyangkan untuk menemani aktivitas harian! 😋`;

        case 'minuman_favorit':
          return `🥤 **Minuman Favorit Habib Ramadhan**:\n\nMinuman favorit owner adalah **${fact.value}**. Kombinasi teh hijau matcha dan susu yang segar dan nikmat! 🍵✨`;

        case 'hobi':
          return `⚡ **Hobi Habib Ramadhan**:\n\nHabib Ramadhan suka **ngedit**! Mengedit video atau konten kreatif digital adalah hobi favorit owner untuk mengisi waktu luang dan mengasah kreativitas. 🎬✨`;

        case 'game_favorit':
          return `🎮 **Game Favorit Habib Ramadhan**:\n\nGame favorit owner adalah **${fact.value}** (FF)! Game aksi battle royale yang seru dan penuh strategi bersama teman-teman. 🔥`;

        case 'teman_owner':
          return `👥 **Teman Dekat Owner (Habib Ramadhan)**:\n\nTeman-teman dekat owner yang memang diizinkan untuk disebutkan adalah **${fact.value}**. Sahabat karib yang saling mendukung dalam belajar dan beraktivitas! 🤝`;

        case 'nama_owner':
          return `👋 **Nama Owner**:\n\nNama owner portofolio ini adalah **${fact.value}**, siswa SMK Negeri 1 Ciomas jurusan PPLG.`;

        case 'panggilan_owner':
          return `✨ **Nama Panggilan Owner**:\n\nHabib Ramadhan akrab dipanggil dengan nickname **${fact.value}**.`;

        case 'sekolah_jurusan':
          return `🏫 **Pendidikan & Jurusan**:\n\n${fact.value}\n\nKompetensi kejuruan PPLG mencakup pemrograman web, mobile, basis data, dan pengembangan aplikasi digital. 📚`;

        case 'keahlian_teknologi':
          return `💻 **Keahlian & Teknologi Owner**:\n\n${fact.value}\n\nHabib fokus pada arsitektur frontend modern, UI Glassmorphism, dan integrasi backend database. 🚀`;

        case 'proyek_owner':
          return `🚀 **Proyek Portofolio Owner**:\n\n${fact.value}\n\nAnda dapat melihat detail seluruh karya di halaman **Projects**!`;

        case 'target_belajar':
          return `🎯 **Target Belajar Owner Saat Ini**:\n\n${fact.value}\n\nHabib terus meningkatkan kompetensi coding untuk siap bersaing di dunia industri perangkat lunak! 💻🔥`;

        case 'cita_cita':
          return `🌟 **Cita-cita Owner**:\n\n"${fact.value}"`;

        case 'ulang_tahun':
          return `🎂 **Ulang Tahun Habib Ramadhan**:\n\nUlang tahun owner adalah tanggal **${fact.value}**.\n\n*(Catatan: Informasi ini berstatus pending konfirmasi resmi dari owner karena tahun lahir belum diverifikasi secara pasti)* 🎉`;

        default:
          return `✨ **${fact.label}**:\n\n${fact.value}`;
      }
    }

    // Kasus 2: Topik terdeteksi tetapi belum ada fakta terdaftar (Anti-Halusinasi)
    if (resolved.detectedTopic) {
      const topicName = resolved.detectedTopic.replace(/_/g, ' ');
      return `ℹ️ **Informasi Belum Tersedia**\n\nMaaf, informasi mengenai **${topicName}** belum dicatat atau belum diverifikasi di basis data pengetahuan.\n\nNOVA AI tidak mengarang fakta owner. Anda dapat menanyakannya langsung kepada Habib melalui halaman **Contact** ya! 😊`;
    }

    return null; // Kembalikan null jika bukan pertanyaan spesifik fakta owner
  }
};
