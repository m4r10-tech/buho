/* ==========================================================
   Bar Bocatería El Búho — interacciones
   ========================================================== */
(function () {
  "use strict";

  const D = window.BUHO;
  const H = window.BuhoHorario;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const pad = n => String(n).padStart(2, "0");
  const euro = n => n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2800);
  }

  /* ---------- Preloader ---------- */
  function initPreloader() {
    const pre = $("#preloader");
    const bar = $("#preloaderBar");
    let p = 0;
    const iv = setInterval(() => { p = Math.min(p + Math.random() * 18, 92); bar.style.width = p + "%"; }, 120);
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(iv);
      bar.style.width = "100%";
      setTimeout(() => {
        pre.classList.add("is-done");
        document.body.classList.remove("is-loading");
        startHeroIntro();
        // Respetar el ancla de la URL (p. ej. /#carta) una vez cargado todo
        const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) target.scrollIntoView({ behavior: "auto" });
      }, 300);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish);
    setTimeout(finish, 2600); // nunca bloquear más de 2,6 s
  }

  /* ---------- Split title ---------- */
  function initSplit() {
    $$("[data-split]").forEach(el => {
      const text = el.textContent;
      el.textContent = "";
      [...text].forEach((ch, i) => {
        const s = document.createElement("span");
        s.className = "char";
        s.textContent = ch === " " ? " " : ch;
        s.style.transitionDelay = (i * 60) + "ms";
        s.setAttribute("aria-hidden", "true");
        el.appendChild(s);
      });
    });
  }
  function startHeroIntro() {
    $$("[data-split]").forEach(el => el.classList.add("is-in"));
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = $$(".reveal");
    els.forEach(el => { if (el.dataset.delay) el.style.setProperty("--delay", el.dataset.delay + "ms"); });
    if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
    return io;
  }
  let revealIO;

  /* ---------- Counters & stars ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const dur = 2000;
    const start = performance.now();
    const fmt = v => v.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduceMotion) { el.textContent = fmt(target); return; }
    const step = now => {
      const t = Math.min((now - start) / dur, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = fmt(target * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function initCounters() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el.dataset.count) animateCount(el);
        if (el.dataset.stars) {
          const pct = (parseFloat(el.dataset.stars) / 5) * 100;
          el.querySelector("span").style.width = pct + "%";
        }
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    $$("[data-count], [data-stars]").forEach(el => io.observe(el));
  }

  /* ---------- Nav ---------- */
  function initNav() {
    const nav = $("#nav");
    const burger = $("#burger");
    const links = $("#navLinks");
    const progress = $("#scrollProgress");
    const toTop = $("#toTop");
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      nav.classList.toggle("is-scrolled", y > 30);
      const menuOpen = links.classList.contains("is-open");
      nav.classList.toggle("is-hidden", !menuOpen && y > lastY && y > 400);
      toTop.classList.toggle("is-visible", y > 700);
      lastY = y;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    const setMenu = open => {
      links.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      document.body.classList.toggle("no-scroll", open);
    };
    burger.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
    links.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && links.classList.contains("is-open")) setMenu(false); });
    window.addEventListener("resize", () => { if (window.innerWidth > 960 && links.classList.contains("is-open")) setMenu(false); });

    // Enlace activo según sección visible
    const map = new Map();
    $$("a[href^='#']", links).forEach(a => {
      const sec = document.getElementById(a.getAttribute("href").slice(1));
      if (sec && !a.classList.contains("btn")) map.set(sec, a);
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const a = map.get(e.target);
        if (a && e.isIntersecting) {
          $$("a.is-active", links).forEach(x => x.classList.remove("is-active"));
          a.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, sec) => io.observe(sec));
  }

  /* ---------- Cursor glow, magnetic, tilt, parallax ---------- */
  function initPointerFx() {
    if (!finePointer || reduceMotion) return;
    const glow = $("#cursorGlow");
    let gx = 0, gy = 0, tx = 0, ty = 0, raf;
    window.addEventListener("mousemove", e => {
      tx = e.clientX; ty = e.clientY;
      glow.classList.add("is-on");
      if (!raf) raf = requestAnimationFrame(loop);
    });
    document.addEventListener("mouseleave", () => glow.classList.remove("is-on"));
    function loop() {
      gx += (tx - gx) * 0.15; gy += (ty - gy) * 0.15;
      glow.style.transform = `translate(${gx - 210}px, ${gy - 210}px)`;
      raf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(loop) : null;
    }
    glow.style.left = "0"; glow.style.top = "0";

    $$(".magnetic").forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });

    const addTilt = el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-4px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    };
    $$("[data-tilt]").forEach(addTilt);
    window.__buhoTilt = addTilt;
  }

  function initParallax() {
    if (reduceMotion) return;
    const els = $$("[data-parallax]");
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      els.forEach(el => {
        if (y < window.innerHeight * 1.2) el.style.transform = `translate3d(0, ${y * parseFloat(el.dataset.parallax)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  }

  /* ---------- Fireflies canvas ---------- */
  function initFireflies() {
    const c = $("#fireflies");
    if (!c || reduceMotion) return;
    const ctx = c.getContext("2d");
    let w, h, dpr, flies = [], running = true, mouse = { x: -999, y: -999 };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(70, (w * h) / 22000));
      flies = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.8 + 0.6, a: Math.random() * Math.PI * 2,
        s: Math.random() * 0.35 + 0.1, p: Math.random() * Math.PI * 2
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    c.parentElement.addEventListener("mousemove", e => {
      const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    c.parentElement.addEventListener("mouseleave", () => { mouse.x = mouse.y = -999; });
    const io = new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) requestAnimationFrame(draw); });
    io.observe(c);
    function draw(t) {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      flies.forEach(f => {
        f.a += (Math.random() - 0.5) * 0.2;
        f.x += Math.cos(f.a) * f.s; f.y += Math.sin(f.a) * f.s - 0.08;
        const dx = f.x - mouse.x, dy = f.y - mouse.y, dist = Math.hypot(dx, dy);
        if (dist < 120) { f.x += dx / dist * 1.5; f.y += dy / dist * 1.5; }
        if (f.x < -10) f.x = w + 10; if (f.x > w + 10) f.x = -10;
        if (f.y < -10) f.y = h + 10; if (f.y > h + 10) f.y = -10;
        const glow = 0.45 + 0.55 * Math.sin(t / 600 + f.p);
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6);
        g.addColorStop(0, `rgba(255, 210, 110, ${0.9 * glow})`);
        g.addColorStop(1, "rgba(255, 210, 110, 0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 6, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
  }

  /* ---------- Búho que mira al cursor ---------- */
  function initOwl() {
    const owl = $("#heroOwl");
    if (!owl) return;
    const pupils = $$("[data-pupil]", owl);
    const shines = $$("[data-pupil-shine]", owl);
    const base = pupils.map(p => ({ cx: +p.getAttribute("cx"), cy: +p.getAttribute("cy") }));
    const shineBase = shines.map(p => ({ cx: +p.getAttribute("cx"), cy: +p.getAttribute("cy") }));
    const look = (x, y) => {
      const r = owl.getBoundingClientRect();
      const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
      const ang = Math.atan2(y - oy, x - ox);
      const d = Math.min(Math.hypot(x - ox, y - oy) / 40, 9);
      const dx = Math.cos(ang) * d, dy = Math.sin(ang) * d;
      pupils.forEach((p, i) => { p.setAttribute("cx", base[i].cx + dx); p.setAttribute("cy", base[i].cy + dy); });
      shines.forEach((p, i) => { p.setAttribute("cx", shineBase[i].cx + dx); p.setAttribute("cy", shineBase[i].cy + dy); });
    };
    window.addEventListener("mousemove", e => look(e.clientX, e.clientY), { passive: true });
    window.addEventListener("touchmove", e => { const t = e.touches[0]; if (t) look(t.clientX, t.clientY); }, { passive: true });
    const blink = () => {
      owl.classList.add("is-blinking");
      setTimeout(() => owl.classList.remove("is-blinking"), 160);
      setTimeout(blink, 2500 + Math.random() * 4000);
    };
    setTimeout(blink, 2000);
    owl.style.pointerEvents = "auto";
    owl.style.cursor = "pointer";
    const hoots = ["¡Uhu, uhu!", "¿Una caña con tapa?", "El búho nunca duerme… bueno, los lunes sí.", "¡Prueba las migas!"];
    let i = 0;
    owl.addEventListener("click", () => { toast(hoots[i++ % hoots.length]); blink(); });
  }

  /* ---------- Horario / estado en vivo ---------- */
  function initHours() {
    const list = $("#weekList");
    const today = H.madridNow().day;
    H.WEEK_ORDER.forEach((d, idx) => {
      const slot = D.schedule[d];
      const li = document.createElement("li");
      li.className = "week__item" + (d === today ? " is-today" : "") + (slot ? "" : " is-closed");
      li.style.setProperty("--d", (idx * 0.07) + "s");
      li.innerHTML = `<span class="week__day">${H.DAY_NAMES[d]}${d === today ? ' <span class="week__today-tag">Hoy</span>' : ""}</span>
        <span class="week__time">${slot ? H.fmtMin(slot[0]) + " – " + H.fmtMin(slot[1]) : "Cerrado"}</span>`;
      list.appendChild(li);
    });
    const week = list.closest(".week");
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { week.classList.add("is-in"); o.disconnect(); } }, { threshold: 0.2 }).observe(week);

    // Footer
    const fh = $("#footerHours");
    fh.innerHTML = "<b>Mar – Jue</b><span>11:00 – 01:00</span><b>Vie – Sáb</b><span>11:00 – 02:00</span><b>Domingo</b><span>12:00 – 01:00</span><b>Lunes</b><span>Cerrado</span>";

    // Barra del día: tramos abiertos dentro de las 24 h de hoy
    const track = $(".dayline__track");
    const nowMark = $("[data-dayline-now]");
    const firstOpen = $("[data-dayline-open]");
    function paintDayline(day) {
      $$(".dayline__open", track).forEach((el, i) => { if (i > 0) el.remove(); });
      const segs = [];
      const prev = D.schedule[(day + 6) % 7];
      if (prev && prev[1] > 1440) segs.push([0, prev[1] - 1440]);
      const cur = D.schedule[day];
      if (cur) segs.push([cur[0], Math.min(cur[1], 1440)]);
      if (!segs.length) { firstOpen.style.width = "0"; return; }
      segs.forEach((s, i) => {
        const el = i === 0 ? firstOpen : firstOpen.cloneNode();
        el.style.left = (s[0] / 1440 * 100) + "%";
        el.style.width = ((s[1] - s[0]) / 1440 * 100) + "%";
        if (i > 0) track.insertBefore(el, nowMark);
      });
      requestAnimationFrame(() => $$(".dayline__open", track).forEach(el => el.classList.add("is-in")));
    }
    let paintedDay = -1;

    const cdEls = { h: $("[data-cd='h']"), m: $("[data-cd='m']"), s: $("[data-cd='s']") };
    const setCd = (k, v) => {
      const el = cdEls[k];
      if (el.textContent !== v) {
        el.textContent = v;
        if (!reduceMotion) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
      }
    };
    let lastOpen = null;

    function update() {
      const st = H.status(D.schedule);
      const n = st.now;
      const cls = st.open ? (st.closingSoon ? "is-soon" : "is-open") : (st.openingSoon ? "is-soon" : "is-closed");
      const short = st.open ? (st.closingSoon ? "Cierra pronto" : "Abierto") : (st.openingSoon ? "Abre pronto" : "Cerrado");
      const long = st.open
        ? (st.closingSoon ? "¡Date prisa, cerramos pronto!" : "¡Estamos abiertos! Pásate.")
        : "Ahora mismo estamos cerrados";
      const sub = st.open
        ? "Hoy cerramos a las " + H.fmtMin(st.until) + "."
        : "Abrimos " + H.nextLabel(st.next) + ".";

      $$("[data-status-pill], [data-status-card], [data-status-panel], [data-status-badge]").forEach(el => {
        el.classList.remove("is-open", "is-closed", "is-soon");
        el.classList.add(cls);
      });
      $$("[data-status-short]").forEach(el => { el.textContent = short; });
      $$("[data-status-long]").forEach(el => { el.textContent = long; });
      $$("[data-status-sub]").forEach(el => { el.textContent = sub; });

      const sec = st.secondsLeft;
      setCd("h", pad(Math.floor(sec / 3600)));
      setCd("m", pad(Math.floor((sec % 3600) / 60)));
      setCd("s", pad(sec % 60));
      $("[data-cd-label]").textContent = st.open ? "para el cierre" : "para abrir";

      $("#liveClock").textContent = `${pad(n.h)}:${pad(n.m)}:${pad(n.s)}`;
      nowMark.style.left = `calc(${(n.minutes + n.seconds / 60) / 1440 * 100}% - 1.5px)`;
      if (paintedDay !== n.day) { paintDayline(n.day); paintedDay = n.day; }

      if (lastOpen !== null && lastOpen !== st.open) toast(st.open ? "¡Acabamos de abrir!" : "Acabamos de cerrar. ¡Hasta mañana!");
      lastOpen = st.open;
    }
    update();
    setInterval(update, 1000);
  }

  /* ---------- Carta ---------- */
  function initMenu() {
    const grid = $("#menuGrid");
    const tabs = $("#menuTabs");
    const ink = $(".menu__tabs-ink", tabs);
    const search = $("#menuSearch");
    const empty = $("#menuEmpty");
    let filter = "all", query = "";
    const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

    function render() {
      const q = norm(query.trim());
      const items = D.menu.filter(it => (filter === "all" || it.cat === filter) && (!q || norm(it.name + " " + it.desc).includes(q)));
      grid.innerHTML = "";
      items.forEach((it, i) => {
        const card = document.createElement("article");
        card.className = "dish";
        card.style.setProperty("--d", Math.min(i * 0.05, 0.6) + "s");
        card.innerHTML = `
          <div class="dish__img">
            <img src="${it.img}" alt="${it.name}" loading="lazy" width="1100" height="688">
            ${it.tag ? `<span class="dish__tag">${it.tag}</span>` : ""}
          </div>
          <div class="dish__body">
            <div class="dish__head"><h3 class="dish__name">${it.name}</h3><span class="dish__price">${euro(it.price)}</span></div>
            <p class="dish__desc">${it.desc}</p>
          </div>`;
        grid.appendChild(card);
        if (window.__buhoTilt) window.__buhoTilt(card);
      });
      empty.hidden = items.length > 0;
    }

    function moveInk(btn) {
      const r = btn.getBoundingClientRect();
      const pr = tabs.getBoundingClientRect();
      ink.style.width = r.width + "px";
      ink.style.height = r.height + "px";
      ink.style.top = (r.top - pr.top) + "px";
      ink.style.transform = `translateX(${r.left - pr.left}px)`;
    }

    tabs.addEventListener("click", e => {
      const b = e.target.closest("button[data-filter]");
      if (!b) return;
      $$("button[data-filter]", tabs).forEach(x => x.setAttribute("aria-selected", String(x === b)));
      filter = b.dataset.filter;
      moveInk(b);
      render();
    });
    tabs.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const btns = $$("button[data-filter]", tabs);
      const i = btns.findIndex(b => b.getAttribute("aria-selected") === "true");
      const next = btns[(i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length];
      next.focus(); next.click();
    });
    let st;
    search.addEventListener("input", () => { clearTimeout(st); st = setTimeout(() => { query = search.value; render(); }, 150); });
    const reInk = () => moveInk($("button[aria-selected='true']", tabs));
    window.addEventListener("resize", reInk);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reInk);
    render();
    reInk();
  }

  /* ---------- Galería + lightbox ---------- */
  function initGallery() {
    const grid = $("#galleryGrid");
    D.gallery.forEach((g, i) => {
      const b = document.createElement("button");
      b.className = "g-item reveal" + (g.size ? " " + g.size : "");
      b.dataset.caption = g.alt;
      b.dataset.index = i;
      b.dataset.delay = (i % 4) * 80;
      b.setAttribute("aria-label", "Ampliar foto: " + g.alt);
      b.innerHTML = `<img src="${g.src}" alt="${g.alt}" loading="lazy">`;
      grid.appendChild(b);
    });

    const lb = $("#lightbox"), img = $("#lightboxImg"), cap = $("#lightboxCap");
    let idx = 0, lastFocus = null;
    const show = i => {
      idx = (i + D.gallery.length) % D.gallery.length;
      const g = D.gallery[idx];
      img.style.animation = "none"; void img.offsetWidth; img.style.animation = "";
      img.src = g.src; img.alt = g.alt;
      cap.textContent = `${g.alt} · ${idx + 1}/${D.gallery.length}`;
    };
    const open = i => {
      lastFocus = document.activeElement;
      show(i); lb.hidden = false; document.body.classList.add("no-scroll");
      $(".lightbox__close", lb).focus();
    };
    const close = () => {
      lb.hidden = true; document.body.classList.remove("no-scroll");
      if (lastFocus) lastFocus.focus();
    };
    grid.addEventListener("click", e => { const b = e.target.closest(".g-item"); if (b) open(+b.dataset.index); });
    lb.addEventListener("click", e => {
      const a = e.target.closest("[data-lb]");
      if (a) { const act = a.dataset.lb; if (act === "close") close(); else show(idx + (act === "next" ? 1 : -1)); }
      else if (e.target === lb) close();
    });
    document.addEventListener("keydown", e => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "Tab") { // foco atrapado en el lightbox
        const f = $$("button", lb); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    let sx = null;
    lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* ---------- Carrusel de reseñas ---------- */
  function initCarousel() {
    const track = $("#carouselTrack"), dots = $("#carouselDots"), root = $("#carousel");
    D.reviews.forEach((r, i) => {
      const el = document.createElement("blockquote");
      el.className = "review";
      el.setAttribute("aria-roledescription", "opinión");
      el.setAttribute("aria-label", `${i + 1} de ${D.reviews.length}`);
      el.innerHTML = `<div class="review__stars" aria-label="${r.stars} estrellas">${"★".repeat(r.stars)}</div>
        <p class="review__text">${r.text}</p><cite class="review__author">— ${r.author}</cite>`;
      track.appendChild(el);
      const d = document.createElement("button");
      d.setAttribute("aria-label", "Ver opinión " + (i + 1));
      d.addEventListener("click", () => { go(i); restart(); });
      dots.appendChild(d);
    });
    let cur = 0, timer;
    const slides = $$(".review", track);
    function go(i) {
      cur = (i + D.reviews.length) % D.reviews.length;
      track.style.transform = `translateX(${-cur * 100}%)`;
      $$("button", dots).forEach((d, k) => d.setAttribute("aria-current", String(k === cur)));
      slides.forEach((s, k) => s.setAttribute("aria-hidden", String(k !== cur)));
    }
    const restart = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => go(cur + 1), 6000); };
    $$(".carousel__btn", root).forEach(b => b.addEventListener("click", () => { go(cur + +b.dataset.dir); restart(); }));
    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", restart);
    root.addEventListener("focusin", () => clearInterval(timer));
    let sx = null;
    const vp = $(".carousel__viewport", root);
    vp.addEventListener("touchstart", e => { sx = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
    vp.addEventListener("touchend", e => {
      if (sx !== null) { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); }
      sx = null; restart();
    });
    go(0); restart();
  }

  /* ---------- Reservas ---------- */
  function initBooking() {
    const form = $("#bookingForm");
    const date = $("#fDate"), time = $("#fTime"), people = $("#fPeople"), notes = $("#fNotes");
    const madridDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" });
    const todayStr = madridDate.format(new Date());
    date.min = todayStr;
    const maxD = new Date(); maxD.setDate(maxD.getDate() + 60);
    date.max = madridDate.format(maxD);
    const dayOf = s => new Date(s + "T12:00:00Z").getUTCDay();

    function fillTimes() {
      time.innerHTML = "";
      const v = date.value;
      if (!v) { time.add(new Option("Elige primero el día", "")); return; }
      const slot = D.schedule[dayOf(v)];
      if (!slot) { time.add(new Option("Ese día cerramos (lunes)", "")); return; }
      let from = slot[0];
      if (v === todayStr) {
        const n = H.madridNow();
        from = Math.max(from, Math.ceil((n.minutes + 30) / 30) * 30);
      }
      const opts = [];
      for (let m = from; m <= slot[1] - 60; m += 30) opts.push(m);
      if (!opts.length) { time.add(new Option("No quedan horas hoy", "")); return; }
      time.add(new Option("Elige una hora", ""));
      opts.forEach(m => time.add(new Option(H.fmtMin(m), H.fmtMin(m))));
    }
    date.addEventListener("change", () => { fillTimes(); validate(date); });
    fillTimes();

    let n = 2;
    $$("[data-step]", form).forEach(b => b.addEventListener("click", () => {
      const nv = Math.max(1, Math.min(20, n + +b.dataset.step));
      if (nv === n) { toast(n === 1 ? "Mínimo 1 persona" : "Para más de 20, llámanos"); return; }
      n = nv; people.textContent = n; people.value = n;
      people.classList.remove("bump"); void people.offsetWidth; people.classList.add("bump");
    }));
    notes.addEventListener("input", () => { $("#notesCount").textContent = notes.value.length; });

    const messages = {
      name: "Dinos tu nombre",
      phone: "Teléfono no válido (mín. 9 dígitos)",
      date: "Elige un día válido",
      time: "Elige una hora"
    };
    function validate(el) {
      const field = el.closest(".field");
      let ok = el.checkValidity();
      if (el === date && ok && el.value) {
        if (el.value < todayStr) ok = false;
        else if (!D.schedule[dayOf(el.value)]) { ok = false; field.querySelector(".field__error").textContent = "Los lunes cerramos"; field.classList.add("is-invalid"); return false; }
      }
      if (el === $("#fPhone") && ok) ok = el.value.replace(/\D/g, "").length >= 9;
      field.classList.toggle("is-invalid", !ok);
      field.querySelector(".field__error").textContent = ok ? "" : messages[el.name];
      return ok;
    }
    $$("input[required], select[required]", form).forEach(el => {
      el.addEventListener("blur", () => { if (el.value) validate(el); });
      el.addEventListener("input", () => { if (el.closest(".field").classList.contains("is-invalid")) validate(el); });
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      const fields = $$("input[required], select[required]", form);
      const results = fields.map(validate);
      if (results.includes(false)) {
        const bad = fields[results.indexOf(false)];
        bad.focus();
        toast("Revisa los campos marcados");
        return;
      }
      const fd = new FormData(form);
      const d = new Date(fd.get("date") + "T12:00:00Z");
      const dateLabel = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
      const data = {
        Nombre: fd.get("name").trim(),
        Teléfono: fd.get("phone").trim(),
        Día: dateLabel,
        Hora: fd.get("time"),
        Personas: n,
        Zona: fd.get("zone"),
        Comentarios: fd.get("notes").trim() || "—"
      };
      const text = "¡Hola El Búho! Quiero reservar:\n" + Object.entries(data).map(([k, v]) => `• ${k}: ${v}`).join("\n");
      const wa = `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(text)}`;
      const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      openModal("Revisa tu reserva", `
        <ul class="summary-list">${Object.entries(data).map(([k, v]) => `<li><span>${k}</span><b>${esc(v)}</b></li>`).join("")}</ul>
        <p style="color:var(--muted);font-size:.9rem">Pulsa el botón para enviarnos la reserva por WhatsApp. Te confirmaremos lo antes posible.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn btn--gold" href="${wa}" target="_blank" rel="noopener" id="waLink">Enviar por WhatsApp</a>
          <a class="btn btn--ghost" href="tel:${D.phone}">Llamar</a>
        </div>`);
      $("#waLink").addEventListener("click", () => {
        closeModal();
        form.reset(); n = 2; people.textContent = "2"; $("#notesCount").textContent = "0"; fillTimes();
        toast("¡Gracias! Te esperamos");
      });
    });
  }

  /* ---------- Modal ---------- */
  let modalLastFocus = null;
  function openModal(title, html) {
    modalLastFocus = document.activeElement;
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = html;
    $("#modal").hidden = false;
    document.body.classList.add("no-scroll");
    $("#modal [data-modal-close]").focus();
  }
  function closeModal() {
    $("#modal").hidden = true;
    document.body.classList.remove("no-scroll");
    if (modalLastFocus) modalLastFocus.focus();
  }
  function initModal() {
    const m = $("#modal");
    m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-modal-close]")) closeModal(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !m.hidden) closeModal(); });
    $("#creditsBtn").addEventListener("click", () => {
      openModal("Créditos de las fotos", `<p style="color:var(--muted)">Fotografías de Wikimedia Commons usadas bajo sus licencias libres:</p><ul>${
        D.credits.map(c => `<li><b>${c.file}</b> — ${c.author} · ${c.license} · <a href="${c.source}" target="_blank" rel="noopener">fuente</a></li>`).join("")
      }</ul><p style="color:var(--muted);font-size:.85rem">Mapa: © colaboradores de OpenStreetMap.</p>`);
    });
  }

  /* ---------- Mapa ---------- */
  function initMap() {
    const el = $("#map");
    const fallback = () => {
      el.innerHTML = `<iframe class="map-fallback" title="Mapa de El Búho" loading="lazy" src="https://maps.google.com/maps?q=${D.coords.join(",")}&z=16&output=embed"></iframe>`;
    };
    const build = () => {
      if (!window.L) { fallback(); return; }
      try {
        const map = L.map(el, { scrollWheelZoom: false, zoomControl: false }).setView(D.coords, 16);
        L.control.zoom({ position: "bottomright" }).addTo(map);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        const icon = L.divIcon({
          className: "", iconSize: [54, 54], iconAnchor: [27, 50], popupAnchor: [0, -46],
          html: '<div class="owl-marker" style="width:54px;height:54px;position:relative"><svg viewBox="0 0 120 120"><use href="#owl"/></svg><span class="owl-marker__pulse"></span></div>'
        });
        L.marker(D.coords, { icon, title: "Bar Bocatería El Búho" }).addTo(map)
          .bindPopup(`<strong>El Búho</strong><br>${D.address}<br><a href="https://www.google.com/maps/dir/?api=1&destination=${D.coords.join(",")}" target="_blank" rel="noopener">Cómo llegar →</a>`, { maxWidth: 240, autoPanPadding: [24, 24] })
          .openPopup();
        el.addEventListener("click", () => map.scrollWheelZoom.enable(), { once: true });
        new IntersectionObserver(([e]) => { if (e.isIntersecting) map.invalidateSize(); }).observe(el);
      } catch (err) { fallback(); }
    };
    // Construir solo cuando el mapa se acerca al viewport
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); build(); } }, { rootMargin: "300px" }).observe(el);
  }

  /* ---------- Distancia / copiar ---------- */
  function initFindTools() {
    $("#distanceBtn").addEventListener("click", () => {
      const out = $("#distanceText");
      if (!navigator.geolocation) { out.textContent = "Tu navegador no permite la geolocalización."; return; }
      out.textContent = "Buscando tu ubicación…";
      navigator.geolocation.getCurrentPosition(pos => {
        const [la1, lo1] = [pos.coords.latitude, pos.coords.longitude].map(v => v * Math.PI / 180);
        const [la2, lo2] = D.coords.map(v => v * Math.PI / 180);
        const a = Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2;
        const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const walk = Math.round(km / 4.8 * 60), car = Math.max(1, Math.round(km / 35 * 60));
        out.innerHTML = km < 1
          ? `Estás a <b>${Math.round(km * 1000)} m</b> · unos ${walk} min andando`
          : `Estás a <b>${km.toLocaleString("es-ES", { maximumFractionDigits: 1 })} km</b> · ~${car} min en coche${km < 4 ? ` · ${walk} min andando` : ""}`;
      }, () => { out.textContent = "No hemos podido obtener tu ubicación."; }, { timeout: 10000 });
    });
    $$("[data-copy]").forEach(b => b.addEventListener("click", async () => {
      const txt = b.dataset.copy;
      try { await navigator.clipboard.writeText(txt); toast("Dirección copiada"); }
      catch (e) {
        const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); toast("Dirección copiada"); } catch (_) { toast(txt); }
        ta.remove();
      }
    }));
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = new Date().getFullYear();
    initSplit();
    initPreloader();
    initNav();
    initHours();
    initPointerFx();
    initMenu();
    initGallery();
    revealIO = initReveal();
    initCounters();
    initParallax();
    initFireflies();
    initOwl();
    initCarousel();
    initBooking();
    initModal();
    initMap();
    initFindTools();
  });
})();
