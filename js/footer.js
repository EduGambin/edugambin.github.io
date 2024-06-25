{
  const body = document.getElementsByTagName("body")[0];

  const footer = document.createElement("footer");

  const a_email = document.createElement("a");
  a_email.href = "mailto:gambinmonserrat@gmail.com";
  a_email.textContent = "gambinmonserratedu@gmail.com";
  footer.appendChild(a_email);

  const a_linkedin = document.createElement("a");
  a_linkedin.href = "https://www.linkedin.com/in/edu-gambin";
  a_linkedin.textContent = "Linked-in";
  footer.appendChild(a_linkedin);

  const a_github = document.createElement("a");
  a_github.href = "https://github.com/EduGambin";
  a_github.textContent = "GitHub";
  footer.appendChild(a_github);

  body.appendChild(footer);
}
