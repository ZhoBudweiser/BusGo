export function debounce(fn, wait) {
  var timeout;
  return function () {
    var ctx = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      fn.apply(ctx, args);
    }, wait);
  };
}

export function flip(client, field) {
  client.setData({
    [field]: !client.data[field],
  });
}
