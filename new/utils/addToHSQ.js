const addToHSQ = (user, location) => {
  // Sending to hubspot
  if (user.userId === user.orgId) {
    const _hsq = (window._hsq = window._hsq || []);
    _hsq.push(['setPath', location.pathname]);
    _hsq.push(['trackPageView']);
  }
};

export default addToHSQ;
