(function(){
  // HSL 转 HEX
  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    const to255 = v => Math.round((v + m) * 255);
    const toHex = v => v.toString(16).padStart(2, '0');
    return `#${toHex(to255(r))}${toHex(to255(g))}${toHex(to255(b))}`;
  }

  function normalizeHue(h) { return (h % 360 + 360) % 360; }

  // 不局限色系：相近色的浅色双色渐变（更亮、色差加倍）
  function chooseSimilarLightPair() {
    var baseHue = Math.random() * 360;                 // 0-360 全色系
    var dHue = 16 + Math.random() * 12;                // 16-28：相近色偏移（更明显）
    var h1 = normalizeHue(baseHue - dHue / 2);
    var h2 = normalizeHue(baseHue + dHue / 2);

    var sBase = 46 + Math.random() * 10;               // 46-56：在高亮度下保持色感
    var s1 = Math.max(42, Math.min(60, sBase + (Math.random() * 6 - 3)));
    var s2 = Math.max(42, Math.min(60, sBase + (Math.random() * 6 - 3)));

    var lBase = 84 + Math.random() * 4;                // 84-88：更浅基准
    var lDelta = 10 + Math.random() * 4;               // 10-14：左右亮度差更大
    var l1 = Math.max(68, Math.min(90, lBase - lDelta)); // 左更深
    var l2 = Math.max(90, Math.min(98, lBase + lDelta)); // 右更浅

    var leftHex = hslToHex(h1, s1, l1);
    var rightHex = hslToHex(h2, s2, l2);

    var themeHue = (h1 + h2) / 2;
    var themeSat = (s1 + s2) / 2;
    var themeLight = (l1 + l2) / 2;
    var themeHex = hslToHex(themeHue, themeSat, themeLight);

    return { leftHex, rightHex, themeHex };
  }

  var pair = chooseSimilarLightPair();

  function applySimilarLightCover() {
    var cover = document.querySelector('.cover');
    if (!cover) return;
    cover.style.backgroundImage = `linear-gradient(90deg, ${pair.leftHex} 0%, ${pair.rightHex} 100%)`;
    cover.style.backgroundColor = pair.leftHex; // 兜底色
    cover.style.backgroundSize = 'cover';
    cover.style.backgroundPosition = 'center';
  }

  // 提供插件函数，供 index.html 的 window.$docsify.plugins 使用
  function coverPlugin(hook, vm) {
    hook.doneEach(function () {
      if (!vm.route.path || vm.route.path === '/') {
        applySimilarLightCover();
      }
    });
  }



  // 暴露 API，供 index.html 使用（不修改 window.$docsify）
  window.SiteTheme = {
    pair: pair,
    applySimilarLightCover: applySimilarLightCover,
    coverPlugin: coverPlugin
  };
})();