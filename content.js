function kelimeciInıt(){
	
	$(document).bind('dblclick',function(e){
		if(!e.ctrlKey)
			return;
		
		$('#wPopup').remove();

		// Get selected text
		var selText=getSelected();
		
		// Pattern for the selected text            
		var patt=/^[a-zA-Z]+( [a-zA-Z]+)*$/gi; 

		if(selText!='' && patt.test(selText))
			searchWord(selText,e);

	}).keyup(function(e){
		if(e.keyCode==27) // esc key
			$('#wPopup').remove();
	});

}
kelimeciInıt();

/**
 * Get selected (text) on the page
 *
 * @return string
 */
function getSelected(){
	var t='';

	if(window.getSelection)	t=window.getSelection();
	else if(document.getSelection) t=document.getSelection();
	else if(document.selection) t=document.selection.createRange().text;
	
	t=$.trim(t);

	return t;
}

function searchWord(word,e){
	
	if(word.length>30 || word.split(' ').length>2)
		return false;

	console.log('searching for "'+word+'"');

	chrome.extension.sendRequest(
		{"cmm":"searchBrief","word":word},
		function(r){showWordPopup(r,e);}
	);

}

function showWordPopup(w,e){
	
	var path=chrome.extension.getURL('/');
	var h='';
	var closeImg=chrome.extension.getURL('close.png');

	$('#wPopup').remove();
	
	h='<div id="wPopup"> <img class="close" src="'+closeImg+'" alt="x" />';
	
	if(!w.error)
		h+=prepareWordPopup(w,e);
	else
		h+='Error: '+w.error;

	h+='</div>';

	h=$(h);


	$('img.close',h).click(function(){
		$(this).parent().remove();
	});

	$(document.body).append(h);

	$('img.close',h).mouseover(function(){
		$(this).attr('src',path+'close2.png');
	}).mouseout(function(){
		$(this).attr('src',path+'close.png');
	});
	
	var wwidth=$(window).width();
	var wheight=$(window).height();
	var pwidth=$(h).width();
	var pheight=$(h).height();
	var ex= ( e.pageX-200<0 ? e.pageX : e.pageX-200 );
	var ey=e.pageY+10;
	
	if(wwidth-e.clientX < pwidth)
		ex= (ex+200)- ( (pwidth- (wwidth-e.clientX)) +10);

	if(wheight-e.clientY < pheight)
		ey= ey- ( (pheight+10- (wheight-e.clientY)) +10);
	
	$(h).offset({
		top:ey, left: ex
	})

	if(w.pronunciation)
		bindPronunciation(w,h)

}

function prepareWordPopup(w,e){
	var h='';
	var flagImg=chrome.extension.getURL('tr.png');
	var spkActiveImg=chrome.extension.getURL('speakerActive.png');
	var spkPassiveImg=chrome.extension.getURL('speakerPassive.png');
	
	h+='<h2><b>'+w.word+'</b>';

	if(w.pronunciation)
		h+='<span class="pronunciation" class="jplayer"></span>'
			+'<span class="player">'
			+'<img src="'+spkPassiveImg+'" class="play" alt="çal"></span>';

	h+='</h2><div><ul class="meanings">';
	
	var flag='<img class="flag" src="'+flagImg+'" alt="eng-tr" />';
	
	for(var i in w.meanings){
		var k=w.meanings[i];
		h+='<li class="c">'+flag;
		if(k.cname!='') h+='<i>('+k.cname+')</i>';
		h+=' <span>'+k.m.join('</span>, <span>')+'</span>, </li>';
		
		flag='';
	}
	
	h+='<li><a class="more" target="_blank" href="http://kelimeci.net/search?word='+
		w.word+'">detay</a></li></ul></div>';


	return h;
	
}

function bindPronunciation(w,h){
	
	var path=chrome.extension.getURL('/');
	$('.pronunciation',h).jPlayer({
		solution: "html,flash", // Flash with an HTML5 fallback.
		supplied: "mp3",
		swfPath: path,
		cssSelectorAncestor: ".player",
		cssSelector:{
			 play: ".play",
		},
		ready:function(){
			$(this).jPlayer("setMedia", {
				mp3: "http://kelimeci.net/"+w.pronunciation.file
			});
			$(this).jPlayer('play');
		},
		play: function(){
			$('.player .play',h).attr('src',path+'speakerActive.png');
		},
		ended: function(){
			$('.player .play',h).attr('src',path+'speakerPassive.png');
		},
		errorAlerts: function(err){console.log('kelimeci jplayer:'+err);}
	}
	);
}

