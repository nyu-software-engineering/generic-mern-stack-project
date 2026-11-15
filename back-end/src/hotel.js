function isHotelNameValid(name) {
  return typeof name === 'string' && name.trim().length > 0;
}

export { isHotelNameValid };
