import fetchImage from './fetchimage.js';

const appendKakaoAPI = () => {
  const script = document.createElement('script');
  //prettier-ignore
  script.src ='//dapi.kakao.com/v2/maps/sdk.js?appkey=c8627785e5fed8e94625831777adf1ea&libraries=services&autoload=false';
  document.head.appendChild(script);

  return script;
};
const makeMap = () => {
  var markers = [];
  var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
  const mapContainer = document.createElement('div');
  mapContainer.id = 'map';
  var mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
    level: 3, // 지도의 확대 레벨
  };

  // 지도를 생성합니다
  var map = new kakao.maps.Map(mapContainer, mapOption);
  // 장소 검색 객체를 생성합니다
  var ps = new kakao.maps.services.Places();
  const search = keyword => ps.keywordSearch(keyword, placesSearchCB);

  var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

  // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
  function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
      // 정상적으로 검색이 완료됐으면
      // 검색 목록과 마커를 표출합니다
      displayPlaces(data);

      // 페이지 번호를 표출합니다
      displayPagination(pagination);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
      alert('검색 결과가 존재하지 않습니다.');
      return;
    } else if (status === kakao.maps.services.Status.ERROR) {
      alert('검색 결과 중 오류가 발생했습니다.');
      return;
    }
  }

  // 검색 결과 목록과 마커를 표출하는 함수입니다
  function displayPlaces(places) {
    var listEl = document.getElementById('placesList'),
      menuEl = document.getElementById('menu_wrap'),
      fragment = document.createDocumentFragment(),
      bounds = new kakao.maps.LatLngBounds(),
      listStr = '';

    removeAllChildNods(listEl);

    removeMarker();

    for (var i = 0; i < places.length; i++) {
      var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
        marker = addMarker(placePosition, i),
        itemEl = getListItem(i, places[i]);
      bounds.extend(placePosition);

      (function (marker, title) {
        kakao.maps.event.addListener(marker, 'mouseover', function () {
          displayInfowindow(marker, title);
        });

        kakao.maps.event.addListener(marker, 'mouseout', function () {
          infowindow.close();
        });

        itemEl.onmouseover = function () {
          displayInfowindow(marker, title);
        };

        itemEl.onmouseout = function () {
          infowindow.close();
        };
      })(marker, places[i].place_name);

      fragment.appendChild(itemEl);
    }

    // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
    listEl.appendChild(fragment);
    menuEl.scrollTop = 0;

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
    map.setBounds(bounds);
  }

  // 검색결과 항목을 Element로 반환하는 함수입니다
  function getListItem(index, places) {
    const selectedStoreId = [...document.getElementById('menu_voted')?.querySelectorAll('li')].map(store => store.id);
    var el = document.createElement('li'),
      itemStr = `
        <div class="store-name">${places.place_name}</div>
        <div class="store-description">${places.category_name}</div>
        <span class="tel">${places.phone}</span>
        <button class="add-store" ${selectedStoreId.includes(places.id) ? 'disabled' : ''}>추가하기</button>
        <div class="x hidden">${places.x}</div>
        <div class="y hidden">${places.y}</div>
        `;
    el.innerHTML = itemStr;
    el.className = 'item-' + places.id;
    fetchImage(places.place_name).then(({ data }) => {
      el.insertAdjacentHTML(
        'beforeend',
        "<div class='store-images'>" +
          data.documents
            .map(
              store =>
                `<div class="store-image" style="background-image: url(${store.thumbnail_url});background-size: contain;"></div>`
            )
            .join('') +
          '</div>'
      );
    });
    return el;
  }

  // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
  function addMarker(position, idx, title) {
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
      imageSize = new kakao.maps.Size(36, 37), // 마커 이미지의 크기
      imgOptions = {
        spriteSize: new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
        spriteOrigin: new kakao.maps.Point(0, idx * 46 + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
        offset: new kakao.maps.Point(13, 37), // 마커 좌표에 일치시킬 이미지 내에서의 좌표
      },
      markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
      marker = new kakao.maps.Marker({
        position: position, // 마커의 위치
        image: markerImage,
      });

    marker.setMap(map); // 지도 위에 마커를 표출합니다
    markers.push(marker); // 배열에 생성된 마커를 추가합니다

    return marker;
  }

  // 지도 위에 표시되고 있는 마커를 모두 제거합니다
  function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers = [];
  }

  // 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
  function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
      fragment = document.createDocumentFragment(),
      i;

    // 기존에 추가된 페이지번호를 삭제합니다
    while (paginationEl.hasChildNodes()) {
      paginationEl.removeChild(paginationEl.lastChild);
    }

    for (i = 1; i <= pagination.last; i++) {
      var el = document.createElement('a');
      el.href = '#';
      el.innerHTML = i;

      if (i === pagination.current) {
        el.className = 'on';
      } else {
        el.onclick = (function (i) {
          return function () {
            pagination.gotoPage(i);
          };
        })(i);
      }

      fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
  }

  // 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
  // 인포윈도우에 장소명을 표시합니다
  function displayInfowindow(marker, title) {
    var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';

    infowindow.setContent(content);
    infowindow.open(map, marker);
  }

  // 검색결과 목록의 자식 Element를 제거하는 함수입니다
  function removeAllChildNods(el) {
    while (el.hasChildNodes()) {
      el.removeChild(el.lastChild);
    }
  }

  const insert = parent => {
    parent.append(mapContainer);
    map.relayout();
    mapContainer.firstChild.style.left = 'auto';
  };

  const marker = stores => {
    let positions = stores.map(({ title, x, y }) => ({ title, latlng: new kakao.maps.LatLng(y, x) }));

    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';

    for (var i = 0; i < positions.length; i++) {
      var imageSize = new kakao.maps.Size(24, 35);
      var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
      var marker = new kakao.maps.Marker({
        map: map,
        position: positions[i].latlng,
      });

      var customOverlay = new kakao.maps.CustomOverlay({
        position: positions[i].latlng,
        content: `<div style=" border: 1px solid #292929;padding:0.5rem;background:white;margin-bottom:150px;">${positions[i].title}</div>`,
      });
      customOverlay.setMap(map);
    }

    document
      .querySelectorAll('.info-window')
      .forEach(window => console.log(window.parentElement.parentElement.style.width));

    map.setCenter(new kakao.maps.LatLng(stores[0].y, stores[0].x));
  };
  return { insert, search, marker };
};
const loadMap = () => {
  appendKakaoAPI();

  window.addEventListener('load', () => {
    window.kakao.maps.load(() => {
      kakao.setMap = makeMap();
    });
  });
};
export default loadMap;
