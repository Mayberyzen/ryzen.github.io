// Writeups Page Functionality

// Filter functionality
const filterButtons = document.querySelectorAll('.filter-btn');
const writeupItems = document.querySelectorAll('.writeup-item');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        // Filter items
        writeupItems.forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.style.display = 'block';
                item.style.animation = 'fadeIn 0.5s ease-out';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Search functionality
const searchInput = document.getElementById('writeupSearch');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        writeupItems.forEach(item => {
            const title = item.querySelector('h2').textContent.toLowerCase();
            const tags = item.querySelector('.tags')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchTerm) || tags.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// Load more functionality
let visibleCount = 6;
const loadMoreBtn = document.getElementById('loadMore');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        const hiddenItems = Array.from(writeupItems).slice(visibleCount, visibleCount + 3);
        
        hiddenItems.forEach(item => {
            item.style.display = 'block';
            item.style.animation = 'fadeIn 0.5s ease-out';
        });
        
        visibleCount += 3;
        
        if (visibleCount >= writeupItems.length) {
            loadMoreBtn.style.display = 'none';
        }
    });
}

// Reading progress
const progressBar = document.getElementById('readingProgress');
if (progressBar) {
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Code copy buttons
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const code = btn.nextElementSibling.textContent;
        navigator.clipboard.writeText(code).then(() => {
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.color = 'var(--accent-green)';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.color = '';
            }, 2000);
        });
    });
});

// Related writeups
function loadRelatedWriteups(currentCategory, currentId) {
    const relatedContainer = document.getElementById('relatedWriteups');
    if (!relatedContainer) return;
    
    const related = Array.from(writeupItems)
        .filter(item => item.dataset.category === currentCategory && item.id !== currentId)
        .slice(0, 3);
    
    relatedContainer.innerHTML = related.map(item => `
        <a href="${item.querySelector('a').href}" class="related-card">
            <span class="related-difficulty ${item.querySelector('.writeup-badge').classList[1]}">
                ${item.querySelector('.writeup-badge').textContent}
            </span>
            <h4>${item.querySelector('h2').textContent}</h4>
            <span class="related-date">${item.querySelector('.date').textContent}</span>
        </a>
    `).join('');
}