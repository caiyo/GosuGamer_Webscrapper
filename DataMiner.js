/**
 * Created by kywong on 11/17/2014.
 */
var cheerio = require('cheerio');
var webscraper = require('./webscrapper.js');
var queries = require('./db/dbQueries.js');
var $;


/** MATCH DATA*/
var getMatchData= function (html){
     //$ = cheerio.load(html);
    var table;
    var matches = [];
    var maxPage=1;
    var minPage = 1;
    for(var i=minPage; i<=maxPage; i++){
        $ = cheerio.load(html+i);
        $('h2').each(function(){
            if($(this).html() === 'DotA 2 Upcoming Matches'){
                table = $(this).next().children();
                //while parsing the first page, find max number of pages to parse
                if(i==1)
                    maxPage=findMaxPage(table);
            }
        });
        $('tr', table).each(function(i, data){

            extractMatchInfo(data, matches);
        });
    }


    //queries.storeMatchData(matches);
};

var findMaxPage = function(matchesTable){
    var ahref =$( '.pages span', $(matchesTable).next()).parent()[1].attribs.href;
    var numPattern = /\d+/g;
    var max = ahref.match(numPattern);
    max = max[max.length-1];
    console.log(max);
    return max;
}

var extractMatchInfo= function (match, matches){
    var data = $('td', match);
    var matchInfo = {};
    getMatchTeams(data[0], matchInfo);
    getMatchTime(data[1], matchInfo);
    matches.push(matchInfo);
    console.log(matchInfo);


};

var getMatchTeams = function(td, matchObj){
    var opp1=clean($('.opp1 span' ,td).html());
    var opp2=clean($('.opp2 span' ,td).not('.flag').html());
    matchObj['opp1'] =opp1;
    matchObj['opp2'] =opp2;
};

//takes the time until match string and converts it to milliseconds
//and adds to current date to get starting time of game
var getMatchTime = function(td, matchObj){
    var timeUntil = $('.live-in', td).html().trim().split(' ');
    var today = new Date();
    var milliSeconds = 0;
    for(var i in timeUntil){
        var interval = timeUntil[i];
        var unit = interval[interval.length-1];
        var value = interval.substr(0, interval.length-1);
        //converts time string to milliseconds
        switch (unit){
            case 'w':
                milliSeconds += value*6.048e+8;
                break;
            case 'd':
                milliSeconds += value*8.64e+7;
                break;
            case 'h':
                milliSeconds += value*3600000;
                break;
            case 'm':
                milliSeconds += value*60000;
                break;
            case 's':
                milliSeconds += value*1000;
                break;
        }

    }
    //console.log(matchTime);
    matchObj['matchTime'] = roundTime(today.getTime()+milliSeconds);
};

//rounds given Date object to the nearest 5 minutes
//to account of latency
var roundTime = function(time){
  var coeff = 1000*60*5;
    return new Date(Math.round(time / coeff) * coeff);
};

var clean = function(string){
    //does some basic sanitizing of string from html page
  var regex = /&[apos]*;/g;
  string = string.replace(regex, "'");
  string = string.replace('...', '');
  return string.trim();
};

/** END MATCH DATA SCRAP*/


/**
 * TEAM LIST SCRAP
 */
var getTeamList= function(html){
    $ = cheerio.load(html);
    var teamList = [];
    $('.ranking-link td>h4>span>span').not('.flag').each(function(i,data){
        teamList.push($(this).html());
       // console.log($(this).html());
    });
    console.log(teamList.length);
   // for(var i in teamList){
        queries.storeTeamData(teamList);
    //}
};


/**
 * END TEAM LIST SCRAP
 */

webscraper.scrapeSite('/dota2/gosubet?u-page=', getMatchData);
//webscraper.scrapeSite('/dota2/rankings?page=5', getTeamList);