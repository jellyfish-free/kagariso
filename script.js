"use strict";

// 表示処理。怪異の追加・修正は data.js で行います。
(() => {
  const main = document.querySelector("#phenomena");
  const nav = document.querySelector("#area-nav");
  const search = document.querySelector("#search");
  const total = document.querySelector("#total");
  const result = document.querySelector("#result-count");
  const empty = document.querySelector("#empty-message");
  const reset = document.querySelector("#reset-search");

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  try {
    const data = window.KAGARI_DATA;
    if (!data || !Array.isArray(data.areas) || !Array.isArray(data.items)) {
      throw new Error("data.js の areas または items を確認してください。");
    }
    const areaIds = new Set();
    data.areas.forEach(area => {
      if (!area.id || !area.name || areaIds.has(area.id)) {
        throw new Error("場所の id は重複しない文字列にしてください。");
      }
      areaIds.add(area.id);
    });
    data.items.forEach((item, i) => {
      if (!areaIds.has(item.area) || typeof item.title !== "string" || !item.title.trim()
          || typeof item.location !== "string" || !Array.isArray(item.paragraphs)
          || !item.paragraphs.length || item.paragraphs.some(p => typeof p !== "string")) {
        throw new Error(`怪異 ${i + 1} 件目の area / title / location / paragraphs を確認してください。`);
      }
    });

    const groups = [];
    let number = 0;
    for (const area of data.areas) {
      const items = data.items.filter(item => item.area === area.id);
      const link = element("a", "", area.name);
      link.href = `#${area.id}`;
      nav.append(link);
      const section = element("section", "area-section");
      section.id = area.id;
      section.setAttribute("aria-labelledby", `heading-${area.id}`);
      const heading = element("div", "section-heading");
      const name = element("h2", "", area.name);
      name.id = `heading-${area.id}`;
      const count = element("span", "", `${items.length}案`);
      heading.append(name, count);
      const grid = element("div", "cards");
      if (!items.length) grid.append(element("p", "area-empty", "掲載項目はまだありません。"));
      const cards = [];
      items.forEach(item => {
        number++;
        const card = element("article", "card");
        card.id = `phenomenon-${number}`;
        const top = element("div", "card-top");
        top.append(element("span", "number", String(number).padStart(2, "0")),
          element("span", "place", item.location));
        const title = element("h3");
        const status = "（解決済み）";
        if (item.title.endsWith(status)) {
          title.textContent = item.title.slice(0, -status.length);
          title.append(element("span", "resolved-status", status));
        } else {
          title.textContent = item.title;
        }
        card.append(top, title);
        item.paragraphs.forEach(p => card.append(element("p", "", p)));
        grid.append(card);
        cards.push({ node: card, text: normalize([area.name, item.title, item.location, ...item.paragraphs].join(" ")) });
      });
      section.append(heading, grid);
      main.append(section);
      groups.push({ section, count, cards, link });
    }
    total.textContent = `全${number}案`;
    document.querySelector("#footer-total").textContent = `全${number}案`;

    function normalize(text) {
      return text.normalize("NFKC").toLocaleLowerCase("ja");
    }

    function update() {
      const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
      let visible = 0;
      groups.forEach(group => {
        let areaVisible = 0;
        group.cards.forEach(card => {
          const show = words.every(word => card.text.includes(word));
          card.node.hidden = !show;
          if (show) areaVisible++;
        });
        const showArea = areaVisible > 0 || (words.length === 0 && group.cards.length === 0);
        group.section.hidden = !showArea;
        group.link.hidden = !showArea;
        group.count.textContent = `${areaVisible}案`;
        visible += areaVisible;
      });
      result.textContent = words.length ? `${visible}件 / 全${number}件` : `全${number}件を表示`;
      empty.hidden = visible > 0;
      reset.hidden = !search.value;
    }
    search.addEventListener("input", update);
    reset.addEventListener("click", () => { search.value = ""; update(); search.focus(); });
    update();
    document.querySelector("#tools").hidden = false;
    // 目次への直接リンクで開いた場合、生成後の見出しへ移動します。
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView();
  } catch (error) {
    main.replaceChildren(element("p", "load-error", "一覧を読み込めませんでした。ページを再読み込みしてください。"));
    total.textContent = "";
    console.error(error);
  }
})();
