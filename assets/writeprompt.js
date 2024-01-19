const freePrompt = "This is a free prompt, just type what words enter your head";
var times;
var promptList;
var current;
var noSleep = new NoSleep();

var timer = {
	state: false,
	timerId : setInterval(function (){timer.tick()}, 1000),

	start(length, nav, callback){
		this.length = length * 60;
		this.warn = this.length - 30;
		console.log("Starting Timer for " + length + "minutes");
		this.callback = callback;
		this.currentTick = 0;
		this.state = true;
		this.nav = nav;
		this.callback('start', this.nav);
	},
	pause(){
		console.log("Pause timer at " +this.currentTick + "/" + this.length);
		this.state = false;
		this.callback('pause', this.nav);
	},
	resume(){
		console.log("Resume timer at " +this.currentTick + "/" + this.length);
		this.state = true;
		this.callback('resume', this.nav);
	},
	tick(){	
		if(this.state){
			console.log("timer active tick");
			this.currentTick++;
			if(this.currentTick === this.warn){
				console.log("timer warn");
				this.callback('warn', this.nav);
			}
			if(this.currentTick === this.length){
				console.log("timer end");
				this.callback('end', this.nav);
				this.state = false;
				this.lenght = 0;
			}
		}else{
			console.log("tick");
		}
	}
}

let switcher = function(action, target){
	switch(action){
		case 'start': //hide start button, replace with pause
			$( "#write_start_button" ).appendTo($('#nav_source'));
			$( "#write_pause_button" ).appendTo(target);
			$( "#write_pause_button" ).off();
			document.getElementById("sound_start").play();
			$( "#write_pause_button" ).click(function(){timer.pause()});
			noSleep.enable();
			$("#bad_prompt").appendTo($('#nav_source'));
		break;
		case 'resume': //hide resume button, replace with pause
			$( "#write_resume_button" ).appendTo($('#nav_source'));
			$( "#write_pause_button" ).appendTo(target);
			$( "#write_pause_button" ).off();
			$( "#write_pause_button" ).click(function(){timer.pause()});
			noSleep.enable();
		break;
		case 'pause': //hide pause button, replace with resume
			console.log('pause called');
			$( "#write_pause_button" ).appendTo($('#nav_source'));
			$( "#write_resume_button" ).appendTo(target);
			$( "#write_resume_button" ).off();
			$( "#write_resume_button" ).click(function(){timer.resume()});
			noSleep.disable();
		break;
		case 'warn'://change background of target with yellow
			$("#write_pause_button").addClass('bg-warning');
			document.getElementById("sound_warn").volume = 0.75;
			document.getElementById("sound_warn").play();
		break;
		case 'end':	//change the background of target with red and replace pause button with next.
			document.getElementById("sound_end").play();
			$("#write_pause_button").removeClass('bg-warning');
			$( "#write_pause_button" ).appendTo($('#nav_source'));
			$( "#write_next_button" ).appendTo(target);		
		break;
	}
}

class PromptsList{
	constructor(prompts){
		let url = "https://docs.google.com/spreadsheets/d/" +
			prompts['key']+
			"/gviz/tq?tqx=out:csv&tq="+
			prompts['query']+
			"&gid="+
			prompts['gid'];

		fetch(url)
		.then(response => response.text())
		.then((data) => {
			this.prompts = data.split("\n");
			this.prompts.shift();
		});
	}
	next(){
		if(this.prompts.length === 0){
			console.log("no prompts left.");
			return false;
		}
		let target = Math.floor(Math.random() * this.prompts.length);
		let low = this.prompts.slice(0, target);
		let high = this.prompts.slice(target);
		let out = high.shift();
		this.prompts = low.concat(high);
		return out;
	}
};

let SwapPrompt = function(){
	$('.current_prompt').text(promptList.next());
};

function newPrompt(cur){
	console.log( "NewPrompt called" );
	$( "#write_first_button" ).appendTo($('#nav_source'));
	$( "#write_next_button" ).appendTo($('#nav_source'));

	//Get time and 
	let promptTime = times.shift();

	if(promptTime === undefined){
		//create completion article
		//return completion article
		promptType = "complete";
	}else{
		promptType = promptTime.type;
	}
	
	let nextPrompt = $(document.createElement("article"));
	nextPrompt.addClass('container-fluid prompt');
	$('blockquote').removeClass('current_prompt');
	switch (promptType){
		case 'text':
			let promptText = promptList.next();
			if(promptText  === false){
				console.log("out of prompts");
				alert("Sorry we are out of prompts");
				//Out of Prompts Error
			}
			nextPrompt.addClass("text_prompt");
			nextPrompt.append($("<p class='write_prompt'>"+promptTime.message+"</p>"));
			nextPrompt.append($("<blockquote class='current_prompt'>"+promptText+"</blockquote>"));
			nextPrompt.append($("#bad_prompt"));
		break;
		case 'free':
			nextPrompt.append($("<p class='write_free'>"+promptTime.message+"</p>"));
		break;
		case 'ad':
			nextPrompt.append($("<h3>This is an advertizing prompt</h3>"));
			nextPrompt.append($("<p class='write_ad'>For the next "+ promptTime.length+" minutes write use this advertisement banner as inspiration. If you don't feel comfortable with that, press next now.</p>"));
		break;
		case 'complete':
			nextPrompt.append($("<h3>Congradulations you have completed the excercise.</h3><p>Now take what you have written and get to writing more. Good Luck!</p>"));
			cur.after(nextPrompt);
			$( "#write_next_button" ).detach() 
			let nav = $(document.createElement("nav"));
			//nav.append(  $( "#write_print_button" ).detach()  );
			nextPrompt.append($(nav));
			return;
		break;
	}
	let nav = $(document.createElement("nav"));
	nav.attr('id','left'+times.length);
	nextPrompt.append($(nav));
		
	nav.append(  $( "#write_start_button" ).detach()  );
	$(document).one('click',"#write_start_button",function(){
		console.log('#write_start_button clicked');
		timer.start(promptTime.length, nav, switcher);
	});

	cur.after(nextPrompt);
	$(document).scrollTop(nextPrompt.position().top-10);
	return nextPrompt;	
}

//onload
$(document).ready(function init(){
	//Get contents of prompt.json
	var filename = "assets/conf.json";
	$.getJSON(filename, function(data){
		times = data.times;
		promptList = new PromptsList(data.prompts);
	});

	current = $('#intro');

	let nav = $(document.createElement("nav"));
	nav.appendTo(current);
	nav.append( $( "#write_first_button" ).detach() );
	
	$( "#write_first_button" ).click(function() {
		current = newPrompt(current);
		console.log( "Handler for #write_first_button.click() called." );
	});

	$( "#write_next_button" ).click(function() {
		current = newPrompt(current);
		console.log( "Handler for #write_next_button.click() called." );
		noSleep.disable();
	});
});