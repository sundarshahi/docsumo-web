export const isElementVisibleOnViewport = (el) => {
  const rect = el.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const isFullyVisible =
    rect.top >= 0 &&
    rect.bottom <= windowHeight &&
    rect.left >= 0 &&
    rect.right <= windowWidth;

  const isPartiallyVisible =
    rect.top < windowHeight &&
    rect.bottom >= 0 &&
    rect.left < windowWidth &&
    rect.right >= 0;

  return isFullyVisible || isPartiallyVisible;
};

export const calculateElementVisibilityPercentage = (element) => {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const visibleHeight =
    Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  const visibleWidth =
    Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);

  const visibleArea = visibleHeight * visibleWidth;
  const elementArea = element.offsetWidth * element.offsetHeight;

  const percentageVisible = (visibleArea / elementArea) * 100;
  return Math.round(percentageVisible);
};

export const isElementVisibleOnContainer = (childEl, containerEl) => {
  const containerRect = containerEl.getBoundingClientRect();
  const targetRect = childEl.getBoundingClientRect();

  const containerTop = containerRect.top;
  const containerBottom = containerRect.bottom;
  const containerLeft = containerRect.left;
  const containerRight = containerRect.right;

  const targetTop = targetRect.top;
  const targetBottom = targetRect.bottom;
  const targetLeft = targetRect.left;
  const targetRight = targetRect.right;

  const isPartiallyVisibleVertically =
    targetTop < containerBottom && targetBottom > containerTop;

  const isPartiallyVisibleHorizontally =
    targetLeft < containerRight && targetRight > containerLeft;

  return isPartiallyVisibleVertically && isPartiallyVisibleHorizontally;
};
