const payloadPassthrough = (payload) => {
  return new Promise((resolve) => resolve(payload));
};

export { payloadPassthrough };
