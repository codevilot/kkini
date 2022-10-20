import fetchImage from './fetchimage.js';

var markers = [];
function displayPagination(pagination) {
  var paginationEl = document.getElementById('pagination'),
    fragment = document.createDocumentFragment(),
    i;

  while (paginationEl.hasChildNodes()) {
    paginationEl.removeChild(paginationEl.lastChild);
  }

  for (i = 1; i <= pagination.last; i++) {
    var el = document.createElement('a');
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

function searchPlaces() {
  kakao.maps.load(() => {
    const addMarker = (position, idx, title) => {
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
    };

    const displayPlaces = places => {
      var listEl = document.getElementById('placesList'),
        fragment = document.createDocumentFragment(),
        bounds = new kakao.maps.LatLngBounds(),
        listStr = '';
      document.getElementById('placesList').innerHTML = '';
      markers.forEach(marker => {
        marker.setMap(null);
        markers = [];
      });

      for (var i = 0; i < places.length; i++) {
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
          marker = addMarker(placePosition, i),
          itemEl = getListItem(i, places[i]);
        bounds.extend(placePosition);

        (function (marker, title) {
          function displayInfowindow(marker, title) {
            var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';

            infowindow.setContent(content);
            infowindow.open(map, marker);
          }

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
      listEl.appendChild(fragment);
      document.getElementById('menu_select').scrollTop = 0;
      map.setBounds(bounds);
    };
    const placesSearchCB = (data, status, pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        displayPlaces(data);
        displayPagination(pagination);
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
        return;
      } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.');
        return;
      }
    };
    var mapContainer = document.getElementById('map');
    var mapOption = {
      center: new kakao.maps.LatLng(37.566826, 126.9786567),
      level: 3,
    };
    var map = new kakao.maps.Map(mapContainer, mapOption);
    var ps = new kakao.maps.services.Places();
    var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
    new kakao.maps.InfoWindow({ zIndex: 1 });

    var keyword = document.getElementById('keyword').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
      alert('키워드를 입력해주세요!');
      return false;
    }
    var ps = new kakao.maps.services.Places();
    ps.keywordSearch(keyword, placesSearchCB);

    document.querySelector('#menu_select').addEventListener('click', ({ target }) => {
      if (target.closest('li') && target.closest('li').className.includes('item') && !target.matches('.add-store')) {
        const id = target.closest('li').className.split('-')[1];
        document.querySelector(
          '#store-detail'
        ).innerHTML = `<iframe style="height: 100vh;" src="https://place.map.kakao.com/m/${id}">`;
      }
    });
  });
  return;
}

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

export { searchPlaces };
