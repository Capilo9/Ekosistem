'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  Eye,
  Leaf,
  Lightbulb,
  Link as LinkIcon,
  Map,
  Network,
  RotateCcw,
  Sparkles,
  Sun,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type Question = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  hint: string;
};

const screenNames = [
  'Beranda', 'Petunjuk', 'Peta Belajar', 'Apa yang Ada di Sini?',
  'Jelajahi Ekosistem', 'Dua Kelompok Komponen', 'Biotik atau Abiotik?',
  'Peran Setiap Komponen', 'Siapa Berperan Apa?', 'Apa yang Terjadi Jika…?',
  'Bukti Belajar 1', 'Energi di Dalam Ekosistem', 'Kenali Perannya',
  'Ikuti Aliran Energi', 'Susun Rantai Makanan', 'Dari Rantai Menjadi Jaring',
  'Bangun Jaring-jaring Makanan', 'Ekosistem Berubah', 'Bukti Belajar 2',
  'Rangkuman', 'Refleksi', 'Selesai',
];

const discoveries = [
  { id: 'sun', name: 'Cahaya', kind: 'Abiotik', pos: 'left-[6%] top-[9%]', role: 'Cahaya matahari adalah sumber energi utama. Tumbuhan menggunakannya untuk membuat makanan.' },
  { id: 'tree', name: 'Pohon', kind: 'Biotik', pos: 'left-[31%] top-[34%]', role: 'Pohon adalah makhluk hidup. Ia membuat makanan dan menjadi tempat hidup organisme lain.' },
  { id: 'water', name: 'Air', kind: 'Abiotik', pos: 'left-[68%] top-[67%]', role: 'Air dibutuhkan makhluk hidup dan menjadi habitat bagi organisme air.' },
  { id: 'grasshopper', name: 'Belalang', kind: 'Biotik', pos: 'left-[14%] top-[40%]', role: 'Belalang adalah hewan pemakan tumbuhan dan dapat menjadi makanan bagi katak atau burung.' },
  { id: 'frog', name: 'Katak', kind: 'Biotik', pos: 'left-[57%] top-[70%]', role: 'Katak memakan serangga. Ia juga dapat menjadi makanan bagi ular.' },
  { id: 'mouse', name: 'Tikus', kind: 'Biotik', pos: 'left-[40%] top-[57%]', role: 'Tikus memakan biji atau bagian tumbuhan dan dapat dimangsa ular atau elang.' },
  { id: 'fungi', name: 'Jamur', kind: 'Biotik', pos: 'left-[87%] top-[75%]', role: 'Jamur membantu menguraikan sisa makhluk hidup dan mengembalikan unsur hara ke tanah.' },
  { id: 'rock', name: 'Batu', kind: 'Abiotik', pos: 'left-[80%] top-[58%]', role: 'Batu tidak hidup. Batu dapat menjadi tempat berlindung dan memengaruhi kondisi habitat.' },
  { id: 'soil', name: 'Tanah', kind: 'Abiotik', pos: 'left-[35%] top-[78%]', role: 'Tanah menjadi tempat tumbuh serta menyediakan air dan unsur hara bagi tumbuhan.' },
] as const;

const groupingQuestions: Question[] = [
  ['Pohon', 0, 'Pohon tumbuh, bernapas, dan membutuhkan air sehingga termasuk biotik.'],
  ['Air kolam', 1, 'Air tidak hidup, tetapi sangat dibutuhkan organisme sehingga termasuk abiotik.'],
  ['Katak', 0, 'Katak adalah hewan yang melakukan proses kehidupan.'],
  ['Cahaya matahari', 1, 'Cahaya adalah faktor tidak hidup yang menjadi sumber energi utama.'],
  ['Jamur', 0, 'Jamur adalah makhluk hidup dan berperan sebagai pengurai.'],
  ['Tanah', 1, 'Dalam aktivitas ini tanah dikelompokkan sebagai faktor abiotik.'],
  ['Belalang', 0, 'Belalang adalah hewan, jadi termasuk komponen biotik.'],
  ['Udara', 1, 'Udara tidak hidup, tetapi dibutuhkan dalam proses kehidupan.'],
  ['Rumput', 0, 'Rumput adalah tumbuhan yang tumbuh dan membuat makanan.'],
  ['Suhu', 1, 'Suhu adalah kondisi fisik lingkungan, jadi termasuk abiotik.'],
].map(([name, answer, explanation]) => ({
  prompt: `${name} termasuk komponen…`, options: ['Biotik', 'Abiotik'], answer: answer as number,
  explanation: explanation as string, hint: 'Tanyakan: apakah komponen ini melakukan proses kehidupan?',
}));

const roleQuestions: Question[] = [
  { prompt: 'Apa peran utama tumbuhan?', options: ['Membuat makanan', 'Menguraikan sisa', 'Mengatur suhu'], answer: 0, explanation: 'Tumbuhan membuat makanan dengan bantuan cahaya, air, dan udara.', hint: 'Cari komponen yang mampu membuat makanan sendiri.' },
  { prompt: 'Apa peran hewan dalam hubungan makan dan dimakan?', options: ['Selalu menjadi pengurai', 'Memindahkan energi saat makan atau dimakan', 'Membuat cahaya'], answer: 1, explanation: 'Hewan memperoleh energi dari makanan dan dapat meneruskannya kepada pemangsa.', hint: 'Pikirkan dari mana hewan memperoleh energi.' },
  { prompt: 'Apa peran jamur dan bakteri pengurai?', options: ['Mengembalikan unsur hara', 'Menghasilkan cahaya', 'Menghentikan pertumbuhan'], answer: 0, explanation: 'Pengurai memecah sisa makhluk hidup sehingga unsur hara kembali ke lingkungan.', hint: 'Perhatikan apa yang terjadi pada daun gugur.' },
  { prompt: 'Apa fungsi air?', options: ['Menggantikan makanan semua hewan', 'Mendukung proses kehidupan', 'Membuat organisme tidak bernapas'], answer: 1, explanation: 'Air diperlukan dalam tubuh makhluk hidup dan menjadi habitat berbagai organisme.', hint: 'Bayangkan tumbuhan yang lama tidak mendapat air.' },
  { prompt: 'Apa fungsi cahaya matahari?', options: ['Sumber energi bagi tumbuhan', 'Tempat hidup pengurai', 'Makanan langsung bagi elang'], answer: 0, explanation: 'Energi cahaya digunakan tumbuhan untuk membuat makanan.', hint: 'Awal aliran energi dalam banyak ekosistem berasal dari sini.' },
];

const changeQuestions: Question[] = [
  { prompt: 'Air kolam berkurang drastis. Apa yang paling mungkin terjadi lebih dahulu?', options: ['Tumbuhan air kesulitan hidup', 'Semua hewan langsung bertambah', 'Cahaya matahari menghilang'], answer: 0, explanation: 'Tumbuhan air bergantung langsung pada ketersediaan air sebagai tempat hidup dan kebutuhan hidupnya.', hint: 'Cari komponen yang berhubungan paling langsung dengan air.' },
  { prompt: 'Pohon tertutup bangunan sehingga menerima sangat sedikit cahaya.', options: ['Pohon lebih mudah membuat makanan', 'Kemampuan pohon membuat makanan menurun', 'Tanah berubah menjadi hewan'], answer: 1, explanation: 'Tanpa cukup cahaya, proses pembuatan makanan pada tumbuhan terganggu.', hint: 'Cahaya menyediakan energi bagi tumbuhan.' },
  { prompt: 'Jumlah tumbuhan menurun. Dampak yang masuk akal adalah…', options: ['Hewan pemakan tumbuhan kekurangan makanan', 'Semua pengurai hilang seketika', 'Air berubah menjadi biotik'], answer: 0, explanation: 'Lebih sedikit tumbuhan berarti lebih sedikit sumber makanan bagi herbivor.', hint: 'Siapa yang menggunakan tumbuhan sebagai makanan?' },
  { prompt: 'Pengurai menghilang dari kebun.', options: ['Sisa makhluk hidup menumpuk', 'Matahari berhenti bersinar', 'Hewan membuat makanan sendiri'], answer: 0, explanation: 'Tanpa pengurai, sisa makhluk hidup lebih lambat terurai dan unsur hara lebih lambat kembali.', hint: 'Ingat tugas pengurai pada daun gugur.' },
];

const trophicQuestions: Question[] = [
  ['Rumput', 0, 'Rumput adalah produsen karena mampu membuat makanan sendiri.'],
  ['Belalang', 1, 'Belalang adalah konsumen karena memperoleh energi dengan memakan tumbuhan.'],
  ['Katak', 1, 'Katak adalah konsumen karena memakan organisme lain.'],
  ['Elang', 1, 'Elang adalah konsumen yang memperoleh energi dari mangsanya.'],
  ['Jamur', 2, 'Jamur adalah pengurai yang memecah sisa makhluk hidup.'],
  ['Bakteri tanah', 2, 'Bakteri pengurai membantu mengembalikan unsur hara ke lingkungan.'],
].map(([name, answer, explanation]) => ({
  prompt: `Peran ${name} adalah…`, options: ['Produsen', 'Konsumen', 'Pengurai'], answer: answer as number,
  explanation: explanation as string, hint: 'Lihat cara organisme itu memperoleh energi.',
}));

const arrowQuestions: Question[] = [
  { prompt: 'Pada rantai “rumput → belalang”, panah berarti…', options: ['Belalang memberi energi kepada rumput', 'Energi dari rumput berpindah ke belalang', 'Rumput mengejar belalang'], answer: 1, explanation: 'Panah menunjuk ke organisme yang menerima energi melalui makanan.', hint: 'Ikuti perjalanan energi, bukan arah gerak hewan.' },
  { prompt: 'Urutan awal aliran energi yang benar adalah…', options: ['Matahari → tumbuhan', 'Tumbuhan → Matahari', 'Elang → Matahari'], answer: 0, explanation: 'Tumbuhan menangkap energi cahaya matahari untuk membuat makanan.', hint: 'Apa sumber energi utama ekosistem?' },
  { prompt: 'Dalam “belalang → katak”, siapa yang dimakan?', options: ['Katak', 'Belalang', 'Keduanya tidak berhubungan'], answer: 1, explanation: 'Energi belalang berpindah kepada katak ketika katak memakannya.', hint: 'Panah bergerak dari sumber makanan menuju pemakan.' },
];

const ecosystemChangeQuestions: Question[] = [
  { prompt: 'Populasi belalang berkurang drastis. Pasangan dampak paling masuk akal adalah…', options: ['Tumbuhan cenderung bertambah; katak dapat kekurangan makanan', 'Tumbuhan langsung habis; katak selalu bertambah', 'Elang menjadi produsen'], answer: 0, explanation: 'Lebih sedikit belalang mengurangi pemakanan tumbuhan dan mengurangi salah satu sumber makanan katak.', hint: 'Periksa organisme yang dimakan dan memakan belalang.' },
  { prompt: 'Jumlah tumbuhan menurun tajam. Apa awal dampak berantainya?', options: ['Herbivor kekurangan makanan', 'Pengurai berubah menjadi produsen', 'Cahaya matahari habis'], answer: 0, explanation: 'Tumbuhan adalah dasar banyak rantai makanan, sehingga herbivor terdampak lebih dahulu.', hint: 'Mulailah dari konsumen yang makan tumbuhan.' },
  { prompt: 'Jumlah ular bertambah banyak sementara makanan lain tetap.', options: ['Tikus dan katak dapat berkurang', 'Rumput pasti langsung hilang', 'Jamur berhenti mengurai'], answer: 0, explanation: 'Lebih banyak ular dapat meningkatkan tekanan pemangsaan pada tikus dan katak.', hint: 'Cari mangsa ular pada jaring-jaring.' },
  { prompt: 'Pengurai sangat berkurang dalam waktu lama.', options: ['Daur unsur hara terganggu', 'Semua konsumen membuat makanan sendiri', 'Arah energi berbalik ke matahari'], answer: 0, explanation: 'Pengurai membantu mengembalikan unsur hara; jumlahnya yang menurun dapat mengganggu kesuburan lingkungan.', hint: 'Pikirkan perjalanan sisa makhluk hidup kembali ke tanah.' },
];

function EcosystemImage({ compact = false }: { compact?: boolean }) {
  const [src, setSrc] = useState('/ecosystem-scene.png');
  return <img src={src} onError={() => setSrc('/ecosystem-fallback.svg')} alt="Ekosistem kebun dan kolam dengan tumbuhan, hewan, air, tanah, dan cahaya" className={`${compact ? 'aspect-[16/7]' : 'aspect-video'} h-full w-full object-cover`} />;
}

function Feedback({ ok, text, hint, onRetry }: { ok: boolean; text: string; hint?: string; onRetry?: () => void }) {
  return (
    <div role="status" aria-live="polite" className={`mt-5 rounded-2xl border p-4 ${ok ? 'border-[var(--leaf)]/25 bg-[var(--leaf-pale)]' : 'border-[var(--sun)]/50 bg-[var(--sun-pale)]'}`}>
      <div className="flex gap-3">
        {ok ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--leaf)]" /> : <Lightbulb className="mt-0.5 size-5 shrink-0 text-[var(--soil)]" />}
        <div><p className="font-bold">{ok ? 'Tepat!' : 'Belum tepat.'}</p><p className="mt-1 text-sm leading-relaxed">{text}</p>{!ok && hint && <p className="mt-2 text-sm font-semibold">Petunjuk: {hint}</p>}</div>
      </div>
      {!ok && onRetry && <Button onClick={onRetry} variant="outline" className="mt-4 rounded-xl border-black/15 bg-white/70"><RotateCcw /> Coba lagi</Button>}
    </div>
  );
}

function ChoiceQuiz({ eyebrow, title, questions, onDone }: { eyebrow: string; title: string; questions: Question[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const q = questions[index];
  const choose = (choice: number) => {
    if (feedback?.ok) return;
    if (choice === q.answer) setFeedback({ ok: true, text: q.explanation });
    else { setAttempts((value) => value + 1); setFeedback({ ok: false, text: attempts > 0 ? `${q.hint} Perhatikan kembali setiap kata pada pilihan.` : q.hint }); }
  };
  const advance = () => {
    if (index === questions.length - 1) onDone();
    else { setIndex((value) => value + 1); setFeedback(null); setAttempts(0); }
  };
  return (
    <LearningPanel eyebrow={eyebrow} title={title} step={`${index + 1} dari ${questions.length}`}>
      <p className="text-xl font-extrabold leading-snug text-[var(--forest)]">{q.prompt}</p>
      <div className="mt-5 grid gap-3">
        {q.options.map((option, optionIndex) => <Button key={option} onClick={() => choose(optionIndex)} disabled={Boolean(feedback?.ok)} variant="outline" className="min-h-14 h-auto justify-start rounded-2xl border-black/15 bg-white px-5 py-3 text-left text-base whitespace-normal hover:border-[var(--leaf)] hover:bg-[var(--leaf-pale)]">{String.fromCharCode(65 + optionIndex)}. {option}</Button>)}
      </div>
      {feedback && <Feedback ok={feedback.ok} text={feedback.text} hint={q.hint} onRetry={() => setFeedback(null)} />}
      {feedback?.ok && <Button onClick={advance} className="mt-5 h-12 rounded-xl bg-[var(--forest)] px-5 text-white hover:bg-[var(--leaf)]">{index === questions.length - 1 ? 'Selesaikan aktivitas' : 'Pertanyaan berikutnya'} <ArrowRight /></Button>}
    </LearningPanel>
  );
}

function LearningPanel({ eyebrow, title, step, children }: { eyebrow: string; title: string; step?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-7 md:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--leaf)]">{eyebrow}</p><h1 className="font-display mt-1 text-3xl font-black tracking-tight text-[var(--forest)] md:text-4xl">{title}</h1></div>
        {step && <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[var(--moss)] shadow-sm">{step}</span>}
      </div>
      <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_20px_60px_rgba(22,78,62,0.08)] md:p-7">{children}</div>
    </section>
  );
}

function FooterNav({ onBack, onNext, nextLabel = 'Lanjut', disabled = false }: { onBack?: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean }) {
  return <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/10 pt-5">{onBack ? <Button onClick={onBack} variant="ghost" className="h-11 rounded-xl"><ArrowLeft /> Kembali</Button> : <span /> }<Button onClick={onNext} disabled={disabled} className="h-12 rounded-xl bg-[var(--forest)] px-5 text-white hover:bg-[var(--leaf)]">{nextLabel} <ArrowRight /></Button></div>;
}

function ExploreScreen({ onDone }: { onDone: () => void }) {
  const [selected, setSelected] = useState<(typeof discoveries)[number] | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const visit = (item: (typeof discoveries)[number]) => { setSelected(item); setSeen((current) => new Set(current).add(item.id)); };
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
      <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--leaf)]">Subunit 1 · I1</p><h1 className="font-display mt-1 text-3xl font-black text-[var(--forest)]">Jelajahi ekosistem</h1><p className="mt-2 text-[var(--moss)]">Klik sekurang-kurangnya enam penanda. Temukan nama, jenis, dan perannya.</p>
        <div className="relative mt-5 overflow-hidden rounded-[2rem] border-4 border-white bg-[var(--sky)] shadow-xl"><EcosystemImage />{discoveries.map((item) => <button key={item.id} onClick={() => visit(item)} className={`hotspot ${item.pos} ${seen.has(item.id) ? 'is-seen' : ''}`} aria-label={`Amati ${item.name}`}><span>{item.name}</span></button>)}</div>
      </div>
      <aside className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm lg:mt-16">
        <p className="text-sm font-bold text-[var(--moss)]">Ditemukan {seen.size} dari {discoveries.length}</p><Progress value={(seen.size / discoveries.length) * 100} className="mt-2 [&_[data-slot=progress-indicator]]:bg-[var(--sun)] [&_[data-slot=progress-track]]:h-2" />
        {selected ? <><span className={`mt-6 inline-flex rounded-full px-3 py-1 text-sm font-bold ${selected.kind === 'Biotik' ? 'bg-[var(--leaf-pale)] text-[var(--forest)]' : 'bg-[var(--sky-pale)] text-[var(--water)]'}`}>{selected.kind}</span><h2 className="font-display mt-3 text-3xl font-black text-[var(--forest)]">{selected.name}</h2><p className="mt-3 leading-relaxed text-[var(--moss)]">{selected.role}</p></> : <div className="mt-8 text-center"><Eye className="mx-auto size-10 text-[var(--leaf)]" /><p className="mt-3 font-bold">Pilih penanda untuk mulai mengamati.</p></div>}
        <Button onClick={onDone} disabled={seen.size < 6} className="mt-7 h-12 w-full rounded-xl bg-[var(--forest)] text-white">Lanjut setelah 6 temuan <ArrowRight /></Button>
      </aside>
    </section>
  );
}

function FactorScreen({ onDone }: { onDone: () => void }) {
  const factors = [
    ['Air', 'Menjaga proses kehidupan dan menjadi habitat organisme air.'],
    ['Cahaya', 'Memberikan energi bagi tumbuhan untuk membuat makanan.'],
    ['Udara', 'Menyediakan gas yang digunakan makhluk hidup.'],
    ['Tanah', 'Menjadi tempat tumbuh dan menyediakan unsur hara.'],
    ['Suhu', 'Memengaruhi kenyamanan dan proses kehidupan organisme.'],
  ];
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  return <LearningPanel eyebrow="Subunit 1 · Amati" title="Peran setiap komponen" step={`${seen.size}/5 dibuka`}><div className="grid gap-5 md:grid-cols-[0.85fr_1.15fr]"><div className="grid gap-2">{factors.map(([name], index) => <Button key={name} onClick={() => { setActive(index); setSeen((s) => new Set(s).add(index)); }} variant="outline" className={`h-12 justify-between rounded-xl px-4 ${active === index ? 'border-[var(--water)] bg-[var(--sky-pale)]' : ''}`}>{name}{seen.has(index) && <Check className="text-[var(--leaf)]" />}</Button>)}</div><div className="rounded-2xl bg-[var(--sky-pale)] p-6"><Sun className="size-8 text-[var(--sun)]" /><h2 className="mt-4 text-2xl font-black text-[var(--forest)]">{factors[active][0]}</h2><p className="mt-2 leading-relaxed text-[var(--moss)]">{factors[active][1]}</p><p className="mt-5 text-sm font-semibold text-[var(--water)]">Komponen abiotik tidak hidup, tetapi sangat memengaruhi makhluk hidup.</p></div></div><FooterNav onNext={onDone} disabled={seen.size < 4} nextLabel="Lanjut ke pasangan peran" /></LearningPanel>;
}

function EnergyIntro({ onDone }: { onDone: () => void }) {
  const [played, setPlayed] = useState(false);
  const nodes = ['☀️ Matahari', '🌿 Rumput', '🦗 Belalang', '🐸 Katak', '🦅 Elang'];
  return <LearningPanel eyebrow="Subunit 2 · Amati" title="Energi di dalam ekosistem"><p className="text-lg text-[var(--moss)]">Tekan tombol untuk mengikuti perjalanan energi dari sumbernya.</p><div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-3xl bg-[var(--forest)] p-6 text-white">{nodes.map((node, index) => <div key={node} className={`flex items-center gap-2 transition ${played ? 'opacity-100' : index ? 'opacity-35' : ''}`} style={{ transitionDelay: `${index * 180}ms` }}><span className="rounded-xl bg-white/10 px-3 py-3 font-bold">{node}</span>{index < nodes.length - 1 && <ArrowRight className={played ? 'text-[var(--sun)]' : 'text-white/30'} />}</div>)}</div>{played ? <Feedback ok text="Energi bermula dari Matahari, ditangkap tumbuhan, lalu berpindah melalui proses makan dan dimakan." /> : <Button onClick={() => setPlayed(true)} className="mt-5 h-12 rounded-xl bg-[var(--sun)] px-5 font-bold text-[var(--forest)] hover:bg-yellow-300"><Sparkles /> Alirkan energi</Button>}<FooterNav onNext={onDone} disabled={!played} nextLabel="Kenali peran organisme" /></LearningPanel>;
}

function SequenceScreen({ onDone }: { onDone: () => void }) {
  const chains = [
    ['Matahari', 'Rumput', 'Belalang', 'Katak', 'Ular', 'Elang'],
    ['Matahari', 'Tumbuhan berbiji', 'Tikus', 'Ular', 'Elang'],
  ];
  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const pool = useMemo(() => [...chains[round]].sort((a, b) => a.localeCompare(b)), [round]);
  const choose = (item: string) => {
    if (sequence.includes(item) || feedback?.ok) return;
    const expected = chains[round][sequence.length];
    if (item === expected) {
      const next = [...sequence, item]; setSequence(next);
      if (next.length === chains[round].length) setFeedback({ ok: true, text: 'Urutan benar. Setiap panah mengikuti perpindahan energi menuju organisme berikutnya.' });
    } else setFeedback({ ok: false, text: sequence.length === 0 ? 'Mulailah dari sumber energi utama ekosistem.' : `Sesudah ${sequence.at(-1)}, cari organisme yang menerima energi berikutnya.` });
  };
  const advance = () => { if (round === 1) onDone(); else { setRound(1); setSequence([]); setFeedback(null); } };
  return <LearningPanel eyebrow="Subunit 2 · I6" title="Susun rantai makanan" step={`Rantai ${round + 1} dari 2`}><p className="text-[var(--moss)]">Klik kartu sesuai urutan. Panah menunjukkan energi berpindah ke kanan.</p><div className="mt-5 min-h-20 rounded-2xl border-2 border-dashed border-[var(--leaf)]/30 bg-[var(--leaf-pale)]/50 p-4"><div className="flex flex-wrap items-center gap-2">{sequence.length ? sequence.map((item, index) => <span key={item} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 font-bold shadow-sm">{item}{index < sequence.length - 1 && <ArrowRight className="text-[var(--leaf)]" />}</span>) : <span className="text-sm font-semibold text-[var(--moss)]">Urutanmu akan muncul di sini.</span>}</div></div><div className="mt-5 flex flex-wrap gap-3">{pool.map((item) => <Button key={item} onClick={() => choose(item)} disabled={sequence.includes(item)} variant="outline" className="h-11 rounded-xl border-black/15 bg-white">{item}</Button>)}</div>{feedback && <Feedback ok={feedback.ok} text={feedback.text} hint="Ikuti aliran energi." onRetry={() => setFeedback(null)} />}{feedback?.ok && <Button onClick={advance} className="mt-5 h-12 rounded-xl bg-[var(--forest)] px-5 text-white">{round === 1 ? 'Selesaikan aktivitas' : 'Susun rantai kedua'} <ArrowRight /></Button>}</LearningPanel>;
}

function WebBuilder({ onDone }: { onDone: () => void }) {
  const links = [
    ['Rumput → Belalang', true], ['Rumput → Tikus', true], ['Daun → Ulat', true],
    ['Belalang → Katak', true], ['Ulat → Burung', true], ['Tikus → Ular', true],
    ['Katak → Ular', true], ['Ular → Elang', true], ['Burung → Elang', true],
    ['Elang → Rumput', false], ['Katak → Cahaya', false], ['Ular → Tumbuhan', false],
  ] as const;
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const choose = (label: string, valid: boolean) => {
    if (chosen.has(label)) return;
    if (valid) { setChosen((current) => new Set(current).add(label)); setFeedback({ ok: true, text: `${label} menunjukkan energi berpindah dari makanan menuju pemakannya.` }); }
    else setFeedback({ ok: false, text: 'Hubungan itu tidak sesuai dengan jaring-jaring kebun. Ingat: panah berasal dari yang dimakan.' });
  };
  return <LearningPanel eyebrow="Subunit 2 · I7" title="Bangun jaring-jaring makanan" step={`${chosen.size}/7 hubungan`}><p className="text-[var(--moss)]">Pilih sedikitnya tujuh hubungan yang benar. Satu organisme boleh memiliki lebih dari satu hubungan.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{links.map(([label, valid]) => <Button key={label} onClick={() => choose(label, valid)} disabled={chosen.has(label)} variant="outline" className={`min-h-12 h-auto justify-start rounded-xl px-4 py-3 ${chosen.has(label) ? 'border-[var(--leaf)] bg-[var(--leaf-pale)] text-[var(--forest)]' : 'border-black/15 bg-white'}`}>{chosen.has(label) && <Check />} {label}</Button>)}</div>{feedback && <Feedback ok={feedback.ok} text={feedback.text} hint="Cari siapa memakan siapa, lalu arahkan energi ke pemakan." onRetry={!feedback.ok ? () => setFeedback(null) : undefined} />}{chosen.size >= 7 && <Button onClick={onDone} className="mt-5 h-12 rounded-xl bg-[var(--forest)] px-5 text-white">Jaring-jaring terbentuk <ArrowRight /></Button>}</LearningPanel>;
}

function SummaryScreen({ onDone }: { onDone: () => void }) {
  const ideas = [
    ['Komponen', 'Ekosistem tersusun atas komponen biotik dan abiotik.'],
    ['Peran', 'Setiap komponen mempunyai fungsi dan saling membutuhkan.'],
    ['Energi', 'Energi mengalir dari Matahari ke produsen lalu konsumen.'],
    ['Keseimbangan', 'Perubahan satu komponen dapat memengaruhi komponen lain.'],
  ];
  const [opened, setOpened] = useState<Set<number>>(new Set());
  return <LearningPanel eyebrow="Rangkuman Unit" title="Empat simpul harmoni" step={`${opened.size}/4 dibuka`}><div className="grid gap-4 sm:grid-cols-2">{ideas.map(([title, text], index) => <button key={title} onClick={() => setOpened((current) => new Set(current).add(index))} className={`min-h-36 rounded-2xl border p-5 text-left transition ${opened.has(index) ? 'border-[var(--leaf)] bg-[var(--leaf-pale)]' : 'border-black/10 bg-[var(--paper)] hover:-translate-y-1 hover:shadow-md'}`}><span className="text-sm font-black uppercase tracking-wider text-[var(--leaf)]">0{index + 1}</span><h2 className="mt-2 text-xl font-black text-[var(--forest)]">{title}</h2><p className={`mt-2 text-sm leading-relaxed text-[var(--moss)] ${opened.has(index) ? 'block' : 'hidden'}`}>{text}</p>{!opened.has(index) && <p className="mt-2 text-sm font-semibold text-[var(--moss)]">Klik untuk membuka</p>}</button>)}</div><FooterNav onNext={onDone} disabled={opened.size < 4} nextLabel="Lanjut ke refleksi" /></LearningPanel>;
}

export default function Home() {
  const [screen, setScreen] = useState(1);
  const [resumeScreen, setResumeScreen] = useState(4);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [demoDone, setDemoDone] = useState(false);
  const [warmup, setWarmup] = useState<Set<string>>(new Set());
  const [reflection, setReflection] = useState('');

  const progress = Math.round((completed.size / 21) * 100);
  const finish = (id: number, next = id + 1) => { setCompleted((current) => new Set(current).add(id)); setScreen(next); };
  const goMap = () => { if (screen !== 3) setResumeScreen(screen > 3 ? screen : 4); setScreen(3); };
  const restart = () => { setScreen(1); setResumeScreen(4); setCompleted(new Set()); setDemoDone(false); setWarmup(new Set()); setReflection(''); };

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: 'open_learning_section',
        title: 'Buka bagian pembelajaran',
        description: 'Membuka Subunit 1 atau Subunit 2 pada media Harmoni dalam Ekosistem.',
        inputSchema: { type: 'object', properties: { subunit: { type: 'integer', enum: [1, 2] } }, required: ['subunit'], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const value = (input as { subunit?: unknown })?.subunit;
          if (value !== 1 && value !== 2) throw new Error('subunit harus bernilai 1 atau 2');
          const target = value === 1 ? 4 : 12;
          setScreen(target); setResumeScreen(target);
          return { opened: true, subunit: value, screen: target };
        },
      }, { signal: lifecycle.signal })).catch(() => undefined);
    } catch { /* Browser tanpa WebMCP tetap dapat menggunakan antarmuka biasa. */ }
    return () => lifecycle.abort();
  }, []);

  const header = screen > 1 && screen < 22 ? <header className="sticky top-0 z-40 border-b border-black/10 bg-[var(--paper)]/90 px-5 py-3 backdrop-blur md:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--leaf)] text-white shadow-sm"><Leaf className="size-5" /></span><div className="min-w-0"><p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-[var(--moss)]">Layar {screen} dari 22</p><p className="truncate font-semibold">{screenNames[screen - 1]}</p></div></div><div className="hidden min-w-56 md:block"><div className="mb-1 flex justify-between text-xs font-semibold text-[var(--moss)]"><span>Progres belajar</span><span>{progress}%</span></div><Progress value={progress} className="[&_[data-slot=progress-indicator]]:bg-[var(--sun)] [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-black/10" /></div><Button onClick={goMap} variant="outline" className="h-10 rounded-xl border-black/15 bg-white/80 px-4"><Map /> <span className="hidden sm:inline">Peta belajar</span></Button></div></header> : null;

  let content: React.ReactNode;
  switch (screen) {
    case 1:
      content = <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-5 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-8"><div className="relative z-10 max-w-xl"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--sun)]/40 bg-[var(--sun-pale)] px-3 py-1.5 text-sm font-bold text-[var(--soil)]"><Sparkles className="size-4" /> Ekspedisi Pengamat Ekosistem</div><h1 className="font-display text-5xl leading-[0.98] font-black tracking-[-0.04em] text-[var(--forest)] sm:text-6xl">Lihat yang hidup. Temukan yang menghubungkan.</h1><p className="mt-5 max-w-lg text-lg leading-relaxed text-[var(--moss)]">Jelajahi kebun dan kolam, susun rantai makanan, lalu cari tahu apa yang terjadi saat ekosistem berubah.</p><Button onClick={() => finish(1, 2)} size="lg" className="mt-7 h-14 rounded-2xl bg-[var(--forest)] px-6 text-base text-white shadow-[0_8px_0_var(--moss)] hover:bg-[var(--leaf)]">Mulai mengamati <ArrowRight /></Button><div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-[var(--moss)]"><span className="rounded-full bg-white/70 px-3 py-2">2 subunit</span><span className="rounded-full bg-white/70 px-3 py-2">8 aktivitas</span><span className="rounded-full bg-white/70 px-3 py-2">± 20 menit</span></div></div><div className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-[var(--sky)] shadow-[0_28px_80px_rgba(24,77,63,0.2)]"><EcosystemImage /><div className="absolute inset-x-5 bottom-5 rounded-2xl bg-[var(--forest)]/90 p-4 text-white backdrop-blur-sm"><p className="font-semibold">Tantangan pertamamu</p><p className="mt-1 text-sm text-white/80">Temukan komponen hidup dan tidak hidup di dalam gambar.</p></div></div></section>;
      break;
    case 2:
      content = <LearningPanel eyebrow="Sebelum mulai" title="Cara menggunakan media"><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-[var(--leaf-pale)] p-5"><Compass className="text-[var(--leaf)]" /><h2 className="mt-3 font-bold">Amati dan pilih</h2><p className="mt-1 text-sm text-[var(--moss)]">Klik objek, kartu, atau jawaban untuk menunjukkan pemahamanmu.</p></div><div className="rounded-2xl bg-[var(--sky-pale)] p-5"><Lightbulb className="text-[var(--water)]" /><h2 className="mt-3 font-bold">Gunakan petunjuk</h2><p className="mt-1 text-sm text-[var(--moss)]">Jika belum tepat, baca alasan lalu coba kembali tanpa penalti.</p></div></div><button onClick={() => setDemoDone(true)} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 font-bold transition ${demoDone ? 'border-[var(--leaf)] bg-[var(--leaf-pale)] text-[var(--forest)]' : 'border-[var(--sun)] bg-[var(--sun-pale)] text-[var(--soil)]'}`}>{demoDone ? <><CheckCircle2 /> Siap! Kontrol berhasil dicoba.</> : <><Eye /> Klik untuk mencoba satu kontrol</>}</button><FooterNav onNext={() => finish(2, 3)} disabled={!demoDone} nextLabel="Buka peta belajar" /></LearningPanel>;
      break;
    case 3:
      content = <LearningPanel eyebrow="Peta Belajar" title="Pilih bagian yang ingin dijelajahi"><div className="grid gap-5 md:grid-cols-2"><button onClick={() => setScreen(4)} className="group rounded-3xl border border-black/10 bg-[var(--leaf-pale)] p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"><span className="grid size-12 place-items-center rounded-2xl bg-[var(--leaf)] text-white"><Leaf /></span><p className="mt-5 text-sm font-black uppercase tracking-wider text-[var(--leaf)]">Bagian 1 · TP1–TP5</p><h2 className="mt-1 text-2xl font-black text-[var(--forest)]">Berkenalan dengan Ekosistem</h2><p className="mt-2 text-sm leading-relaxed text-[var(--moss)]">Kenali komponen biotik, abiotik, fungsi, dan hubungannya.</p><span className="mt-5 inline-flex items-center gap-2 font-bold text-[var(--forest)]">{completed.has(11) ? 'Ulangi bagian' : 'Mulai bagian'} <ArrowRight /></span></button><button onClick={() => setScreen(12)} className="group rounded-3xl border border-black/10 bg-[var(--sky-pale)] p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"><span className="grid size-12 place-items-center rounded-2xl bg-[var(--water)] text-white"><Network /></span><p className="mt-5 text-sm font-black uppercase tracking-wider text-[var(--water)]">Bagian 2 · TP6–TP12</p><h2 className="mt-1 text-2xl font-black text-[var(--forest)]">Interaksi Antar Komponen</h2><p className="mt-2 text-sm leading-relaxed text-[var(--moss)]">Susun rantai, bangun jaring-jaring, dan analisis perubahan.</p><span className="mt-5 inline-flex items-center gap-2 font-bold text-[var(--forest)]">{completed.has(19) ? 'Ulangi bagian' : 'Mulai bagian'} <ArrowRight /></span></button></div>{resumeScreen > 3 && <FooterNav onNext={() => setScreen(resumeScreen)} nextLabel="Lanjutkan dari layar terakhir" />}</LearningPanel>;
      break;
    case 4:
      content = <LearningPanel eyebrow="Subunit 1 · Pemantik" title="Apa yang ada di sini?"><div className="overflow-hidden rounded-2xl"><EcosystemImage compact /></div><p className="mt-5 text-lg font-bold text-[var(--forest)]">Pilih tiga hal yang menurutmu merupakan bagian dari ekosistem.</p><div className="mt-4 flex flex-wrap gap-3">{['Pohon', 'Air', 'Katak', 'Tanah', 'Cahaya', 'Jamur'].map((item) => <Button key={item} onClick={() => setWarmup((current) => new Set(current).add(item))} variant="outline" className={`h-11 rounded-xl ${warmup.has(item) ? 'border-[var(--leaf)] bg-[var(--leaf-pale)]' : 'border-black/15 bg-white'}`}>{warmup.has(item) && <Check />} {item}</Button>)}</div>{warmup.size >= 3 && <Feedback ok text="Semuanya dapat menjadi bagian ekosistem. Ekosistem mencakup makhluk hidup dan unsur tidak hidup di lingkungannya." />}<FooterNav onNext={() => finish(4, 5)} disabled={warmup.size < 3} nextLabel="Jelajahi lebih dekat" /></LearningPanel>;
      break;
    case 5: content = <ExploreScreen onDone={() => finish(5, 6)} />; break;
    case 6: content = <ChoiceQuiz key="quiz-6" eyebrow="Subunit 1 · Pahami" title="Dua kelompok komponen" questions={[{ prompt: 'Pohon tidak berpindah tempat. Apakah itu berarti pohon termasuk abiotik?', options: ['Ya, karena pohon diam', 'Tidak, karena pohon tetap melakukan proses kehidupan'], answer: 1, explanation: 'Gerak bukan satu-satunya ciri makhluk hidup. Pohon tumbuh, bernapas, dan membutuhkan air.', hint: 'Perhatikan proses kehidupan, bukan hanya perpindahan tempat.' }]} onDone={() => finish(6, 7)} />; break;
    case 7: content = <ChoiceQuiz key="quiz-7" eyebrow="Subunit 1 · I2" title="Biotik atau abiotik?" questions={groupingQuestions} onDone={() => finish(7, 8)} />; break;
    case 8: content = <FactorScreen onDone={() => finish(8, 9)} />; break;
    case 9: content = <ChoiceQuiz key="quiz-9" eyebrow="Subunit 1 · I3" title="Siapa berperan apa?" questions={roleQuestions} onDone={() => finish(9, 10)} />; break;
    case 10: content = <ChoiceQuiz key="quiz-10" eyebrow="Subunit 1 · I4" title="Apa yang terjadi jika…?" questions={changeQuestions} onDone={() => finish(10, 11)} />; break;
    case 11:
      content = <LearningPanel eyebrow="Bukti Belajar 1" title="Komponen bekerja bersama"><div className="grid gap-3"><div className="concept-row"><span>Ekosistem</span><ArrowRight /><span>Biotik + Abiotik</span></div><div className="concept-row"><span>Setiap komponen</span><ArrowRight /><span>Mempunyai fungsi</span></div><div className="concept-row"><span>Satu komponen berubah</span><ArrowRight /><span>Komponen lain dapat terdampak</span></div></div><div className="mt-6 flex items-center gap-4 rounded-2xl bg-[var(--sun-pale)] p-5"><Trophy className="size-10 shrink-0 text-[var(--sun)]" /><div><p className="font-black text-[var(--forest)]">Bukti Belajar 1 siap diperoleh</p><p className="text-sm text-[var(--moss)]">Kamu telah mengenali komponen, fungsi, dan hubungan di dalam ekosistem.</p></div></div><FooterNav onNext={() => finish(11, 12)} nextLabel="Dapatkan bukti & lanjut" /></LearningPanel>;
      break;
    case 12: content = <EnergyIntro onDone={() => finish(12, 13)} />; break;
    case 13: content = <ChoiceQuiz key="quiz-13" eyebrow="Subunit 2 · I5" title="Kenali perannya" questions={trophicQuestions} onDone={() => finish(13, 14)} />; break;
    case 14: content = <ChoiceQuiz key="quiz-14" eyebrow="Subunit 2 · Pahami" title="Ikuti aliran energi" questions={arrowQuestions} onDone={() => finish(14, 15)} />; break;
    case 15: content = <SequenceScreen onDone={() => finish(15, 16)} />; break;
    case 16: content = <ChoiceQuiz key="quiz-16" eyebrow="Subunit 2 · Amati" title="Dari rantai menjadi jaring" questions={[{ prompt: 'Rantai A: rumput → belalang → katak. Rantai B: rumput → belalang → burung. Organisme mana yang menghubungkan kedua rantai?', options: ['Rumput dan belalang', 'Katak saja', 'Burung saja'], answer: 0, explanation: 'Rumput dan belalang muncul pada kedua rantai. Rantai yang berbagi organisme dapat terhubung menjadi jaring-jaring makanan.', hint: 'Cari nama yang muncul pada kedua urutan.' }]} onDone={() => finish(16, 17)} />; break;
    case 17: content = <WebBuilder onDone={() => finish(17, 18)} />; break;
    case 18: content = <ChoiceQuiz key="quiz-18" eyebrow="Subunit 2 · I8" title="Ekosistem berubah" questions={ecosystemChangeQuestions} onDone={() => finish(18, 19)} />; break;
    case 19:
      content = <LearningPanel eyebrow="Bukti Belajar 2" title="Energi menghubungkan organisme"><div className="rounded-3xl bg-[var(--forest)] p-6 text-white"><div className="flex flex-wrap items-center justify-center gap-3 text-center font-black"><span className="flow-node">☀️ Matahari</span><ArrowRight className="text-[var(--sun)]" /><span className="flow-node">🌿 Produsen</span><ArrowRight className="text-[var(--sun)]" /><span className="flow-node">🐾 Konsumen</span><ArrowRight className="text-[var(--sun)]" /><span className="flow-node">🍄 Pengurai</span></div><p className="mt-5 text-center text-sm text-white/75">Beberapa rantai yang berbagi organisme membentuk jaring-jaring makanan.</p></div><div className="mt-6 flex items-center gap-4 rounded-2xl bg-[var(--sky-pale)] p-5"><Trophy className="size-10 shrink-0 text-[var(--water)]" /><div><p className="font-black text-[var(--forest)]">Bukti Belajar 2 siap diperoleh</p><p className="text-sm text-[var(--moss)]">Kamu telah menelusuri aliran energi dan memprediksi perubahan ekosistem.</p></div></div><FooterNav onNext={() => { setCompleted((c) => new Set(c).add(19)); setScreen(completed.has(11) ? 20 : 3); }} nextLabel={completed.has(11) ? 'Dapatkan bukti & rangkum' : 'Lengkapi Bagian 1'} /></LearningPanel>;
      break;
    case 20: content = <SummaryScreen onDone={() => finish(20, 21)} />; break;
    case 21:
      content = <LearningPanel eyebrow="Refleksi" title="Bagaimana pemahamanmu sekarang?"><p className="text-[var(--moss)]">Pilih pernyataan yang paling sesuai. Jawaban ini hanya digunakan pada sesi ini.</p><div className="mt-5 grid gap-3">{['Saya sudah paham dan dapat menjelaskan kembali.', 'Saya paham, tetapi ingin mencoba beberapa aktivitas lagi.', 'Saya masih memerlukan bantuan pada beberapa konsep.'].map((option) => <Button key={option} onClick={() => setReflection(option)} variant="outline" className={`min-h-14 h-auto justify-start rounded-2xl px-5 py-3 text-left whitespace-normal ${reflection === option ? 'border-[var(--leaf)] bg-[var(--leaf-pale)]' : 'border-black/15 bg-white'}`}>{reflection === option && <Check />} {option}</Button>)}</div>{reflection && <Feedback ok text={reflection.includes('bantuan') ? 'Tidak apa-apa. Gunakan Peta Belajar untuk mengulang bagian yang masih sulit bersama guru.' : 'Refleksimu membantu menentukan langkah belajar berikutnya.'} />}<FooterNav onNext={() => finish(21, 22)} disabled={!reflection} nextLabel="Selesaikan pembelajaran" /></LearningPanel>;
      break;
    default:
      content = <section className="mx-auto grid min-h-screen max-w-4xl place-items-center px-5 py-10"><div className="w-full rounded-[2.5rem] border border-black/10 bg-white p-8 text-center shadow-[0_28px_90px_rgba(22,78,62,0.15)] md:p-12"><span className="mx-auto grid size-20 place-items-center rounded-full bg-[var(--sun-pale)] text-[var(--sun)]"><Trophy className="size-10" /></span><p className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-[var(--leaf)]">Pembelajaran selesai</p><h1 className="font-display mt-2 text-4xl font-black text-[var(--forest)] md:text-5xl">Kamu menemukan harmoni di dalam ekosistem.</h1><p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-[var(--moss)]">Makhluk hidup dan unsur tak hidup saling terhubung. Perubahan satu bagian dapat memengaruhi keseimbangan keseluruhan.</p><div className="mx-auto mt-7 grid max-w-lg gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[var(--leaf-pale)] p-4"><CheckCircle2 className="mx-auto text-[var(--leaf)]" /><p className="mt-2 font-bold">Bukti Belajar 1</p><p className="text-sm text-[var(--moss)]">Komponen & fungsi</p></div><div className="rounded-2xl bg-[var(--sky-pale)] p-4"><CheckCircle2 className="mx-auto text-[var(--water)]" /><p className="mt-2 font-bold">Bukti Belajar 2</p><p className="text-sm text-[var(--moss)]">Aliran & keseimbangan</p></div></div><Button onClick={restart} variant="outline" className="mt-8 h-12 rounded-xl border-black/15 px-5"><RotateCcw /> Ulangi dari awal</Button></div></section>;
  }

  return <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">{header}{content}</main>;
}
