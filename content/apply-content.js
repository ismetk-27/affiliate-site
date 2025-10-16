(async function () {
  try {
    const res = await fetch('/content/site.json', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();

    // === Sayfa başlığı ===
    if (data.page_title) document.title = data.page_title;

    // === Arkaplan görseli (CSS override) ===
    try {
      if (data.background?.image) {
        document.body.style.backgroundImage = `url('${data.background.image}')`;
      }
      if (data.background?.size) document.body.style.backgroundSize = data.background.size;
      if (data.background?.repeat) document.body.style.backgroundRepeat = data.background.repeat;
      if (data.background?.attachment) document.body.style.backgroundAttachment = data.background.attachment;
    } catch {}

    // === Logo ===
    try {
      const logoImg = document.querySelector('.logo img');
      if (logoImg && data.logo?.src) {
        logoImg.src = data.logo.src;
        if (data.logo?.alt) logoImg.alt = data.logo.alt;
      }
    } catch {}

    // === Sosyal ikonlar (link + ikon src) ===
    try {
      const socials = data.socials || {};
      // Link düğümlerini sırayla bul
      const links = document.querySelectorAll('nav.social a');
      const imgs  = document.querySelectorAll('nav.social a img');

      // Telegram Sohbet
      if (links[0] && socials.telegram_chat_url) links[0].href = socials.telegram_chat_url;
      if (imgs[0]  && socials.telegram_chat_icon) imgs[0].src  = socials.telegram_chat_icon;

      // Telegram Duyuru
      if (links[1] && socials.telegram_announce_url) links[1].href = socials.telegram_announce_url;
      if (imgs[1]  && socials.telegram_announce_icon) imgs[1].src  = socials.telegram_announce_icon;

      // YouTube 1
      if (links[2] && socials.youtube1_url) links[2].href = socials.youtube1_url;
      if (imgs[2]  && socials.youtube1_icon) imgs[2].src  = socials.youtube1_icon;

      // YouTube 2
      if (links[3] && socials.youtube2_url) links[3].href = socials.youtube2_url;
      if (imgs[3]  && socials.youtube2_icon) imgs[3].src  = socials.youtube2_icon;
    } catch {}

    // === Sabit Bannerlar ===
    function applyFixed(side, cfg) {
      const root = document.querySelector(`.fixed-banner.${side}-banner`);
      if (!root) return;
      if (cfg?.enabled === false) { root.style.display = 'none'; return; }
      const link = root.querySelector('a');
      const img = root.querySelector('.banner-img-wrapper img');
      const text = root.querySelector('.banner-text');
      if (link && cfg?.href) link.href = cfg.href;
      if (img && cfg?.image) img.src = cfg.image;
      if (text && cfg?.text) text.textContent = cfg.text;
    }
    applyFixed('left', data.left_fixed_banner);
    applyFixed('right', data.right_fixed_banner);

    // === Mobil Slider ===
    try {
      const slider = Array.isArray(data.mobile_banners) ? data.mobile_banners : [];
      const bannerLink = document.querySelector("#bannerLink");
      if (bannerLink && slider.length) {
        const bannerImg = bannerLink.querySelector("img");
        const bannerText = bannerLink.querySelector(".slide-text");
        let current = 0;
        function draw(i) {
          bannerLink.href = slider[i].link || '#';
          bannerImg.src   = slider[i].img  || '';
          bannerImg.alt   = "Banner " + (i + 1);
          bannerText.textContent = slider[i].text || '';
        }
        draw(0);
        setInterval(() => { current = (current + 1) % slider.length; draw(current); }, 2000);
      }
    } catch {}

    // === Sponsor Kartları (liste; tüm görseller) ===
    try {
      const grid = document.querySelector('.sponsor-grid');
      if (grid && Array.isArray(data.sponsors)) {
        grid.innerHTML = '';
        data.sponsors.forEach(s => {
          const a = document.createElement('a');
          a.href = s.href || '#';
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.innerHTML = `
            <div class="sponsor-card">
              <div class="sponsor-img-wrapper">
                <img class="sponsor-img" src="${s.image || ''}" alt="Sponsor">
                <div class="hover-overlay"><p>${s.hover || ''}</p></div>
              </div>
              <div class="sponsor-mobile-text">${s.hover || ''}</div>
              <img class="sponsor-logo" src="${s.logo || ''}" alt="Logo">
            </div>`;
          grid.appendChild(a);
        });
      }
    } catch {}

    // === VIP Kartları (liste; tüm görseller) ===
    try {
      const vipGrid = document.querySelector('.vip-grid');
      if (vipGrid && Array.isArray(data.vip_cards)) {
        vipGrid.innerHTML = '';
        data.vip_cards.forEach(v => {
          const a = document.createElement('a');
          a.href = v.href || '#';
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.innerHTML = `
            <div class="vip-card">
              <img src="${v.img || ''}" alt="VIP">
              <p>${v.text || ''}</p>
              <span class="btn">Giriş Yap</span>
            </div>`;
          vipGrid.appendChild(a);
        });
      }
    } catch {}

// === Popup ===
    try {
      const overlay = document.getElementById('popup');
      if (overlay) {
        // ... aktif/pasif kontrolü
        } else {
          const linkA = overlay.querySelector('.popup-content a[target="_blank"]'); // Tıklanabilir görselin link etiketi
          const img = overlay.querySelector('.popup-content img');
          const p   = overlay.querySelector('.popup-content p');
          const emailA   = overlay.querySelector('.popup-content a.popup-btn'); // E-posta link etiketi

             // 🚨 BU KISIM ÇOK ÖNEMLİ: Linki JS ile dolduruyoruz
          if (linkA && data.popup?.link) linkA.href = data.popup.link; 

             // Diğer verilerin doldurulması
          if (img && data.popup?.image) img.src = data.popup.image;
          if (p   && data.popup?.text)  p.textContent = data.popup.text;
          if (emailA   && data.popup?.email) { 
                emailA.textContent = data.popup.email; 
                emailA.href = 'mailto:' + data.popup.email; 
            }
        }
      }
    } catch {}

    // === Footer e-posta ===
    try {
      const footerA = document.querySelector('.site-footer a[href^="mailto:"]');
      const footerP = document.querySelector('.site-footer p');
      if (footerA && data.footer?.email) {
        footerA.textContent = data.footer.email;
        footerA.href = 'mailto:' + data.footer.email;
      }
      if (footerP && data.footer?.email) {
        footerP.innerHTML = `📢 Reklam &amp; İş Birliği için: <a href="mailto:${data.footer.email}">${data.footer.email}</a>`;
      }
    } catch {}

  } catch {
    // JSON bulunamazsa mevcut statik içerikle devam
  }
})();
