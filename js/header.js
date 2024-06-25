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
  a_index.innerHTML = `<i class="fa-solid fa-house"></i> `;
  if (pageName === "index") {
    a_index.style = "font-weight: bolder;";
  }
  a_index.innerHTML = `<i class="fa-solid fa-house-chimney"></i><span class="nav-text"> Home</span>`;
  header.appendChild(a_index);

  const a_projects = document.createElement("a");
  a_projects.href = "projects.html";
  if (pageName === "projects") {
    a_projects.style = "font-weight: bolder;";
  }
  a_projects.innerHTML = `<i class="fa-solid fa-list-check"></i><span class="nav-text"> Projects</span>`;
  header.appendChild(a_projects);

  const a_about = document.createElement("a");
  a_about.href = "about.html";
  if (pageName === "about") {
    a_about.style = "font-weight: bolder;";
  }
  a_about.innerHTML = `<i class="fa-solid fa-user-check"></i><span class="nav-text"> About</span>`;
  header.appendChild(a_about);

  const a_blog = document.createElement("a");
  a_blog.href = "#";
  if (pageName === "blog") {
    a_blog.style = "font-weight: bolder;";
  }
  a_blog.innerHTML = `<i class="fa-solid fa-blog"></i><span class="nav-text"> Blog</span>`;
  header.appendChild(a_blog);

  body.insertBefore(header, main);
}
