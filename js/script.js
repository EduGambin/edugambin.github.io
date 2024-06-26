document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".navlink");
  const currentPage = window.location.pathname.split("/").pop();

  if (currentPage === "") {
    currentPage = "index.html";
  }

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
});
