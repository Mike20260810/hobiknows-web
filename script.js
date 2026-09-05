document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const cards = document.querySelectorAll('.card');

    // Real-time search filter
    searchInput.addEventListener('keyup', (e) => {
        const query = e.target.value.toLowerCase().trim();

        cards.forEach((card) => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const desc = card.querySelector('.card-desc').textContent.toLowerCase();
            const tag = card.querySelector('.card-tag').textContent.toLowerCase();

            // Check if search query matches title, description, or tag
            if (title.includes(query) || desc.includes(query) || tag.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});