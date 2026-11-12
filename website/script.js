/**
 * Volumography.com — Main Script
 * Sci-Fi OS Style with Recursive Internal Card Layout
 * 
 * CLICK INTERACTION DESIGN:
 * - Clicking card (cover/name) → Opens Creative.Tech page
 * - Clicking website link → Opens official website
 * - Clicking social icons → Opens respective social page
 * - Tags are NOT clickable (just labels)
 */

import { cardInnerHtml, creatorAssets, getTagOrder } from './card.js';

document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const tagFiltersContainer = document.getElementById('tag-filters');
    const sortSelect = document.getElementById('sort-select');
    const resetBtn = document.getElementById('reset-filters');
    const resultsNumber = document.getElementById('results-number');

    let allCreators = [];
    let assetsManifest = {};
    let selectedTags = new Set();
    let currentSort = 'priority';

    /**
     * Get first letter of name for avatar placeholder
     */
    const getInitial = (name) => {
        if (!name) return '?';
        return name.trim().charAt(0).toUpperCase();
    };

    /**
     * Convert image path to WebP (for optimized builds)
     */
    const shouldUseWebP = (() => {
        // Vite replaces `import.meta.env` at build time.
        // - In `vite dev`: PROD === false
        // - In `vite build`: PROD === true
        // - In plain static servers (e.g., VSCode Live Server): `import.meta.env` is undefined
        try {
            return !!(import.meta && import.meta.env && import.meta.env.PROD);
        } catch {
            return false;
        }
    })();

    /**
     * Get asset paths for a creator from the manifest
     */
    const getAssetPaths = (creatorId) => creatorAssets(creatorId, assetsManifest, shouldUseWebP);

    /**
     * Get cover image for a creator
     * Priority: cover > random gallery image > null
     */
    const getCoverImage = (creatorId) => {
        const assets = getAssetPaths(creatorId);
        if (assets.cover) return assets.cover;
        if (assets.gallery && assets.gallery.length > 0) {
            // Random image from gallery
            const randomIndex = Math.floor(Math.random() * assets.gallery.length);
            return assets.gallery[randomIndex];
        }
        return null;
    };

    /**
     * Create a creator card element
     * 
     * STRUCTURE:
     * ┌─────────────────────────┐
     * │ [AVA]              [↗]  │  ← Avatar overlay (only if has avatar), arrow (if CT link)
     * │     [COVER/PREVIEW]     │
     * │                         │
     * ├─────────────────────────┤
     * │ Name                    │  ← Wraps if long
     * │ Title                   │
     * │ Subtitle                │
     * │ Location                │
     * │ website.com             │  ← Mono font, theme color
     * │ 𝕏  ◎  ▶                 │  ← Social icons
     * ├─────────────────────────┤
     * │ [TAG] [TAG]             │  ← Clickable, syncs with filter
     * └─────────────────────────┘
     */
    const createCard = (creator, index) => {
        // Get links
        const ctLink = creator.links?.ct || null;
        const hasCTLink = !!ctLink;

        // Get images from assets manifest
        const assets = getAssetPaths(creator.id);
        const coverImage = getCoverImage(creator.id);

        // Create card container
        const card = document.createElement(hasCTLink ? 'a' : 'div');
        card.className = 'creator-card';
        card.style.animationDelay = `${index * 30}ms`;
        card.dataset.creator = creator.id;
        
        if (hasCTLink) {
            card.href = ctLink;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
        }

        // Build card HTML (shared with the build-time render, see card.js)
        card.innerHTML = cardInnerHtml(creator, {
            coverImage,
            profileImage: assets.profile,
            tagOrder,
            selectedTags
        });

        setupCardBehavior(card, creator);

        return card;
    };

    /**
     * Attach hover carousel and analytics to a card element
     */
    const setupCardBehavior = (card, creator) => {
        const assets = getAssetPaths(creator.id);
        const coverImage = card.querySelector('.cover-image')?.getAttribute('src');

        // Setup hover carousel if multiple images available
        const allImages = [coverImage, ...assets.gallery].filter(Boolean);
        // Remove duplicates
        const uniqueImages = [...new Set(allImages)];
        
        if (uniqueImages.length > 1) {
            setupHoverCarousel(card, uniqueImages);
        }

        // Setup analytics tracking
        setupCardAnalytics(card, creator.id);
    };

    /**
     * Setup hover carousel for card
     * Cycles through images when hovering
     */
    const setupHoverCarousel = (card, images) => {
        const imgElement = card.querySelector('.cover-image');
        if (!imgElement || images.length < 2) return;

        let intervalId = null;
        let currentIndex = 0;
        const originalSrc = imgElement.src;

        card.addEventListener('mouseenter', () => {
            currentIndex = 0;
            intervalId = setInterval(() => {
                currentIndex = (currentIndex + 1) % images.length;
                imgElement.src = images[currentIndex];
            }, 600); // Change image every 600ms
        });

        card.addEventListener('mouseleave', () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            imgElement.src = originalSrc;
        });
    };

    /**
     * Setup analytics tracking for card (Google Analytics 4)
     * Only tracks on volumography.com
     */
    const isProduction = location.hostname === 'volumography.com';
    let hoverStartTimes = {};

    const trackEvent = (eventName, params) => {
        if (isProduction && typeof gtag === 'function') {
            gtag('event', eventName, params);
        }
    };

    const setupCardAnalytics = (card, creatorId) => {
        // Track hover duration
        card.addEventListener('mouseenter', () => {
            hoverStartTimes[creatorId] = Date.now();
        });
        
        card.addEventListener('mouseleave', () => {
            if (hoverStartTimes[creatorId]) {
                const duration = Date.now() - hoverStartTimes[creatorId];
                // Only track hovers between 500ms and 30s (intentional, not AFK)
                if (duration > 500 && duration < 30000) {
                    trackEvent('creator_hover', {
                        creator_id: creatorId,
                        hover_duration_ms: duration
                    });
                }
                delete hoverStartTimes[creatorId];
            }
        });
        
        // Track clicks on links
        card.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                let linkType = 'other';
                if (link.classList.contains('card-link')) {
                    linkType = 'website';
                } else if (link.classList.contains('social-icon')) {
                    linkType = (link.getAttribute('title') || 'social').toLowerCase();
                }
                trackEvent('creator_link_click', {
                    creator_id: creatorId,
                    link_type: linkType
                });
            });
        });
        
        // Track card click (if it's a link to CT)
        if (card.tagName === 'A') {
            card.addEventListener('click', () => {
                trackEvent('creator_card_click', {
                    creator_id: creatorId
                });
            });
        }
    };

    /**
     * Render the gallery
     */
    const renderGallery = () => {
        // Filter
        let filtered = allCreators.filter(creator => {
            if (selectedTags.size === 0) return true;
            return creator.tags && creator.tags.some(tag => selectedTags.has(tag));
        });

        // Sort
        switch (currentSort) {
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'date-desc':
                // Newest first
                filtered.sort((a, b) => (b.addedDate || '').localeCompare(a.addedDate || ''));
                break;
            case 'date-asc':
                // Oldest first
                filtered.sort((a, b) => (a.addedDate || '').localeCompare(b.addedDate || ''));
                break;
            case 'random':
                filtered.sort(() => Math.random() - 0.5);
                break;
            case 'priority':
            default:
                // Keep original order (or could prioritize by other criteria)
                break;
        }

        // Update count
        resultsNumber.textContent = filtered.length;
        
        // Clear and rebuild
        gallery.innerHTML = '';
        
        if (filtered.length === 0) {
            gallery.innerHTML = `
                <div class="col-span-full text-center py-20 bg-[#0a0a0a]">
                    <p class="text-secondary text-sm">No Creators Found</p>
                    <button onclick="document.getElementById('reset-filters').click()" 
                            class="link-accent text-sm mt-4">
                        Clear Filters
                    </button>
                </div>
            `;
            return;
        }
        
        // Create and append cards
        filtered.forEach((creator, index) => {
            const card = createCard(creator, index);
            gallery.appendChild(card);
        });
    };

    /**
     * Adopt the cards the build rendered into #gallery (all creators, featured
     * order) instead of drawing them again, so the first paint stays in place.
     * Returns false when there are none or they do not match the data.
     */
    const hydrateGallery = () => {
        const cards = [...gallery.querySelectorAll('.creator-card')];
        const matches = cards.length === allCreators.length &&
            cards.every((card, index) => card.dataset.creator === allCreators[index].id);
        if (!matches) return false;

        cards.forEach((card, index) => {
            const creator = allCreators[index];
            if (creator.links?.ct) {
                // HTML cannot nest the inner links in a link card, so the build
                // renders these as plain cards; swap in the link card without
                // replaying the fade.
                const linkCard = createCard(creator, index);
                linkCard.style.animation = 'none';
                card.replaceWith(linkCard);
            } else {
                setupCardBehavior(card, creator);
            }
        });

        resultsNumber.textContent = allCreators.length;
        return true;
    };

    /**
     * Setup filter buttons
     */
    // Global tag order (sorted by usage count, populated in setupFilters)
    let tagOrder = [];

    /**
     * Setup filter buttons - sorted by usage count (most to least)
     */
    const setupFilters = (data) => {
        // Sort tags by count (descending), then alphabetically
        tagOrder = getTagOrder(data);

        tagFiltersContainer.innerHTML = '';
        
        tagOrder.forEach(tag => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = tag;
            
            btn.addEventListener('click', () => {
                toggleTagFilter(tag);
            });
            
            tagFiltersContainer.appendChild(btn);
        });
    };

    /**
     * Update CLEAR button state based on selected tags
     */
    const updateClearButtonState = () => {
        resetBtn.classList.toggle('active', selectedTags.size > 0);
    };

    /**
     * Toggle tag filter - can be called from card tags or filter bar
     */
    const toggleTagFilter = (tag) => {
        if (selectedTags.has(tag)) {
            selectedTags.delete(tag);
        } else {
            selectedTags.add(tag);
        }
        
        // Update filter bar buttons
        document.querySelectorAll('#tag-filters .filter-btn').forEach(btn => {
            if (btn.textContent === tag) {
                btn.classList.toggle('active', selectedTags.has(tag));
            }
        });
        
        updateClearButtonState();
        renderGallery();
    };

    // Expose to global scope for inline onclick handlers
    window.toggleTagFilter = toggleTagFilter;

    /**
     * Reset filters
     */
    resetBtn.addEventListener('click', () => {
        selectedTags.clear();
        document.querySelectorAll('#tag-filters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        updateClearButtonState();
        renderGallery();
    });

    /**
     * Sort change
     */
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderGallery();
    });

    /**
     * Load data - creators.json and assets-manifest.json
     */
    Promise.all([
        fetch('data/creators.json').then(res => res.json()),
        fetch('data/assets-manifest.json').then(res => res.json())
    ])
        .then(([creators, manifest]) => {
            allCreators = creators;
            assetsManifest = manifest;
            setupFilters(creators);
            if (!hydrateGallery()) renderGallery();
        })
        .catch(err => {
            console.error('Error loading data:', err);
            gallery.innerHTML = `
                <div class="col-span-full text-center py-20 bg-[#0a0a0a]">
                    <p class="text-red-400 text-sm">Failed To Load Creator Data</p>
                </div>
            `;
        });
});
