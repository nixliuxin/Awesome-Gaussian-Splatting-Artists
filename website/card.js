/**
 * Volumography.com — Creator Card Markup
 * Shared by script.js (browser) and scripts/seo.mjs (build), so the list
 * rendered into index.html at build time matches the one the browser draws.
 * No DOM access here.
 */

// Words that should preserve their original case (acronyms, etc.)
const preserveCase = ['VFX', '3D', '4D', '3DGS', '4DGS', 'AI', 'AR', 'VR', 'XR', 'NeRF', 'LiDAR'];

/**
 * Convert string to Title Case
 */
export const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => {
        // Check if word should preserve its case
        const upperTxt = txt.toUpperCase();
        const preserved = preserveCase.find(p => p.toUpperCase() === upperTxt);
        if (preserved) return preserved;
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

/**
 * Format URL for display (remove protocol and www)
 */
export const formatUrl = (url) => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
};

/**
 * Escape data before it goes into markup
 */
export const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Social media icons (SVG)
 */
export const socialIcons = {
    twitter: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    instagram: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
    youtube: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    github: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>',
    linkedin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    tiktok: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>'
};

/**
 * Get asset paths for a creator from the manifest
 * Optimized builds serve WebP (scripts/optimize-images.js)
 */
export const creatorAssets = (creatorId, manifest, useWebP) => {
    const assets = manifest[creatorId] || {};
    const basePath = `assets/creators/${creatorId}`;
    const toWebP = (path) => useWebP ? path.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp') : path;

    return {
        profile: assets.profile ? toWebP(`${basePath}/${assets.profile}`) : null,
        cover: assets.cover ? toWebP(`${basePath}/${assets.cover}`) : null,
        gallery: (assets.gallery || []).map(img => toWebP(`${basePath}/gallery/${img}`))
    };
};

/**
 * Global tag order: by usage count (most to least), then alphabetically
 */
export const getTagOrder = (data) => {
    const tagCounts = {};
    data.forEach(c => c.tags?.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
    }));

    return Object.keys(tagCounts).sort((a, b) => {
        const countDiff = tagCounts[b] - tagCounts[a];
        if (countDiff !== 0) return countDiff;
        return a.localeCompare(b);
    });
};

/**
 * Sort creator's tags according to global tag order
 */
export const sortTagsByOrder = (tags, tagOrder) => {
    if (!tags || !tagOrder.length) return tags || [];
    return [...tags].sort((a, b) => {
        const indexA = tagOrder.indexOf(a);
        const indexB = tagOrder.indexOf(b);
        // If not found in order, put at end
        const posA = indexA === -1 ? Infinity : indexA;
        const posB = indexB === -1 ? Infinity : indexB;
        return posA - posB;
    });
};

/**
 * Inner markup of a creator card (see createCard in script.js for the layout)
 */
export const cardInnerHtml = (creator, { coverImage, profileImage, tagOrder, selectedTags }) => {
    const hasCTLink = !!creator.links?.ct;
    const websiteLink = creator.links?.website || null;
    const name = escapeHtml(creator.name);

    let html = '';

    // ===== MEDIA SECTION (TOP) =====
    html += '<div class="card-media">';

    // Cover image or placeholder
    if (coverImage) {
        html += `<img src="${escapeHtml(coverImage)}" alt="${name}" class="cover-image" loading="lazy">`;
    } else {
        html += '<div class="card-media-placeholder">No Preview</div>';
    }

    // Avatar overlay - ONLY show if creator has avatar image
    if (profileImage) {
        html += `<div class="card-avatar-overlay"><img src="${escapeHtml(profileImage)}" alt="${name}"></div>`;
    }
    // Note: If no avatar, we don't show anything (no initial letter)

    // Link arrow - ONLY if CT link exists
    if (hasCTLink) {
        html += '<span class="card-arrow">↗</span>';
    }
    html += '</div>';

    // ===== INFO SECTION (BOTTOM) =====
    html += '<div class="card-info">';

    // ===== TEXT GROUP (TOP-ALIGNED) =====
    html += '<div class="card-text-group">';

    // Name + Origin Name (if exists)
    html += '<div class="card-name">';
    html += name;  // Preserve original case for proper nouns
    if (creator.name_origin) {
        html += ` <span class="card-origin-name">${escapeHtml(creator.name_origin)}</span>`;
    }
    html += '</div>';

    // Title
    if (creator.title) {
        html += `<div class="card-specialty">${escapeHtml(toTitleCase(creator.title))}</div>`;
    }

    // Subtitle (below title)
    if (creator.subtitle) {
        html += `<div class="card-subtitle">${escapeHtml(creator.subtitle)}</div>`;
    }

    html += '</div>'; // End text-group

    // ===== META GROUP (BOTTOM-ALIGNED) =====
    html += '<div class="card-meta-group">';

    // Line 1: website + social icons
    const hasSocialLinks = creator.links && Object.keys(creator.links).some(k =>
        k !== 'ct' && k !== 'website' && socialIcons[k]
    );

    html += '<div class="card-links-row">';
    if (websiteLink) {
        html += `<a href="${escapeHtml(websiteLink)}" target="_blank" rel="noopener" class="card-link" onclick="event.stopPropagation();">${escapeHtml(formatUrl(websiteLink))}</a>`;
    }
    if (websiteLink && hasSocialLinks) {
        html += '<span class="card-separator">/</span>';
    }
    if (hasSocialLinks) {
        html += '<div class="card-social">';
        for (const [platform, url] of Object.entries(creator.links)) {
            if (url && platform !== 'ct' && platform !== 'website' && socialIcons[platform]) {
                html += `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="social-icon" title="${platform}" onclick="event.stopPropagation();">${socialIcons[platform]}</a>`;
            }
        }
        html += '</div>';
    }
    html += '</div>';

    // Line 2: location (always show row for alignment)
    // Format slashes in location to match separator style
    const formattedLocation = creator.location
        ? creator.location.split(/\s*\/\s*/).map(escapeHtml).join('<span class="card-separator">/</span>')
        : '&nbsp;';
    html += `<div class="card-location">${formattedLocation}</div>`;

    // Tags - sorted by global tag order
    if (creator.tags?.length) {
        html += '<div class="card-tags">';
        const sortedTags = sortTagsByOrder(creator.tags, tagOrder);
        sortedTags.forEach(tag => {
            const isActive = selectedTags.has(tag) ? 'active' : '';
            html += `<button class="tag ${isActive}" data-tag="${escapeHtml(tag)}" onclick="event.stopPropagation(); event.preventDefault(); window.toggleTagFilter('${escapeHtml(tag)}')">${escapeHtml(tag)}</button>`;
        });
        html += '</div>';
    }

    html += '</div>'; // End meta-group
    html += '</div>'; // End card-info

    return html;
};
