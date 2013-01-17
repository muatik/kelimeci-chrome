
chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
	
	if(request.cmm=='searchBrief')
		searchBrief( request.word, function(wjson){
			sendResponse(wjson);
		})

});

function searchBrief(word,callback){
	var x=new simpleAjax();
	var timeoutsec=5;
	word=encodeURI(word);

	var tout=setTimeout( function(){
		callback({"error":"Timeout"});
		x.abort();
	}, timeoutsec*1000 );

	x.send(
		'http://kelimeci.net/search?_ajax=getWord&ref=chrmext&word='+word,null,
		{'onSuccess':function(r){
			clearTimeout(tout);
			callback(jQuery.parseJSON(r));
		}}
	)
	
}
