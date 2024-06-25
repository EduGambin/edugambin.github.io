const Header = (buttons) => {
  let ret = "<header>"

  ret += "<span>Eduardo Gambín Monserrat</span>"

  ret += "<nav>"
  for (const button of buttons) {
    ret += `<a href="${button.toLowerCase()}.html">${button}</a>`
  }
  ret += "</nav>"

  ret += "</header>"

  return ret;
}

document.body.innerHTML += Header(["Home", "Projects", "About", "CV"])

const Main = () => {
  let ret = "<main>"
  ret += "Hello world"
  ret += "</main>"

  return ret;
}

document.body.innerHTML += Main();

const Footer = (buttons) => {
  let ret = "<footer>"
  for (const button of buttons) {
    ret += `<a href="${button.toLowerCase()}.html">${button}</a>`
  }
  ret += "</footer>"

  return ret;
}

document.body.innerHTML += Footer(["LDIN", "GHUB"])


