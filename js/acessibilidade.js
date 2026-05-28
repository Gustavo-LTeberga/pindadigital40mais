const FONTES = ['menor', 'normal', 'maior', 'maxima'];
const FONTES_MSG = {
  menor: 'Fonte diminuída.', normal: 'Fonte no tamanho padrão.',
  maior: 'Fonte aumentada.', maxima: 'Fonte no tamanho máximo.'
};

function alterarFonte(t) {
  const html = document.documentElement;
  FONTES.forEach(f => html.classList.remove('fonte-' + f));
  if (t !== 'normal') html.classList.add('fonte-' + t);
  FONTES.forEach(f => {
    const b = document.getElementById('btn-fonte-' + f);
    if (!b) return;
    b.classList.toggle('ativo', f === t);
    b.setAttribute('aria-pressed', f === t ? 'true' : 'false');
  });
  localStorage.setItem('acesso-fonte', t);
  anunciar(FONTES_MSG[t]);
}

function toggleContraste() {
  const ativo = document.documentElement.classList.toggle('alto-contraste');
  const b = document.getElementById('btn-contraste');
  b.classList.toggle('ativo', ativo);
  b.setAttribute('aria-pressed', String(ativo));
  localStorage.setItem('acesso-contraste', ativo ? '1' : '0');
  anunciar(ativo ? 'Alto contraste ativado.' : 'Alto contraste desativado.');
}

function toggleEspaco() {
  const ativo = document.documentElement.classList.toggle('espaco-texto');
  const b = document.getElementById('btn-espaco');
  b.classList.toggle('ativo', ativo);
  b.setAttribute('aria-pressed', String(ativo));
  localStorage.setItem('acesso-espaco', ativo ? '1' : '0');
  anunciar(ativo ? 'Espaçamento ampliado.' : 'Espaçamento normal.');
}

function toggleFoco() {
  const ativo = document.documentElement.classList.toggle('foco-visivel');
  const b = document.getElementById('btn-foco');
  b.classList.toggle('ativo', ativo);
  b.setAttribute('aria-pressed', String(ativo));
  localStorage.setItem('acesso-foco', ativo ? '1' : '0');
  anunciar(ativo ? 'Destaque de foco ativado. Use a tecla Tab.' : 'Destaque de foco desativado.');
}

function resetarTudo() {
  alterarFonte('normal');
  const html = document.documentElement;
  if (html.classList.contains('alto-contraste')) toggleContraste();
  if (html.classList.contains('espaco-texto')) toggleEspaco();
  if (html.classList.contains('foco-visivel')) toggleFoco();
  ttsParar();
  if (document.getElementById('painel-tts').classList.contains('visivel')) togglePainelTTS();
  ['acesso-fonte', 'acesso-contraste', 'acesso-espaco', 'acesso-foco'].forEach(k => localStorage.removeItem(k));
  anunciar('Acessibilidade redefinida.');
}

let ttsVelocidade = 1;
const suportaTTS = 'speechSynthesis' in window;

function togglePainelTTS() {
  const p = document.getElementById('painel-tts');
  const b = document.getElementById('btn-tts');
  const aberto = p.classList.toggle('visivel');
  b.classList.toggle('ativo', aberto);
  b.setAttribute('aria-expanded', String(aberto));
  if (!suportaTTS && aberto)
    p.querySelector('p').textContent = '⚠️ Seu navegador não suporta leitura em voz alta. Use Chrome ou Edge.';
}

function _ttsFalar(texto) {
  if (!suportaTTS) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'pt-BR'; u.rate = ttsVelocidade; u.pitch = 1;
  const vozes = speechSynthesis.getVoices();
  const voz = vozes.find(v => v.lang.startsWith('pt'));
  if (voz) u.voice = voz;
  u.onstart = () => document.getElementById('tts-status').classList.add('visivel');
  u.onend = u.onerror = () => document.getElementById('tts-status').classList.remove('visivel');
  speechSynthesis.speak(u);
}

function ttsLerPagina() {
  const els = document.querySelectorAll('h1, h2, h3, h4, h5, p, li');
  const texto = Array.from(els).map(e => e.innerText.trim()).filter(t => t.length > 1).join('. ');
  _ttsFalar(texto);
}

function ttsLerSecao() {
  const secoes = document.querySelectorAll('section, main, footer, article');
  let atual = secoes[0];
  secoes.forEach(s => { if (s.getBoundingClientRect().top <= 80) atual = s; });
  _ttsFalar(atual ? atual.innerText.trim() : '');
}

function ttsPausar() {
  if (!suportaTTS) return;
  const b = document.getElementById('btn-pausar');
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    b.innerHTML = '<i class="bi bi-pause-fill"></i> Pausar';
    anunciar('Leitura retomada.');
  } else {
    speechSynthesis.pause();
    b.innerHTML = '<i class="bi bi-play-fill"></i> Retomar';
    anunciar('Leitura pausada.');
  }
}

function ttsParar() {
  if (!suportaTTS) return;
  speechSynthesis.cancel();
  document.getElementById('tts-status').classList.remove('visivel');
}

function ttsAjustarVelocidade(v) {
  ttsVelocidade = parseFloat(v);
  document.getElementById('tts-vel-label').textContent = parseFloat(v).toFixed(1) + '×';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') ttsParar(); });

function anunciar(msg) {
  const el = document.getElementById('aria-anunciador');
  el.textContent = '';
  setTimeout(() => { el.textContent = msg; }, 60);
}

(function () {
  alterarFonte(localStorage.getItem('acesso-fonte') || 'normal');
  if (localStorage.getItem('acesso-contraste') === '1') toggleContraste();
  if (localStorage.getItem('acesso-espaco') === '1') toggleEspaco();
  if (localStorage.getItem('acesso-foco') === '1') toggleFoco();
})();