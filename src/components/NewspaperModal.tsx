/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { NewspaperData, toBanglaNumber } from '../types';
import { RotateCcw, Download, Share2, AlertCircle, Award, Check, Home } from 'lucide-react';

interface NewspaperModalProps {
  data: NewspaperData;
  onRestart: () => void;
  onClose?: () => void;
  onGoHome?: () => void;
}

export const NewspaperModal: React.FC<NewspaperModalProps> = ({ data, onRestart, onClose, onGoHome }) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const newspaperContainerRef = useRef<HTMLDivElement | null>(null);

  const handleShare = () => {
    const text = `📰 দৈনিক গেন্জাম ব্রেকিং নিউজ!\n${data.headline}\nমোট জাতীয় ক্ষতি: ৳${toBanglaNumber(data.totalLoss)}\n#DhakaCNG #DainikGenjam`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleDownloadPNG = () => {
    setIsExporting(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1600;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsExporting(false);
        return;
      }

      // Background newsprint paper
      ctx.fillStyle = '#f5efe0';
      ctx.fillRect(0, 0, 1080, 1600);

      // Paper aging texture & border
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 4;
      ctx.strokeRect(24, 24, 1032, 1552);
      ctx.lineWidth = 1;
      ctx.strokeRect(30, 30, 1020, 1540);

      // Header Masthead
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('যেখানে গন্ডগোল সেখানেই আমরা • ঢাকা সংস্করণ • বিশেষ সান্ধ্য সংখ্যা', 540, 72);

      // Title
      ctx.font = '900 82px "Noto Serif Bengali", serif';
      ctx.fillText('দৈনিক গেন্জাম', 540, 155);

      // Sub-bar
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 180);
      ctx.lineTo(1040, 180);
      ctx.stroke();

      ctx.font = '600 20px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`তারিখ: ${data.dateStr}`, 45, 208);
      ctx.textAlign = 'center';
      ctx.fillText(`সংখ্যা: ${data.issueNo} | মূল্য: ৳৫`, 540, 208);
      ctx.textAlign = 'right';
      ctx.fillText(`ঘটনাস্থল: ${data.roadName}`, 1035, 208);

      ctx.beginPath();
      ctx.moveTo(40, 222);
      ctx.lineTo(1040, 222);
      ctx.stroke();

      // Lead Headline
      ctx.fillStyle = '#990000';
      ctx.font = '900 42px "Noto Serif Bengali", serif';
      ctx.textAlign = 'center';
      ctx.fillText(data.headline, 540, 280);

      ctx.fillStyle = '#333333';
      ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
      ctx.fillText(data.subHeadline, 540, 318);

      // Screenshot Box (if available)
      if (data.screenshotUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 70, 350, 440, 290);
          ctx.strokeStyle = '#333333';
          ctx.lineWidth = 3;
          ctx.strokeRect(70, 350, 440, 290);

          ctx.fillStyle = '#444444';
          ctx.font = 'italic 16px "Hind Siliguri", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('ঘটনাস্থলের চিত্র: জনতার ভালোবাসায় অটোরিকশা এখন খণ্ডবিখণ্ড', 70, 662);

          finishExport(canvas);
        };
        img.onerror = () => finishExport(canvas);
        img.src = data.screenshotUrl;
        return;
      } else {
        finishExport(canvas);
      }
    } catch {
      setIsExporting(false);
    }
  };

  const finishExport = (canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = `dainik-genjam-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 pointer-events-auto">
      <div
        ref={newspaperContainerRef}
        className="relative w-full max-w-4xl bg-[#f6f0dd] text-neutral-900 shadow-2xl rounded-sm border-4 border-neutral-900 p-4 sm:p-7 font-serif leading-relaxed my-4"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), inset 0 0 40px rgba(180, 160, 120, 0.35)',
        }}
      >
        {/* Top Control Action Bar (Sticky in view) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-neutral-800 pb-3 mb-4 font-sans text-xs">
          <div className="flex items-center gap-1.5 bg-red-700 text-white font-bold px-3 py-1 rounded">
            <AlertCircle className="w-4 h-4" />
            <span>বিশেষ প্রকাশনা • জনস্বার্থে জারি</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 bg-amber-200 hover:bg-amber-300 border border-amber-600 px-3 py-1.5 rounded font-bold transition-all text-neutral-900"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে!' : 'শেয়ার করুন'}</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-1.5 rounded font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'তৈরি হচ্ছে...' : 'পত্রিকা ডাউনলোড (PNG)'}</span>
            </button>

            <button
              onClick={onRestart}
              className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-1.5 rounded font-black text-sm shadow transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>নতুন দিন শুরু</span>
            </button>
          </div>
        </div>

        {/* Newspaper Masthead */}
        <div className="text-center border-b-4 border-double border-neutral-900 pb-3 mb-4">
          <div className="text-[11px] sm:text-xs uppercase tracking-widest text-neutral-600 font-sans font-bold">
            যেখানে গন্ডগোল সেখানেই আমরা • ঢাকা সংস্করণ • বিশেষ সান্ধ্য সংস্করণ
          </div>
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-black text-neutral-950 tracking-tight my-1 select-none"
            style={{ fontFamily: '"Noto Serif Bengali", serif' }}
          >
            দৈনিক গেন্জাম
          </h1>
          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm font-sans font-medium text-neutral-700 border-t border-b border-neutral-700 py-1 px-2 mt-2">
            <span>{data.dateStr}</span>
            <span className="font-bold">বর্ষ ৪২ • {data.issueNo} • মূল্য: ৳৫</span>
            <span>ঘটনাস্থল: {data.roadName}</span>
          </div>
        </div>

        {/* Lead Headline Banner */}
        <div className="text-center my-4 border-b-2 border-neutral-800 pb-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-red-700 leading-tight">
            {data.headline}
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 font-sans font-semibold mt-1">
            {data.subHeadline}
          </p>
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
          {/* Left Column: Photo & Eyewitness Story (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* Halftone Newsprint Photo */}
            {data.screenshotUrl && (
              <div className="bg-neutral-900 p-1 rounded-xs shadow-md">
                <div className="relative overflow-hidden border border-neutral-700 bg-neutral-800">
                  <img
                    src={data.screenshotUrl}
                    alt="Scene of accident"
                    className="w-full h-52 sm:h-64 object-cover filter contrast-125 sepia-50 brightness-90"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-neutral-950/85 text-amber-200 text-[11px] p-2 font-sans italic">
                    ঘটনাস্থলের চিত্র: জনতার ভালোবাসায় অটোরিকশা এখন খণ্ডবিখণ্ড। চালক নিখোঁজ, কেটলি শহীদ।
                  </div>
                </div>
              </div>
            )}

            {/* Satirical Article Paragraphs */}
            <div className="text-xs sm:text-sm text-neutral-900 space-y-2.5 leading-relaxed text-justify">
              {data.articleParagraphs.map((p, idx) => (
                <p key={idx} className="indent-4">
                  {p}
                </p>
              ))}
            </div>

            {/* Eyewitness Quotes Box */}
            <div className="bg-[#ede4cb] border-l-4 border-neutral-900 p-3 text-xs italic space-y-1.5 rounded-r">
              <span className="font-bold font-sans not-italic text-neutral-800 uppercase text-[10px] tracking-wider block">
                প্রত্যক্ষদর্শীদের মন্তব্য:
              </span>
              {data.quotes.map((q, idx) => (
                <div key={idx}>
                  <strong className="not-italic text-neutral-900">{q.speaker}:</strong> "{q.quote}"
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Damage Table & Funny Side Columns (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            {/* Itemized National Loss Table */}
            <div className="bg-[#ede3c5] border-2 border-neutral-800 p-3 rounded">
              <div className="flex items-center justify-between border-b-2 border-neutral-800 pb-1 mb-2 font-sans font-bold text-xs uppercase text-neutral-900">
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-red-600" /> জাতীয় ক্ষয়ক্ষতির হিসাব
                </span>
                <span className="text-red-700 font-mono">
                  মোট: ৳{toBanglaNumber(data.totalLoss)}
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto pr-1 text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-400 text-neutral-600 font-sans">
                      <th className="py-1">আইটেম</th>
                      <th className="py-1 text-center">সংখ্যা</th>
                      <th className="py-1 text-right">খরচ (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-2 text-neutral-500 italic">
                          কোনো উল্লেখযোগ্য ধ্বংসযজ্ঞ ঘটেনি!
                        </td>
                      </tr>
                    ) : (
                      data.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-neutral-300">
                          <td className="py-1 font-semibold">{item.nameBangla}</td>
                          <td className="py-1 text-center font-mono">{toBanglaNumber(item.count)}</td>
                          <td className="py-1 text-right font-mono font-bold text-red-700">
                            {toBanglaNumber(item.totalCost)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Slapstick Unit Equivalencies */}
              <div className="mt-3 pt-2 border-t border-neutral-400 font-sans text-[11px] text-neutral-800 space-y-1">
                <div className="font-bold text-[10px] uppercase text-neutral-600">
                  ক্ষয়ক্ষতির তুলনামূলক মূল্যমান:
                </div>
                <div>🥚 এই টাকায় কেনা যেত: <strong className="text-amber-800">{toBanglaNumber(data.eggComparison)}</strong> টি সেদ্ধ ডিম</div>
                <div>🫖 কিংবা: <strong className="text-amber-800">{toBanglaNumber(data.kettleComparison)}</strong> টি চায়ের কেটলি</div>
                <div>🔩 কিংবা: <strong className="text-amber-800">{data.bridgeBoltComparison}</strong></div>
                <div className="pt-1.5 border-t border-neutral-300 font-bold text-neutral-900 flex items-center justify-between">
                  <span>চালকের অবশিষ্ট ক্যাশ:</span>
                  <span className={`font-mono ${data.remainingMoney < 0 ? 'text-red-700' : 'text-emerald-800'}`}>
                    ৳{toBanglaNumber(data.remainingMoney)}
                  </span>
                </div>
              </div>
            </div>

            {/* Historical Top Records from LocalStorage */}
            {data.historicalRecords && data.historicalRecords.length > 0 && (
              <div className="bg-[#f0e8d3] border border-neutral-700 p-2.5 rounded font-sans text-xs">
                <div className="font-bold text-neutral-800 border-b border-neutral-400 pb-1 mb-1.5 flex items-center justify-between">
                  <span>ইতিহাসের শীর্ষ ৩ জাতীয় ক্ষতি:</span>
                  <span className="text-[10px] text-neutral-500 font-bold">রেকর্ড বোর্ড</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  {data.historicalRecords.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="flex items-center justify-between text-neutral-700">
                      <span className="truncate max-w-[170px]">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {rec.headline}
                      </span>
                      <span className="font-mono font-bold text-red-700">
                        ৳{toBanglaNumber(rec.totalLoss)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Funny Fake Classified Ads */}
            <div className="border border-dashed border-neutral-700 p-2.5 font-sans text-[11px] bg-[#fbf6e8] space-y-2">
              <div className="text-center font-bold uppercase tracking-wider text-[10px] bg-neutral-900 text-white py-0.5">
                ক্লাসিফাইড বিজ্ঞাপন
              </div>
              {data.ads.map((ad, idx) => (
                <div key={idx} className="border-b border-neutral-300 pb-1.5 last:border-0 last:pb-0">
                  <div className="font-bold text-neutral-900">{ad.title}</div>
                  <div className="text-neutral-700 leading-snug">{ad.text}</div>
                  <div className="text-[10px] text-neutral-500 font-mono">যোগাযোগ: {ad.phone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Columns: Weather, Horoscope, Sports, Readers Letter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t-2 border-neutral-800 pt-3 font-sans text-xs text-neutral-800">
          <div className="bg-[#ede3c5] p-2 rounded">
            <span className="font-bold block text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1">
              ☀️ আজকের আবহাওয়া
            </span>
            <p className="text-[11px] text-neutral-700">
              উত্তপ্ত মেজাজ, ভারী ধুলোবালি ও আকস্মিক গণরোষের পূর্বাভাস। বৃষ্টির বদলে জুতো ছোঁড়ার সম্ভাবনা।
            </p>
          </div>

          <div className="bg-[#ede3c5] p-2 rounded">
            <span className="font-bold block text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1">
              🔮 দিনের রাশিফল (সিএনজি)
            </span>
            <p className="text-[11px] text-neutral-700">
              {data.horoscope}
            </p>
          </div>

          <div className="bg-[#ede3c5] p-2 rounded">
            <span className="font-bold block text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1">
              🏏 ক্রীড়া সংবাদ
            </span>
            <p className="text-[11px] text-neutral-700">
              {data.sportsScore}
            </p>
          </div>

          <div className="bg-[#ede3c5] p-2 rounded">
            <span className="font-bold block text-neutral-900 border-b border-neutral-400 pb-0.5 mb-1">
              ✉️ পাঠকের চিঠি
            </span>
            <p className="text-[11px] text-neutral-700">
              {data.readersLetter}
            </p>
          </div>
        </div>

        {/* Footer Call to Action Buttons */}
        <div className="mt-5 pt-3 border-t-4 border-double border-neutral-900 text-center font-sans flex flex-wrap items-center justify-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded shadow-md transition-all inline-flex items-center justify-center gap-1.5"
            >
              <span>✕ খেলায় ফিরুন</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className="px-6 py-2.5 bg-red-700 hover:bg-red-600 active:scale-95 text-white font-black text-sm rounded shadow-lg transition-all inline-flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>আবার খেলুন</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white font-bold text-sm rounded shadow-lg transition-all inline-flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'তৈরি হচ্ছে...' : 'পত্রিকা ডাউনলোড করুন (PNG)'}</span>
          </button>

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm rounded shadow-lg transition-all inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>মেনুতে ফিরুন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
