export default async function fetchImage(query = '', size = 3) {
  const res = await axios.get(`https://dapi.kakao.com/v2/search/image?query=${encodeURI(query)}&size=${size}`, {
    headers: {
      Authorization: `KakaoAK e905344ef09f503efebe3a02312cb9ef`,
    },
  });
  return res;
}
