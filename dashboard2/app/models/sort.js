class Sort {
  sortEventsByDateDescending(array) {
    array.sort(function(first, second) {
      return new Date(second.date) - new Date(first.date);
    });
    return array;
  }

  sortEventsByDateAscending(array) {
    array.sort(function(first, second) {
      return new Date(first.date) - new Date(second.date);
    });
    return array;
  }
}

export let sort = new Sort();
