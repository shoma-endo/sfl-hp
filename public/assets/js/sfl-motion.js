(() => {
  const STAGGER = {
    proof: [[0, 80, 160, 240], [0, 60, 120, 180]],
    benefit: [[0, 100, 200], [0, 100, 200]],
    'services-cards': [[0, 90, 180], [0, 80, 160]],
    'case-kpis': [[0, 70, 140, 210, 280], [0, 70, 140, 210, 280]],
    'case-ba': [[0, 120], [0, 120]],
    'feature-strip': [[0, 50, 100, 150, 200, 250], [0, 50, 100, 150, 200, 250]]
  };

  const HERO_BASE = {
    kicker: [0, 420, 16, ''],
    h1: [80, 560, 24, 'blur snap'],
    lead: [200, 480, 20, 'blur'],
    sub: [320, 420, 16, ''],
    actions: [420, 480, 12, 'snap scale'],
    visual: [160, 720, 24, 'snap device'],
    pricing: [520, 400, 10, ''],
    meta: [600, 380, 8, ''],
    salon: [160, 720, 0, 'salon'],
    device: [280, 640, 32, 'snap device'],
    'float-notice': [1100, 420, 12, 'float'],
    'float-doc': [1200, 420, 12, 'float'],
    'float-karte': [1300, 420, 12, 'float']
  };

  const TABLET_FLOAT = { 'float-notice': 1010, 'float-doc': 1110, 'float-karte': 1210 };
  const MOBILE_OVERRIDE = { salon: 100, device: 200 };

  let heroPlayAt = 0;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const formatHeroCount = (el, value) => {
    const prefix = el.getAttribute('data-sfl-count-prefix') || '';
    const suffix = el.getAttribute('data-sfl-count-suffix') || '';
    const decimals = Number(el.getAttribute('data-sfl-count-decimals') || 0);
    const sep = el.getAttribute('data-sfl-count-separator');
    let num = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
    if (sep === ',') {
      const parts = num.split('.');
      parts[0] = Number(parts[0]).toLocaleString('ja-JP');
      num = parts.join('.');
    }
    return prefix + num + suffix;
  };

  const animateHeroCount = (el, end, duration, delay) => {
    const start = Number(el.getAttribute('data-sfl-count-start') || 0);
    const startAt = performance.now() + delay;

    const tick = (now) => {
      const elapsed = now - startAt;
      if (elapsed < 0) {
        requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (end - start) * easeOutCubic(progress);
      el.textContent = formatHeroCount(el, current);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = formatHeroCount(el, end);
    };

    requestAnimationFrame(tick);
  };

  const startHeroKpiCountUp = (hero, t) => {
    const timing = getHeroTiming('device', t);
    if (!timing) return;

    const [deviceDelay, deviceDur] = timing;
    const baseDelay = deviceDelay + Math.round(deviceDur * 0.42);

    hero.querySelectorAll('[data-sfl-count]').forEach((el, i) => {
      const end = Number(el.getAttribute('data-sfl-count'));
      if (!Number.isFinite(end)) return;
      el.textContent = formatHeroCount(el, 0);
      animateHeroCount(el, end, 1200 + i * 80, baseDelay + i * 120);
    });
  };

  const tier = () => {
    if (window.matchMedia('(max-width: 720px)').matches) return 'm';
    if (window.matchMedia('(max-width: 1100px)').matches) return 't';
    return 'd';
  };

  const resolveStaggerSelector = (sel) => {
    if (!sel) return null;
    const trimmed = sel.trim();
    if (trimmed.startsWith('>')) return ':scope ' + trimmed;
    return trimmed;
  };

  const queryStaggerChildren = (parent, staggerSel) => {
    const resolved = resolveStaggerSelector(staggerSel);
    if (!resolved) return [];
    try {
      return [...parent.querySelectorAll(resolved)];
    } catch (err) {
      console.warn('[sfl-motion] invalid stagger selector:', staggerSel, err);
      return [];
    }
  };

  const showAllMotionTargets = (root = document) => {
    root.querySelectorAll('[data-sfl-enter], [data-sfl-reveal], [data-sfl-reveal-mobile]').forEach((el) => {
      el.classList.add('sfl-is-visible');
    });
    root.querySelectorAll('[data-sfl-stagger]').forEach((parent) => {
      const staggerSel = parent.getAttribute('data-sfl-stagger');
      queryStaggerChildren(parent, staggerSel).forEach((child) => child.classList.add('sfl-is-visible'));
    });
  };

  const abortMotionInit = () => {
    document.documentElement.classList.remove('sfl-motion-ready');
    document.documentElement.classList.add('sfl-no-motion');
    showAllMotionTargets();
  };

  const getHeroTiming = (key, t) => {
    const base = HERO_BASE[key];
    if (!base) return null;
    let [delay, dur, y, flags] = base;
    if (t === 'm' && (key === 'sub' || key.startsWith('float-'))) return null;
    if (t === 't') {
      delay = Math.round(delay * 0.85);
      if (TABLET_FLOAT[key] != null) delay = TABLET_FLOAT[key];
    } else if (t === 'm') {
      delay = MOBILE_OVERRIDE[key] != null ? MOBILE_OVERRIDE[key] : Math.round(delay * 0.7);
    }
    return [delay, dur, y, flags];
  };

  const getStaggerDelays = (group) => {
    const spec = STAGGER[group];
    if (!spec) return [0];
    return window.matchMedia('(max-width: 720px)').matches ? spec[1] : spec[0];
  };

  const getRevealObserverOptions = () => {
    if (window.matchMedia('(max-width: 720px)').matches) {
      return { root: null, rootMargin: '-4% 0px -6% 0px', threshold: 0.12 };
    }
    if (window.matchMedia('(max-width: 1100px)').matches) {
      return { root: null, rootMargin: '-6% 0px -8% 0px', threshold: 0.14 };
    }
    return { root: null, rootMargin: '-8% 0px -10% 0px', threshold: 0.15 };
  };

  const applyEnterFlags = (el, flags) => {
    el.classList.remove('sfl-enter-snap', 'sfl-enter-blur', 'sfl-enter-scale', 'sfl-enter-salon', 'sfl-enter-device');
    if (flags.includes('snap')) el.classList.add('sfl-enter-snap');
    if (flags.includes('blur')) el.classList.add('sfl-enter-blur');
    if (flags.includes('scale')) el.classList.add('sfl-enter-scale');
    if (flags.includes('salon')) el.classList.add('sfl-enter-salon');
    if (flags.includes('device')) el.classList.add('sfl-enter-device');
  };

  const prepareHeroSubForViewport = () => {
    const sub = document.querySelector('.sfl-hero-sub[data-sfl-reveal-mobile]');
    if (!sub || !window.matchMedia('(max-width: 720px)').matches) return;
    sub.removeAttribute('data-sfl-enter');
  };

  const revealElement = (el) => {
    el.classList.add('sfl-is-visible');
    const group = el.getAttribute('data-sfl-reveal-group');
    const staggerSel = el.getAttribute('data-sfl-stagger');
    if (!staggerSel) return;
    const delays = getStaggerDelays(group || 'feature-strip');
    queryStaggerChildren(el, staggerSel).forEach((child, i) => {
      child.classList.add('sfl-is-visible');
      child.style.setProperty('--sfl-stagger-delay', (delays[i] != null ? delays[i] : 0) + 'ms');
    });
  };

  const revealMobileSub = (el) => {
    const minAt = heroPlayAt + 774 + 100;
    const wait = Math.max(0, minAt - Date.now());
    window.setTimeout(() => el.classList.add('sfl-is-visible'), wait);
  };

  const registerRevealObservers = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        try {
          revealElement(entry.target);
          observer.unobserve(entry.target);
        } catch (err) {
          abortMotionInit();
          console.error('[sfl-motion]', err);
        }
      });
    }, getRevealObserverOptions());

    document.querySelectorAll('[data-sfl-reveal]').forEach((el) => observer.observe(el));

    if (window.matchMedia('(max-width: 720px)').matches) {
      const subObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          try {
            revealMobileSub(entry.target);
            subObserver.unobserve(entry.target);
          } catch (err) {
            abortMotionInit();
            console.error('[sfl-motion]', err);
          }
        });
      }, getRevealObserverOptions());
      document.querySelectorAll('[data-sfl-reveal-mobile]').forEach((el) => subObserver.observe(el));
    }
  };

  const startHeroSequence = () => {
    const hero = document.querySelector('[data-sfl-hero]');
    if (!hero) return;
    const t = tier();
    const floatLoop = window.matchMedia('(min-width: 1101px)').matches;

    window.setTimeout(() => {
      heroPlayAt = Date.now();
      hero.classList.add('sfl-hero-played');

      hero.querySelectorAll('[data-sfl-enter]').forEach((el) => {
        const key = el.getAttribute('data-sfl-enter');
        const timing = getHeroTiming(key, t);
        if (!timing) return;
        const [delay, dur, y, flags] = timing;
        el.style.setProperty('--sfl-enter-dur', dur + 'ms');
        el.style.setProperty('--sfl-enter-y', y + 'px');
        applyEnterFlags(el, flags);
      });

      hero.querySelectorAll('[data-sfl-enter]').forEach((el) => {
        const key = el.getAttribute('data-sfl-enter');
        const timing = getHeroTiming(key, t);
        if (!timing) return;
        const [delay, dur, , flags] = timing;

        window.setTimeout(() => {
          el.classList.add('sfl-is-visible');
          if (key === 'device') startHeroKpiCountUp(hero, t);
          if (floatLoop && flags.includes('float')) {
            window.setTimeout(() => el.classList.add('sfl-float-active'), dur + 400);
          }
        }, delay);
      });
    }, 120);
  };

  const initSflMotion = () => {
    if (!document.querySelector('[data-sfl-hero]')) return;

    try {
      document.documentElement.classList.add('sfl-motion-ready');

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('sfl-no-motion');
        showAllMotionTargets();
        return;
      }

      prepareHeroSubForViewport();
      registerRevealObservers();
      startHeroSequence();
    } catch (err) {
      abortMotionInit();
      console.error('[sfl-motion]', err);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSflMotion);
  } else {
    initSflMotion();
  }
})();
