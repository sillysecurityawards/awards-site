const domReady = () => {
  const wrap = document.getElementById("share");
  const width = 600;
  const height = 600;

  const share = ({ url, title }) => {
    const top =
      window.screenTop + document.documentElement.clientHeight / 2 - height / 2;
    const left =
      window.screenLeft + document.documentElement.clientWidth / 2 - width / 2;

    const popup = window.open(
      url,
      title,
      `width=${width},height=${height},top=${top},left=${left},
      directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,
      copyhistory=no,dependent=yes`
    );

    // Unset `window.opener` to remove popup page's access
    popup.opener = null;
  };

  wrap.addEventListener("click", (ev) => {
    const link = ev.target.closest("a");

    if (link) {
      const url = link.href;
      const title = link.getAttribute("aria-label");

      console.log(title);

      share({ url, title });
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
