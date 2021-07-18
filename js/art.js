/* Used to insert an image into the preview and show the preview box */
let showImg = function(u) {
  let preview = document.getElementById("preview");
  let previewImg = document.querySelector("#preview img:first-of-type");
  let previewLink = document.querySelector("#preview a:first-of-type");
  if(preview != null && previewImg != null && previewLink != null) {
    preview.style.visibility = "visible";
    preview.classList.add("toast-up");
    preview.classList.remove("toast-down");
    previewImg.src = u;
    previewLink.innerText = u;
    previewLink.href = u;
  }
}

/* Used to hide the preview box */
let hideImg = function() {
  let preview = document.getElementById("preview");
  let previewImg = document.querySelector("#preview img:first-of-type");
  if(preview != null && previewImg != null) {
    preview.classList.remove("toast-up");
    preview.classList.add("toast-down");
    setTimeout(function() {
      preview.style.visibility = "hidden";
      previewImg.src = "";
    }, 400);
  }
}
