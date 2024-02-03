const mapArrToStateKeys = (
  items = [],
  { idKey = 'id', optionalId = 'slug' } = {}
) => {
  const itemIds = [];
  const itemsById = {};

  items.forEach((item) => {
    const id = item[idKey] || item[optionalId];
    itemIds.push(id);
    itemsById[id] = item;
  });

  return {
    itemIds,
    itemsById,
  };
};

export { mapArrToStateKeys };
