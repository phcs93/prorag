SET indexHtmlPath=%~dp0index.html

START "" "C:\Program Files\Google\Chrome\Application\chrome.exe" %indexHtmlPath% --disable-web-security --allow-file-access-from-files --disable-site-isolation-trials --user-data-dir="C://Chrome dev session"