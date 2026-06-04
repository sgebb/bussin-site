(function () {
  // Apply theme immediately to prevent flashing
  const savedTheme = localStorage.getItem('bussin_site_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const activeTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  if (activeTheme === 'light') {
    document.documentElement.classList.add('light-theme');
  } else {
    document.documentElement.classList.remove('light-theme');
  }

  // Once DOM is fully loaded, inject the toggle button next to the brand logo
  document.addEventListener('DOMContentLoaded', () => {
    const brand = document.querySelector('.header-brand .brand');
    if (!brand) return;
    
    // Create the toggle button
    const btn = document.createElement('button');
    btn.className = 'theme-toggle-btn';
    btn.setAttribute('aria-label', 'Toggle light/dark theme');
    btn.setAttribute('type', 'button');
    updateButtonContent(btn);
    
    btn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light-theme');
      localStorage.setItem('bussin_site_theme', isLight ? 'light' : 'dark');
      updateButtonContent(btn);
    });
    
    // Insert directly after the brand element (so it shows next to the logo)
    brand.parentNode.insertBefore(btn, brand.nextSibling);
  });

  function updateButtonContent(btn) {
    const isLight = document.documentElement.classList.contains('light-theme');
    
    // SVGs for Moon (light theme active -> click to turn dark) and Sun (dark theme active -> click to turn light)
    btn.innerHTML = isLight 
      ? `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>` // Moon icon
      : `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`; // Sun icon
  }
})();
