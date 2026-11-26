document.querySelectorAll('.ptv-menu').forEach(menu => {
  const trigger = menu.querySelector('summary');

  document.addEventListener('click', event => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !menu.open) return;
    const returnFocus = menu.contains(document.activeElement);
    menu.open = false;
    if (returnFocus) trigger.focus();
  });

  menu.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (link.origin === location.origin &&
          link.pathname === location.pathname &&
          link.hash && link.hash !== location.hash) {
        menu.open = false;
        const section = document.getElementById(link.hash.slice(1));
        if (section) {
          if (!section.hasAttribute('tabindex')) section.tabIndex = -1;
          section.focus({ preventScroll: true });
        }
      } else {
        if (menu.contains(document.activeElement)) trigger.focus();
        menu.open = false;
      }
    });
  });
});
