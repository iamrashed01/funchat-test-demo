function cleaupUsername(selector) {
  const target = document.getElementById(selector);
  const value = target.value.replace(/[^0-9a-zA-Z:,_]/g, "");
  target.value = value;
}
