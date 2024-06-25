{
  function getPageName() {
    var url = window.location.pathname;
    var parts = url.split("/");
    var lastPart = parts.pop() || parts.pop(); // Handle potential trailing slash
    var pageName = lastPart.split(".")[0];

    return pageName;
  }

  const pageName = getPageName();

  const main = document.getElementsByTagName("main")[0];
  const body = main.parentNode;

  const header = document.createElement("header");

  const a_index = document.createElement("a");
  a_index.href = "index.html";
  if (pageName === "index") {
    a_index.innerHTML = "<b>Home</b>";
  } else {
    a_index.innerHTML = "Home";
  }
  header.appendChild(a_index);

  const a_projects = document.createElement("a");
  a_projects.href = "projects.html";
  if (pageName === "projects") {
    a_projects.innerHTML = "<b>Projects</b>";
  } else {
    a_projects.innerHTML = "Projects";
  }
  header.appendChild(a_projects);

  const a_about = document.createElement("a");
  a_about.href = "about.html";
  if (pageName === "about") {
    a_about.innerHTML = "<b>About</b>";
  } else {
    a_about.textContent = "About";
  }
  header.appendChild(a_about);

  body.insertBefore(header, main);
}
