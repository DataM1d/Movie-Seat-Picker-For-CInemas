const lsKeys = {
    selectedSeats: 'selectedSeats',
    selectedMovieIndex: 'selectedMovieIndex',
    selectedMoviePrice: 'selectedMoviePrice',
    theme: 'theme'
};

const selectors = {
    seatAvaliable: '.row .seat:not(.occupied)',
    seatSelected: '.row .seat.selected'
};

const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));
const currency = new Intl.NumberFormat(navigator.language || 'en-US', {
    style: 'currency',
    currency: 'USD'
});

const container = $('#container');
const seats = $$(selectors.seatAvaliable);
const countEl = $('#count');
const totalEl = $('#total');
const movieSelect = $('#movie');
const clearBtn = $('#clear');
const themeBtn = $('#themeToggle');

const state = {
    ticketPrice: +movieSelect.value,
    selectedSeatIdx: JSON.parse(localStorage.getItem(lsKeys.selectedSeats) || '[]'),
    movieIndex: +(localStorage.getItem(lsKeys.selectedMovieIndex) ?? movieSelect.selectedIndex),
    theme: localStorage.getItem(lsKeys.theme) || (matchMedia('(prefers-color-scheme: light'). matches ? 'light' : 'dark'),
};

const saveState =  () => {
    localStorage.setItem(lsKeys.selectedSeats, JSON.stringify(state.selectedSeatIdx));
    localStorage.setItem(lsKeys.selectedMovieIndex, String(state.movieIndex));
    localStorage.setItem(lsKeys.selectedMoviePrice, String(state.ticketPrice));
    localStorage.setItem(lsKeys.theme, String(state.theme));
};

const applyTheme = () => {
    document.documentElement.classList.toggle('light', state.theme === 'light');
    themeBtn.setAttribute('aria-pressed', state.theme === 'light' ? 'true' : 'false');
};

const restoreUIFromState = () => {
    movieSelect.selectedIndex = state.movieIndex;
    state.ticketPrice = +movieSelect.value;
      seats.forEach((seat, idx) => {
        seat.classList.toggle('selected', state.selectedSeatIdx.includes(idx));
      });
    updateSummary();
};

const updateSummary = () => {
    const selectedCount = $$(selectors.seatSelected).length;
    countEl.textContent = selectedCount;
    totalEl.textContent = currency.format(selectedCount * state.ticketPrice);
};

const toggleSeatSelection = (target) => {
    if (!target.classList.contains('seat') || target.classList.contains('occupied')) return;

    const idx = seats.indexOf(target);
    if (idx === -1) return;
    target.classList.toggle('selected');

    if (target.classList.contains('selected')) {
        if (!state.selectedSeatIdx.includes(idx)) state.selectedSeatIdx.push(idx);
    } else {
        state.selectedSeatIdx = state.selectedSeatIdx.filter(i => i !== idx);
    }

    updateSummary();
    saveState();
};

const wireEvents = () => {
    container.addEventListener('click', (e) => toggleSeatSelection(e.target));

    container.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && !e.target.classList.contains('occupied')) {
            e.preventDefault();
            toggleSeatSelection(e.target);
        }
    });

    movieSelect.addEventListener('change', (e) => {
        state.ticketPrice = +e.target.value;
        state.movieIndex = e.target.selectedIndex;
        updateSummary();
        saveState();
    });

    clearBtn.addEventListener('click', () => {
        seats.forEach(seat => seat.classList.remove('selected'));
        state.selectedSeatIdx = [];
        updateSummary();
        saveState();
    });

    themeBtn.addEventListener('click', () => {
        state.theme = (state.theme === 'light') ? 'dark' : 'light';
        applyTheme();
        saveState();
    });
};

(function init() {
    applyTheme();
    restoreUIFromState();
    wireEvents();
})();

