chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchFavicon") {
        fetch(request.url)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => sendResponse({ data: reader.result });
                reader.readAsDataURL(blob);
            })
            .catch(() => sendResponse({ error: "Failed to fetch" }));
        return true; // Mantém a conexão assíncrona aberta
    }
});
