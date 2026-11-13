(() => {
  'use strict';

  const menuToggle = document.querySelector('.menu-toggle');
  const primaryNav = document.querySelector('.primary-nav');
  const navLinks = [...document.querySelectorAll('.nav-link, .nav-note')];

  function closeMenu() {
    if (!menuToggle || !primaryNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '開啟導覽選單');
    primaryNav.classList.remove('is-open');
  }

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '關閉導覽選單' : '開啟導覽選單');
    primaryNav?.classList.toggle('is-open', open);
  });
  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const href = `#${visible.target.id}`;
      document.querySelectorAll('.nav-link').forEach((link) => {
        const current = link.getAttribute('href') === href;
        link.classList.toggle('is-active', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-22% 0px -62% 0px', threshold: [0, 0.15, 0.35] });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const countdown = document.querySelector('#countdown');
  if (countdown) {
    const targetTime = new Date(countdown.dataset.target).getTime();
    const digits = {
      days: countdown.querySelector('[data-time="days"]'),
      hours: countdown.querySelector('[data-time="hours"]'),
      minutes: countdown.querySelector('[data-time="minutes"]'),
      seconds: countdown.querySelector('[data-time="seconds"]')
    };
    const pad = (value, width = 2) => String(value).padStart(width, '0');
    function updateCountdown() {
      const remaining = Math.max(0, targetTime - Date.now());
      const totalSeconds = Math.floor(remaining / 1000);
      digits.days.textContent = pad(Math.floor(totalSeconds / 86400), 3);
      digits.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
      digits.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
      digits.seconds.textContent = pad(totalSeconds % 60);
      if (remaining === 0) {
        countdown.querySelector('.countdown-foot').textContent = 'The Journey Has Begun!';
        clearInterval(countdownTimer);
      }
    }
    updateCountdown();
    const countdownTimer = window.setInterval(updateCountdown, 1000);
  }

  const galleryItems = [...document.querySelectorAll('.gallery-item')];
  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightbox-image');
  const lightboxCaption = document.querySelector('#lightbox-caption');
  const lightboxCount = document.querySelector('#lightbox-count');
  let currentPhoto = 0;
  let lastFocusedElement = null;

  function showPhoto(index) {
    currentPhoto = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentPhoto];
    const image = item.querySelector('img');
    lightboxImage.src = item.dataset.full || image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = item.dataset.caption || image.alt;
    lightboxCount.textContent = `${String(currentPhoto + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}`;
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      if (!lightbox || typeof lightbox.showModal !== 'function') return;
      lastFocusedElement = item;
      showPhoto(index);
      lightbox.showModal();
      document.body.classList.add('is-locked');
      lightbox.querySelector('.lightbox-close').focus();
    });
  });
  lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
  lightbox?.querySelector('.lightbox-prev')?.addEventListener('click', () => showPhoto(currentPhoto - 1));
  lightbox?.querySelector('.lightbox-next')?.addEventListener('click', () => showPhoto(currentPhoto + 1));
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox?.addEventListener('close', () => {
    document.body.classList.remove('is-locked');
    lastFocusedElement?.focus();
  });
  lightbox?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') showPhoto(currentPhoto + 1);
    if (event.key === 'ArrowLeft') showPhoto(currentPhoto - 1);
  });

  const wishForm = document.querySelector('#wish-form');
  const wishName = document.querySelector('#wish-name');
  const wishMessage = document.querySelector('#wish-message');
  const wishList = document.querySelector('#wish-list');
  const wishTotal = document.querySelector('#wish-total');
  const formFeedback = document.querySelector('#form-feedback');
  const characterCount = document.querySelector('#character-count');
  const STORAGE_KEY = 'masters-graduation-memories-wishes-v1';
  const MAX_WISHES = 80;

  function readWishes() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter((wish) => wish && typeof wish.name === 'string' && typeof wish.message === 'string').slice(0, MAX_WISHES) : [];
    } catch {
      return [];
    }
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  }

  function renderWishes(wishes) {
    wishList.replaceChildren();
    wishTotal.textContent = `${wishes.length} 則留言`;
    if (wishes.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-wishes';
      empty.textContent = '第一份祝福，等你來留下。';
      wishList.append(empty);
      return;
    }
    wishes.forEach((wish) => {
      const article = document.createElement('article');
      article.className = 'wish-card';
      const header = document.createElement('div');
      header.className = 'wish-card-head';
      const name = document.createElement('strong');
      name.textContent = wish.name;
      const date = document.createElement('time');
      date.dateTime = wish.createdAt;
      date.textContent = formatDate(wish.createdAt);
      const message = document.createElement('p');
      message.textContent = wish.message;
      const mark = document.createElement('span');
      mark.className = 'wish-card-mark';
      mark.textContent = 'With gratitude';
      header.append(name, date);
      article.append(header, message, mark);
      wishList.append(article);
    });
  }

  const savedWishes = readWishes();
  renderWishes(savedWishes);
  wishMessage?.addEventListener('input', () => {
    characterCount.textContent = `${wishMessage.value.length} / 240`;
  });
  wishForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = wishName.value.trim();
    const message = wishMessage.value.trim();
    if (!name || !message) {
      formFeedback.textContent = '請填寫你的名字與祝福內容。';
      (!name ? wishName : wishMessage).focus();
      return;
    }
    if (name.length > 28 || message.length > 240) {
      formFeedback.textContent = '名字最多 28 字，祝福內容最多 240 字。';
      return;
    }
    const entry = { name, message, createdAt: new Date().toISOString() };
    const updated = [entry, ...readWishes()].slice(0, MAX_WISHES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      renderWishes(updated);
      wishForm.reset();
      characterCount.textContent = '0 / 240';
      formFeedback.textContent = '祝福已留下，謝謝你與我們分享。';
    } catch {
      formFeedback.textContent = '目前無法儲存留言，請檢查瀏覽器儲存空間設定。';
    }
  });

  const shareButton = document.querySelector('#share-button');
  const toast = document.querySelector('#toast');
  let toastTimeout;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }
  shareButton?.addEventListener('click', async () => {
    const shareData = { title: document.title, text: '一起翻閱這段畢業回憶。', url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        showToast('頁面連結已複製，可以分享給朋友了。');
      } else {
        showToast('複製網址，分享這份畢業回憶給朋友。');
      }
    } catch (error) {
      if (error.name !== 'AbortError') showToast('分享功能暫時無法使用。');
    }
  });

  document.querySelector('#copyright-year').textContent = String(new Date().getFullYear());
})();
