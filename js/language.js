const form = document.querySelector('.form_language');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const language = form.language.value.toUpperCase();
    localStorage.setItem('language', language);
    window.location.reload(); // Recargar la página para aplicar el nuevo idioma
});