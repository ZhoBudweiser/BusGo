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

export function setSysQueryFrequency(lines) {
  if (lines.length == 0) {
    return 600000;
  } else {
    if (lines.find((line) => line.runBusInfo !== null)) {
      return 10000;
    } else {
      return 60000;
    }
  }
}
