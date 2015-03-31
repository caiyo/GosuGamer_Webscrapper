/**
 * Created by kywong on 11/17/2014.
 */
var cheerio = require('cheerio');
var webscraper = require('./webscrapper.js');
var queries = require('./db/dbQueries.js');


/** MATCH DATA*/
//Callback function given to webscraper with html of upcoming matches page
var getMatchData= function (html){
    var $ = cheerio.load(html);
    var table;
    var matches = [];
    //upcoming matches is determined by specific h2 tag
    $('h2').each(function(){
        if($(this).html() === 'DotA 2 Upcoming Matches'){
            table = $(this).next().children();
        }
    });
    //each row in table holds match data
    $('tr', table).each(function(i, data){

        extractMatchInfo(data, $);
    });
};

//Takes base url for matches page, finds amount of pages in upcoming matches
//table, and scrapes each of the pages
var mineMatches = function(url){
    //This is used to find the number of pages in the upcoming matches table.
    //after it is found, it will loop through the pages and scrape each one
    webscraper.scrapeSite(url, function(html){
        var $ = cheerio.load(html);
        var table;

        $('h2').each(function(){
            if($(this).html() === 'DotA 2 Upcoming Matches'){
                table = $(this).next().children();
            }
        });
        //contains link to the last page of upcoming matches
        var ahref =$( '.pages span', $(table).next()).parent()[1].attribs.href;
        var numPattern = /\d+/g;
        var max = ahref.match(numPattern);
        max = max[max.length-1];

        //after number of pages is found, scrape each page and store data
        for(var i=1; i<=max; i++){
            webscraper.scrapeSite(url+ i.toString(), getMatchData);
        }

    });
}

var extractMatchInfo= function (match, $){
    var data = $('td', match);
    var matchInfo = {};
    var matchPageLink = $('a', data)[0].attribs.href;
    //scrapes page for specified match and extracts match info from it
    webscraper.scrapeSite(matchPageLink, function(html){
        var $ = cheerio.load(html);
        var matchInfo = {};
        matchInfo.opp1= clean($('.opponent1 h3 a').html());
        matchInfo.opp2= clean($('.opponent2 h3 a').html());
        //tells how many games the match series is
        matchInfo.seriesLength = $('.bestof').html().split(' ')[2];
        var matchDate = $('.datetime').html();
        //converts match datetime string to js date object
        matchInfo.matchTime = getMatchTime(matchDate);
        //queries.storeMatchData([matchInfo]);
        console.log(matchInfo);
    });
};


//Takes the match datetime string and converts to date
//object in PST time
//datetime format: MONTH DAY, DAYOFWEEK, HOUR:MINUTE, TIMEZONE
//ie: MARCH 30, Monday, 00:00 CET
var getMatchTime = function(dateTime){
    if(!dateTime)
        return null;
    var months = {
        January     : 0,
        February    : 1,
        March       : 2,
        April       : 3,
        May         : 4,
        June        : 5,
        July        : 6,
        August      : 7,
        September   : 8,
        October     : 9,
        November    : 10,
        December    : 11
    };
    dateTime=dateTime.replace(/,/g, "");
    var splitDateString = dateTime.split(' ');
    var month,day,year,time,hour, minute;

    month = months[splitDateString[0]];
    day = splitDateString[1];
    year = new Date().getUTCFullYear();
    time = splitDateString[3].split(':');
    hour=time[0]-1;     //subtract 1 to set to UTC (time is originally in CET - UTC+1 )
    minute = time[1];
    return new Date(Date.UTC(year, month, day, hour, minute));

};


var clean = function(string){
    //does some basic sanitizing of string from html page
  var regex = /&[apos]*;/g;
  string = string.replace(regex, "'");
  return string.trim();
};

/** END MATCH DATA SCRAP*/

mineMatches('/dota2/gosubet?u-page=');
