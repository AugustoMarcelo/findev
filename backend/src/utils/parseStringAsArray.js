module.exports = function parseArrayAsString(arrayAsString) {
  return arrayAsString.split(',').map(item => item.trim());
}