document.addEventListener("DOMContentLoaded", () => {
  // NOTE: If the class name is changed in the HTML, this has to be changed as well!
  const navLinks = document.querySelectorAll(".navlink");

  currentPage = window.location.pathname.split("/").pop();

  if (currentPage === "test.html") {
    currentPage = "index.html";
  }

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
});
