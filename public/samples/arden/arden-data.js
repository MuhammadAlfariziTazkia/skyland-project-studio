/* Arden Property Auction — prototype data + motion system. All content fictional.
   Concept demo built by Skyland Project Studio; see /samples/arden/index.html.
   Every date is generated relative to today so the prototype never reads as stale. */
(function () {
  if (window.ARDEN) return;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.7,.2,1)';

  var S = {
    live: { label: 'Live', fg: '#FFFFFF', bg: '#A63D2A', bd: '#A63D2A', pulse: 1 },
    closing: { label: 'Closing Soon', fg: '#8A4A1C', bg: '#F7E9DA', bd: '#E3C7A8', pulse: 1 },
    upcoming: { label: 'Upcoming', fg: '#172333', bg: '#FAFAF7', bd: '#172333' },
    registration: { label: 'Registration Open', fg: '#2F5240', bg: '#E4ECE4', bd: '#BFD2C1' },
    sold: { label: 'Sold', fg: '#FFFFFF', bg: '#202326', bd: '#202326' },
    passed: { label: 'Passed In', fg: '#4E565D', bg: '#ECEAE4', bd: '#D3D0C8' },
    withdrawn: { label: 'Withdrawn', fg: '#4E565D', bg: '#FAFAF7', bd: '#9AA0A6' },
    leading: { label: 'Leading', fg: '#2F5240', bg: '#E4ECE4', bd: '#BFD2C1' },
    outbid: { label: 'Outbid', fg: '#FFFFFF', bg: '#A63D2A', bd: '#A63D2A' }
  };

  var lots = [
    { id: 'cedar', lot: 'Lot 07', name: 'Cedar Residence', loc: 'Northbridge District', type: 'Residential', tenure: 'Freehold', guide: '¥68,000,000', g: 68, date: '18 Nov', time: '13:00', auction: 'The Meridian Property Collection', status: 'registration', reg: 'Registration open', spec: '4 bed · 212 m² · Built 2009', tone: '#857C6D', mode: 'Hybrid', x: 34, y: 28 },
    { id: 'harbor', lot: 'Lot 03', name: 'West Harbor Office Floor 14', loc: 'West Harbor', type: 'Commercial', tenure: 'Strata', guide: '¥142,000,000', g: 142, date: 'Today', time: '11:00', auction: 'West Harbor Commercial Session', status: 'live', reg: 'Registered bidders only', spec: '612 m² · Leased to 2029', tone: '#5F6872', mode: 'Online', x: 18, y: 62 },
    { id: 'greenfield', lot: 'Lot 11', name: 'Greenfield Residence No. 3', loc: 'Greenfield Residence', type: 'Residential', tenure: 'Freehold', guide: '¥54,500,000', g: 54.5, date: '21 Nov', time: '14:00', auction: 'Greenfield Residential Evening', status: 'closing', reg: 'Registration closes in 4 h', spec: '3 bed · 148 m² · Built 2016', tone: '#7F8676', mode: 'In-room', x: 66, y: 22 },
    { id: 'meridian', lot: 'Lot 14', name: 'Meridian Corner Building', loc: 'Meridian Business Quarter', type: 'Investment', tenure: 'Freehold', guide: '¥310,000,000', g: 310, date: '18 Nov', time: '15:00', auction: 'The Meridian Property Collection', status: 'upcoming', reg: 'Registration opens 4 Nov', spec: '7 floors · 1,940 m² · 92% let', tone: '#6E7468', mode: 'Hybrid', x: 48, y: 50 },
    { id: 'kaede', lot: 'Lot 02', name: 'Kaede Hill Development Site', loc: 'Kaede Hill', type: 'Land', tenure: 'Freehold', guide: '¥96,000,000', g: 96, date: '28 Nov', time: '11:00', auction: 'Land & Development Sites', status: 'upcoming', reg: 'Registration opens 5 Nov', spec: '1,840 m² · Zoned residential', tone: '#8E8270', mode: 'Online', x: 80, y: 40 },
    { id: 'linden', lot: 'Lot 19', name: 'Linden Court, 12 Apartments', loc: 'Linden Park', type: 'Investment', tenure: 'Freehold', guide: '¥228,000,000', g: 228, date: '18 Nov', time: '14:00', auction: 'The Meridian Property Collection', status: 'registration', reg: 'Registration open', spec: '12 units · 94% occupied', tone: '#737A82', mode: 'Hybrid', x: 58, y: 70 },
    { id: 'eastport', lot: 'Lot 01', name: 'Eastport Logistics Depot', loc: 'Eastport Industrial', type: 'Commercial', tenure: 'Leasehold', guide: '¥185,000,000', g: 185, date: '05 Nov', time: '10:00', auction: 'Eastport Industrial & Logistics', status: 'closing', reg: 'Registration closes tomorrow', spec: '4,200 m² · 9 m eaves', tone: '#7C7064', mode: 'Online', x: 88, y: 74 },
    { id: 'aster', lot: 'Lot 05', name: 'Aster Terrace House', loc: 'Northbridge District', type: 'Residential', tenure: 'Freehold', guide: '¥82,000,000', g: 82, date: '21 Nov', time: '15:00', auction: 'Greenfield Residential Evening', status: 'registration', reg: 'Registration open', spec: '4 bed · 236 m² · Built 1998', tone: '#8A7F73', mode: 'In-room', x: 28, y: 18 },
    { id: 'saito', lot: 'Lot 04', name: 'Former Regional Branch, Saito City', loc: 'Old Market Street, Saito City', type: 'Institutional', tenure: 'Freehold', guide: '¥120,000,000', g: 120, date: '25 Nov', time: '11:00', auction: 'Institutional Asset Disposal Programme', status: 'upcoming', reg: 'Registration opens 2 Nov', spec: '3 floors · 1,120 m² · Vacant', tone: '#6B6F73', mode: 'Online', x: 12, y: 36 },
    { id: 'riverside', lot: 'Lot 22', name: 'Riverside Apartment 806', loc: 'West Harbor', type: 'Residential', tenure: 'Strata', guide: '¥39,800,000', g: 39.8, date: '03 Dec', time: '13:00', auction: 'Investment Property Selection', status: 'upcoming', reg: 'Registration opens 10 Nov', spec: '2 bed · 74 m² · 8th floor', tone: '#76808A', mode: 'Hybrid', x: 24, y: 80 },
    { id: 'orchard', lot: 'Lot 06', name: 'Orchard Lane Retail Parade', loc: 'Meridian Business Quarter', type: 'Commercial', tenure: 'Freehold', guide: '¥164,000,000', g: 164, date: '25 Nov', time: '13:00', auction: 'Institutional Asset Disposal Programme', status: 'registration', reg: 'Registration open', spec: '6 units · 880 m²', tone: '#857A6A', mode: 'Online', x: 44, y: 34 },
    { id: 'hillcrest', lot: 'Lot 09', name: 'Hillcrest Plot 4', loc: 'Kaede Hill', type: 'Land', tenure: 'Freehold', guide: '¥31,000,000', g: 31, date: '28 Nov', time: '12:00', auction: 'Land & Development Sites', status: 'registration', reg: 'Registration open', spec: '612 m² · Services at boundary', tone: '#8C8676', mode: 'Online', x: 74, y: 58 }
  ];

  var events = [
    { id: 'e1', day: '05', mon: 'Nov', dow: 'Thu', name: 'Eastport Industrial & Logistics', lots: 6, cats: 'Commercial · Industrial', reg: 'Closes tomorrow', regKey: 'closing', mode: 'Online', time: '10:00 JST', venue: 'Arden Online Room' },
    { id: 'e2', day: '12', mon: 'Nov', dow: 'Thu', name: 'West Harbor Commercial Session', lots: 11, cats: 'Commercial · Office', reg: 'Registration closed', regKey: 'passed', mode: 'Hybrid', time: '11:00 JST', venue: 'Arden Hall, Meridian + Online' },
    { id: 'e3', day: '18', mon: 'Nov', dow: 'Wed', name: 'The Meridian Property Collection', lots: 24, cats: 'Residential · Investment', reg: 'Registration open', regKey: 'registration', mode: 'Hybrid', time: '12:00 JST', venue: 'Arden Hall, Meridian + Online' },
    { id: 'e4', day: '21', mon: 'Nov', dow: 'Sat', name: 'Greenfield Residential Evening', lots: 9, cats: 'Residential', reg: 'Registration open', regKey: 'registration', mode: 'In-room', time: '14:00 JST', venue: 'Greenfield Community Hall' },
    { id: 'e5', day: '25', mon: 'Nov', dow: 'Wed', name: 'Institutional Asset Disposal Programme', lots: 7, cats: 'Institutional · Commercial', reg: 'Opens 2 Nov', regKey: 'upcoming', mode: 'Online', time: '11:00 JST', venue: 'Arden Online Room' },
    { id: 'e6', day: '28', mon: 'Nov', dow: 'Sat', name: 'Land & Development Sites', lots: 12, cats: 'Land', reg: 'Opens 5 Nov', regKey: 'upcoming', mode: 'Online', time: '11:00 JST', venue: 'Arden Online Room' },
    { id: 'e7', day: '03', mon: 'Dec', dow: 'Thu', name: 'Investment Property Selection', lots: 16, cats: 'Investment · Residential', reg: 'Opens 10 Nov', regKey: 'upcoming', mode: 'Hybrid', time: '13:00 JST', venue: 'Arden Hall, Meridian + Online' },
    { id: 'e8', day: '10', mon: 'Dec', dow: 'Thu', name: 'Kaede Hill Residential', lots: 14, cats: 'Residential · Land', reg: 'Opens 17 Nov', regKey: 'upcoming', mode: 'Online', time: '12:00 JST', venue: 'Arden Online Room' }
  ];

  var results = [
    { name: 'Meridian Office Suite', loc: 'Meridian Business Quarter', type: 'Commercial', auction: 'Autumn Commercial Session', date: '24 Sep 2026', guide: '¥85M', sold: '¥93.5M', diff: '+10.0%', result: 'sold' },
    { name: 'Birchwood Family House', loc: 'Northbridge District', type: 'Residential', auction: 'September Residential', date: '17 Sep 2026', guide: '¥48M', sold: '¥52.8M', diff: '+10.0%', result: 'sold' },
    { name: 'Former Distribution Centre', loc: 'Eastport Industrial', type: 'Institutional', auction: 'Institutional Disposals III', date: '10 Sep 2026', guide: '¥240M', sold: '¥251M', diff: '+4.6%', result: 'sold' },
    { name: 'Linden Park Duplex', loc: 'Linden Park', type: 'Residential', auction: 'September Residential', date: '17 Sep 2026', guide: '¥61M', sold: '¥70.1M', diff: '+14.9%', result: 'sold' },
    { name: 'Hollow Lane Plot B', loc: 'Kaede Hill', type: 'Land', auction: 'Land Sites, Q3', date: '03 Sep 2026', guide: '¥22M', sold: '—', diff: 'Highest ¥19.5M', result: 'passed' },
    { name: 'Harbor View Retail Unit', loc: 'West Harbor', type: 'Commercial', auction: 'Autumn Commercial Session', date: '24 Sep 2026', guide: '¥36M', sold: '¥35.2M', diff: '−2.2%', result: 'sold' },
    { name: 'Saito Street Townhouse', loc: 'Saito City', type: 'Residential', auction: 'September Residential', date: '17 Sep 2026', guide: '¥39M', sold: '—', diff: 'Sold prior', result: 'withdrawn' },
    { name: 'Riverside Apartment 1204', loc: 'West Harbor', type: 'Residential', auction: 'August Selection', date: '27 Aug 2026', guide: '¥44M', sold: '¥49.3M', diff: '+12.0%', result: 'sold' },
    { name: 'Meridian Mixed-Use Block', loc: 'Meridian Business Quarter', type: 'Investment', auction: 'Investment Selection, Q3', date: '20 Aug 2026', guide: '¥410M', sold: '¥438M', diff: '+6.8%', result: 'sold' },
    { name: 'Greenfield Lot 14', loc: 'Greenfield Residence', type: 'Land', auction: 'Land Sites, Q3', date: '03 Sep 2026', guide: '¥28M', sold: '¥30.4M', diff: '+8.6%', result: 'sold' },
    { name: 'Northbridge Clinic Building', loc: 'Northbridge District', type: 'Institutional', auction: 'Institutional Disposals III', date: '10 Sep 2026', guide: '¥132M', sold: '—', diff: 'Highest ¥121M', result: 'passed' },
    { name: 'Aster Mews No. 2', loc: 'Northbridge District', type: 'Residential', auction: 'August Selection', date: '27 Aug 2026', guide: '¥57M', sold: '¥61.0M', diff: '+7.0%', result: 'sold' }
  ];

  var articles = [
    { id: 'a1', cat: 'Auction Guides', title: 'Understanding property auction guide prices', dek: 'A guide price is an indication, not a valuation. How guides are set, how they relate to reserves, and how to read them alongside the information pack.', read: '7 min', date: '02 Oct 2026', author: 'Arden Research Desk', tone: '#7F8676' },
    { id: 'a2', cat: 'Buying Property', title: 'How property inspections work', dek: 'What you can and cannot examine during an open inspection, and when to commission your own survey.', read: '5 min', date: '24 Sep 2026', author: 'Arden Research Desk', tone: '#857C6D' },
    { id: 'a3', cat: 'Auction Guides', title: 'Preparing for your first auction', dek: 'Registration, deposits, finance and what happens in the minutes after the gavel falls.', read: '9 min', date: '16 Sep 2026', author: 'Arden Research Desk', tone: '#737A82' },
    { id: 'a4', cat: 'Selling Property', title: 'Selling commercial property through auction', dek: 'When a defined timetable and open competition outperform private treaty for income-producing assets.', read: '8 min', date: '09 Sep 2026', author: 'Arden Research Desk', tone: '#6E7468' },
    { id: 'a5', cat: 'Market Insights', title: 'Quarterly clearance rates: a steadier third quarter', dek: 'Prototype analysis of fictional auction outcomes across residential and commercial sessions.', read: '6 min', date: '01 Sep 2026', author: 'Arden Research Desk', tone: '#8E8270' },
    { id: 'a6', cat: 'Property Investment', title: 'Reading a tenancy schedule before you bid', dek: 'Lease terms, rent reviews and break clauses: the five lines investors check first.', read: '6 min', date: '22 Aug 2026', author: 'Arden Research Desk', tone: '#5F6872' },
    { id: 'a7', cat: 'Selling Property', title: 'Estate and inheritance assets: a practical timeline', dek: 'How representatives can prepare a property for auction while probate matters are resolved.', read: '7 min', date: '12 Aug 2026', author: 'Arden Research Desk', tone: '#8A7F73' },
    { id: 'a8', cat: 'Buying Property', title: 'Deposits, buyer fees and settlement explained', dek: 'Every payment you make, when you make it, and where it is held.', read: '5 min', date: '01 Aug 2026', author: 'Arden Research Desk', tone: '#76808A' }
  ];

  var notifications = [
    { id: 'n1', kind: 'Bid status', title: 'You have been outbid', body: 'West Harbor Office Floor 14 — current bid ¥149,000,000.', time: '2 min ago', unread: true, alert: true, href: 'Auction%20Room.dc.html' },
    { id: 'n2', kind: 'Registration', title: 'Registration closes in 4 hours', body: 'Greenfield Residence No. 3 — complete your deposit to participate.', time: '1 h ago', unread: true, href: 'Property%20Lot.dc.html?lot=greenfield' },
    { id: 'n3', kind: 'Auction reminder', title: 'Auction begins tomorrow', body: 'Eastport Industrial & Logistics — 10:00 JST, online.', time: '3 h ago', unread: true, href: 'Calendar.dc.html' },
    { id: 'n4', kind: 'Inspection', title: 'Inspection booking confirmed', body: 'Cedar Residence — 10 Nov, 10:00–12:00.', time: 'Yesterday', unread: false, href: 'Property%20Lot.dc.html?lot=cedar' },
    { id: 'n5', kind: 'Documents', title: 'New document uploaded', body: 'Cedar Residence — Inspection Report (rev. 2) is now available.', time: 'Yesterday', unread: false, href: 'Property%20Lot.dc.html?lot=cedar#documents' },
    { id: 'n6', kind: 'Results', title: 'Auction result available', body: 'Meridian Office Suite — sold at ¥93,500,000.', time: '24 Sep', unread: false, href: 'Results.dc.html' }
  ];

  var WK = 'arden-watchlist';
  function watchlist() { try { var v = localStorage.getItem(WK); return v ? JSON.parse(v) : ['cedar', 'linden', 'kaede']; } catch (e) { return ['cedar', 'linden', 'kaede']; } }
  function isWatched(id) { return watchlist().indexOf(id) > -1; }
  function pop(el) { if (el && el.animate && !RM) el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 200, easing: 'ease-out' }); }
  function toggleWatch(id, el) {
    var w = watchlist(), i = w.indexOf(id);
    if (i > -1) { w.splice(i, 1); toast('Removed from watchlist'); } else { w.push(id); toast('Added to watchlist — saved in this browser'); }
    try { localStorage.setItem(WK, JSON.stringify(w)); } catch (e) {}
    pop(el);
    window.dispatchEvent(new Event('arden-watch'));
  }

  function demo(msg) { toast(msg); }
  function toast(msg, linkText, href) {
    var old = document.getElementById('arden-toast'); if (old) old.remove();
    var t = document.createElement('div'); t.id = 'arden-toast'; t.setAttribute('role', 'status');
    t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:9999;background:#172333;color:#FAFAF7;padding:14px 20px;border-radius:2px;font:500 14px/1.4 "IBM Plex Sans",sans-serif;display:flex;gap:14px;align-items:center;box-shadow:0 18px 40px -16px rgba(23,35,51,.45)';
    t.innerHTML = '<span style="width:7px;height:7px;background:#C4A27F;border-radius:50%;flex:none"></span><span>' + msg + '</span>' + (linkText ? '<a href="' + href + '" style="color:#E3CFB6;text-decoration:underline;text-underline-offset:3px">' + linkText + '</a>' : '');
    document.body.appendChild(t);
    if (!RM) t.animate([{ opacity: 0, transform: 'translate(-50%,10px)' }, { opacity: 1, transform: 'translate(-50%,0)' }], { duration: 260, easing: EASE });
    setTimeout(function () { if (!t.isConnected) return; var a = t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 }); a.onfinish = function () { t.remove(); }; }, 3200);
  }

  function decorate(l) {
    var s = S[l.status], w = isWatched(l.id);
    return Object.assign({}, l, {
      sLabel: s.label, sFg: s.fg, sBg: s.bg, sBd: s.bd, pulse: s.pulse ? 'true' : 'false',
      watched: w, wFill: w ? '#172333' : 'none', wLabel: w ? 'Remove ' + l.name + ' from watchlist' : 'Add ' + l.name + ' to watchlist',
      img: l.img, isLive: l.status === 'live',
      // Individual property pages are outside this one-page demo, so the card says so
      // rather than leaving a dead link.
      href: '#auctions', ctaHref: '#auctions',
      cta: l.status === 'live' ? 'Enter Auction Room' : 'View Property',
      onOpen: function (e) {
        e.preventDefault();
        demo(l.status === 'live' ? 'The live auction room is outside this demo.' : 'Individual property pages are outside this demo — this concept is the home page only.');
      },
      onWatch: function (e) { e.preventDefault(); e.stopPropagation(); toggleWatch(l.id, e.currentTarget); }
    });
  }
  function decorateResult(r) { var s = S[r.result]; return Object.assign({}, r, { sLabel: s.label, sFg: s.fg, sBg: s.bg, sBd: s.bd, pulse: 'false' }); }
  function decorateEvent(e) { var s = S[e.regKey]; return Object.assign({}, e, { rFg: s.fg, rBg: s.bg, rBd: s.bd, pulse: e.regKey === 'closing' ? 'true' : 'false' }); }

  /* ---------- Dates ----------
     The copy is fixed but the calendar must always look current, so each session is
     placed a set number of days from today (Asia/Tokyo) and the strings are derived. */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function todayTokyo() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }
  function parseIso(iso) { var p = iso.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function toIso(d) { return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()); }
  function shiftDays(iso, n) { var d = parseIso(iso); d.setUTCDate(d.getUTCDate() + n); return toIso(d); }
  function dayOf(iso) { return pad2(parseIso(iso).getUTCDate()); }
  function monOf(iso) { return MON[parseIso(iso).getUTCMonth()]; }
  function dowOf(iso) { return DOW[parseIso(iso).getUTCDay()]; }
  function shortDate(iso) { return parseIso(iso).getUTCDate() + ' ' + monOf(iso); }
  function longDate(iso) { return pad2(parseIso(iso).getUTCDate()) + ' ' + monOf(iso) + ' ' + parseIso(iso).getUTCFullYear(); }

  var TODAY = todayTokyo();
  // days from today for each session, and when registration opens for the later ones
  var SESSION = { e2: { off: 0 }, e1: { off: 3 }, e3: { off: 10 }, e4: { off: 13 },
                  e5: { off: 17, opens: 6 }, e6: { off: 20, opens: 9 }, e7: { off: 25, opens: 13 }, e8: { off: 32, opens: 20 } };
  events.forEach(function (e) {
    var cfg = SESSION[e.id] || { off: 30 };
    e.iso = shiftDays(TODAY, cfg.off);
    e.day = dayOf(e.iso); e.mon = monOf(e.iso); e.dow = dowOf(e.iso);
    e.shortDate = shortDate(e.iso);
    if (cfg.opens != null) e.reg = 'Opens ' + shortDate(shiftDays(TODAY, cfg.opens));
  });
  events.sort(function (a, b) { return a.iso < b.iso ? -1 : a.iso > b.iso ? 1 : 0; });
  function eventById(id) { return events.filter(function (e) { return e.id === id; })[0]; }
  function eventByName(name) { return events.filter(function (e) { return e.name === name; })[0]; }

  // Each lot belongs to a session, so its date follows that session rather than a fixed string.
  lots.forEach(function (l) {
    var e = eventByName(l.auction);
    if (e) {
      if (l.status !== 'live') l.date = e.shortDate;
      var cfg = SESSION[e.id] || {};
      // Sessions without their own "opens" date get one a week before the sale.
      if (/^Registration opens/.test(l.reg)) l.reg = 'Registration opens ' + shortDate(cfg.opens != null ? shiftDays(TODAY, cfg.opens) : shiftDays(e.iso, -7));
    }
    l.img = 'img/lot-' + l.id + '.webp';
  });

  // Results sit in the recent past, newest first.
  var RESULT_AGO = [14, 21, 28, 21, 35, 14, 21, 42, 49, 35, 28, 42];
  results.forEach(function (r, i) { r.iso = shiftDays(TODAY, -(RESULT_AGO[i] || 30)); r.date = longDate(r.iso); });
  var newest = results.map(function (r) { return r.iso; }).sort().slice(-1)[0] || TODAY;

  // The session the hero counts down to: the next one still taking registrations.
  var nextSession = events.filter(function (e) { return e.regKey === 'registration'; })[0] || events[0];

  window.ARDEN = { lots: lots, events: events, results: results, articles: articles, notifications: notifications, status: S,
    decorate: decorate, decorateResult: decorateResult, decorateEvent: decorateEvent, watchlist: watchlist, isWatched: isWatched, toggleWatch: toggleWatch, toast: toast, demo: demo, pop: pop, reducedMotion: RM,
    today: TODAY, nextSession: nextSession, shortDate: shortDate, eventById: eventById,
    calendarMonth: MONTH_FULL[parseIso(events[0].iso).getUTCMonth()], calendarYear: String(parseIso(events[0].iso).getUTCFullYear()),
    resultsMonth: MONTH_FULL[parseIso(newest).getUTCMonth()],
    lot: function (id) { return lots.filter(function (l) { return l.id === id; })[0] || lots[0]; } };

  /* ---------- Motion ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); fire(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;

  function countUp(el) {
    var to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    var fmt = function (v) { return pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; };
    if (RM) { el.textContent = fmt(to); return; }
    var t0 = performance.now(), d = 1400;
    (function step(t) { var p = Math.min(1, (t - t0) / d), k = 1 - Math.pow(1 - p, 3); el.textContent = fmt(to * k); if (p < 1) requestAnimationFrame(step); })(t0);
  }
  function fire(el) {
    var d = +(el.dataset.delay || 0);
    if (el.hasAttribute('data-reveal')) {
      el.style.opacity = '';
      if (!RM) el.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: d, easing: EASE, fill: 'backwards' });
    }
    if (el.hasAttribute('data-count')) setTimeout(function () { countUp(el); }, d);
    if (el.hasAttribute('data-progress')) {
      el.style.transition = RM ? 'none' : 'transform 1.6s ' + EASE + ' ' + d + 'ms';
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.transform = 'scaleX(1)'; }); });
    }
  }
  function scan() {
    // <x-dc> holds the un-mounted template. support.js reads the style attribute off those
    // nodes to build the component, so parking one at opacity:0 here would bake the hidden
    // state (and the data-m marker that stops it ever being revealed) straight into the
    // render. This script and the runtime race each other on load, so the guard is required,
    // not defensive: scan only once the real nodes are on the page.
    if (document.querySelector('x-dc')) return;
    document.querySelectorAll('[data-reveal]:not([data-m]),[data-count]:not([data-m]),[data-progress]:not([data-m])').forEach(function (el) {
      el.setAttribute('data-m', '');
      if (el.hasAttribute('data-progress')) { el.style.transformOrigin = 'left center'; el.style.transform = 'scaleX(0)'; }
      if (el.hasAttribute('data-count') && !RM) { el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || ''); }
      if (RM || !io) { fire(el); return; }
      if (el.hasAttribute('data-reveal')) el.style.opacity = '0';
      io.observe(el);
    });
    document.querySelectorAll('[data-settle]:not([data-m])').forEach(function (el) {
      el.setAttribute('data-m', '');
      if (!RM) el.animate([{ opacity: 0, transform: 'translateY(14px)', letterSpacing: '0.012em' }, { opacity: 1, transform: 'none', letterSpacing: getComputedStyle(el).letterSpacing }], { duration: 900, delay: +(el.dataset.delay || 0), easing: EASE, fill: 'backwards' });
    });
    document.querySelectorAll('[data-zoom]:not([data-m])').forEach(function (el) {
      el.setAttribute('data-m', '');
      if (!RM) el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.025)' }], { duration: 16000, easing: 'cubic-bezier(.25,.1,.25,1)', fill: 'forwards' });
    });
    document.querySelectorAll('[data-pulse]').forEach(function (el) {
      var on = el.getAttribute('data-pulse') === 'true';
      if (on && !el._pulse && !RM) el._pulse = el.animate([{ opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }], { duration: 2400, iterations: Infinity, easing: 'ease-in-out' });
      if (!on && el._pulse) { el._pulse.cancel(); el._pulse = null; }
    });
  }
  var queued = false;
  function queue() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; scan(); }); }
  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-pulse'] });
  queue();

  /* Card hover: image scale + arrow shift */
  function cardHover(e, on) {
    var c = e.target.closest && e.target.closest('[data-card]'); if (!c) return;
    if (e.relatedTarget && c.contains(e.relatedTarget)) return;
    var img = c.querySelector('[data-card-img]'), ar = c.querySelectorAll('[data-card-arrow]');
    if (img) img.style.transform = on && !RM ? 'scale(1.035)' : 'scale(1)';
    ar.forEach(function (a) { a.style.transform = on && !RM ? 'translateX(4px)' : 'none'; });
  }
  document.addEventListener('mouseover', function (e) { cardHover(e, true); });
  document.addEventListener('mouseout', function (e) { cardHover(e, false); });

  /* Page crossfade */
  function fadeIn() { if (!RM && document.body) document.body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' }); }
  if (document.body) fadeIn(); else document.addEventListener('DOMContentLoaded', fadeIn);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || RM) return;
    var h = a.getAttribute('href'); if (!h || h.charAt(0) === '#' || /^(mailto|tel|https?):/.test(h)) return;
    if (h.split('#')[0] === location.pathname.split('/').pop() + location.search) return;
    e.preventDefault();
    var an = document.body.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-in', fill: 'forwards' });
    an.onfinish = function () { location.href = h; };
  });

  window.dispatchEvent(new Event('arden-ready'));
})();
