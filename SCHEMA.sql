DROP TABLE MATCHES;
DROP TABLE TEAMS;

CREATE TABLE TEAMS(
	id bigserial PRIMARY KEY,
	team_name text,
	constraint "unq_team_name" unique(team_name) 
);

CREATE TABLE MATCHES (
	id	bigserial PRIMARY KEY,
	opp1 bigserial references TEAMS(id),
	opp2 bigserial references TEAMS(id),
	match_time timestamp,
	series_length smallint,
	match_status text
);

CREATE TABLE MATCHES_LOADER (
	id	bigserial PRIMARY KEY,
	opp1 bigserial references TEAMS(id),
	opp2 bigserial references TEAMS(id),
	match_time timestamp,
	series_length smallint,
	match_status text
);
CREATE UNIQUE INDEX "unq_match" ON MATCHES (opp1,opp2,match_time);