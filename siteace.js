Websites = new Mongo.Collection("websites");

WebsitesIndex = new EasySearch.Index({
	collection: Websites,
	fields: ['title', 'description'],
	engine: new EasySearch.MongoDB()
});

Router.configure({
	layoutTemplate: 'main'
});

Router.route('/', function () {
	this.render('navbar', {
		to:"navbar"
	});
	this.render('container', {
		to: "content"
	});
});

Router.route('/search', function () {
	this.render('navbar', {
		to:"navbar"
	});
	this.render('search', {
		to: "content"
	});
});

Router.route('/details/:_id', function () {
	this.render('container');
	var item = Websites.findOne({_id: this.params._id});
	this.render('navbar', {
		to:"navbar"
	});
	this.render('details', {
		to: "content",
		data: item
	});
});

if (Meteor.isClient) {

	 Accounts.ui.config({
	    passwordSignupFields: "USERNAME_AND_EMAIL"
	  });

	/////
	// template helpers 
	/////
	Comments.ui.config({
	   template: 'bootstrap' // or ionic, semantic-ui
	});


	// helper function that returns all available websites
	Template.website_list.helpers({
		websites:function(){
			if (Session.get('search')) {
				console.log(Session.get('search'));
				var reg = new RegExp(Session.get('search'), 'ig');
				return Websites.find({$or: [
					{title: reg},
					{description: reg}
					]
				}, {sort:{upVote: -1, downVote: 1}});
			}
			else {
				return Websites.find({}, {sort:{upVote: -1, downVote: 1}});
			}
		}
		

	});

	Template.search_box.events({
		"submit .js-search-filter": function(event) {
			var filter =  event.target.search.value;
			Session.set('search', filter);
			console.log(filter);
			return false;
		}
	});

	Template.details.events({
		"click .js-upvote":function(event){
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Up voting website with id "+website_id);
			// put the code in here to add a vote to a website!
			var vote = this.upVote;
			vote++;
			Websites.update({_id: website_id}, {
				$set: {upVote: vote}
			});
			
			return false;// prevent the button from reloading the page
		}, 
		"click .js-downvote":function(event){

			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Down voting website with id "+website_id);

			var vote = this.downVote;
			vote++;
			Websites.update({_id: website_id}, {
				$set: {downVote: vote}
			});
			
			// put the code in here to remove a vote from a website!

			return false;// prevent the button from reloading the page
		}
	});


	/////
	// template events 
	/////

	Template.website_item.events({
		"click .js-upvote":function(event){
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Up voting website with id "+website_id);
			// put the code in here to add a vote to a website!
			var vote = this.upVote;
			vote++;
			Websites.update({_id: website_id}, {
				$set: {upVote: vote}
			});
			
			return false;// prevent the button from reloading the page
		}, 
		"click .js-downvote":function(event){

			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Down voting website with id "+website_id);

			var vote = this.downVote;
			vote++;
			Websites.update({_id: website_id}, {
				$set: {downVote: vote}
			});

			// put the code in here to remove a vote from a website!

			return false;// prevent the button from reloading the page
		}
	});

Template.website_form.events({
	"click .js-toggle-website-form":function(event){
		$("#website_form").toggle('slow');
	}, 
	"click .js-check-data": function(event) {	
		var url = document.getElementById('url').value;
		Meteor.call('checkUrl', url, function(err, response) {
			var content = $.parseHTML(response.content);
			content = $(content);
			var title = content.filter('title').text();
			var description = content.filter('meta[name=description]').attr("content");
			
			if (title) {
				document.getElementById('title').value = title;
			}
			if (description) {
				document.getElementById('description').value = description;
			}
		});
	},
	"submit .js-save-website-form":function(event){

			// here is an example of how to get the url out of the form:
			var url = event.target.url.value;
			var title = event.target.title.value;
			var description = event.target.description.value;
			console.log("The url they entered is: "+url);

			if (title && description) {
				Websites.insert({
					url: url, 
					title: title,
					description: description,
					createdOn:new Date(),
					upVote: 0,
					downVote: 0
				});
			}
			
			//  put your website saving code in here!	
			
			$("#website_form").hide('slow');

			return false;// stop the form submit from reloading the page

		}
	});
Template.registerHelper('formatDate', function(date) {
	return moment(date).format('MM-DD-YYYY');
});

}


if (Meteor.isServer) {
	// start up function that creates entries in the Websites databases.
	Meteor.startup(function () {
    // code to run on server at startup
    if (!Websites.findOne()){
    	console.log("No websites yet. Creating starter data.");
    	Websites.insert({
    		title:"Goldsmiths Computing Department", 
    		url:"http://www.gold.ac.uk/computing/", 
    		description:"This is where this course was developed.", 
    		createdOn:new Date(),
    		upVote: 0,
    		downVote: 0
    	});
    	Websites.insert({
    		title:"University of London", 
    		url:"http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route", 
    		description:"University of London International Programme.", 
    		createdOn:new Date(),
    		upVote: 0,
    		downVote: 0
    	});
    	Websites.insert({
    		title:"Coursera", 
    		url:"http://www.coursera.org", 
    		description:"Universal access to the world’s best education.", 
    		createdOn:new Date(),
    		upVote: 0,
    		downVote: 0
    	});
    	Websites.insert({
    		title:"Google", 
    		url:"http://www.google.com", 
    		description:"Popular search engine.", 
    		createdOn:new Date(),
    		upVote: 0,
    		downVote: 0
    	});
    }
    Meteor.methods({
    	checkUrl: function (url) {
    		this.unblock();
    		try {
    			var result = HTTP.call("GET", url);
    			return result;
    		} catch (e) {
		    // Got a network error, time-out or HTTP error in the 400 or 500 range.
		    return false;
		}
	}
});
});


}
