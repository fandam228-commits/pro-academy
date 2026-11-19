const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Target directory paths
const rootDir = path.resolve(__dirname, '..');
const publicIconsDir = path.join(rootDir, 'public', 'icons');
const srcAppDir = path.join(rootDir, 'src', 'app');

// 1. STANDARD ICON SVG (Rounded squircle with gold luxury border for favicon, desktop, PWA standard)
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient: Deep Royal Midnight to Vibrant Sapphire -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08101E"/>
      <stop offset="40%" stop-color="#0E1E38"/>
      <stop offset="80%" stop-color="#142850"/>
      <stop offset="100%" stop-color="#1E3A8A"/>
    </linearGradient>

    <!-- Radial Glow behind the cap & book -->
    <radialGradient id="centerGlow" cx="50%" cy="46%" r="48%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.38"/>
      <stop offset="50%" stop-color="#1D4ED8" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Premium Golden Gradient -->
    <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF0"/>
      <stop offset="25%" stop-color="#FDE68A"/>
      <stop offset="60%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <!-- Golden Border Stroke -->
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" stop-opacity="0.8"/>
      <stop offset="40%" stop-color="#F59E0B" stop-opacity="0.4"/>
      <stop offset="70%" stop-color="#38BDF8" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#60A5FA" stop-opacity="0.8"/>
    </linearGradient>

    <!-- Mortarboard Diamond Gradients for 3D Lighting -->
    <linearGradient id="capTopLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="capTopRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#CBD5E1"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>
    <linearGradient id="capBase" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0A1120"/>
    </linearGradient>

    <!-- Book Page Gradients -->
    <linearGradient id="bookPageLeft" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#DCE7F5"/>
      <stop offset="85%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="bookPageRight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="15%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>

    <!-- Drop Shadows -->
    <filter id="shadowCap" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#020617" flood-opacity="0.6"/>
    </filter>
    <filter id="shadowGold" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#B45309" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- 1. Background Rounded Squircle -->
  <rect width="512" height="512" rx="116" fill="url(#bgGrad)"/>

  <!-- 2. Subtle Luxury Inner Gold/Blue Rim -->
  <rect x="7" y="7" width="498" height="498" rx="110" fill="none" stroke="url(#goldBorder)" stroke-width="3"/>

  <!-- 3. Ambient Center Glow -->
  <circle cx="256" cy="245" r="235" fill="url(#centerGlow)"/>

  <!-- 4. Top Stars of Academic Excellence (Arch) -->
  <g fill="url(#goldSheen)" filter="url(#shadowGold)">
    <!-- Center Star -->
    <path d="M 256 62 L 261 74 L 274 74 L 263 82 L 267 94 L 256 86 L 245 94 L 249 82 L 238 74 L 251 74 Z"/>
    <!-- Left Star -->
    <path transform="translate(192, 74) scale(0.78)" d="M 0 -15 L 4 -3 L 17 -3 L 6 5 L 10 17 L 0 9 L -10 17 L -6 5 L -17 -3 L -4 -3 Z"/>
    <!-- Right Star -->
    <path transform="translate(320, 74) scale(0.78)" d="M 0 -15 L 4 -3 L 17 -3 L 6 5 L 10 17 L 0 9 L -10 17 L -6 5 L -17 -3 L -4 -3 Z"/>
  </g>

  <!-- 5. Open Book of Knowledge (Spreading Wisdom) -->
  <g id="openBook">
    <!-- Under-pages shadow/depth -->
    <path d="M 126 314 C 160 304, 215 304, 256 322 C 297 304, 352 304, 386 314 L 390 376 C 354 366, 297 364, 256 384 C 215 364, 158 366, 122 376 Z" fill="#0B1528" opacity="0.65"/>
    <path d="M 123 319 C 158 309, 215 308, 256 324 C 297 308, 354 309, 389 319 L 387 377 C 352 368, 297 366, 256 385 C 215 366, 160 368, 125 377 Z" fill="#94A3B8"/>

    <!-- Left Page -->
    <path d="M 256 320 C 215 302, 160 304, 126 315 L 126 373 C 160 362, 215 360, 256 380 Z" fill="url(#bookPageLeft)"/>
    <!-- Left Page Texture Lines -->
    <line x1="152" y1="332" x2="232" y2="335" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
    <line x1="152" y1="344" x2="232" y2="347" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
    <line x1="165" y1="356" x2="232" y2="359" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>

    <!-- Right Page -->
    <path d="M 256 320 C 297 302, 352 304, 386 315 L 386 373 C 352 362, 297 360, 256 380 Z" fill="url(#bookPageRight)"/>
    <!-- Right Page Texture Lines -->
    <line x1="280" y1="335" x2="360" y2="332" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
    <line x1="280" y1="347" x2="360" y2="344" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
    <line x1="280" y1="359" x2="347" y2="356" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>

    <!-- Book Golden Spine Accent -->
    <path d="M 254 318 L 258 318 L 258 382 L 254 382 Z" fill="url(#goldSheen)"/>
  </g>

  <!-- 6. Graduation Cap Mortarboard (Center Emblem) -->
  <g id="graduationCap" filter="url(#shadowCap)">
    <!-- Skull Cap Base beneath the diamond -->
    <path d="M 166 220 L 166 264 C 166 295, 206 316, 256 316 C 306 316, 346 295, 346 264 L 346 220 C 316 238, 286 244, 256 244 C 226 244, 196 238, 166 220 Z" fill="url(#capBase)"/>
    <!-- Cap Base Gold Rim -->
    <path d="M 166 264 C 166 295, 206 316, 256 316 C 306 316, 346 295, 346 264" fill="none" stroke="url(#goldSheen)" stroke-width="3" stroke-linecap="round"/>

    <!-- Left Diamond Facet (Lit Face) -->
    <path d="M 256 122 L 86 195 L 256 256 L 256 122 Z" fill="url(#capTopLeft)"/>
    <!-- Right Diamond Facet (Shaded Face) -->
    <path d="M 256 122 L 426 195 L 256 256 L 256 122 Z" fill="url(#capTopRight)"/>

    <!-- Cap Perimeter Subtle Edge -->
    <path d="M 256 122 L 426 195 L 256 256 L 86 195 Z" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.8"/>

    <!-- Golden Tassel Origin Button -->
    <circle cx="256" cy="189" r="9" fill="url(#goldSheen)" filter="url(#shadowGold)"/>

    <!-- Golden Tassel Ribbon String (flowing to the right) -->
    <path d="M 256 189 C 330 190, 396 205, 404 246" fill="none" stroke="url(#goldSheen)" stroke-width="4.5" stroke-linecap="round"/>
    
    <!-- Tassel Golden Ring Clip -->
    <circle cx="404" cy="250" r="5" fill="#D97706"/>
    
    <!-- Tassel Fringe Brush -->
    <path d="M 401 253 L 407 253 L 412 298 C 412 301, 396 301, 396 298 Z" fill="url(#goldSheen)" filter="url(#shadowGold)"/>
  </g>

  <!-- 7. Bottom Luxury "PRO" Emblem Badge -->
  <g id="proBadge" filter="url(#shadowGold)">
    <!-- Badge Background Pill -->
    <rect x="194" y="416" width="124" height="42" rx="21" fill="url(#goldSheen)"/>
    <!-- Inner Dark Stroke -->
    <rect x="197" y="419" width="118" height="36" rx="18" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
    <!-- "PRO" Typography -->
    <text x="256" y="444" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#0A1628" text-anchor="middle" letter-spacing="4">PRO</text>
  </g>
</svg>`;

// 2. MASKABLE ICON SVG (Full bleed square background, scaled content to 80% to fit within Android 409px safe circle)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient: Full bleed square for Android Adaptive Icons -->
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08101E"/>
      <stop offset="40%" stop-color="#0E1E38"/>
      <stop offset="80%" stop-color="#142850"/>
      <stop offset="100%" stop-color="#1E3A8A"/>
    </linearGradient>

    <radialGradient id="centerGlowMask" cx="50%" cy="46%" r="50%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.45"/>
      <stop offset="60%" stop-color="#1D4ED8" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="goldSheenMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF0"/>
      <stop offset="25%" stop-color="#FDE68A"/>
      <stop offset="60%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <linearGradient id="capTopLeftMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="capTopRightMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#CBD5E1"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>
    <linearGradient id="capBaseMask" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0A1120"/>
    </linearGradient>

    <linearGradient id="bookPageLeftMask" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#DCE7F5"/>
      <stop offset="85%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="bookPageRightMask" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="15%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>

    <filter id="shadowCapMask" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#020617" flood-opacity="0.6"/>
    </filter>
    <filter id="shadowGoldMask" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#B45309" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Full Bleed Square Background -->
  <rect width="512" height="512" fill="url(#bgGradMask)"/>
  <circle cx="256" cy="256" r="240" fill="url(#centerGlowMask)"/>

  <!-- Centered Scaled Content (80% scale centered at 256, 256 to ensure complete mask safety) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <!-- Stars -->
    <g fill="url(#goldSheenMask)" filter="url(#shadowGoldMask)">
      <path d="M 256 62 L 261 74 L 274 74 L 263 82 L 267 94 L 256 86 L 245 94 L 249 82 L 238 74 L 251 74 Z"/>
      <path transform="translate(192, 74) scale(0.78)" d="M 0 -15 L 4 -3 L 17 -3 L 6 5 L 10 17 L 0 9 L -10 17 L -6 5 L -17 -3 L -4 -3 Z"/>
      <path transform="translate(320, 74) scale(0.78)" d="M 0 -15 L 4 -3 L 17 -3 L 6 5 L 10 17 L 0 9 L -10 17 L -6 5 L -17 -3 L -4 -3 Z"/>
    </g>

    <!-- Open Book -->
    <g>
      <path d="M 126 314 C 160 304, 215 304, 256 322 C 297 304, 352 304, 386 314 L 390 376 C 354 366, 297 364, 256 384 C 215 364, 158 366, 122 376 Z" fill="#0B1528" opacity="0.65"/>
      <path d="M 123 319 C 158 309, 215 308, 256 324 C 297 308, 354 309, 389 319 L 387 377 C 352 368, 297 366, 256 385 C 215 366, 160 368, 125 377 Z" fill="#94A3B8"/>
      <path d="M 256 320 C 215 302, 160 304, 126 315 L 126 373 C 160 362, 215 360, 256 380 Z" fill="url(#bookPageLeftMask)"/>
      <line x1="152" y1="332" x2="232" y2="335" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
      <line x1="152" y1="344" x2="232" y2="347" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
      <line x1="165" y1="356" x2="232" y2="359" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
      <path d="M 256 320 C 297 302, 352 304, 386 315 L 386 373 C 352 362, 297 360, 256 380 Z" fill="url(#bookPageRightMask)"/>
      <line x1="280" y1="335" x2="360" y2="332" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
      <line x1="280" y1="347" x2="360" y2="344" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
      <line x1="280" y1="359" x2="347" y2="356" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
      <path d="M 254 318 L 258 318 L 258 382 L 254 382 Z" fill="url(#goldSheenMask)"/>
    </g>

    <!-- Graduation Cap -->
    <g filter="url(#shadowCapMask)">
      <path d="M 166 220 L 166 264 C 166 295, 206 316, 256 316 C 306 316, 346 295, 346 264 L 346 220 C 316 238, 286 244, 256 244 C 226 244, 196 238, 166 220 Z" fill="url(#capBaseMask)"/>
      <path d="M 166 264 C 166 295, 206 316, 256 316 C 306 316, 346 295, 346 264" fill="none" stroke="url(#goldSheenMask)" stroke-width="3" stroke-linecap="round"/>
      <path d="M 256 122 L 86 195 L 256 256 L 256 122 Z" fill="url(#capTopLeftMask)"/>
      <path d="M 256 122 L 426 195 L 256 256 L 256 122 Z" fill="url(#capTopRightMask)"/>
      <path d="M 256 122 L 426 195 L 256 256 L 86 195 Z" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.8"/>
      <circle cx="256" cy="189" r="9" fill="url(#goldSheenMask)" filter="url(#shadowGoldMask)"/>
      <path d="M 256 189 C 330 190, 396 205, 404 246" fill="none" stroke="url(#goldSheenMask)" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="404" cy="250" r="5" fill="#D97706"/>
      <path d="M 401 253 L 407 253 L 412 298 C 412 301, 396 301, 396 298 Z" fill="url(#goldSheenMask)" filter="url(#shadowGoldMask)"/>
    </g>

    <!-- PRO Badge -->
    <g filter="url(#shadowGoldMask)">
      <rect x="194" y="416" width="124" height="42" rx="21" fill="url(#goldSheenMask)"/>
      <rect x="197" y="419" width="118" height="36" rx="18" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
      <text x="256" y="444" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#0A1628" text-anchor="middle" letter-spacing="4">PRO</text>
    </g>
  </g>
</svg>`;

async function main() {
  console.log('Generating updated application icons...');

  // 1. Write src/app/icon.svg
  const iconSvgPath = path.join(srcAppDir, 'icon.svg');
  fs.writeFileSync(iconSvgPath, standardSvg.trim(), 'utf8');
  console.log('Written:', iconSvgPath);

  // 2. Generate standard PNG icons at various sizes
  const standardBuffer = Buffer.from(standardSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  const targets = [
    { name: 'icon-192.png', size: 192, buffer: standardBuffer },
    { name: 'icon-192x192.png', size: 192, buffer: standardBuffer },
    { name: 'icon-384.png', size: 384, buffer: standardBuffer },
    { name: 'icon-512.png', size: 512, buffer: standardBuffer },
    { name: 'icon-512x512.png', size: 512, buffer: standardBuffer },
    { name: 'apple-touch-icon.png', size: 180, buffer: standardBuffer },
    { name: 'maskable-512.png', size: 512, buffer: maskableBuffer },
    { name: 'maskable-512x512.png', size: 512, buffer: maskableBuffer },
  ];

  for (const target of targets) {
    const outPath = path.join(publicIconsDir, target.name);
    await sharp(target.buffer)
      .resize(target.size, target.size)
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`Generated: ${target.name} (${target.size}x${target.size})`);
  }

  console.log('All icons generated successfully!');
}

main().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
