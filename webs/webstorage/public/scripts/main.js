document.addEventListener('DOMContentLoaded', () => {
    const updateCacheButton = document.createElement('button');
    updateCacheButton.innerText = 'Update Cache';

    const clearCacheButton = document.createElement('button');
    clearCacheButton.innerText = 'Clear Cache';

    const container = document.createElement('div');
    container.classList.add('container');
    container.appendChild(updateCacheButton);
    container.appendChild(clearCacheButton);

    document.body.appendChild(container);

    updateCacheButton.addEventListener('click', () => {
        fetch('/styles/main.css')
            .then(response => response.text())
            .then(css => console.log('CSS Fetched:', css));
    });

    clearCacheButton.addEventListener('click', () => {
        caches.delete('my-cache')
            .then(() => console.log('Cache Deleted'))
            .catch(err => console.error('Cache Deletion Error:', err));
    });
});
