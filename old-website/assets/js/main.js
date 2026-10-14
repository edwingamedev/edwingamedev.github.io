const topButton = document.getElementById("topButton");

function scrollFunction() {
  if (!topButton) {
    return;
  }

  const shouldShow = document.body.scrollTop > 20 || document.documentElement.scrollTop > 20;

  topButton.style.display = shouldShow ? "block" : "none";
}

function topFunction() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

window.addEventListener("scroll", scrollFunction);

if (topButton) {
  topButton.addEventListener("click", topFunction);
}
