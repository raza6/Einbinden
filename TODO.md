bedetheque scrapper

Goal 1) Better cover

Target Url
https://www.bedetheque.com/media/Couvertures/Couv_74976.jpg

The 5 number sequence is known as the BEL Id

It can be extracted from

<a title="tooltip" class="image-tooltip" rel="https://www.bedetheque.com/cache/thb_couv/Couv_74976.jpg" href="https://www.bedetheque.com/BD-Seuls-Tome-3-Le-clan-du-requin-74976.html">
    <span class="ico">
        <img src="https://www.bdgest.com/skin/flags/France.png"/>
    </span>
    <span class="serie">Seuls</span>
    <span class="num">#3</span>
    <span class="numa"></span>
    <span class="titre">Le clan du requin</span>
    <span class="dl">06/2008</span>
</a>

It is part of the html return coming from the following request (with isbn)
https://www.bedetheque.com/search/albums?RechIdSerie=&RechIdAuteur=&csrf_token_bel=0d9f900c9b28059624717055b070f872&RechSerie=&RechTitre=&RechEditeur=&RechCollection=&RechStyle=&RechAuteur=&RechISBN=9782800140490&RechParution=&RechOrigine=&RechLangue=&RechMotCle=&RechDLDeb=&RechDLFin=&RechCoteMin=&RechCoteMax=&RechEO=0


Raw header associated (to improve stealth and prevent ip ban)

GET /search/albums?RechIdSerie=&RechIdAuteur=&csrf_token_bel=0d9f900c9b28059624717055b070f872&RechSerie=&RechTitre=&RechEditeur=&RechCollection=&RechStyle=&RechAuteur=&RechISBN=9782800140490&RechParution=&RechOrigine=&RechLangue=&RechMotCle=&RechDLDeb=&RechDLFin=&RechCoteMin=&RechCoteMax=&RechEO=0 HTTP/1.1
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br, zstd
Accept-Language: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7
Cache-Control: no-cache
Connection: keep-alive
Cookie: INGRESSCOOKIE=0d3669ba13aea17bc01c2f0bdacb4d05|f933e2641e802ecbaaee5582d4f85af4; cookie_message=1; bdg_bedetheque_cookie=ekgqp0gud25r83t2rbmcaol9b1fagte8; csrf_cookie_bel=0d9f900c9b28059624717055b070f872
DNT: 1
Host: www.bedetheque.com
Pragma: no-cache
Referer: https://www.bedetheque.com/search
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: same-origin
Sec-Fetch-User: ?1
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
sec-ch-ua: "Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "macOS"
sec-gpc: 1

Mind the user agent
Mind the csrf token
Mind the cookie
=> mimicking a real user might be worth it







 1. Try plain HTTP first (likely sufficient)                                   
                                                                                
  Bedetheque's bot detection is basic. A realistic axios request with proper    
  headers often gets through without any browser automation:                  
                                                                                
  headers: {                                                                    
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) 
  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',       
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9',                                        
    'Referer': 'https://www.bedetheque.com/',                                   
  }                                                                             
                                                                                
  The ISBN search URL is                                                        
  https://www.bedetheque.com/search/albums?RechISBN=<isbn>. This is already used
   by the existing scrapers.                                                    
                                                                        
  2. If that fails: Playwright with stealth

  You already have .playwright-mcp/ in your repo. Use playwright-extra with the 
  stealth plugin — it patches the automation fingerprints that sites detect.
  Since this runs server-side (Node), it integrates naturally into              
  externalBooksService.ts.                                              

  3. Rate limiting

  Regardless of approach, add a small delay (1–2s) between requests — this is   
  the main IP-based trigger they watch for.
                                                                                
  ---                                                                   
  Existing reference implementations:
                                     
  - givka/bedetheque-scraper — Node.js, archived but shows the URL/HTML parsing
  patterns                                                                      
  - npm bedetheque-scraper — same project, last published 4 years ago but the
  site structure may not have changed much                                      
                                                                        
  I'd start with plain axios + proper headers and parse the HTML response. Only 
  escalate to Playwright if you get blocked.                            
                                                                                
  Sources:                                                              
  - givka/bedetheque-scraper
  - maforget/Bedetheque-Scrapper-2                                              
  - bedetheque-scraper on npm     