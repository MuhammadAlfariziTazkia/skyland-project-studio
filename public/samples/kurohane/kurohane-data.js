/* KUROHANE BARBER STUDIO — centralized DEMO data & mock scheduling logic.
   All names, prices, schedules and records are fictional. Replace this file to connect real data.
   Concept demo built by Skyland Project Studio; see /samples/kurohane/index.html. */
(function () {
  const OPEN = 600, CLOSE = 1200, STEP = 30, WINDOW_DAYS = 60;
  const services = [
    { id: 'cut', cat: 'cut', name: 'カット', en: 'Haircut', min: 60, price: 6600, rec: true, desc: 'カウンセリングからシャンプー、仕上げのスタイリングまで。骨格と髪質に合わせて整えます。' },
    { id: 'fade', cat: 'cut', name: 'フェードカット', en: 'Fade Cut', min: 60, price: 7700, desc: '刈り上げ部分を細かく段階づけ、なめらかなグラデーションに。スキンフェードにも対応します。' },
    { id: 'student', cat: 'cut', name: '学生カット', en: 'Student Cut', min: 45, price: 4400, desc: '中学生・高校生・大学生の方へ。ご来店時に学生証をご提示ください。' },
    { id: 'shave', cat: 'shave', name: 'シェービング', en: 'Shave', min: 30, price: 3300, desc: '蒸しタオルで肌を温めてから、顔まわりを丁寧に剃り上げます。' },
    { id: 'cutshave', cat: 'course', name: 'カット＆シェービング', en: 'Cut & Shave', min: 90, price: 9900, rec: true, desc: 'カットとシェービングを一度に。身だしなみを一式で整えたい方に。' },
    { id: 'spa', cat: 'care', name: 'ヘッドスパ', en: 'Head Spa', min: 30, price: 4400, desc: '頭皮の状態を確認し、クレンジングとマッサージで心地よくほぐします。' },
    { id: 'perm', cat: 'care', name: 'パーマ', en: 'Perm', min: 120, price: 11000, desc: 'ツイスト、波巻きなど。カット込みの料金です。' },
    { id: 'grey', cat: 'care', name: 'グレイカラー', en: 'Grey Blending', min: 60, price: 5500, desc: '白髪を染めきらず、自然にぼかしてなじませる方法です。' },
    { id: 'premium', cat: 'course', name: 'プレミアムコース', en: 'Premium Course', min: 120, price: 13200, rec: true, desc: 'カット、シェービング、ヘッドスパ、眉カットを含む、時間をかけたコースです。' }
  ];
  const cats = [
    { id: 'cut', name: 'カット', en: 'Cut' }, { id: 'shave', name: 'シェービング', en: 'Shave' },
    { id: 'care', name: 'ケア・パーマ', en: 'Care & Perm' }, { id: 'course', name: 'コース', en: 'Course' }
  ];
  const barbers = [
    { id: 'kaito', name: '柊 海斗', en: 'Kaito Hiiragi', role: '代表 / ディレクター', roleEn: 'Director', fee: 550, off: [2, 1], lunch: 780, years: 14, color: '#29483F',
      spec: ['フェード', 'ビジネス', 'シェービング'], bio: '理容師歴14年。清潔感と扱いやすさを両立させる、細やかな刈り上げを得意とします。', styles: ['skinfade', 'business7', 'taper'] },
    { id: 'ren', name: '志水 蓮', en: 'Ren Shimizu', role: 'シニアバーバー', roleEn: 'Senior Barber', fee: 0, off: [2, 4], lunch: 810, years: 9, color: '#B76E50',
      spec: ['パーマ', 'カジュアル', 'ヘッドスパ'], bio: '動きのある質感づくりが得意。休日の装いに合う、力の抜けたスタイルを提案します。', styles: ['twist', 'wave', 'mash'] },
    { id: 'mio', name: '朝比奈 澪', en: 'Mio Asahina', role: 'バーバー', roleEn: 'Barber', fee: 0, off: [2, 3], lunch: 750, years: 7, color: '#5B6B8C',
      spec: ['ショート', 'グレイカラー', '眉カット'], bio: '骨格を読み、短くても柔らかい印象に仕上げます。白髪ぼかしのご相談も多くいただきます。', styles: ['natural', 'crop', 'centre'] },
    { id: 'minato', name: '早瀬 湊', en: 'Minato Hayase', role: 'バーバー', roleEn: 'Barber', fee: 0, off: [2, 0], lunch: 840, years: 4, color: '#7A6A3A',
      spec: ['フェード', 'クロップ', '学生カット'], bio: 'ラインの精度にこだわる若手。初めての方にも、ていねいに説明しながら進めます。', styles: ['buzz', 'softmohawk', 'skinfade'] }
  ];
  const styleCats = [
    { id: 'all', name: 'すべて' }, { id: 'short', name: 'ショート' }, { id: 'fade', name: 'フェード' },
    { id: 'perm', name: 'パーマ' }, { id: 'business', name: 'ビジネス' }, { id: 'casual', name: 'カジュアル' }
  ];
  const styles = [
    { id: 'skinfade', no: '01', name: 'スキンフェード', en: 'Skin Fade', cat: 'fade', service: 'fade', barber: 'kaito', cycle: '3〜4週間', shape: 'tall', desc: '地肌から自然につながるグラデーション。トップは長さを残し、横顔をすっきり見せます。' },
    { id: 'natural', no: '02', name: 'ナチュラルショート', en: 'Natural Short', cat: 'short', service: 'cut', barber: 'mio', cycle: '4〜5週間', shape: 'sq', desc: '手ぐしで整う、扱いやすいショート。毎朝のスタイリングは数分で済みます。' },
    { id: 'twist', no: '03', name: 'ツイストパーマ', en: 'Twist Perm', cat: 'perm', service: 'perm', barber: 'ren', cycle: '6〜8週間', shape: 'tall', desc: '束感のあるねじれで立体感を。ワックスを揉み込むだけで形が決まります。' },
    { id: 'business7', no: '04', name: '七三ビジネス', en: 'Side Part', cat: 'business', service: 'cut', barber: 'kaito', cycle: '3〜4週間', shape: 'wide', desc: '品のある分け目と短めのサイド。スーツにも休日の服にもなじみます。' },
    { id: 'crop', no: '05', name: 'クロップ', en: 'Textured Crop', cat: 'short', service: 'fade', barber: 'mio', cycle: '3〜4週間', shape: 'sq', desc: '前髪を短く揃え、トップに質感を。くせ毛の方にもおすすめです。' },
    { id: 'wave', no: '06', name: '波巻きパーマ', en: 'Wave Perm', cat: 'perm', service: 'perm', barber: 'ren', cycle: '6〜8週間', shape: 'sq', desc: 'ゆるやかな波で柔らかい印象に。乾かすだけでも形になります。' },
    { id: 'taper', no: '07', name: 'テーパーフェード', en: 'Taper Fade', cat: 'fade', service: 'fade', barber: 'kaito', cycle: '3〜4週間', shape: 'tall', desc: 'もみあげと襟足だけを短く絞る、控えめなフェード。職場でも浮きません。' },
    { id: 'centre', no: '08', name: 'センターパート', en: 'Centre Part', cat: 'casual', service: 'cut', barber: 'mio', cycle: '4〜6週間', shape: 'wide', desc: '中央で分けた前髪が額を自然に見せます。伸ばしかけの時期にも。' },
    { id: 'mash', no: '09', name: 'ソフトマッシュ', en: 'Soft Mash', cat: 'casual', service: 'cut', barber: 'ren', cycle: '4〜5週間', shape: 'sq', desc: '丸みのあるシルエットに軽さを加えた、親しみやすいスタイル。' },
    { id: 'buzz', no: '10', name: 'バズカット', en: 'Buzz Cut', cat: 'short', service: 'fade', barber: 'minato', cycle: '2〜3週間', shape: 'sq', desc: '頭の形を整えて見せる、潔い短髪。お手入れはほとんど不要です。' },
    { id: 'softmohawk', no: '11', name: 'ソフトモヒカン', en: 'Soft Mohawk', cat: 'casual', service: 'fade', barber: 'minato', cycle: '3〜4週間', shape: 'tall', desc: 'トップを立ち上げ、サイドを締めた動きのあるスタイル。' }
  ];
  const reviews = [
    { q: '初めてで緊張していましたが、最初に髪の悩みをじっくり聞いてもらえて安心しました。', who: '30代・会社員', svc: 'カット' },
    { q: '刈り上げのつながりがとてもきれいで、伸びてきても形が崩れにくいと感じます。', who: '40代・自営業', svc: 'フェードカット' },
    { q: 'シェービングの後、肌がつっぱらない。静かな店内で、良い休憩時間になりました。', who: '20代・学生', svc: 'カット＆シェービング' }
  ];
  const shop = {
    name: 'KUROHANE BARBER STUDIO', jp: '黒羽理容室',
    zip: '〒000-0000', addr: '東京都架空区黒羽町1-2-3 デモビル2F', addrNote: '※架空の住所です',
    tel: '00-0000-0000', telNote: '※デモ用の番号です',
    hours: '10:00 — 20:00', last: '最終受付 19:00（カット）', closed: '毎週火曜日・第3水曜日',
    access: '架空線「黒羽駅」A2出口より徒歩3分（デモ）',
    pay: ['現金', 'クレジットカード', '交通系IC', 'QRコード決済']
  };
  const custNames = ['佐藤 健一', '鈴木 大輔', '高橋 誠', '田中 翔', '伊藤 拓也', '渡辺 亮', '山本 悠真', '中村 颯', '小林 直樹', '加藤 陽介', '吉田 光', '山口 隼人', '松本 圭', '井上 蒼', '木村 修', '林 智也', '清水 航', '森 遼', '池田 慎', '橋本 匠'];

  function rng(seedStr) {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return function () { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  }
  const pad = (n) => String(n).padStart(2, '0');
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const iso = (dt) => dt.getUTCFullYear() + '-' + pad(dt.getUTCMonth() + 1) + '-' + pad(dt.getUTCDate());
  const addDays = (s, n) => { const d = parse(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  const dow = (s) => parse(s).getUTCDay();
  const WD = ['日', '月', '火', '水', '木', '金', '土'];
  function todayTokyo() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
  function nowMinTokyo() { const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()).split(':'); return (+p[0]) * 60 + (+p[1]); }
  const hm = (m) => pad(Math.floor(m / 60)) + ':' + pad(m % 60);
  const yen = (n) => '¥' + Number(n).toLocaleString('ja-JP');
  const fmt = (s) => { const d = parse(s); return (d.getUTCMonth() + 1) + '月' + d.getUTCDate() + '日（' + WD[d.getUTCDay()] + '）'; };
  const fmtLong = (s) => parse(s).getUTCFullYear() + '年' + fmt(s);
  function isClosed(s) { const d = parse(s); const w = d.getUTCDay(), day = d.getUTCDate(); return w === 2 || (w === 3 && day >= 15 && day <= 21); }
  function closedReason(s) { const w = dow(s); return w === 2 ? '定休日' : (isClosed(s) ? '第3水曜 定休' : ''); }
  const svc = (id) => services.find((x) => x.id === id);
  const barber = (id) => barbers.find((x) => x.id === id);
  const works = (b, s) => !isClosed(s) && !b.off.includes(dow(s));

  function genDay(s) {
    if (isClosed(s)) return [];
    const r = rng('kh' + s), w = dow(s), busy = (w === 0 || w === 6) ? 0.66 : 0.46;
    const today = todayTokyo(), now = nowMinTokyo(), out = [];
    const durs = ['cut', 'cut', 'fade', 'fade', 'cutshave', 'shave', 'spa', 'premium', 'student', 'perm', 'grey'];
    barbers.forEach((b) => {
      if (!works(b, s)) return;
      let t = OPEN;
      while (t < CLOSE) {
        if (t >= b.lunch && t < b.lunch + 60) { t = b.lunch + 60; continue; }
        if (r() < busy) {
          const sv = svc(durs[Math.floor(r() * durs.length)]);
          const end = t + sv.min;
          if (end <= CLOSE && !(t < b.lunch + 60 && end > b.lunch)) {
            let status = 'confirmed';
            if (s < today || (s === today && end <= now)) status = 'done';
            else if (s === today && t <= now) status = 'inprogress';
            else if (r() < 0.12) status = 'pending';
            const walkin = (s <= today) && r() < 0.14;
            if (r() < 0.05 && status !== 'done') status = 'canceled';
            out.push({ id: s + '-' + b.id + '-' + t, date: s, barber: b.id, start: t, min: sv.min, service: sv.id,
              customer: custNames[Math.floor(r() * custNames.length)], status, walkin, nominated: r() < 0.6, src: walkin ? 'walkin' : (r() < 0.7 ? 'web' : 'phone') });
            t = end; continue;
          }
        }
        t += STEP;
      }
    });
    return out;
  }
  function loadSession() { try { return JSON.parse(sessionStorage.getItem('kh_bookings') || '[]'); } catch (e) { return []; } }
  function saveSession(list) { try { sessionStorage.setItem('kh_bookings', JSON.stringify(list)); } catch (e) {} }
  function busy(s, ignoreRef) {
    const a = genDay(s).filter((x) => x.status !== 'canceled').map((x) => ({ barber: x.barber, start: x.start, min: x.min }));
    loadSession().filter((x) => x.date === s && x.status !== 'canceled' && x.ref !== ignoreRef).forEach((x) => a.push({ barber: x.barber, start: x.start, min: x.min }));
    return a;
  }
  function slotsFor(s, min, barberId, ignoreRef) {
    if (isClosed(s)) return [];
    const bs = barberId && barberId !== 'any' ? [barber(barberId)] : barbers;
    const taken = busy(s, ignoreRef), today = todayTokyo(), now = nowMinTokyo(), out = [];
    for (let t = OPEN; t + min <= CLOSE; t += STEP) {
      const free = bs.filter((b) => works(b, s) && !(t < b.lunch + 60 && t + min > b.lunch) &&
        !taken.some((x) => x.barber === b.id && t < x.start + x.min && t + min > x.start)).map((b) => b.id);
      const past = s < today || (s === today && t <= now + 30);
      out.push({ t, label: hm(t), ok: !past && free.length > 0, barbers: past ? [] : free });
    }
    return out;
  }
  function dayStatus(s, min, barberId) {
    const today = todayTokyo();
    if (s < today) return 'past';
    if (s > addDays(today, WINDOW_DAYS)) return 'out';
    if (isClosed(s)) return 'closed';
    if (barberId && barberId !== 'any' && !works(barber(barberId), s)) return 'off';
    const n = slotsFor(s, min, barberId).filter((x) => x.ok).length;
    return n === 0 ? 'full' : n <= 3 ? 'few' : n <= 9 ? 'some' : 'many';
  }
  const customers = custNames.slice(0, 14).map((n, i) => {
    const r = rng('c' + i);
    const b = barbers[Math.floor(r() * 4)];
    const visits = i % 5 === 3 ? 1 : 2 + Math.floor(r() * 22);
    return { id: 'C' + (1040 + i), name: n, visits, pref: visits > 1 ? b.id : null, last: addDays(todayTokyo(), -(3 + Math.floor(r() * 60))),
      next: r() < 0.5 ? addDays(todayTokyo(), 1 + Math.floor(r() * 20)) : null, fav: services[Math.floor(r() * 5)].id, isNew: visits === 1,
      memo: ['トップは長めを希望', '肌が敏感。シェービングは低刺激で', '毎回同じ長さで', 'つむじ付近に癖あり', ''][i % 5] };
  });
  window.KH = { OPEN, CLOSE, STEP, WINDOW_DAYS, services, cats, barbers, styleCats, styles, reviews, shop, customers,
    rng, pad, parse, iso, addDays, dow, WD, todayTokyo, nowMinTokyo, hm, yen, fmt, fmtLong, isClosed, closedReason,
    svc, barber, works, genDay, loadSession, saveSession, busy, slotsFor, dayStatus };
})();
