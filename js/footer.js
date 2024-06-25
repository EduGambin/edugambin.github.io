{
  const body = document.getElementsByTagName("body")[0];

  const footer = document.createElement("footer");

  const a_email = document.createElement("a");
  a_email.href = "mailto:gambinmonserrat@gmail.com";
  a_email.innerHTML = `<i class="fa-solid fa-envelope"></i>`;
  footer.appendChild(a_email);

  const a_linkedin = document.createElement("a");
  a_linkedin.href = "https://www.linkedin.com/in/edu-gambin";
  a_linkedin.innerHTML = `<i class="fa-brands fa-linkedin"></i>`;
  footer.appendChild(a_linkedin);

  const a_github = document.createElement("a");
  a_github.href = "https://github.com/EduGambin";
  a_github.innerHTML = `<i class="fa-brands fa-github"></i>`;
  footer.appendChild(a_github);

  const a_instagram = document.createElement("a");
  a_instagram.href = "https://instagram.com/EduGambin";
  a_instagram.innerHTML = `<i class="fa-brands fa-instagram"></i>`;
  footer.appendChild(a_instagram);

  body.appendChild(footer);
}
