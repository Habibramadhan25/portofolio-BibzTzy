import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Trash2,
  Settings,
  Copy,
  Check,
  Code2,
  User,
  Compass,
  Play,
  Pause,
  Square,
  AlertCircle,
  FileCode,
  RotateCcw
} from 'lucide-react';
import {
  sendNovaChatMessage,
  sendNovaAudioMessage,
  getSupportedAudioMimeType,
  voiceEngine,
  chatHistoryStorage,
  MAX_AUDIO_SECONDS
} from '../../services/novaAIService';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/nova-ai.css';

// Expression mapping for Chibi Mascot integration
const CHIBI_IMAGES = {
  welcome: '/images/chibi/welcome.png',
  happy: '/images/chibi/happy.png',
  curious: '/images/chibi/curious.png',
  excited: '/images/chibi/excited.png',
  pouting: '/images/chibi/pouting.png',
  music: '/images/chibi/music.png',
  surprised: '/images/chibi/surprised.png',
  backview: '/images/chibi/backview.png'
};

export default function NovaAIChatModal({ isOpen, onClose, initialMode = 'general' }) {
  const location = useLocation();
  const { playSound } = useTheme();

  // ─── 3. Pemisahan 8 State Utama (Wajib Sesuai Spesifikasi) ───────────────────
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSendingText, setIsSendingText] = useState(false);
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(false);

  // ─── State Tambahan untuk Mode Tampilan & Kontrol ────────────────────────────
  // Mode Interaksi: 'text' (Chat Teks) | 'vn' (Voice Note)
  const [activeInputMode, setActiveInputMode] = useState('text');

  // Mode Topik AI (Persona): 'general' | 'owner' | 'coding' | 'project'
  const [activeMode, setActiveMode] = useState('general');

  // Chat message history
  const [messages, setMessages] = useState(() => chatHistoryStorage.load());
  const [statusMessage, setStatusMessage] = useState('Siap membantu Anda');
  const [errorMessage, setErrorMessage] = useState(null);

  // Audio Duration & Preview State
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Settings Flyout
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState(() => voiceEngine.getSavedVoiceSettings());

  // Copy Feedback state
  const [copiedStates, setCopiedStates] = useState({});

  // ─── Refs ───────────────────────────────────────────────────────────────────
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const previewAudioRef = useRef(null);

  // Synchronize Chibi Mascot state
  const dispatchChibiEvent = useCallback((status) => {
    let expression = 'welcome';
    if (status === 'listening') expression = 'curious';
    else if (status === 'thinking') expression = 'backview';
    else if (status === 'speaking') expression = 'excited';
    else if (status === 'error') expression = 'pouting';
    else if (status === 'success') expression = 'happy';

    window.dispatchEvent(
      new CustomEvent('nova-ai-status-change', {
        detail: { status, expression }
      })
    );
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    chatHistoryStorage.save(messages);
  }, [messages]);

  // ─── Stream & Recording Cleanup ──────────────────────────────────────────
  const stopMicrophoneStream = useCallback(() => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn('Error stopping microphone track:', e);
      }
      mediaStreamRef.current = null;
    }
  }, []);

  const cleanupRecordingState = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      } catch (_) {}
      mediaRecorderRef.current = null;
    }
    stopMicrophoneStream();
    audioChunksRef.current = [];
    setIsRecording(false);
  }, [stopMicrophoneStream]);

  // Handle Modal Open / Close
  useEffect(() => {
    if (isOpen) {
      if (initialMode) {
        setActiveMode(initialMode);
      }
      scrollToBottom();
      if (activeInputMode === 'text') {
        inputRef.current?.focus();
      }
    } else {
      // Instantly stop voice and active recording if modal is closed
      voiceEngine.stopSpeaking();
      cleanupRecordingState();
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        setIsPlayingPreview(false);
      }
      setStatusMessage('Siap membantu Anda');
      dispatchChibiEvent('idle');
    }
  }, [isOpen, cleanupRecordingState, dispatchChibiEvent, activeInputMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecordingState();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [cleanupRecordingState, previewUrl]);

  // ─── Stop Recording Callback ──────────────────────────────────────────────
  const handleStopRecording = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('Recorder stop error:', err);
      }
    }
    setIsRecording(false);
  }, []);

  // ─── Audio Recording Timer (Max 60 Seconds) ───────────────────────────────
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= MAX_AUDIO_SECONDS) {
            handleStopRecording();
            return MAX_AUDIO_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording, handleStopRecording]);

  // ─── 1. Mode Chat Teks (Terkontrol & Murni Teks) ─────────────────────────────
  const handleSendTextMessage = async (e, textOverride = null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const textToSend = (textOverride !== null ? textOverride : inputText).trim();
    if (!textToSend || isSendingText || isAiResponding) return;

    // Interrupt AI if currently speaking
    if (voiceEngine.isSpeaking) {
      voiceEngine.stopSpeaking();
    }

    playSound?.('click');
    setErrorMessage(null);
    setInputText('');

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      type: 'text',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSendingText(true);
    setIsAiResponding(true);
    setStatusMessage('Sedang memproses jawaban...');
    dispatchChibiEvent('thinking');

    try {
      const response = await sendNovaChatMessage({
        message: textToSend,
        history: messages,
        mode: activeMode,
        currentRoute: location.pathname
      });

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        isLocal: response.isLocalEngine,
        timestamp: response.timestamp
      };

      setMessages((prev) => [...prev, assistantMsg]);
      dispatchChibiEvent('success');
      setStatusMessage('Siap membantu Anda');

      // Auto-speak HANYA jika pengguna secara eksplisit mengaktifkannya
      if (autoSpeakEnabled && voiceEngine.isSpeechSynthesisSupported()) {
        setStatusMessage('Sedang berbicara...');
        dispatchChibiEvent('speaking');
        voiceEngine.speakText({
          text: response.content,
          lang: voiceSettings.lang,
          rate: voiceSettings.rate,
          volume: voiceSettings.volume,
          onEnd: () => {
            setStatusMessage('Siap membantu Anda');
            dispatchChibiEvent('idle');
          },
          onError: () => {
            setStatusMessage('Siap membantu Anda');
            dispatchChibiEvent('idle');
          }
        });
      }
    } catch (err) {
      console.error('Nova AI Error:', err);
      setErrorMessage(err.message || 'Terjadi gangguan saat memproses pesan.');
      setStatusMessage('Terjadi kesalahan');
      dispatchChibiEvent('error');
    } finally {
      setIsSendingText(false);
      setIsAiResponding(false);
    }
  };

  // ─── 2. Mode Voice Note (Dedicated Recording & Preview) ─────────────────────
  const handleStartRecording = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isRecording || isSendingAudio || isAiResponding) return;

    voiceEngine.stopSpeaking();

    // Revoke URL rekaman lama jika ada
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setAudioBlob(null);
    setErrorMessage(null);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setErrorMessage('Browser Anda tidak mendukung akses mikrofon.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = getSupportedAudioMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm'
        });
        setAudioBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setPreviewUrl(url);
        stopMicrophoneStream();
        setStatusMessage('Tinjau Voice Note Anda');
        dispatchChibiEvent('idle');
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      setStatusMessage('Sedang merekam Voice Note...');
      dispatchChibiEvent('listening');
    } catch (err) {
      console.error('Microphone error:', err);
      stopMicrophoneStream();
      setIsRecording(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Izin mikrofon ditolak oleh browser.');
      } else if (err.name === 'NotFoundError') {
        setErrorMessage('Mikrofon fisik tidak terdeteksi pada perangkat.');
      } else {
        setErrorMessage('Gagal merekam suara: ' + err.message);
      }
      dispatchChibiEvent('error');
    }
  };

  const handleCancelRecording = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    cleanupRecordingState();
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setAudioBlob(null);
    setRecordingSeconds(0);
    setStatusMessage('Rekaman dibatalkan');
    dispatchChibiEvent('idle');
  };

  const handleRerecord = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    handleCancelRecording();
    handleStartRecording();
  };

  const handleTogglePreviewPlay = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current
        .play()
        .then(() => setIsPlayingPreview(true))
        .catch((err) => {
          console.warn('Audio preview play error:', err);
          setIsPlayingPreview(false);
        });
    }
  };

  const handleSendVoiceNote = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!audioBlob || isSendingAudio || isAiResponding) return;

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    }

    voiceEngine.stopSpeaking();

    const capturedBlob = audioBlob;
    const capturedUrl = previewUrl || URL.createObjectURL(capturedBlob);
    const durationSec = recordingSeconds || 1;

    // Reset state preview agar tidak bisa dikirim dua kali
    setAudioBlob(null);
    setPreviewUrl(null);
    setRecordingSeconds(0);

    const userMsg = {
      id: `user-vn-${Date.now()}`,
      role: 'user',
      type: 'audio',
      audioUrl: capturedUrl,
      duration: durationSec,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSendingAudio(true);
    setIsAiResponding(true);
    setIsTranscribing(true);
    setStatusMessage('Mengirim Voice Note ke AI...');
    dispatchChibiEvent('thinking');
    playSound?.('click');

    try {
      const response = await sendNovaAudioMessage({
        audioBlob: capturedBlob,
        mimeType: capturedBlob.type,
        history: messages,
        mode: activeMode,
        currentRoute: location.pathname
      });

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        isLocal: response.isLocalEngine,
        timestamp: response.timestamp
      };

      setMessages((prev) => [...prev, assistantMsg]);
      dispatchChibiEvent('success');
      setStatusMessage('Siap membantu Anda');

      // Auto-speak HANYA jika autoSpeakEnabled bernilai true
      if (autoSpeakEnabled && voiceEngine.isSpeechSynthesisSupported()) {
        setStatusMessage('Sedang berbicara...');
        dispatchChibiEvent('speaking');
        voiceEngine.speakText({
          text: response.content,
          lang: voiceSettings.lang,
          rate: voiceSettings.rate,
          volume: voiceSettings.volume,
          onEnd: () => {
            setStatusMessage('Siap membantu Anda');
            dispatchChibiEvent('idle');
          },
          onError: () => {
            setStatusMessage('Siap membantu Anda');
            dispatchChibiEvent('idle');
          }
        });
      }
    } catch (err) {
      console.error('Nova AI Audio Error:', err);
      setErrorMessage(err.message || 'Gagal memproses Voice Note.');
      setStatusMessage('Terjadi kesalahan');
      dispatchChibiEvent('error');
    } finally {
      setIsSendingAudio(false);
      setIsAiResponding(false);
      setIsTranscribing(false);
      // Jangan otomatis merekam ulang setelah VN dikirim
    }
  };

  // ─── AI Voice Controls ───────────────────────────────────────────────────
  const handleStopSpeaking = () => {
    voiceEngine.stopSpeaking();
    setStatusMessage('Siap membantu Anda');
    dispatchChibiEvent('idle');
  };

  const handleReplaySpeech = (text) => {
    handleStopSpeaking();
    setStatusMessage('Memutar suara balasan...');
    dispatchChibiEvent('speaking');

    voiceEngine.speakText({
      text,
      lang: voiceSettings.lang,
      rate: voiceSettings.rate,
      volume: voiceSettings.volume,
      onEnd: () => {
        setStatusMessage('Siap membantu Anda');
        dispatchChibiEvent('idle');
      },
      onError: () => {
        setStatusMessage('Siap membantu Anda');
        dispatchChibiEvent('idle');
      }
    });
  };

  // Clear Chat History
  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat percakapan sesi ini?')) {
      const resetMsgs = chatHistoryStorage.clear();
      setMessages(resetMsgs);
      handleStopSpeaking();
      cleanupRecordingState();
      playSound?.('trash');
      setStatusMessage('Riwayat percakapan dibersihkan');
    }
  };

  // Copy Code snippet to clipboard
  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: true }));
      playSound?.('click');
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    });
  };

  // Explain Code via NOVA
  const handleExplainCode = (code) => {
    setActiveMode('coding');
    setActiveInputMode('text');
    handleSendTextMessage(
      null,
      `Mohon jelaskan baris demi baris cara kerja kode berikut secara bertahap:\n\n\`\`\`\n${code}\n\`\`\``
    );
  };

  // Quick Action Buttons
  const QUICK_ACTIONS = [
    {
      label: '👤 Tanya Owner',
      action: () => {
        setActiveMode('owner');
        setActiveInputMode('text');
        handleSendTextMessage(null, 'Siapa owner NOVA GLASS dan apa saja latar belakang pendidikannya?');
      }
    },
    {
      label: '🎙️ Voice Note',
      action: () => {
        // Berpindah mode tidak boleh mengirim pesan otomatis atau memicu mic
        setActiveInputMode('vn');
      }
    },
    {
      label: '💻 Belajar Coding',
      action: () => {
        setActiveMode('coding');
        setActiveInputMode('text');
        handleSendTextMessage(null, 'Saya ingin belajar dasar React.js untuk siswa SMK PPLG.');
      }
    },
    {
      label: '🔍 Cari Proyek',
      action: () => {
        setActiveMode('owner');
        setActiveInputMode('text');
        handleSendTextMessage(null, 'Apa saja proyek terbaik yang pernah dibuat oleh Habib Ramadhan?');
      }
    },
    {
      label: '💡 Buat Ide Proyek',
      action: () => {
        setActiveMode('project');
        setActiveInputMode('text');
        handleSendTextMessage(null, 'Buatkan saya ide proyek website portofolio interaktif yang kreatif!');
      }
    },
    {
      label: '📍 Jelaskan Halaman Ini',
      action: () => {
        setActiveInputMode('text');
        handleSendTextMessage(null, `Jelaskan halaman ${location.pathname} yang sedang saya kunjungi di website ini.`);
      }
    }
  ];

  const OWNER_PRESET_QUESTIONS = [
    'Siapa owner NOVA GLASS?',
    'Apa makanan kesukaan owner?',
    'Apa minuman favorit owner?',
    'Apa game favorit owner?',
    'Siapa teman dekat owner?',
    'Apa makanan kesukaan teman dekat owner?',
    'Owner sekarang belajar apa?',
    'Proyek apa yang sedang dikerjakan owner?',
    'Kapan ulang tahun owner?',
    'Apa jurusan owner?',
    'Owner bersekolah di mana?',
    'Apa keahlian owner?',
    'Apa cita-cita atau tujuan karier owner?',
    'Bagaimana cara menghubungi owner?'
  ];

  const PROJECT_CATEGORIES = [
    { label: '🌐 Website', query: 'Berikan ide proyek website modern yang memecahkan masalah nyata.' },
    { label: '🎨 UI/UX', query: 'Berikan ide studi kasus desain UI/UX mobile app yang estetis dan ramah pengguna.' },
    { label: '🎮 Game', query: 'Berikan ide proyek game 2D ringan menggunakan JavaScript Canvas atau Unity.' },
    { label: '📱 Mobile App', query: 'Berikan ide proyek mobile app berbasis React Native / Flutter untuk pelajar.' },
    { label: '🤖 AI / ML', query: 'Berikan ide aplikasi web dengan integrasi AI/ML untuk pemula.' }
  ];

  // Helper for inline markdown
  const formatInlineMarkdown = (text) => {
    const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={i}>{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('*') && token.endsWith('*')) {
        return <em key={i}>{token.slice(1, -1)}</em>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return <code key={i}>{token.slice(1, -1)}</code>;
      }
      return token;
    });
  };

  // Render markdown text including code blocks
  const renderMessageContent = (content, msgId) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim() || 'code';
        const code = (lines.length > 1 ? lines.slice(1) : lines).join('\n');
        const blockId = `${msgId}-code-${index}`;
        const isCopied = copiedStates[blockId];

        return (
          <div key={blockId} className="nova-code-block-wrap">
            <div className="nova-code-header">
              <span>{lang}</span>
              <div className="nova-code-actions">
                <button
                  type="button"
                  className="nova-code-btn"
                  onClick={() => handleExplainCode(code)}
                  title="Minta AI menjelaskan kode ini"
                >
                  <FileCode size={12} />
                  <span>Jelaskan Kode</span>
                </button>
                <button
                  type="button"
                  className="nova-code-btn"
                  onClick={() => handleCopyCode(code, blockId)}
                  title="Salin kode ke clipboard"
                >
                  {isCopied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                  <span>{isCopied ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>
            </div>
            <pre>
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      return (
        <div key={index} className="nova-markdown-text">
          {part.split('\n\n').map((paragraph, pIdx) => {
            if (paragraph.startsWith('• ') || paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={pIdx}>
                  {items.map((it, iIdx) => (
                    <li key={iIdx}>
                      {formatInlineMarkdown(it.replace(/^[•-]\s*/, ''))}
                    </li>
                  ))}
                </ul>
              );
            }

            if (paragraph.startsWith('### ')) {
              return <h3 key={pIdx}>{formatInlineMarkdown(paragraph.replace(/^###\s*/, ''))}</h3>;
            }
            if (paragraph.startsWith('## ')) {
              return <h2 key={pIdx}>{formatInlineMarkdown(paragraph.replace(/^##\s*/, ''))}</h2>;
            }

            return <p key={pIdx}>{formatInlineMarkdown(paragraph)}</p>;
          })}
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="nova-ai-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="NOVA AI Chat Assistant"
    >
      <div className="nova-ai-window">
        {/* Top Header */}
        <header className="nova-ai-header">
          <div className="nova-ai-brand">
            <div
              className="nova-ai-avatar-wrap"
              onClick={() => handleSendTextMessage(null, 'Ceritakan sedikit tentang maskot NOVA GLASS!')}
              title="Maskot NOVA — Ketuk untuk interaksi"
            >
              <img
                src={
                  isRecording
                    ? CHIBI_IMAGES.curious
                    : isAiResponding
                    ? CHIBI_IMAGES.backview
                    : voiceEngine.isSpeaking
                    ? CHIBI_IMAGES.excited
                    : errorMessage
                    ? CHIBI_IMAGES.pouting
                    : CHIBI_IMAGES.welcome
                }
                alt="NOVA Chibi Avatar"
                className="nova-ai-avatar-img"
              />
            </div>
            <div className="nova-ai-title-wrap">
              <div className="nova-ai-name">
                <span>NOVA AI</span>
                <span className="nova-ai-badge">AI Assistant</span>
              </div>
              <div className="nova-ai-status-indicator">
                <span
                  className={`nova-ai-dot ${
                    isRecording
                      ? 'listening'
                      : isAiResponding
                      ? 'thinking'
                      : voiceEngine.isSpeaking
                      ? 'speaking'
                      : errorMessage
                      ? 'error'
                      : 'idle'
                  }`}
                />
                <span>{statusMessage}</span>
              </div>
            </div>
          </div>

          <div className="nova-ai-header-actions">
            {/* Quick Auto Speak Toggle */}
            <button
              type="button"
              className={`nova-tool-btn ${autoSpeakEnabled ? 'active' : ''}`}
              onClick={() => {
                const next = !autoSpeakEnabled;
                setAutoSpeakEnabled(next);
                const updated = { ...voiceSettings, autoRead: next };
                setVoiceSettings(updated);
                voiceEngine.saveVoiceSettings(updated);
                if (!next) {
                  voiceEngine.stopSpeaking();
                }
              }}
              title={
                autoSpeakEnabled
                  ? 'Auto Speak Aktif (Jawaban AI dibacakan suara)'
                  : 'Auto Speak Nonaktif (Jawaban AI berupa teks default)'
              }
              aria-label="Toggle Auto Speak"
            >
              {autoSpeakEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Stop Speaking / Interrupt Button */}
            {voiceEngine.isSpeaking && (
              <button
                type="button"
                className="nova-tool-btn active"
                onClick={handleStopSpeaking}
                title="Hentikan suara AI (Interupsi)"
              >
                <Square size={14} />
              </button>
            )}

            {/* Settings Toggle */}
            <button
              type="button"
              className={`nova-tool-btn ${showSettings ? 'active' : ''}`}
              onClick={() => setShowSettings((prev) => !prev)}
              title="Pengaturan Suara & AI"
            >
              <Settings size={16} />
            </button>

            {/* Clear History */}
            <button
              type="button"
              className="nova-tool-btn"
              onClick={handleClearHistory}
              title="Hapus riwayat chat sesi ini"
            >
              <Trash2 size={16} />
            </button>

            {/* Close Modal */}
            <button
              type="button"
              className="nova-tool-btn close"
              onClick={onClose}
              title="Tutup (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Voice & AI Settings Dropdown */}
        {showSettings && (
          <div className="nova-settings-panel">
            <div className="nova-setting-row">
              <div className="nova-setting-label">
                <span>Bahasa Suara (Speech Language)</span>
                <span className="nova-setting-sub">Pilih aksen bahasa pembacaan suara AI</span>
              </div>
              <select
                className="nova-select"
                value={voiceSettings.lang}
                onChange={(e) => {
                  const updated = { ...voiceSettings, lang: e.target.value };
                  setVoiceSettings(updated);
                  voiceEngine.saveVoiceSettings(updated);
                }}
              >
                <option value="id-ID">Bahasa Indonesia (id-ID) — Default</option>
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
              </select>
            </div>

            <div className="nova-setting-row">
              <div className="nova-setting-label">
                <span>Kecepatan Bicara ({voiceSettings.rate}x)</span>
                <span className="nova-setting-sub">Atur tempo pembacaan suara</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                className="nova-range-slider"
                value={voiceSettings.rate}
                onChange={(e) => {
                  const updated = { ...voiceSettings, rate: parseFloat(e.target.value) };
                  setVoiceSettings(updated);
                  voiceEngine.saveVoiceSettings(updated);
                }}
              />
            </div>

            <div className="nova-setting-row">
              <div className="nova-setting-label">
                <span>Auto Speak (Baca Otomatis)</span>
                <span className="nova-setting-sub">
                  Suarakan jawaban AI secara otomatis (Default: Nonaktif)
                </span>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${autoSpeakEnabled ? 'btn-primary' : 'btn-glass'}`}
                onClick={() => {
                  const next = !autoSpeakEnabled;
                  setAutoSpeakEnabled(next);
                  const updated = { ...voiceSettings, autoRead: next };
                  setVoiceSettings(updated);
                  voiceEngine.saveVoiceSettings(updated);
                  if (!next) {
                    voiceEngine.stopSpeaking();
                  }
                }}
              >
                {autoSpeakEnabled ? 'Aktif' : 'Nonaktif (Default Teks)'}
              </button>
            </div>
          </div>
        )}

        {/* AI Knowledge Mode Selector Tabs */}
        <div className="nova-mode-bar">
          <button
            type="button"
            className={`nova-mode-chip ${activeMode === 'general' ? 'active' : ''}`}
            onClick={() => setActiveMode('general')}
          >
            <Sparkles size={14} />
            <span>NOVA AI</span>
          </button>

          <button
            type="button"
            className={`nova-mode-chip ${activeMode === 'owner' ? 'active' : ''}`}
            onClick={() => setActiveMode('owner')}
          >
            <User size={14} />
            <span>Tanya Owner</span>
          </button>

          <button
            type="button"
            className={`nova-mode-chip ${activeMode === 'coding' ? 'active' : ''}`}
            onClick={() => setActiveMode('coding')}
          >
            <Code2 size={14} />
            <span>Coding Tutor</span>
          </button>

          <button
            type="button"
            className={`nova-mode-chip ${activeMode === 'project' ? 'active' : ''}`}
            onClick={() => setActiveMode('project')}
          >
            <Compass size={14} />
            <span>Project Generator</span>
          </button>
        </div>

        {/* Chat Message List */}
        <div className="nova-ai-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`nova-message-row ${msg.role}`}>
              <div className="nova-msg-avatar">
                {msg.role === 'user' ? (
                  <img src="/images/user-avatar.jpg" alt="User" />
                ) : (
                  <img src={CHIBI_IMAGES.welcome} alt="NOVA" />
                )}
              </div>

              <div className="nova-msg-bubble">
                {msg.type === 'audio' ? (
                  <div className="nova-vn-msg-bubble">
                    <div className="nova-vn-msg-header">
                      <Mic size={14} />
                      <span>Voice Note ({msg.duration ? `${msg.duration} detik` : 'Audio'})</span>
                    </div>
                    <audio controls src={msg.audioUrl} className="nova-vn-audio-player" />
                  </div>
                ) : (
                  renderMessageContent(msg.content, msg.id)
                )}

                <div className="nova-bubble-footer">
                  <span>
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : ''}
                  </span>

                  {msg.role === 'assistant' && (
                    <div className="nova-bubble-actions">
                      <button
                        type="button"
                        className="nova-bubble-mini-btn"
                        onClick={() => handleReplaySpeech(msg.content)}
                        title="Putar suara balasan ini"
                      >
                        <Volume2 size={13} />
                        <span>Putar Suara</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* AI Responding Indicator */}
          {isAiResponding && (
            <div className="nova-message-row assistant">
              <div className="nova-msg-avatar">
                <img src={CHIBI_IMAGES.backview} alt="Thinking" />
              </div>
              <div
                className="nova-msg-bubble"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span className="nova-ai-dot thinking" />
                <span>
                  {isTranscribing
                    ? 'NOVA sedang mendengarkan & memproses Voice Note...'
                    : 'NOVA sedang menyusun respons terbaik untukmu...'}
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#FCA5A5',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.85rem'
              }}
            >
              <AlertCircle size={16} />
              <div style={{ flex: 1 }}>{errorMessage}</div>
              <button
                type="button"
                className="nova-code-btn"
                onClick={() => setErrorMessage(null)}
              >
                Tutup
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Strip */}
        <div className="nova-quick-strip">
          {activeMode === 'owner' &&
            OWNER_PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                className="nova-quick-btn"
                onClick={() => {
                  setActiveInputMode('text');
                  handleSendTextMessage(null, q);
                }}
              >
                {q}
              </button>
            ))}

          {activeMode === 'project' &&
            PROJECT_CATEGORIES.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                className="nova-quick-btn"
                onClick={() => {
                  setActiveInputMode('text');
                  handleSendTextMessage(null, cat.query);
                }}
              >
                {cat.label}
              </button>
            ))}

          {activeMode === 'general' &&
            QUICK_ACTIONS.map((qa, idx) => (
              <button
                key={idx}
                type="button"
                className="nova-quick-btn"
                onClick={qa.action}
              >
                {qa.label}
              </button>
            ))}
        </div>

        {/* Bottom Interaction Area */}
        <div className="nova-ai-input-wrap">
          {/* 5. TAMPILAN: Pilihan mode yang jelas [ Chat Teks ] [ Voice Note ] */}
          <div className="nova-mode-toggle-bar">
            <button
              type="button"
              id="nova-mode-text-btn"
              className={`nova-mode-toggle-btn ${activeInputMode === 'text' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isRecording) handleCancelRecording();
                setActiveInputMode('text');
              }}
            >
              <Send size={13} />
              <span>Chat Teks</span>
            </button>
            <button
              type="button"
              id="nova-mode-vn-btn"
              className={`nova-mode-toggle-btn ${activeInputMode === 'vn' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveInputMode('vn');
              }}
            >
              <Mic size={13} />
              <span>Voice Note</span>
            </button>
          </div>

          {/* Mode 1: Chat Teks (Hanya Input Teks & Tombol Kirim Teks) */}
          {activeInputMode === 'text' && (
            <form
              id="nova-text-chat-form"
              onSubmit={handleSendTextMessage}
              className="nova-input-row"
            >
              <input
                ref={inputRef}
                id="nova-chat-text-input"
                type="text"
                className="nova-text-input"
                placeholder={
                  activeMode === 'owner'
                    ? 'Tanyakan tentang profil, sekolah, keahlian owner...'
                    : activeMode === 'coding'
                    ? 'Tanya kode HTML, CSS, React, bug, atau konsep...'
                    : activeMode === 'project'
                    ? 'Minta ide website, game, UI/UX, atau AI...'
                    : 'Ketik pesan teks di sini...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSendingText || isAiResponding}
              />

              <button
                id="nova-chat-send-btn"
                type="submit"
                className="nova-send-btn"
                disabled={!inputText.trim() || isSendingText || isAiResponding}
                title="Kirim pesan teks (Enter)"
                aria-label="Kirim Pesan Teks"
              >
                <Send size={18} />
              </button>
            </form>
          )}

          {/* Mode 2: Voice Note (Dedicated Recording & Audio Controls) */}
          {activeInputMode === 'vn' && (
            <div className="nova-vn-wrapper">
              {/* Status 1: Sedang Merekam */}
              {isRecording && (
                <div className="nova-vn-card recording">
                  <div className="nova-vn-card-header">
                    <span className="nova-vn-dot-pulse" />
                    <span className="nova-vn-card-title">Merekam Voice Note...</span>
                    <span className="nova-vn-card-timer">
                      {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:
                      {String(recordingSeconds % 60).padStart(2, '0')} / 01:00
                    </span>
                  </div>

                  {/* Waveform Visualization Saat Merekam */}
                  <div className="nova-vn-wave-strip">
                    {[...Array(16)].map((_, i) => (
                      <div
                        key={i}
                        className="nova-vn-wave-line"
                        style={{
                          animationDelay: `${(i * 0.07).toFixed(2)}s`,
                          height: `${Math.floor(Math.sin(i + recordingSeconds) * 18 + 24)}px`
                        }}
                      />
                    ))}
                  </div>

                  <div className="nova-vn-actions-row">
                    <button
                      type="button"
                      className="nova-vn-ctrl-btn danger"
                      onClick={handleCancelRecording}
                    >
                      <X size={15} />
                      <span>Batal</span>
                    </button>
                    <button
                      type="button"
                      className="nova-vn-ctrl-btn primary"
                      onClick={handleStopRecording}
                    >
                      <Square size={15} />
                      <span>Selesai Rekam</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status 2: Rekaman Selesai & Audio Preview Tersedia */}
              {!isRecording && audioBlob && (
                <div className="nova-vn-card preview">
                  <div className="nova-vn-player-bar">
                    <button
                      type="button"
                      className="nova-vn-playback-btn"
                      onClick={handleTogglePreviewPlay}
                      title={isPlayingPreview ? 'Jeda preview' : 'Putar preview audio'}
                    >
                      {isPlayingPreview ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    <div className="nova-vn-meta-info">
                      <span className="nova-vn-meta-title">Rekaman Voice Note Siap</span>
                      <span className="nova-vn-meta-dur">
                        Durasi: {recordingSeconds || 1} detik
                      </span>
                    </div>

                    <audio
                      ref={previewAudioRef}
                      src={previewUrl}
                      onEnded={() => setIsPlayingPreview(false)}
                      onPause={() => setIsPlayingPreview(false)}
                      onPlay={() => setIsPlayingPreview(true)}
                    />
                  </div>

                  {/* 2. MODE VOICE NOTE: Tombol Putar, Rekam Ulang, Batal, dan Kirim VN */}
                  <div className="nova-vn-actions-row">
                    <button
                      type="button"
                      className="nova-vn-ctrl-btn secondary"
                      onClick={handleTogglePreviewPlay}
                    >
                      {isPlayingPreview ? <Pause size={14} /> : <Play size={14} />}
                      <span>{isPlayingPreview ? 'Jeda' : 'Putar'}</span>
                    </button>
                    <button
                      type="button"
                      className="nova-vn-ctrl-btn secondary"
                      onClick={handleRerecord}
                      disabled={isSendingAudio || isAiResponding}
                    >
                      <RotateCcw size={14} />
                      <span>Rekam Ulang</span>
                    </button>
                    <button
                      type="button"
                      className="nova-vn-ctrl-btn danger"
                      onClick={handleCancelRecording}
                      disabled={isSendingAudio || isAiResponding}
                    >
                      <Trash2 size={14} />
                      <span>Batal</span>
                    </button>
                    <button
                      type="button"
                      className="nova-vn-ctrl-btn send"
                      onClick={handleSendVoiceNote}
                      disabled={isSendingAudio || isAiResponding}
                    >
                      <Send size={14} />
                      <span>{isSendingAudio ? 'Mengirim...' : 'Kirim VN'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status 3: Siap Merekam (Belum Ada Rekaman) */}
              {!isRecording && !audioBlob && (
                <div className="nova-vn-card idle">
                  <button
                    type="button"
                    className="nova-vn-start-record-btn"
                    onClick={handleStartRecording}
                    disabled={isSendingAudio || isAiResponding}
                  >
                    <div className="nova-vn-mic-circle">
                      <Mic size={22} />
                    </div>
                    <div className="nova-vn-start-text">
                      <strong>Mulai Rekam Voice Note</strong>
                      <span>Klik mikrofon untuk merekam audio (Maksimum 60 detik)</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
