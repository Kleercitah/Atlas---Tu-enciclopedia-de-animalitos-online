
(function () {
  'use strict';

  if (!document.querySelector('.screens-root')) return;

  const screens = document.querySelectorAll('.screen');
  const gotoBtns = document.querySelectorAll('[data-goto]');
  const atmosphere = document.querySelector('.atmosphere');

  function goToScreen(name) {
    const target = document.querySelector(`.screen[data-screen="${name}"]`);
    if (!target) return;

    screens.forEach((s) => {
      if (s.classList.contains('active')) {
        s.style.animation = 'none';
        s.offsetHeight;
        s.style.animation = '';
      }
      s.classList.remove('active');
    });

    target.classList.add('active');

    if (name === 'login' || name === 'register') {
      atmosphere.style.transition =
        'filter 1.1s cubic-bezier(0.65, 0, 0.35, 1), transform 1.1s cubic-bezier(0.65, 0, 0.35, 1)';
      atmosphere.style.filter = 'blur(1.5px) brightness(0.9) saturate(0.96)';
      atmosphere.style.transform = 'scale(1.015)';
    } else {
      atmosphere.style.transition =
        'filter 1.1s cubic-bezier(0.65, 0, 0.35, 1), transform 1.1s cubic-bezier(0.65, 0, 0.35, 1)';
      atmosphere.style.filter = 'blur(0) brightness(1) saturate(1)';
      atmosphere.style.transform = 'scale(1)';
    }

    if (history.replaceState) {
      history.replaceState(null, '', '#' + name);
    } else {
      window.location.hash = name;
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  gotoBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-goto');
      if (target) goToScreen(target);
    });
  });

  if (window.location.hash) {
    const initial = window.location.hash.replace('#', '');
    if (['landing', 'login', 'register'].includes(initial)) {
      requestAnimationFrame(() => goToScreen(initial));
    }
  }

  window.addEventListener('hashchange', () => {
    const name = window.location.hash.replace('#', '') || 'landing';
    if (['landing', 'login', 'register'].includes(name)) {
      const active = document.querySelector('.screen.active');
      if (!active || active.dataset.screen !== name) goToScreen(name);
    }
  }, { passive: true });

  /* ---------- Parallax cinematográfico (mouse) ---------- */
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(hover: none)').matches;

  if (!prefersReduce && !coarse) {
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let rafId = null;

    const layers = [
      { sel: '.atmo-mountains',      tx: 0.4,  ty: 0.22 },
      { sel: '.atmo-forest-far',    tx: 0.9,  ty: 0.5  },
      { sel: '.atmo-fog-1',         tx: 1.8,  ty: 0.9  },
      { sel: '.atmo-forest-mid',    tx: 2.4,  ty: 1.2  },
      { sel: '.atmo-fog-2',         tx: 3.0,  ty: 1.6  },
      { sel: '.atmo-forest-near',   tx: 4.2,  ty: 2.2  },
      { sel: '.atmo-veggie-blur',   tx: 6.5,  ty: 3.4  },
      { sel: '.atmo-particles',     tx: 2.8,  ty: 2    },
      { sel: '.atmo-light',         tx: -2.4, ty: -1.2 },
    ];

    const els = layers
      .map((l) => ({ el: document.querySelector(l.sel), tx: l.tx, ty: l.ty }))
      .filter((o) => o.el);

    const photoFox = document.querySelector('.creature-fox');
    const photoOwl = document.querySelector('.creature-owl');

    function tick() {
      mouseX += (targetX - mouseX) * 0.045;
      mouseY += (targetY - mouseY) * 0.045;

      els.forEach(({ el, tx, ty }) => {
        el.style.transform = `translate(${mouseX * tx}px, ${mouseY * ty}px)`;
      });

      if (photoFox) {
        photoFox.style.transform =
          `translate(${mouseX * 5.5}px, ${mouseY * 2.8}px) scale(1.005)`;
      }
      if (photoOwl) {
        photoOwl.style.transform =
          `translate(${mouseX * -6.2}px, ${mouseY * 3.2}px) scale(1.005)`;
      }

      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = (e.clientX - cx) / cx;
      targetY = (e.clientY - cy) / cy;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }, { passive: true });
  }

  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height) * 1.8;
      const x = (e.clientX - rect.left) - size / 2;
      const y = (e.clientY - rect.top)  - size / 2;
      ripple.style.left = x + 'px';
      ripple.style.top  = y + 'px';
      ripple.style.width  = size + 'px';
      ripple.style.height = size + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 760);
    });
  });

  document.querySelectorAll('.field-input input').forEach((inp) => {
    inp.addEventListener('focus', function () {
      this.parentElement.classList.add('is-focused');
    });
    inp.addEventListener('blur', function () {
      this.parentElement.classList.remove('is-focused');
      if (this.value && this.value.length > 0) {
        this.parentElement.classList.add('is-filled');
      } else {
        this.parentElement.classList.remove('is-filled');
      }
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    const landing = document.querySelector('.screen-landing.active');
    if (!landing) return;
  });

})();

(function () {
  'use strict';

  const page = document.querySelector('[data-page="explorer"]');
  if (!page) return;

  if (!window.localStorage.getItem('token')) {
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('currentUser');
    window.location.replace('index.html#login');
    return;
  }

  const API_ROOT = window.ATLAS_API_ROOT || 'http://localhost:3000';
  const INATURALIST_API = 'https://api.inaturalist.org/v1';
  const SEARCH_PAGE_SIZE = 18;
  const SEARCH_CACHE_LIMIT = 12;
  const TOKEN_KEY = 'token';
  const SESSION_KEYS = ['user', 'currentUser'];
  const CATEGORIES = {
    all: { label: 'Todos', taxonId: 1 },
    mammals: { label: 'Mamíferos', taxonId: 40151 },
    birds: { label: 'Aves', taxonId: 3 },
    reptiles: { label: 'Reptiles', taxonId: 26036 },
    amphibians: { label: 'Anfibios', taxonId: 20978 },
    fish: { label: 'Peces', taxonId: 47178 },
    insects: { label: 'Insectos', taxonId: 47158 },
    arachnids: { label: 'Aracnidos', taxonId: 47119 },
  };
  const GROUP_LABELS = {
    Mammalia: 'Mamifero',
    Aves: 'Ave',
    Reptilia: 'Reptil',
    Amphibia: 'Anfibio',
    Actinopterygii: 'Pez',
    Insecta: 'Insecto',
    Arachnida: 'Aracnido',
  };
  const RANK_LABELS = {
    species: 'Especie',
    subspecies: 'Subespecie',
    genus: 'Genero',
    family: 'Familia',
    order: 'Orden',
    class: 'Clase',
  };
  const STATUS_LABELS = {
    descubierto: 'Descubierto',
    investigando: 'Investigando',
    observado: 'Observado',
  };

  const elements = {
    exploreView: document.querySelector('#explore-view'),
    collectionView: document.querySelector('#collection-view'),
    adminView: document.querySelector('#admin-view'),
    exploreTab: document.querySelector('#explore-tab'),
    collectionTab: document.querySelector('#collection-tab'),
    adminTab: document.querySelector('#admin-tab'),
    searchForm: document.querySelector('#animal-search-form'),
    searchInput: document.querySelector('#animal-search'),
    clearSearch: document.querySelector('#clear-search'),
    categories: [...document.querySelectorAll('[data-category]')],
    resultsGrid: document.querySelector('#creature-grid'),
    resultsPagination: document.querySelector('#results-pagination'),
    resultsPrevious: document.querySelector('#results-previous'),
    resultsNext: document.querySelector('#results-next'),
    resultsPageInfo: document.querySelector('#results-page-info'),
    resultsStatus: document.querySelector('#results-status'),
    resultQuery: document.querySelector('#result-query'),
    resultTotal: document.querySelector('#result-total'),
    collectionGrid: document.querySelector('#collection-grid'),
    collectionStatus: document.querySelector('#collection-status'),
    collectionCount: document.querySelector('#collection-count'),
    collectionTotal: document.querySelector('#collection-total'),
    adminStatus: document.querySelector('#admin-status'),
    adminRankings: document.querySelector('#admin-rankings'),
    adminMostSaved: document.querySelector('#admin-most-saved'),
    adminMostViewed: document.querySelector('#admin-most-viewed'),
    detailDialog: document.querySelector('#detail-dialog'),
    detailImage: document.querySelector('#detail-main-image'),
    detailImageFallback: document.querySelector('#detail-photo-fallback'),
    detailPhotoCredit: document.querySelector('#detail-photo-credit'),
    detailThumbnails: document.querySelector('#detail-thumbnails'),
    detailTitle: document.querySelector('#detail-title'),
    detailScientificName: document.querySelector('#detail-scientific-name'),
    detailRank: document.querySelector('#detail-rank'),
    detailSummary: document.querySelector('#detail-summary'),
    detailGroup: document.querySelector('#detail-group'),
    detailObservations: document.querySelector('#detail-observations'),
    detailExternalId: document.querySelector('#detail-external-id'),
    detailSavedState: document.querySelector('#detail-saved-state'),
    detailDiscover: document.querySelector('#detail-discover'),
    editDialog: document.querySelector('#edit-dialog'),
    editForm: document.querySelector('#edit-form'),
    editStatus: document.querySelector('#edit-status'),
    editNotes: document.querySelector('#edit-notes'),
    editFavorite: document.querySelector('#edit-favorite'),
    deleteDialog: document.querySelector('#delete-dialog'),
    confirmDelete: document.querySelector('#confirm-delete'),
    toastRegion: document.querySelector('#toast-region'),
  };

  const state = {
    view: 'explore',
    isAdmin: false,
    query: '',
    category: 'all',
    searchPage: 1,
    taxa: [],
    totalResults: 0,
    discoveries: [],
    taxaById: new Map(),
    taxaRequests: new Map(),
    searchCache: new Map(),
    recordById: new Map(),
    selectedTaxon: null,
    editingRecord: null,
    deletingRecord: null,
    searchController: null,
    detailController: null,
    searchTimer: null,
    searchRequestId: 0,
    collectionRenderId: 0,
    atlasLoaded: false,
    atlasRequest: null,
    adminRequest: null,
    toastTimer: null,
    redirecting: false,
  };

  class ApiError extends Error {
    constructor(message, status, payload) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.payload = payload;
    }
  }

  function getToken() {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  function getSessionRole() {
    try {
      const user = JSON.parse(window.localStorage.getItem('user') || 'null');
      return user && typeof user.role === 'string' ? user.role : '';
    } catch {
      return '';
    }
  }

  function clearSession() {
    window.localStorage.removeItem(TOKEN_KEY);
    SESSION_KEYS.forEach((key) => window.localStorage.removeItem(key));
  }

  function redirectToLogin() {
    if (state.redirecting) return;
    state.redirecting = true;
    clearSession();
    window.location.assign('index.html#login');
  }

  async function readResponse(response) {
    if (response.status === 204) return null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }
    return response.text();
  }

  async function apiFetch(path, options = {}) {
    const token = getToken();
    if (!token) {
      const error = new ApiError('Tu sesión ha terminado. Inicia sesión para continuar.', 401);
      redirectToLogin();
      throw error;
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    let response;
    try {
      response = await fetch(`${API_ROOT}${path}`, { ...options, headers });
    } catch {
      throw new ApiError('No pudimos conectar con ATLAS. Comprueba que el servidor esté disponible.', 0);
    }

    const payload = await readResponse(response);
    if (response.status === 401) {
      redirectToLogin();
      throw new ApiError('Tu sesión ha terminado. Inicia sesión para continuar.', 401, payload);
    }
    if (!response.ok) {
      const message = payload && typeof payload === 'object' && typeof payload.error === 'string'
        ? payload.error
        : 'La operación no pudo completarse.';
      throw new ApiError(message, response.status, payload);
    }
    return payload;
  }

  async function iNaturalistFetch(path, signal) {
    let response;
    try {
      response = await fetch(`${INATURALIST_API}${path}`, {
        headers: { Accept: 'application/json' },
        signal,
      });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new Error('No pudimos conectar con iNaturalist. Intenta nuevamente.');
    }
    if (!response.ok) throw new Error('iNaturalist no pudo completar la consulta.');
    return response.json();
  }

  function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function safePhotoUrl(photo) {
    if (!photo || typeof photo !== 'object') return '';
    const candidates = [photo.medium_url, photo.large_url, photo.square_url, photo.original_url, photo.url];
    for (const value of candidates) {
      if (typeof value !== 'string') continue;
      try {
        const url = new URL(value);
        if (url.protocol === 'https:') return url.href;
      } catch {
        continue;
      }
    }
    return '';
  }

  function getTaxonId(taxon) {
    const id = Number(taxon && taxon.id);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  }

  function getExternalId(record) {
    if (!record || record.external_id === undefined || record.external_id === null) return '';
    return String(record.external_id);
  }

  function getTaxonName(taxon) {
    return typeof taxon.preferred_common_name === 'string' && taxon.preferred_common_name.trim()
      ? taxon.preferred_common_name.trim()
      : (typeof taxon.name === 'string' && taxon.name.trim() ? taxon.name.trim() : 'Nombre no disponible');
  }

  function getScientificName(taxon) {
    return typeof taxon.name === 'string' ? taxon.name : '';
  }

  function getCategoryName(taxon) {
    if (state.category !== 'all' && CATEGORIES[state.category]) return CATEGORIES[state.category].label;
    return GROUP_LABELS[taxon.iconic_taxon_name] || RANK_LABELS[taxon.rank] || 'Grupo no disponible';
  }

  function getRankName(rank) {
    return RANK_LABELS[rank] || (typeof rank === 'string' ? rank : '');
  }

  function getSavedDiscovery(taxonId) {
    const id = String(taxonId);
    return state.discoveries.find((record) => getExternalId(record) === id) || null;
  }

  function formatObservations(value) {
    const count = Number(value);
    return Number.isFinite(count) && count >= 0 ? new Intl.NumberFormat('es').format(count) : 'No disponible';
  }

  function formatDate(value) {
    if (typeof value !== 'string' || !value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(date);
  }

  function showToast(message, kind = 'success') {
    const toast = makeElement('div', `toast-message${kind === 'error' ? ' is-error' : ''}`, message);
    elements.toastRegion.appendChild(toast);
    window.setTimeout(() => toast.remove(), 4300);
  }

  function showPanelMessage(panel, options = {}) {
    panel.replaceChildren();
    panel.hidden = false;
    panel.className = `status-panel${options.kind ? ` is-${options.kind}` : ''}`;

    if (options.kind === 'loading') {
      panel.appendChild(makeElement('span', 'status-spinner'));
      const spinner = panel.firstElementChild;
      spinner.setAttribute('aria-hidden', 'true');
      panel.appendChild(makeElement('span', '', options.message || 'Explorando...'));
      return;
    }

    if (options.title) panel.appendChild(makeElement('strong', '', options.title));
    if (options.message) panel.appendChild(makeElement('span', '', options.message));
    if (options.actionLabel && typeof options.onAction === 'function') {
      const action = makeElement('button', 'action-button', options.actionLabel);
      action.type = 'button';
      action.addEventListener('click', options.onAction, { once: true });
      panel.appendChild(action);
    }
  }

  function hidePanel(panel) {
    panel.hidden = true;
    panel.replaceChildren();
    panel.className = 'status-panel';
  }

  function createFallback(message = 'Fotografía no disponible') {
    const fallback = makeElement('div', 'photo-unavailable');
    fallback.appendChild(makeElement('span', 'fallback-mark'));
    fallback.firstElementChild.setAttribute('aria-hidden', 'true');
    fallback.appendChild(makeElement('span', '', message));
    return fallback;
  }

  function createPhotoFrame(url, alt, options = {}) {
    const frame = makeElement('div', options.frameClass || 'card-image-frame');
    const fallback = createFallback(options.fallbackMessage);
    const loading = options.loading ? makeElement('div', 'photo-loading', options.loadingMessage || 'Cargando ficha...') : null;
    fallback.hidden = Boolean(url) || Boolean(loading);
    frame.appendChild(fallback);
    if (loading) frame.appendChild(loading);

    if (url) {
      const image = makeElement('img');
      image.alt = alt;
      image.loading = options.eager ? 'eager' : 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', () => {
        image.remove();
        fallback.hidden = false;
      }, { once: true });
      frame.appendChild(image);
      image.src = url;
    }
    return frame;
  }

  function createSavedBadge() {
    return makeElement('span', 'saved-badge', 'En mi Atlas');
  }

  function createCreatureCard(taxon) {
    const taxonId = getTaxonId(taxon);
    if (!taxonId) return null;
    state.taxaById.set(String(taxonId), taxon);

    const card = makeElement('article', 'creature-card');
    const imageButton = makeElement('button', 'card-media-button');
    imageButton.type = 'button';
    imageButton.dataset.openTaxon = String(taxonId);
    imageButton.setAttribute('aria-label', `Descubrir ${getTaxonName(taxon)}`);
    const photo = taxon.default_photo;
    imageButton.appendChild(createPhotoFrame(safePhotoUrl(photo), `Fotografía de ${getTaxonName(taxon)}`));

    if (getSavedDiscovery(taxonId)) imageButton.appendChild(createSavedBadge());
    const rank = getRankName(taxon.rank);
    if (rank) imageButton.appendChild(makeElement('span', 'card-rank', rank));
    card.appendChild(imageButton);

    const body = makeElement('div', 'card-body');
    body.appendChild(makeElement('h3', 'card-title', getTaxonName(taxon)));
    body.appendChild(makeElement('p', 'card-scientific', getScientificName(taxon)));
    const foot = makeElement('div', 'card-foot');
    const observations = Number(taxon.observations_count);
    foot.appendChild(makeElement('span', 'card-observations', Number.isFinite(observations) ? `${formatObservations(observations)} observaciones` : getCategoryName(taxon)));
    const action = makeElement('button', 'card-action');
    action.type = 'button';
    action.dataset.openTaxon = String(taxonId);
    action.appendChild(document.createTextNode('Descubrir '));
    action.appendChild(makeElement('span', '', '↗'));
    action.setAttribute('aria-label', `Ver ficha de ${getTaxonName(taxon)}`);
    foot.appendChild(action);
    body.appendChild(foot);
    card.appendChild(body);
    return card;
  }

  function renderAnimalCards() {
    elements.resultsGrid.replaceChildren();
    const fragment = document.createDocumentFragment();
    state.taxa.forEach((taxon) => {
      const card = createCreatureCard(taxon);
      if (card) fragment.appendChild(card);
    });
    elements.resultsGrid.appendChild(fragment);
    elements.resultQuery.textContent = state.query ? `· ${state.query}` : '';
    elements.resultTotal.textContent = state.totalResults
      ? `${new Intl.NumberFormat('es').format(state.totalResults)} resultados`
      : `${state.taxa.length} resultados`;

    const totalPages = Math.max(1, Math.ceil(state.totalResults / SEARCH_PAGE_SIZE));
    const firstResult = (state.searchPage - 1) * SEARCH_PAGE_SIZE + 1;
    const lastResult = Math.min(state.searchPage * SEARCH_PAGE_SIZE, state.totalResults);
    elements.resultsPageInfo.textContent = `${new Intl.NumberFormat('es').format(firstResult)}–${new Intl.NumberFormat('es').format(lastResult)} de ${new Intl.NumberFormat('es').format(state.totalResults)}`;
    elements.resultsPagination.hidden = totalPages <= 1;
    elements.resultsPrevious.disabled = state.searchPage <= 1;
    elements.resultsNext.disabled = state.searchPage >= totalPages;
  }

  function updateCategoryControls() {
    elements.categories.forEach((button) => {
      const active = button.dataset.category === state.category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  async function searchAnimals(options = {}) {
    const query = typeof options.query === 'string' ? options.query.trim() : elements.searchInput.value.trim();
    if (options.resetPage || query !== state.query) state.searchPage = 1;
    else if (Number.isInteger(options.page)) state.searchPage = Math.max(1, options.page);
    state.query = query;
    elements.searchInput.value = query;
    elements.clearSearch.hidden = !query;
    updateCategoryControls();

    const category = CATEGORIES[state.category] || CATEGORIES.all;
    const cacheKey = `${state.category}|${query.toLocaleLowerCase()}|${state.searchPage}`;
    if (!options.force && state.searchCache.has(cacheKey)) {
      const cached = state.searchCache.get(cacheKey);
      state.searchCache.delete(cacheKey);
      state.searchCache.set(cacheKey, cached);
      state.taxa = cached.taxa;
      state.totalResults = cached.totalResults;
      hidePanel(elements.resultsStatus);
      renderAnimalCards();
      return;
    }

    if (state.searchController) state.searchController.abort();
    state.searchController = new AbortController();
    const controller = state.searchController;
    const requestId = ++state.searchRequestId;
    elements.resultsGrid.replaceChildren();
    elements.resultsPagination.hidden = true;
    elements.resultTotal.textContent = '';
    showPanelMessage(elements.resultsStatus, { kind: 'loading', message: 'Explorando registros...' });

    const params = new URLSearchParams({
      taxon_id: String(category.taxonId),
      rank: 'species',
      per_page: String(SEARCH_PAGE_SIZE),
      page: String(state.searchPage),
      order_by: 'observations_count',
      order: 'desc',
      is_active: 'true',
      locale: 'es',
    });
    if (query) params.set('q', query);

    try {
      const payload = await iNaturalistFetch(`/taxa?${params.toString()}`, controller.signal);
      if (requestId !== state.searchRequestId) return;
      const taxa = Array.isArray(payload.results)
        ? payload.results.filter((taxon) => getTaxonId(taxon))
        : [];
      state.taxa = taxa;
      state.totalResults = Number(payload.total_results) || taxa.length;
      state.searchCache.set(cacheKey, { taxa, totalResults: state.totalResults });
      if (state.searchCache.size > SEARCH_CACHE_LIMIT) {
        state.searchCache.delete(state.searchCache.keys().next().value);
      }

      if (!taxa.length) {
        showPanelMessage(elements.resultsStatus, {
          kind: 'empty',
          title: 'No encontramos criaturas con esa búsqueda.',
          message: 'Prueba con otro nombre o selecciona una categoría distinta.',
        });
        elements.resultQuery.textContent = query ? `· ${query}` : '';
        elements.resultTotal.textContent = '0 resultados';
        return;
      }

      hidePanel(elements.resultsStatus);
      renderAnimalCards();
    } catch (error) {
      if (error.name === 'AbortError' || requestId !== state.searchRequestId) return;
      showPanelMessage(elements.resultsStatus, {
        kind: 'error',
        title: 'No pudimos cargar las criaturas.',
        message: error.message || 'Intenta nuevamente.',
        actionLabel: 'Reintentar',
        onAction: () => searchAnimals({ force: true }),
      });
      elements.resultQuery.textContent = query ? `· ${query}` : '';
    }
  }

  function debounceSearch() {
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(() => searchAnimals(), 360);
  }

  function addDialogScrollLock() {
    document.body.classList.add('has-open-dialog');
  }

  function removeDialogScrollLock() {
    if (![elements.detailDialog, elements.editDialog, elements.deleteDialog].some((dialog) => dialog.open)) {
      document.body.classList.remove('has-open-dialog');
    }
  }

  function setDetailPhoto(url, alt) {
    elements.detailImage.hidden = true;
    elements.detailImage.removeAttribute('src');
    elements.detailImageFallback.hidden = false;
    elements.detailPhotoCredit.hidden = true;
    elements.detailPhotoCredit.textContent = '';
    if (!url) return;

    elements.detailImage.alt = alt;
    elements.detailImage.addEventListener('error', () => {
      elements.detailImage.hidden = true;
      elements.detailImage.removeAttribute('src');
      elements.detailImageFallback.hidden = false;
      elements.detailPhotoCredit.hidden = true;
    }, { once: true });
    elements.detailImage.src = url;
    elements.detailImage.hidden = false;
    elements.detailImageFallback.hidden = true;
  }

  function updateDetailSavedState() {
    if (!state.selectedTaxon) return;
    const saved = getSavedDiscovery(getTaxonId(state.selectedTaxon));
    elements.detailSavedState.hidden = !saved;
    elements.detailDiscover.disabled = Boolean(saved);
    elements.detailDiscover.textContent = saved ? 'Ya está en tu Atlas' : 'Añadir a Mi Atlas';
    if (!saved) elements.detailDiscover.appendChild(makeElement('span', '', '+'));
  }

  function setDetailGallery(taxon) {
    const photos = [];
    const addPhoto = (photo) => {
      const url = safePhotoUrl(photo);
      if (!url || photos.some((entry) => entry.url === url)) return;
      photos.push({ url, attribution: typeof photo.attribution === 'string' ? photo.attribution : '' });
    };
    addPhoto(taxon.default_photo);
    if (Array.isArray(taxon.taxon_photos)) {
      taxon.taxon_photos.forEach((item) => addPhoto(item && item.photo));
    }

    elements.detailThumbnails.replaceChildren();
    const alternatives = photos.slice(1, 5);
    if (!alternatives.length) {
      elements.detailThumbnails.hidden = true;
      return;
    }

    [photos[0], ...alternatives].forEach((photo, index) => {
      const button = makeElement('button', `photo-thumbnail${index === 0 ? ' is-active' : ''}`);
      button.type = 'button';
      button.setAttribute('aria-label', `Ver fotografía ${index + 1}`);
      button.setAttribute('aria-pressed', String(index === 0));
      const image = makeElement('img');
      image.src = photo.url;
      image.alt = `Miniatura ${index + 1} de ${getTaxonName(taxon)}`;
      image.loading = 'lazy';
      image.addEventListener('error', () => button.remove(), { once: true });
      button.appendChild(image);
      button.addEventListener('click', () => {
        setDetailPhoto(photo.url, `Fotografía de ${getTaxonName(taxon)}`);
        elements.detailThumbnails.querySelectorAll('.photo-thumbnail').forEach((thumbnail) => {
          const active = thumbnail === button;
          thumbnail.classList.toggle('is-active', active);
          thumbnail.setAttribute('aria-pressed', String(active));
        });
        elements.detailPhotoCredit.textContent = photo.attribution;
        elements.detailPhotoCredit.hidden = !photo.attribution;
      });
      elements.detailThumbnails.appendChild(button);
    });
    elements.detailThumbnails.hidden = false;
  }

  async function loadTaxonGallery(taxon, signal) {
    const id = getTaxonId(taxon);
    if (!id) return;
    try {
      const payload = await iNaturalistFetch(`/taxa/${id}?locale=es`, signal);
      if (signal.aborted || !Array.isArray(payload.results) || !payload.results[0]) return;
      const detailTaxon = payload.results[0];
      setDetailGallery(detailTaxon);
      const attribution = detailTaxon.default_photo && detailTaxon.default_photo.attribution;
      if (typeof attribution === 'string' && attribution.trim()) {
        elements.detailPhotoCredit.textContent = attribution;
        elements.detailPhotoCredit.hidden = false;
      }
      if (typeof detailTaxon.wikipedia_summary === 'string' && detailTaxon.wikipedia_summary.trim()) {
        const parsed = new DOMParser().parseFromString(detailTaxon.wikipedia_summary, 'text/html');
        const summary = (parsed.body.textContent || '').trim();
        if (summary) {
          elements.detailSummary.textContent = summary;
          elements.detailSummary.hidden = false;
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') elements.detailThumbnails.hidden = true;
    }
  }

  function openAnimalDetail(taxon) {
    const id = getTaxonId(taxon);
    if (!id) return;
    state.selectedTaxon = taxon;
    elements.detailTitle.textContent = getTaxonName(taxon);
    elements.detailScientificName.textContent = getScientificName(taxon);
    elements.detailScientificName.hidden = !getScientificName(taxon);
    elements.detailRank.textContent = getRankName(taxon.rank);
    elements.detailGroup.textContent = getCategoryName(taxon);
    elements.detailObservations.textContent = formatObservations(taxon.observations_count);
    elements.detailExternalId.textContent = String(id);
    elements.detailSummary.textContent = '';
    elements.detailSummary.hidden = true;
    elements.detailThumbnails.replaceChildren();
    elements.detailThumbnails.hidden = true;
    setDetailPhoto(safePhotoUrl(taxon.default_photo), `Fotografía de ${getTaxonName(taxon)}`);
    updateDetailSavedState();
    if (!elements.detailDialog.open) elements.detailDialog.showModal();
    addDialogScrollLock();
    recordTaxonView(id);
    if (state.detailController) state.detailController.abort();
    state.detailController = new AbortController();
    loadTaxonGallery(taxon, state.detailController.signal);
  }

  function showCollectionEmpty() {
    showPanelMessage(elements.collectionStatus, {
      kind: 'empty',
      title: 'Tu Atlas todavía está vacío.',
      message: 'Explora el mundo y guarda tu primera criatura.',
      actionLabel: 'Explorar criaturas',
      onAction: () => setView('explore'),
    });
  }

  function showCollectionSessionMessage() {
    showPanelMessage(elements.collectionStatus, {
      kind: 'empty',
      title: 'Inicia sesión para abrir tu Atlas.',
      message: 'Tu colección se sincroniza con tu cuenta.',
      actionLabel: 'Ir a iniciar sesión',
      onAction: redirectToLogin,
    });
  }

  function createAtlasCard(record, taxon, options = {}) {
    const card = makeElement('article', 'creature-card collection-card');
    const recordKey = String(record.id === undefined || record.id === null ? getExternalId(record) : record.id);
    card.dataset.recordId = recordKey;

    const imageButton = makeElement('button', 'card-media-button');
    imageButton.type = 'button';
    imageButton.disabled = !taxon;
    const name = taxon ? getTaxonName(taxon) : 'Ficha taxonómica';
    imageButton.setAttribute('aria-label', taxon ? `Ver ficha de ${name}` : 'Ficha de iNaturalist no disponible');
    imageButton.appendChild(createPhotoFrame(
      taxon ? safePhotoUrl(taxon.default_photo) : '',
      taxon ? `Fotografía de ${name}` : 'Fotografía de criatura guardada',
      { loading: !taxon && options.loading, loadingMessage: 'Cargando tu Atlas...' , fallbackMessage: options.failed ? 'Ficha de iNaturalist no disponible' : 'Fotografía no disponible' },
    ));
    if (taxon && getSavedDiscovery(getTaxonId(taxon))) imageButton.appendChild(createSavedBadge());
    if (taxon) {
      imageButton.addEventListener('click', () => openAnimalDetail(taxon));
    }
    card.appendChild(imageButton);

    const body = makeElement('div', 'card-body');
    body.appendChild(makeElement('h3', 'card-title', taxon ? getTaxonName(taxon) : (options.failed ? 'Ficha no disponible' : 'Recuperando ficha...')));
    body.appendChild(makeElement('p', 'card-scientific', taxon ? getScientificName(taxon) : `Registro iNaturalist ${getExternalId(record)}`));

    const meta = makeElement('div', 'collection-meta');
    const status = STATUS_LABELS[record.status] || STATUS_LABELS.descubierto;
    meta.appendChild(makeElement('span', 'collection-status-label', status));
    if (taxon && Number.isFinite(Number(taxon.observations_count))) {
      meta.appendChild(makeElement('span', '', `${formatObservations(taxon.observations_count)} observaciones`));
    }
    const created = formatDate(record.created_at);
    if (created) meta.appendChild(makeElement('span', '', created));
    body.appendChild(meta);

    const noteText = typeof record.notes === 'string' && record.notes.trim()
      ? record.notes.trim()
      : 'Sin notas personales';
    body.appendChild(makeElement('p', 'collection-notes', noteText));

    const actions = makeElement('div', 'collection-actions');
    const edit = makeElement('button', 'text-action', 'Editar');
    edit.type = 'button';
    edit.dataset.editRecord = recordKey;
    actions.appendChild(edit);
    const remove = makeElement('button', 'text-action', 'Eliminar');
    remove.type = 'button';
    remove.dataset.deleteRecord = recordKey;
    actions.appendChild(remove);
    const favorite = makeElement('button', `favorite-button${record.favorite ? ' is-favorite' : ''}`, record.favorite ? '♥' : '♡');
    favorite.type = 'button';
    favorite.dataset.favoriteRecord = recordKey;
    favorite.setAttribute('aria-label', record.favorite ? 'Quitar de favoritos' : 'Marcar como favorita');
    favorite.setAttribute('aria-pressed', String(Boolean(record.favorite)));
    actions.appendChild(favorite);
    body.appendChild(actions);
    card.appendChild(body);
    return card;
  }

  function renderMyAtlas(options = {}) {
    const records = state.discoveries;
    elements.collectionGrid.replaceChildren();
    elements.collectionCount.textContent = String(records.length);
    elements.collectionCount.setAttribute('aria-label', `${records.length} criaturas guardadas`);
    elements.collectionTotal.textContent = String(records.length);

    if (!records.length) {
      showCollectionEmpty();
      return;
    }

    hidePanel(elements.collectionStatus);
    state.recordById.clear();
    const fragment = document.createDocumentFragment();
    const renderId = ++state.collectionRenderId;
    records.forEach((record) => {
      const recordKey = String(record.id === undefined || record.id === null ? getExternalId(record) : record.id);
      state.recordById.set(recordKey, record);
      const taxon = state.taxaById.get(getExternalId(record)) || null;
      fragment.appendChild(createAtlasCard(record, taxon, { loading: !taxon }));
    });
    elements.collectionGrid.appendChild(fragment);
    if (options.hydrate !== false) hydrateCollection(records, renderId);
  }

  async function fetchTaxonById(id) {
    const cached = state.taxaById.get(String(id));
    if (cached) return cached;
    if (state.taxaRequests.has(String(id))) return state.taxaRequests.get(String(id));
    const request = iNaturalistFetch(`/taxa/${encodeURIComponent(id)}?locale=es`)
      .then((payload) => {
        const taxon = Array.isArray(payload.results) ? payload.results[0] : null;
        if (!taxon || !getTaxonId(taxon)) throw new Error('No encontramos la ficha taxonómica.');
        state.taxaById.set(String(taxon.id), taxon);
        return taxon;
      })
      .finally(() => state.taxaRequests.delete(String(id)));
    state.taxaRequests.set(String(id), request);
    return request;
  }

  function createAdminRankingRows(listElement, items, countField) {
    listElement.replaceChildren();
    if (!items.length) {
      listElement.appendChild(makeElement('li', 'admin-ranking-empty', 'Todavía no hay datos.'));
      return [];
    }

    return items.map((item, index) => {
      const row = makeElement('li', 'admin-ranking-row');
      row.appendChild(makeElement('span', 'admin-ranking-place', String(index + 1).padStart(2, '0')));
      const details = makeElement('span', 'admin-ranking-details');
      const name = makeElement('span', 'admin-ranking-name', `iNaturalist #${item.external_id}`);
      const scientificName = makeElement('span', 'admin-ranking-scientific', '');
      details.append(name, scientificName);
      row.appendChild(details);
      row.appendChild(makeElement('strong', 'admin-ranking-count', formatObservations(item[countField])));
      listElement.appendChild(row);
      return { externalId: String(item.external_id), name, scientificName };
    });
  }

  async function hydrateAdminRankingNames(entries) {
    let cursor = 0;
    const worker = async () => {
      while (cursor < entries.length) {
        const entry = entries[cursor];
        cursor += 1;
        try {
          const taxon = await fetchTaxonById(entry.externalId);
          entry.name.textContent = getTaxonName(taxon);
          entry.scientificName.textContent = getScientificName(taxon);
        } catch {
          entry.scientificName.textContent = `Registro iNaturalist ${entry.externalId}`;
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, entries.length) }, worker));
  }

  async function loadAdminMetrics() {
    if (!state.isAdmin) return;
    if (state.adminRequest) return state.adminRequest;

    elements.adminRankings.hidden = true;
    showPanelMessage(elements.adminStatus, { kind: 'loading', message: 'Cargando tendencias...' });
    state.adminRequest = (async () => {
      try {
        const metrics = await apiFetch('/api/admin/metrics');
        if (!metrics || !Array.isArray(metrics.mostSaved) || !Array.isArray(metrics.mostViewed)) {
          throw new Error('El servidor devolvió métricas no válidas.');
        }
        const savedRows = createAdminRankingRows(elements.adminMostSaved, metrics.mostSaved, 'saved_count');
        const viewedRows = createAdminRankingRows(elements.adminMostViewed, metrics.mostViewed, 'view_count');
        elements.adminRankings.hidden = false;
        hidePanel(elements.adminStatus);
        await hydrateAdminRankingNames([...savedRows, ...viewedRows]);
      } catch (error) {
        if (error.status === 401) return;
        showPanelMessage(elements.adminStatus, {
          kind: 'error',
          title: 'No pudimos cargar las tendencias.',
          message: error.status === 403 ? 'Esta cuenta no tiene permisos de administración.' : (error.message || 'Intenta nuevamente.'),
          actionLabel: 'Reintentar',
          onAction: () => {
            state.adminRequest = null;
            loadAdminMetrics();
          },
        });
      } finally {
        state.adminRequest = null;
      }
    })();
    return state.adminRequest;
  }

  async function recordTaxonView(externalId) {
    if (!getToken()) return;
    try {
      await apiFetch('/api/discoveries/views', {
        method: 'POST',
        body: JSON.stringify({ external_id: externalId }),
      });
    } catch (error) {
      if (error.status !== 401) console.warn('No se pudo registrar la vista de la ficha.');
    }
  }

  async function hydrateCollection(records, renderId) {
    let cursor = 0;
    const worker = async () => {
      while (cursor < records.length) {
        const record = records[cursor];
        cursor += 1;
        const externalId = getExternalId(record);
        if (!/^\d+$/.test(externalId)) continue;
        try {
          const taxon = await fetchTaxonById(externalId);
          if (renderId !== state.collectionRenderId) return;
          const recordKey = String(record.id === undefined || record.id === null ? externalId : record.id);
          const existingCard = [...elements.collectionGrid.children].find((card) => card.dataset.recordId === recordKey);
          if (existingCard) existingCard.replaceWith(createAtlasCard(record, taxon));
        } catch {
          if (renderId !== state.collectionRenderId) return;
          const recordKey = String(record.id === undefined || record.id === null ? externalId : record.id);
          const existingCard = [...elements.collectionGrid.children].find((card) => card.dataset.recordId === recordKey);
          if (existingCard) existingCard.replaceWith(createAtlasCard(record, null, { failed: true }));
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, records.length) }, worker));
  }

  async function loadMyAtlas(options = {}) {
    if (!getToken()) {
      state.atlasLoaded = false;
      elements.collectionGrid.replaceChildren();
      showCollectionSessionMessage();
      elements.collectionCount.textContent = '0';
      elements.collectionTotal.textContent = '0';
      return;
    }
    if (state.atlasRequest) return state.atlasRequest;
    if (state.atlasLoaded && !options.force) {
      renderMyAtlas();
      return;
    }

    showPanelMessage(elements.collectionStatus, { kind: 'loading', message: 'Cargando tu Atlas...' });
    elements.collectionGrid.replaceChildren();
    state.atlasRequest = (async () => {
      try {
        const rows = await apiFetch('/api/discoveries');
        if (!Array.isArray(rows)) throw new Error('El servidor devolvió un formato de colección no válido.');
        state.discoveries = rows;
        state.atlasLoaded = true;
        renderMyAtlas();
        if (state.view === 'explore') renderAnimalCards();
      } catch (error) {
        if (error.status === 401) return;
        state.atlasLoaded = false;
        showPanelMessage(elements.collectionStatus, {
          kind: 'error',
          title: 'No pudimos cargar tu Atlas.',
          message: error.message || 'Intenta nuevamente.',
          actionLabel: 'Reintentar',
          onAction: () => loadMyAtlas({ force: true }),
        });
      } finally {
        state.atlasRequest = null;
      }
    })();
    return state.atlasRequest;
  }

  function setView(view) {
    state.view = view === 'collection' ? 'collection' : (view === 'admin' && state.isAdmin ? 'admin' : 'explore');
    const showCollection = state.view === 'collection';
    const showAdmin = state.view === 'admin';
    elements.exploreView.hidden = showCollection || showAdmin;
    elements.collectionView.hidden = !showCollection;
    elements.adminView.hidden = !showAdmin;
    elements.exploreTab.classList.toggle('is-active', !showCollection && !showAdmin);
    elements.collectionTab.classList.toggle('is-active', showCollection);
    elements.adminTab.classList.toggle('is-active', showAdmin);
    elements.exploreTab.setAttribute('aria-selected', String(!showCollection && !showAdmin));
    elements.collectionTab.setAttribute('aria-selected', String(showCollection));
    elements.adminTab.setAttribute('aria-selected', String(showAdmin));
    if (showCollection) loadMyAtlas();
    else if (showAdmin) loadAdminMetrics();
    else elements.searchInput.focus({ preventScroll: true });
  }

  function upsertDiscovery(record) {
    const externalId = getExternalId(record);
    const index = state.discoveries.findIndex((item) => getExternalId(item) === externalId);
    if (index >= 0) state.discoveries[index] = record;
    else state.discoveries.push(record);
    state.atlasLoaded = true;
    elements.collectionCount.textContent = String(state.discoveries.length);
    elements.collectionCount.setAttribute('aria-label', `${state.discoveries.length} criaturas guardadas`);
    elements.collectionTotal.textContent = String(state.discoveries.length);
    if (state.taxa.length) renderAnimalCards();
    updateDetailSavedState();
    if (state.view === 'collection') renderMyAtlas();
  }

  async function saveDiscovery(taxon) {
    const externalId = getTaxonId(taxon);
    if (!externalId) {
      showToast('No pudimos identificar este registro de iNaturalist.', 'error');
      return;
    }
    if (getSavedDiscovery(externalId)) {
      updateDetailSavedState();
      showToast('Esta criatura ya está en tu Atlas.');
      return;
    }
    elements.detailDiscover.disabled = true;
    elements.detailDiscover.textContent = 'Guardando...';
    try {
      const saved = await apiFetch('/api/discoveries', {
        method: 'POST',
        body: JSON.stringify({ external_id: externalId, notes: '' }),
      });
      const record = saved && typeof saved === 'object'
        ? saved
        : { external_id: externalId, notes: '', status: 'descubierto', favorite: false };
      if (record.external_id === undefined || record.external_id === null) record.external_id = externalId;
      if (!record.status) record.status = 'descubierto';
      state.taxaById.set(String(externalId), taxon);
      upsertDiscovery(record);
      showToast('Criatura añadida a tu Atlas.');
    } catch (error) {
      if (error.status === 409) {
        showToast('Esta criatura ya forma parte de tu Atlas.');
        await loadMyAtlas({ force: true });
      } else if (error.status !== 401) {
        showToast(error.message || 'No pudimos guardar la criatura.', 'error');
      }
    } finally {
      updateDetailSavedState();
    }
  }

  function openEditDialog(record) {
    state.editingRecord = record;
    elements.editStatus.value = STATUS_LABELS[record.status] ? record.status : 'descubierto';
    elements.editNotes.value = typeof record.notes === 'string' ? record.notes : '';
    elements.editFavorite.checked = Boolean(record.favorite);
    elements.editDialog.showModal();
    addDialogScrollLock();
    elements.editStatus.focus();
  }

  function patchDiscovery(record, patch) {
    const payload = {
      status: typeof record.status === 'string' && record.status ? record.status : 'descubierto',
      notes: typeof record.notes === 'string' ? record.notes : '',
      favorite: Boolean(record.favorite),
      ...patch,
    };
    return apiFetch(`/api/discoveries/${encodeURIComponent(record.id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  function replaceDiscovery(previous, updated) {
    const merged = { ...previous, ...(updated && typeof updated === 'object' ? updated : {}) };
    const externalId = getExternalId(previous);
    const index = state.discoveries.findIndex((record) => getExternalId(record) === externalId);
    if (index >= 0) state.discoveries[index] = merged;
    else state.discoveries.push(merged);
    state.recordById.set(String(merged.id), merged);
    return merged;
  }

  async function updateDiscovery(record, patch) {
    try {
      const updated = await patchDiscovery(record, patch);
      replaceDiscovery(record, updated);
      renderMyAtlas();
      updateDetailSavedState();
      showToast('Registro actualizado.');
      return true;
    } catch (error) {
      if (error.status !== 401) showToast(error.message || 'No pudimos actualizar el registro.', 'error');
      return false;
    }
  }

  function openDeleteDialog(record) {
    state.deletingRecord = record;
    elements.deleteDialog.showModal();
    addDialogScrollLock();
    elements.confirmDelete.focus();
  }

  async function deleteDiscovery(record) {
    elements.confirmDelete.disabled = true;
    try {
      await apiFetch(`/api/discoveries/${encodeURIComponent(record.id)}`, { method: 'DELETE' });
      state.discoveries = state.discoveries.filter((item) => String(item.id) !== String(record.id));
      state.atlasLoaded = true;
      elements.deleteDialog.close();
      renderMyAtlas({ hydrate: false });
      if (state.taxa.length) renderAnimalCards();
      showToast('Criatura eliminada de tu Atlas.');
    } catch (error) {
      if (error.status !== 401) showToast(error.message || 'No pudimos eliminar el registro.', 'error');
    } finally {
      elements.confirmDelete.disabled = false;
    }
  }

  function closeDialog(dialog) {
    if (dialog.open) dialog.close();
  }

  function bindDialog(dialog) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      removeDialogScrollLock();
      if (dialog === elements.detailDialog && state.detailController) {
        state.detailController.abort();
        state.detailController = null;
      }
    });
  }

  elements.searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    window.clearTimeout(state.searchTimer);
    searchAnimals({ force: true, resetPage: true });
  });

  elements.searchInput.addEventListener('input', () => {
    elements.clearSearch.hidden = !elements.searchInput.value;
    debounceSearch();
  });

  elements.clearSearch.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.searchInput.focus();
    elements.clearSearch.hidden = true;
    searchAnimals({ query: '', force: true, resetPage: true });
  });

  elements.resultsPrevious.addEventListener('click', () => {
    searchAnimals({ page: state.searchPage - 1 });
  });

  elements.resultsNext.addEventListener('click', () => {
    searchAnimals({ page: state.searchPage + 1 });
  });

  elements.categories.forEach((button) => {
    button.addEventListener('click', () => {
      state.category = CATEGORIES[button.dataset.category] ? button.dataset.category : 'all';
      state.searchPage = 1;
      searchAnimals({ force: true });
    });
  });

  state.isAdmin = getSessionRole() === 'admin';
  elements.adminTab.hidden = !state.isAdmin;

  document.querySelectorAll('[data-view-target]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.viewTarget));
  });

  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', redirectToLogin);
  });

  elements.resultsGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-taxon]');
    if (!button) return;
    const taxon = state.taxaById.get(button.dataset.openTaxon);
    if (taxon) openAnimalDetail(taxon);
  });

  elements.collectionGrid.addEventListener('click', (event) => {
    const control = event.target.closest('[data-edit-record], [data-delete-record], [data-favorite-record]');
    if (!control) return;
    const record = state.recordById.get(control.dataset.editRecord || control.dataset.deleteRecord || control.dataset.favoriteRecord);
    if (!record) return;
    if (control.hasAttribute('data-edit-record')) openEditDialog(record);
    else if (control.hasAttribute('data-delete-record')) openDeleteDialog(record);
    else updateDiscovery(record, { favorite: !Boolean(record.favorite) });
  });

  elements.detailDiscover.addEventListener('click', () => {
    if (state.selectedTaxon && !getSavedDiscovery(getTaxonId(state.selectedTaxon))) {
      saveDiscovery(state.selectedTaxon);
    }
  });

  elements.editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.editingRecord) return;
    const submit = elements.editForm.querySelector('[type="submit"]');
    submit.disabled = true;
    const updated = await updateDiscovery(state.editingRecord, {
      status: elements.editStatus.value,
      notes: elements.editNotes.value.trim(),
      favorite: elements.editFavorite.checked,
    });
    if (updated) {
      closeDialog(elements.editDialog);
      state.editingRecord = null;
    }
    submit.disabled = false;
  });

  elements.confirmDelete.addEventListener('click', () => {
    if (state.deletingRecord) deleteDiscovery(state.deletingRecord);
  });

  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => closeDialog(button.closest('dialog')));
  });

  [elements.detailDialog, elements.editDialog, elements.deleteDialog].forEach(bindDialog);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openDialog = [elements.detailDialog, elements.editDialog, elements.deleteDialog]
      .find((dialog) => dialog.open);
    if (!openDialog) return;
    event.preventDefault();
    openDialog.close();
  });

  searchAnimals();
  if (getToken()) loadMyAtlas();
  else showCollectionSessionMessage();
})();

(function () {
  'use strict';

  const root = document.querySelector('.screens-root');
  const loginForm = document.querySelector('#login-form');
  const registerForm = document.querySelector('#register-form');
  if (!root || !loginForm || !registerForm) return;

  const API_ROOT = window.ATLAS_API_ROOT || 'http://localhost:3000';
  const loginFeedback = document.querySelector('#login-feedback');
  const registerFeedback = document.querySelector('#register-feedback');
  const loginButton = loginForm.querySelector('[type="submit"]');
  const registerButton = registerForm.querySelector('[type="submit"]');

  function setFeedback(element, message, kind) {
    element.textContent = message;
    element.hidden = !message;
    element.classList.toggle('is-error', kind === 'error');
    element.classList.toggle('is-success', kind === 'success');
  }

  function setSubmitting(button, isSubmitting, label) {
    button.disabled = isSubmitting;
    const buttonLabel = button.querySelector('.btn-label');
    if (buttonLabel) buttonLabel.textContent = isSubmitting ? label : button.dataset.originalLabel;
  }

  [loginButton, registerButton].forEach((button) => {
    button.dataset.originalLabel = button.querySelector('.btn-label')?.textContent || '';
  });

  async function postAuth(path, payload) {
    let response;
    try {
      response = await fetch(`${API_ROOT}/auth/${path}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error('No pudimos conectar con ATLAS. Intenta nuevamente.');
    }

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    if (!response.ok) {
      throw new Error(typeof data.error === 'string' ? data.error : 'No pudimos completar la solicitud.');
    }
    return data;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setFeedback(loginFeedback, '', '');
    setSubmitting(loginButton, true, 'Validando...');

    try {
      const formData = new FormData(loginForm);
      const result = await postAuth('login', {
        email: String(formData.get('email') || '').trim(),
        password: String(formData.get('password') || ''),
      });
      if (typeof result.token !== 'string' || !result.token) {
        throw new Error('El servidor no devolvió un token de sesión válido.');
      }
      window.localStorage.setItem('token', result.token);
      if (result.user && typeof result.user === 'object') {
        window.localStorage.setItem('user', JSON.stringify(result.user));
      }
      window.location.assign('explorer.html');
    } catch (error) {
      setFeedback(loginFeedback, error.message, 'error');
      setSubmitting(loginButton, false);
    }
  });

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setFeedback(registerFeedback, '', '');

    const formData = new FormData(registerForm);
    const password = String(formData.get('password') || '');
    const passwordConfirmation = String(formData.get('password_confirmation') || '');
    if (password !== passwordConfirmation) {
      setFeedback(registerFeedback, 'Las contraseñas no coinciden.', 'error');
      document.querySelector('#register-password-confirm').focus();
      return;
    }

    setSubmitting(registerButton, true, 'Creando cuenta...');
    try {
      const email = String(formData.get('email') || '').trim();
      const result = await postAuth('registro', {
        name: String(formData.get('name') || '').trim(),
        email,
        password,
      });
      setFeedback(registerFeedback, result.mensaje || 'Cuenta creada. Te llevaremos al inicio de sesión.', 'success');
      window.setTimeout(() => {
        const loginEmail = document.querySelector('#login-email');
        loginEmail.value = email;
        document.querySelector('.screen-register [data-goto="login"]').click();
        setFeedback(loginFeedback, 'Cuenta creada. Inicia sesión para continuar.', 'success');
        loginEmail.focus();
      }, 1400);
    } catch (error) {
      setFeedback(registerFeedback, error.message, 'error');
    } finally {
      setSubmitting(registerButton, false);
    }
  });
})();
