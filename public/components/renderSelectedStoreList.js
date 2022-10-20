const renderSelectedStoreList = selectedStoreList => {
  // prettier-ignore
  document.querySelector('#menu_voted').innerHTML = `
    ${
      selectedStoreList<1? `
      <div class="empty-store">
        투표할 음식점이 없습니다.\n
        음식점을 추가해주세요.
      </div>
      `
      :selectedStoreList.map(({ id, title, description, tel, thumbnails }) => `
      <li id=${id}>
        <div class="store-name">${title}</div>
        <div class="store-description">${description}</div>
        <span class="tel">${tel}</span>
        <button class="remove-btn">삭제하기</button>
        <div class="store-images">
        ${thumbnails.map(thumbnail =>
          `<div class="store-image" style="background-image:url(${thumbnail});background-size: contain;"></div>`
        ).join('')}
        </div>
      </li>`
    )
    .join('')}
  `;
};
export default renderSelectedStoreList;
