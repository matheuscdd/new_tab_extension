chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action !== 'getImg') return;
  fetch(msg.url)
    .then(response => response.blob())
    .then(async bin => {
      const reader = new FileReader();
      reader.readAsDataURL(bin);
      await loadImg(reader);
      const b64 = reader.result;
      sendResponse({ success: true, b64});
  }).catch(error => {
    console.error(error);
    sendResponse({ success: false });
  });
  return true;
});
  
function loadImg(img) {
  return new Promise(resolve => {
      img.onload = () => resolve(img);
  });
}