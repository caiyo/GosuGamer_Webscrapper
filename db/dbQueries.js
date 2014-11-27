/**
 * Created by kyle on 11/21/14.
 */
var dbconnect = require('./dbconnect.js');
var asynch = require('async');

var queries = {};
queries.storeMatchData = function(matches) {
    var query1 = "INSERT INTO MATCHES (OPP1, OPP2, MATCH_TIME, MATCH_STATUS) VALUES ($1, $2, $3, 'SCHEDULED')";
    dbconnect.connect(function(err, client, done){
        if(err) console.log(err);
        else {
            asynch.map(matches, function (match, callback) {
                var query2 = "SELECT t1.ID t1, t2.ID t2, " + match.matchTime.valueOf();
                query2 += " match_time FROM TEAMS t1, TEAMS t2 where t1.TEAM_NAME like $1 and t2.TEAM_NAME like $2 LIMIT 1";
                client.query(query2, [match['opp1'] + '%', match['opp2'] + '%'], function (err, result) {
                    if (err) {}
                    else {
                        var teams = result.rows[0];
                        console.log(match['opp1'] + " vs. " + match['opp2']);
                        if (!teams) {
                            queries.storeTeamData([match['opp1'], match['opp2']]);
                            queries.storeMatchData(match);
                            callback(err, result);
                        }
                        else {
                            client.query(query1, [result.rows[0]['t1'], result.rows[0]['t2'], new Date(parseInt(result.rows[0]['match_time']))],
                                function (err, result) {
                                    if (err) console.log(err);
                                    else    console.log(result.rows.length + " rows inserted");
                                    callback(err, result);
                                });
                        }
                    }
                })
            }, function (err, result) {
                if (err) console.log(err);
                else console.log('finished');
                done();
            });
        }
    });
};

queries.storeTeamData = function (teamList) {
    var query2 = "INSERT INTO TEAMS (TEAM_NAME) VALUES ($1)";
    var query1 = "SELECT TEAM_NAME FROM TEAMS";

    dbconnect.connect(function(err, client, done){
        if(err) console.log(err);
        else{
            var rowsInserted=0;
            var errors = [];
            //query checks for Teams already in the table
            client.query(query1, function(err, result){
                for(var i in result.rows) {
                    var index = teamList.indexOf(result.rows[i]['team_name']);
                    //if team is already in the table, dont try to reinsert it
                    if (index != -1)
                        teamList.splice(index, 1);
                }
                //insert teams into TEAMS table
                asynch.map(teamList,function(team, callback){
                        client.query(query2, [team], function(err,result){
                        if(err) console.log(err);
                        else rowsInserted++;

                        callback(err, result);
                    });
                },
                function(err, results){
                    if(err) console.log(err);
                    console.log(rowsInserted + " rows inserted");
                    done();
                });
            });
        }

    });
};

module.exports = queries;

