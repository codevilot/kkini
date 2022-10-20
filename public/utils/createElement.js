const createElement = domString => {
  const $temp = document.createElement('template');
  $temp.innerHTML = domString;
  return $temp.content;
};

export default createElement;
