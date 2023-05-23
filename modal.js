import A11yDialog from "./a11y-dialog.esm.min.js";

const domReady = () => {
  const wrap = document.getElementById("modals");
  const element = document.getElementById("modal");
  const content = document.getElementById("modal-content");
  const modal = new A11yDialog(element);

  const show = (html) => {
    content.innerHTML = "";
    content.appendChild(html);

    setTimeout(() => {
      modal.show();

      setTimeout(() => {
        element.focus();
      }, 100);
    }, 0);
  };

  wrap.addEventListener("click", (ev) => {
    const link = ev.target.closest("[data-modal]");

    if (link) {
      const linkTemplate = link.querySelector("template");
      const html = document.importNode(linkTemplate.content, true);

      show(html);
    }
  });
};

if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  setTimeout(domReady, 0);
} else {
  document.addEventListener("DOMContentLoaded", domReady);
}
