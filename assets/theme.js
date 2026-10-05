// Light/dark toggle: follows the OS until the visitor picks one.
(function () {
  var root = document.documentElement, KEY = 'theme';
  try { var saved = localStorage.getItem(KEY); if (saved) root.dataset.theme = saved; } catch (e) {}
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    function current() {
      return root.dataset.theme ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    function label() { btn.textContent = current() === 'dark' ? 'Light mode' : 'Dark mode'; }
    label();
    btn.addEventListener('click', function () {
      root.dataset.theme = current() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY, root.dataset.theme); } catch (e) {}
      label();
    });
  });
})();
