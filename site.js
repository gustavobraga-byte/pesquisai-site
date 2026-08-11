/* PesquisAI — site.js
   Barra de progresso, menu mobile, reveal on scroll,
   nav ativa, vídeo com clique-para-reproduzir, copiar citação, voltar ao topo. */
(function(){
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var _i18n = window.PesquisAII18n || null;
  function _t(key){
    if (!_i18n) return key;
    var l = document.documentElement.lang;
    if (l === 'zh-CN') l = 'zh';
    return _i18n.t(key, l);
  }

  /* ── Barra de progresso de rolagem ── */
  var bar = document.getElementById('progressBar');
  function onScrollProgress(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  document.addEventListener('scroll', onScrollProgress, {passive:true});
  onScrollProgress();

  /* ── Menu mobile (hambúrguer) ── */
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('topNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? _t('menu.close') : _t('menu.open'));
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        nav.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded','false');
      });
    });
  }

  /* ── Reveal on scroll ── */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
      });
    }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ── Link ativo na navegação ── */
  var linkMap = {};
  document.querySelectorAll('.topbar-link[href^="#"]').forEach(function(a){
    linkMap[a.getAttribute('href').slice(1)] = a;
  });
  var sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        var link = linkMap[e.target.id];
        if (!link) return;
        if (e.isIntersecting) {
          document.querySelectorAll('.topbar-link.is-active').forEach(function(x){ x.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, {rootMargin: '-40% 0px -55% 0px'});
    sections.forEach(function(s){ so.observe(s); });
  }

  /* ── Vídeo: card-clique abre o YouTube (incorporação desativada pelo canal —
     verificado no endpoint de embed: erro 153 em qualquer referenciador).
     O facade é um <a href> nativo com target=_blank — nenhum JS necessário. */

  /* ── Copiar citações ── */
  function flash(btn, msg){
    var original = btn.textContent;
    btn.textContent = msg || _t('cit.copied');
    btn.classList.add('ok');
    setTimeout(function(){ btn.textContent = original; btn.classList.remove('ok'); }, 1800);
  }
  document.querySelectorAll('.copy-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var target = document.getElementById(btn.dataset.target);
      if (!target) return;
      var text = target.innerText.replace(/^Copiar\s*/, '');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function(){ flash(btn); },
          function(){ fallbackCopy(text, btn); }
        );
      } else {
        fallbackCopy(text, btn);
      }
    });
  });
  function fallbackCopy(text, btn){
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); flash(btn); }
    catch (e) { flash(btn, _t('cit.copied')); }
    ta.remove();
  }

  /* ── Voltar ao topo ── */
  var btt = document.getElementById('backToTop');
  if (btt) {
    document.addEventListener('scroll', function(){
      btt.classList.toggle('show', window.scrollY > 700);
    }, {passive:true});
    btt.addEventListener('click', function(){
      window.scrollTo({top:0, behavior: reduceMotion ? 'auto' : 'smooth'});
    });
  }
})();
