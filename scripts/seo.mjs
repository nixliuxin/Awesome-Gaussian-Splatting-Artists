/**
 * Search and answer-engine output for volumography.com (Vite plugin)
 *
 * Built from website/data and the copy in index.html, so it cannot drift
 * from the gallery:
 * - index.html: the creator list rendered into #gallery (script.js adopts it),
 *   the tag filters and count, and one JSON-LD graph
 * - llms.txt: a plain-text summary listing every creator
 *
 * robots.txt, sitemap.xml and the icons live in website/static, which the
 * copy-data script copies to the site root (outside Vite, so their URLs stay
 * unhashed); 404.html is a second Vite entry.
 */

import fs from 'node:fs';
import path from 'node:path';
import { cardInnerHtml, creatorAssets, escapeHtml, getTagOrder } from '../website/card.js';

const ORIGIN = 'https://volumography.com';
const HOME = `${ORIGIN}/`;

// Labels for llms.txt, keyed like creator.links
const LINK_LABELS = {
    ct: 'Creative.Tech',
    instagram: 'Instagram',
    youtube: 'YouTube',
    twitter: 'X',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    tiktok: 'TikTok',
    bilibili: 'Bilibili',
    xhs: 'Xiaohongshu'
};

const decode = (value) => value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const textOf = (html) => decode(html.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());

const pick = (html, pattern, label) => {
    const match = html.match(pattern);
    if (!match) throw new Error(`seo: ${label} not found in index.html`);
    return match[1];
};

const linksIn = (html) => [...html.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map(([, url, name]) => ({ name: textOf(name), url }));

/**
 * Site copy, read from the hero and head of index.html
 */
const siteCopy = (html) => {
    const credits = pick(html, /(Curated by[\s\S]*?)<\/p>/, 'credits line').split('Presented by');
    if (credits.length !== 2) throw new Error('seo: credits line must read "Curated by … Presented by …"');

    return {
        title: textOf(pick(html, /<title>([\s\S]*?)<\/title>/, '<title>')),
        description: decode(pick(html, /<meta name="description" content="([^"]*)"/, 'description')),
        siteName: decode(pick(html, /<meta property="og:site_name" content="([^"]*)"/, 'og:site_name')),
        image: pick(html, /<meta property="og:image" content="([^"]*)"/, 'og:image'),
        name: textOf(pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/, '<h1>')),
        formula: textOf(pick(html, /<p class="hero-formula[^"]*">([\s\S]*?)<\/p>/, 'formula')),
        statement: textOf(pick(html, /<p class="max-w-2xl[^"]*">([\s\S]*?)<\/p>/, 'statement')),
        getListed: pick(html, /<a href="([^"]+)"[^>]*>\s*Get Listed\s*<\/a>/, 'Get Listed link'),
        contributing: pick(html, /<a href="(https:\/\/github\.com\/[^"]+)"/, 'GitHub link'),
        curators: linksIn(credits[0]),
        presenter: linksIn(credits[1])[0]
    };
};

/**
 * One creator as schema.org Person or Organization
 */
const creatorEntity = (creator) => {
    const { website, ...others } = creator.links || {};
    const [url, ...sameAs] = [website, ...Object.values(others)].filter(Boolean);

    // The data has no entity type. Members joined by " + ", or a title naming
    // a studio, a collective or creators (plural), mark a group.
    const members = creator.name_origin?.includes(' + ') ? creator.name_origin.split(' + ') : null;
    const group = !!members || /\b(studio|collective|creators)\b/i.test(creator.title || '');

    const entity = { '@type': group ? 'Organization' : 'Person', name: creator.name };
    if (members) {
        entity.member = members.map(name => ({ '@type': 'Person', name }));
    } else if (creator.name_origin) {
        const names = creator.name_origin.split(' / ');
        entity.alternateName = names.length === 1 ? names[0] : names;
    }
    if (creator.title) entity[group ? 'description' : 'jobTitle'] = creator.title;
    if (creator.location) entity[group ? 'location' : 'homeLocation'] = { '@type': 'Place', name: creator.location };
    if (creator.tags?.length) entity.knowsAbout = creator.tags;
    if (url) entity.url = url;
    if (sameAs.length) entity.sameAs = sameAs;
    return entity;
};

const structuredData = (site, creators) => {
    const graph = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': `${HOME}#website`,
                url: HOME,
                name: site.name,
                alternateName: site.siteName,
                description: site.description,
                inLanguage: 'en'
            },
            {
                '@type': 'CollectionPage',
                '@id': `${HOME}#webpage`,
                url: HOME,
                name: site.title,
                description: site.description,
                inLanguage: 'en',
                isPartOf: { '@id': `${HOME}#website` },
                primaryImageOfPage: { '@type': 'ImageObject', url: site.image },
                editor: site.curators.map(({ name, url }) => ({ '@type': 'Person', name, url })),
                publisher: { '@type': 'Organization', name: site.presenter.name, url: site.presenter.url },
                mainEntity: { '@id': `${HOME}#creators` }
            },
            {
                '@type': 'ItemList',
                '@id': `${HOME}#creators`,
                name: site.name,
                numberOfItems: creators.length,
                itemListElement: creators.map((creator, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    item: creatorEntity(creator)
                }))
            }
        ]
    };
    // Escaping < keeps the JSON inert inside <script>
    return JSON.stringify(graph).replace(/</g, '\\u003c');
};

/**
 * The default gallery view (all creators, featured order), as script.js draws it
 */
const galleryHtml = (creators, manifest, useWebP, tagOrder) => creators.map((creator, index) => {
    const assets = creatorAssets(creator.id, manifest, useWebP);
    // script.js picks a random gallery image when there is no cover; the build takes the first
    const coverImage = assets.cover || assets.gallery[0] || null;
    const inner = cardInnerHtml(creator, { coverImage, profileImage: assets.profile, tagOrder, selectedTags: new Set() });
    // Always a plain card: HTML cannot nest the inner links in a link card (script.js swaps those in)
    return `<div class="creator-card" style="animation-delay: ${index * 30}ms;" data-creator="${escapeHtml(creator.id)}">${inner}</div>`;
}).join('\n');

const llmsTxt = (site, creators) => {
    const md = ({ name, url }) => `[${name}](${url})`;
    const lines = [
        `# ${site.name}`,
        '',
        `> ${site.description}`,
        '',
        `${site.formula}. ${site.statement}`,
        '',
        `Curated by ${site.curators.map(md).join(' and ')}. Presented by ${md(site.presenter)}.`,
        '',
        `- Website: ${HOME}`,
        `- Creator data (JSON): ${HOME}data/creators.json`,
        `- Get listed: ${site.getListed}`,
        `- Contribute on GitHub: ${site.contributing}`,
        '',
        '## Creators',
        '',
        `${creators.length} creators, in the order the site shows them. Tags are the site's own labels.`,
        ''
    ];

    for (const creator of creators) {
        const { website, ...others } = creator.links || {};
        const [url] = [website, ...Object.values(others)].filter(Boolean);
        const name = creator.name_origin ? `${creator.name} (${creator.name_origin})` : creator.name;
        const details = [creator.title, creator.location].filter(Boolean).map(text => `${text}.`);
        if (creator.tags?.length) details.push(`Tags: ${creator.tags.join(', ')}.`);
        const profiles = Object.entries(others)
            .filter(([, link]) => link && link !== url)
            .map(([key, link]) => `${LINK_LABELS[key] || key}: ${link}`);
        if (profiles.length) details.push(profiles.join('; '));
        lines.push(`- ${url ? `[${name}](${url})` : name}: ${details.join(' ')}`);
    }

    return lines.join('\n') + '\n';
};

const replaceOnce = (html, pattern, replace, label) => {
    if (!pattern.test(html)) throw new Error(`seo: ${label} not found in index.html`);
    return html.replace(pattern, replace);
};

export default function seo() {
    let root = '';
    let isBuild = false;

    const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
    const load = () => ({
        site: siteCopy(read('index.html')),
        creators: JSON.parse(read('data/creators.json')),
        manifest: JSON.parse(read('data/assets-manifest.json'))
    });

    return {
        name: 'volumography-seo',

        configResolved(config) {
            root = config.root;
            isBuild = config.command === 'build';
        },

        // Runs after Vite has processed the page, so the image paths stay as written
        transformIndexHtml(html, ctx) {
            if (path.basename(ctx.filename) !== 'index.html') return html;

            const { site, creators, manifest } = load();
            const tagOrder = getTagOrder(creators);
            // Optimized builds serve WebP, like script.js in production
            const cards = galleryHtml(creators, manifest, isBuild, tagOrder);
            const filters = tagOrder.map(tag => `<button class="filter-btn">${escapeHtml(tag)}</button>`).join('');

            html = replaceOnce(html, /(<div id="gallery"[^>]*>)[\s\S]*?Loading\.\.\.<\/div>/,
                (_, open) => `${open}\n${cards}`, 'gallery placeholder');
            html = replaceOnce(html, /(<div id="tag-filters"[^>]*>)[\s\S]*?(<\/div>)/,
                (_, open, close) => `${open}${filters}${close}`, 'tag filters');
            html = replaceOnce(html, /(<span id="results-number">)\d*(<\/span>)/,
                (_, open, close) => `${open}${creators.length}${close}`, 'results count');
            return replaceOnce(html, /<\/head>/,
                () => `    <script type="application/ld+json">${structuredData(site, creators)}</script>\n</head>`, '</head>');
        },

        generateBundle() {
            const { site, creators } = load();
            this.emitFile({ type: 'asset', fileName: 'llms.txt', source: llmsTxt(site, creators) });
        }
    };
}
