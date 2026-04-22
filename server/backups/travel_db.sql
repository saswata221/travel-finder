--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2026-04-22 15:52:28

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 227 (class 1255 OID 50025)
-- Name: best_seasons_text(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.best_seasons_text(p_destination_id integer) RETURNS text
    LANGUAGE sql
    AS $$
WITH s AS (
  SELECT month, suitability
  FROM public.seasonality
  WHERE destination_id = p_destination_id
),
best AS (
  SELECT month FROM s WHERE suitability = 5
  UNION ALL
  SELECT month FROM s
  WHERE suitability = 4
    AND NOT EXISTS (SELECT 1 FROM s WHERE suitability = 5)
),
names AS (
  SELECT TO_CHAR(TO_DATE(month::text,'MM'),'Mon') AS mon
  FROM best
  ORDER BY month
)
SELECT CASE
         WHEN COUNT(*) = 0 THEN NULL
         WHEN COUNT(*) = 12 THEN 'All year'
         ELSE STRING_AGG(mon, ', ')
       END
FROM names;
$$;


ALTER FUNCTION public.best_seasons_text(p_destination_id integer) OWNER TO postgres;

--
-- TOC entry 228 (class 1255 OID 58211)
-- Name: get_best_seasons(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_best_seasons(dest_id integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  best_months TEXT;
BEGIN
  SELECT string_agg(
    CASE month
      WHEN 1 THEN 'Jan'
      WHEN 2 THEN 'Feb'
      WHEN 3 THEN 'Mar'
      WHEN 4 THEN 'Apr'
      WHEN 5 THEN 'May'
      WHEN 6 THEN 'Jun'
      WHEN 7 THEN 'Jul'
      WHEN 8 THEN 'Aug'
      WHEN 9 THEN 'Sep'
      WHEN 10 THEN 'Oct'
      WHEN 11 THEN 'Nov'
      WHEN 12 THEN 'Dec'
    END,
    ', ' ORDER BY month
  )
  INTO best_months
  FROM seasonality
  WHERE destination_id = dest_id
    AND suitability >= 4  -- Consider 4 and 5 as "best"
  GROUP BY destination_id;
  
  RETURN COALESCE(best_months, 'Contact local tourism office');
END;
$$;


ALTER FUNCTION public.get_best_seasons(dest_id integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 49517)
-- Name: countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.countries (
    id integer NOT NULL,
    name text NOT NULL,
    iso_code character(2),
    region text
);


ALTER TABLE public.countries OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 49516)
-- Name: countries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.countries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.countries_id_seq OWNER TO postgres;

--
-- TOC entry 4867 (class 0 OID 0)
-- Dependencies: 217
-- Name: countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.countries_id_seq OWNED BY public.countries.id;


--
-- TOC entry 226 (class 1259 OID 49585)
-- Name: destination_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destination_images (
    id integer NOT NULL,
    destination_id integer,
    image_url text NOT NULL,
    is_cover boolean DEFAULT false
);


ALTER TABLE public.destination_images OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 49584)
-- Name: destination_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.destination_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destination_images_id_seq OWNER TO postgres;

--
-- TOC entry 4868 (class 0 OID 0)
-- Dependencies: 225
-- Name: destination_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.destination_images_id_seq OWNED BY public.destination_images.id;


--
-- TOC entry 223 (class 1259 OID 49557)
-- Name: destination_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destination_tags (
    destination_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.destination_tags OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 49541)
-- Name: destinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destinations (
    id integer NOT NULL,
    name text NOT NULL,
    country_id integer,
    short_description text,
    about text,
    latitude numeric(9,6),
    longitude numeric(9,6),
    safety_score numeric(2,1),
    avg_daily_cost integer,
    visa_type text DEFAULT 'unknown'::text,
    popularity_score numeric(3,1),
    CONSTRAINT destinations_safety_score_check CHECK (((safety_score >= (0)::numeric) AND (safety_score <= (5)::numeric))),
    CONSTRAINT destinations_visa_type_check CHECK ((visa_type = ANY (ARRAY['visa-free'::text, 'visa-on-arrival'::text, 'e-visa'::text, 'visa-required'::text, 'schengen'::text, 'unknown'::text])))
);


ALTER TABLE public.destinations OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 49540)
-- Name: destinations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.destinations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destinations_id_seq OWNER TO postgres;

--
-- TOC entry 4869 (class 0 OID 0)
-- Dependencies: 221
-- Name: destinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.destinations_id_seq OWNED BY public.destinations.id;


--
-- TOC entry 224 (class 1259 OID 49572)
-- Name: seasonality; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seasonality (
    destination_id integer NOT NULL,
    month integer NOT NULL,
    suitability smallint,
    CONSTRAINT seasonality_month_check CHECK (((month >= 1) AND (month <= 12))),
    CONSTRAINT seasonality_suitability_check CHECK (((suitability >= 1) AND (suitability <= 5)))
);


ALTER TABLE public.seasonality OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 49530)
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 49529)
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO postgres;

--
-- TOC entry 4870 (class 0 OID 0)
-- Dependencies: 219
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- TOC entry 4666 (class 2604 OID 49520)
-- Name: countries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries ALTER COLUMN id SET DEFAULT nextval('public.countries_id_seq'::regclass);


--
-- TOC entry 4670 (class 2604 OID 49588)
-- Name: destination_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_images ALTER COLUMN id SET DEFAULT nextval('public.destination_images_id_seq'::regclass);


--
-- TOC entry 4668 (class 2604 OID 49544)
-- Name: destinations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations ALTER COLUMN id SET DEFAULT nextval('public.destinations_id_seq'::regclass);


--
-- TOC entry 4667 (class 2604 OID 49533)
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- TOC entry 4853 (class 0 OID 49517)
-- Dependencies: 218
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.countries (id, name, iso_code, region) FROM stdin;
4	Nepal	NP	Asia
5	Switzerland	CH	Europe
6	Japan	JP	Asia
7	France	FR	Europe
8	Australia	AU	Oceania
9	Brazil	BR	South America
10	South Africa	ZA	Africa
11	Italy	IT	Europe
12	Spain	ES	Europe
13	Turkey	TR	Europe/Asia
14	United Arab Emirates	AE	Middle East
15	United States	US	North America
16	New Zealand	NZ	Oceania
17	Morocco	MA	Africa
18	Egypt	EG	Africa
19	Greece	GR	Europe
20	Iceland	IS	Europe
21	Canada	CA	North America
22	Singapore	SG	Asia
23	South Korea	KR	Asia
24	Portugal	PT	Europe
25	Netherlands	NL	Europe
26	Austria	AT	Europe
27	Czech Republic	CZ	Europe
28	Hungary	HU	Europe
29	Norway	NO	Europe
30	Finland	FI	Europe
31	Mexico	MX	North America
32	Peru	PE	South America
33	Argentina	AR	South America
34	Chile	CL	South America
37	Sri Lanka	LK	Asia
38	Jordan	JO	Middle East
39	Kenya	KE	Africa
40	Tanzania	TZ	Africa
41	Germany	DE	Europe
42	Belgium	BE	Europe
43	Ireland	IE	Europe
1	India	IN	Asia
2	Thailand	TH	Asia
3	Indonesia	ID	Asia
36	Malaysia	MY	Asia
35	Vietnam	VN	Asia
49	Philippines	PH	Asia
50	Laos	LA	Asia
51	Cambodia	KH	Asia
52	Myanmar	MM	Asia
\.


--
-- TOC entry 4861 (class 0 OID 49585)
-- Dependencies: 226
-- Data for Name: destination_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destination_images (id, destination_id, image_url, is_cover) FROM stdin;
\.


--
-- TOC entry 4858 (class 0 OID 49557)
-- Dependencies: 223
-- Data for Name: destination_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destination_tags (destination_id, tag_id) FROM stdin;
1	2
1	3
1	8
2	1
2	10
3	2
3	6
3	3
4	1
4	9
4	4
5	1
5	9
5	10
6	1
6	4
6	7
7	2
7	3
8	2
8	8
8	5
9	7
9	15
10	5
10	7
10	14
11	1
11	13
11	10
12	1
12	14
13	2
13	12
13	11
14	7
14	5
15	7
15	5
16	7
16	2
17	1
17	9
18	7
19	9
19	4
20	7
20	2
21	4
21	12
22	8
22	2
23	5
23	7
42	15
42	7
42	5
43	15
43	7
43	5
44	14
44	10
44	1
44	5
45	15
45	7
45	5
46	10
46	6
46	5
47	15
47	5
48	15
48	10
48	5
49	12
49	3
49	2
50	15
50	6
50	5
51	15
51	7
51	6
52	14
52	1
52	9
53	12
53	2
53	8
54	8
54	12
54	3
54	2
55	10
55	9
55	5
56	14
56	15
56	10
56	5
57	15
57	11
57	5
58	10
58	15
58	5
59	10
59	15
59	5
60	15
60	7
60	5
61	15
61	7
61	5
62	10
62	7
62	5
63	2
63	12
63	5
64	15
64	5
65	14
65	15
65	5
66	7
66	3
66	2
67	15
67	10
67	5
68	11
68	2
68	5
69	7
69	15
69	5
70	15
70	10
70	5
71	15
71	1
71	5
72	15
72	7
72	6
73	4
73	12
73	5
74	15
74	1
74	9
75	10
75	15
75	5
76	15
76	5
77	10
77	15
77	5
78	6
78	3
78	2
79	8
79	3
79	2
80	12
80	3
80	2
81	15
81	12
81	4
82	15
82	13
82	1
83	10
83	13
83	1
84	7
84	15
84	9
85	15
85	14
85	2
86	15
86	3
86	2
87	15
87	3
87	2
88	13
88	1
88	9
89	10
89	5
89	2
90	6
90	3
90	2
91	15
91	7
91	5
92	15
92	3
92	2
93	15
93	2
93	7
94	12
94	1
94	9
95	5
95	15
95	7
96	7
96	15
96	5
97	6
97	15
97	7
2	5
7	5
9	5
12	5
14	15
15	15
16	5
17	5
18	5
18	15
19	5
20	5
21	5
22	5
23	15
47	7
64	7
76	7
\.


--
-- TOC entry 4857 (class 0 OID 49541)
-- Dependencies: 222
-- Data for Name: destinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destinations (id, name, country_id, short_description, about, latitude, longitude, safety_score, avg_daily_cost, visa_type, popularity_score) FROM stdin;
42	Venice	11	Canals, gondolas, and romantic architecture	Venice offers unique waterways, historic bridges, and renaissance charm across its lagoon islands.	45.440800	12.315500	4.3	10000	schengen	4.8
43	Rome	11	Ancient ruins, piazzas, and timeless streets	Rome blends imperial history, art, and vibrant street life with iconic landmarks like the Colosseum and Vatican.	41.902800	12.496400	4.4	9000	schengen	4.9
44	Barcelona	12	Gaudi architecture meets Mediterranean vibe	Barcelona combines beach energy, creative neighborhoods, tapas culture, and world-class nightlife.	41.385100	2.173400	4.5	8500	schengen	4.8
45	Istanbul	13	Where Europe meets Asia across the Bosphorus	Istanbul offers grand bazaars, Ottoman heritage, mosques, and modern cafe culture in one city.	41.008200	28.978400	4.2	6500	e-visa	4.7
46	Dubai	14	Futuristic skyline and desert adventures	Dubai features luxury shopping, beaches, modern attractions, and thrilling desert experiences.	25.204800	55.270800	4.6	12000	visa-on-arrival	4.9
47	San Francisco	15	Hilly streets, bay views, and tech culture	San Francisco is known for the Golden Gate, waterfront neighborhoods, and scenic urban landscapes.	37.774900	-122.419400	4.3	12500	visa-required	4.7
48	New York City	15	Iconic skyline, museums, and city buzz	NYC offers world-famous landmarks, diverse food, nightlife, and rich cultural experiences.	40.712800	-74.006000	4.4	13000	visa-required	4.9
49	Queenstown	16	Adventure capital with alpine landscapes	Queenstown is perfect for adventure sports, lake views, and mountain escapes year-round.	-45.031200	168.662600	4.8	9500	e-visa	4.8
50	Marrakech	17	Colorful souks, riads, and desert gateway	Marrakech offers rich Moroccan culture, medinas, palaces, and nearby Atlas/desert excursions.	31.629500	-7.981100	4.1	5500	visa-free	4.6
51	Cairo	18	Pyramids, Nile history, and ancient heritage	Cairo combines ancient wonders with bustling bazaars and deep archaeological significance.	30.044400	31.235700	4.0	5000	visa-on-arrival	4.6
52	Santorini	19	Cliffside villages and Aegean sunsets	Santorini is famous for whitewashed architecture, caldera views, and romantic island experiences.	36.393200	25.461500	4.6	11000	schengen	4.8
53	Reykjavik	20	Northern lights and dramatic landscapes	Reykjavik is a base for geothermal lagoons, glaciers, waterfalls, and aurora viewing.	64.146600	-21.942600	4.7	11500	schengen	4.6
54	Banff	21	Rocky mountain lakes and alpine trails	Banff offers turquoise lakes, scenic drives, wildlife, and iconic Canadian mountain beauty.	51.178400	-115.570800	4.8	9000	e-visa	4.7
55	Singapore City	22	Ultra-clean city with gardens and food	Singapore combines futuristic cityscapes, hawker food culture, and easy urban transit.	1.352100	103.819800	4.7	9500	visa-free	4.8
56	Seoul	23	K-culture, palaces, and modern city life	Seoul balances royal heritage, street markets, nightlife, and cutting-edge urban districts.	37.566500	126.978000	4.6	8000	visa-free	4.8
14	Jaipur	1	The Pink City of India	Jaipur paints forts, palaces, and markets in warm pink stone. Amber, Jaigarh, and Nahargarh watch the city from the hills. City Palace, Jantar Mantar, and Hawa Mahal keep royal science and style close. Bazaars brim with block prints, gemstones, and brassware to haggle over. Street food and folk shows keep evenings lively in old quarters. It is the grand entrance to Rajasthan's craft and history.	26.912400	75.787300	4.3	3500	visa-free	4.6
15	Varanasi	1	India’s spiritual heart on the Ganges	Varanasi sits on the Ganges with rituals that begin before sunrise and end after dark. Boating past ghats shows cremation fires, prayers, and everyday river life. The evening aarti folds lamps, bells, and chants into a glowing ceremony. Silk weavers, musicians, and philosophers give the lanes their character. Temples and ashrams host seekers from India and abroad. The city is intense, ancient, and deeply moving.	25.317600	82.973900	4.2	2500	visa-free	4.5
16	Chiang Mai	2	Thailand’s cultural northern city	Chiang Mai wraps a laid-back northern city inside ancient walls and mountain green. Hundreds of temples and a lively Old City set an easy cultural rhythm. Night bazaars, coffee roasters, and craft studios showcase creative life. Trekking, zip lines, and elephant sanctuaries bring soft adventure close by. Lantern-lit Yi Peng and Songkran festivals glow with community spirit. Many travelers stay longer for the balance of cost, comfort, and nature.	18.706100	98.981700	4.5	3000	visa-on-arrival	4.7
17	Krabi	2	Beach paradise with limestone cliffs	Krabi lines the Andaman coast with towering limestone cliffs and jade water. Railay is a world favorite for rock climbing and relaxed beaches. Snorkel and dive boats reach coral gardens and gentle tropical fish in minutes. Island-hopping to Hong, Phi Phi, and Poda keeps the scenery changing daily. Markets, long-tail boats, and easy seafood meals keep evenings simple. It is equal parts postcard beauty and approachable adventure.	8.086300	98.906300	4.4	4000	visa-on-arrival	4.6
57	Porto	24	Riverside lanes and wine cellars	Porto is known for scenic bridges, old-town vibes, and world-famous port wine experiences.	41.157900	-8.629100	4.6	7000	schengen	4.6
58	Lisbon	24	Historic hills and Atlantic charm	Lisbon mixes colorful neighborhoods, tram rides, viewpoints, and lively food culture by the sea.	38.722300	-9.139300	4.5	7500	schengen	4.7
59	Amsterdam	25	Canals, bikes, and museum culture	Amsterdam offers canal-side beauty, artistic heritage, and vibrant cafe neighborhoods.	52.367600	4.904100	4.6	9500	schengen	4.8
60	Vienna	26	Imperial elegance and classical music	Vienna combines palaces, coffeehouse culture, and refined urban experiences.	48.208200	16.373800	4.7	9000	schengen	4.7
61	Prague	27	Fairytale old town and castles	Prague has gothic architecture, river views, and a charming old-world atmosphere.	50.075500	14.437800	4.6	7000	schengen	4.7
62	Budapest	28	Danube views and thermal baths	Budapest blends grand architecture, riverfront nightlife, and thermal spa culture.	47.497900	19.040200	4.5	6800	schengen	4.7
63	Oslo	29	Fjords, design, and waterfront calm	Oslo blends Scandinavian design, museums, and easy access to nature and fjords.	59.913900	10.752200	4.8	12000	schengen	4.5
64	Helsinki	30	Nordic waterfront and modern design	Helsinki is known for clean city living, saunas, and Baltic coastal charm.	60.169900	24.938400	4.8	11000	schengen	4.5
65	Mexico City	31	Culture-rich capital with food scene	Mexico City offers historic neighborhoods, museums, and one of the world’s best street food scenes.	19.432600	-99.133200	4.1	6500	visa-free	4.7
66	Cusco	32	Andean gateway to Inca heritage	Cusco is a high-altitude cultural hub and launch point for Machu Picchu trekking routes.	-13.531900	-71.967500	4.2	5200	visa-free	4.6
67	Buenos Aires	33	European flair in Latin rhythm	Buenos Aires combines tango culture, historic quarters, and late-night culinary life.	-34.603700	-58.381600	4.2	6000	visa-free	4.7
68	Santiago	34	Mountain-backed modern capital	Santiago sits between Andes and coast, with wine regions and ski options nearby.	-33.448900	-70.669300	4.4	7000	visa-free	4.6
69	Hanoi	35	Old quarter, lakes, and street food	Hanoi blends colonial architecture, lakefront calm, and vibrant local markets.	21.027800	105.834200	4.3	4000	e-visa	4.7
70	Kuala Lumpur	36	Skyline, malls, and food diversity	Kuala Lumpur offers modern towers, multicultural neighborhoods, and easy city transit.	3.139000	101.686900	4.5	5000	visa-free	4.7
71	Colombo	37	Coastal city with cultural access	Colombo is a practical gateway to Sri Lanka’s beaches, tea country, and heritage sites.	6.927100	79.861200	4.2	4500	e-visa	4.4
72	Petra	38	Rock-cut wonder in desert valley	Petra is a world heritage site known for monumental sandstone architecture and ancient trade history.	30.328500	35.444400	4.3	6000	visa-on-arrival	4.7
73	Nairobi	39	Urban safari gateway	Nairobi combines city life with nearby wildlife parks and East African cultural experiences.	-1.292100	36.821900	4.0	5000	e-visa	4.5
74	Zanzibar City	40	Historic island spice port	Zanzibar City offers stone-town heritage, turquoise beaches, and rich Swahili culture.	-6.165900	39.202600	4.1	5500	visa-on-arrival	4.6
75	Berlin	41	History, art, and modern culture	Berlin offers world-class museums, layered history, and a dynamic contemporary scene.	52.520000	13.405000	4.5	8500	schengen	4.7
76	Brussels	42	Grand squares and European hub	Brussels features art-nouveau streets, chocolate culture, and historic city squares.	50.850300	4.351700	4.4	8200	schengen	4.5
77	Dublin	43	Friendly pubs and literary heritage	Dublin pairs lively pub culture with deep literary history and coastal day trips.	53.349800	-6.260300	4.6	9000	visa-free	4.6
78	Spiti Valley	1	Cold desert monasteries and stark landscapes	Spiti offers high-altitude villages, Buddhist monasteries, and adventurous mountain drives.	32.246200	78.034300	4.3	3800	visa-free	4.6
79	Chopta	1	Mini Switzerland with alpine meadows	Chopta is a beautiful Uttarakhand base for Tungnath trek with stunning Himalayan vistas.	30.489400	79.215300	4.5	2700	visa-free	4.5
80	Dzukou Valley	1	Seasonal flower valley on hill ridges	Dzukou Valley is a scenic trekking destination with seasonal blooms and rolling highland meadows.	25.566700	94.083300	4.2	2300	visa-free	4.2
81	Mawlynnong	1	Living root bridges and village greenery	Mawlynnong in Meghalaya is famous for eco-friendly village life and nearby root bridges.	25.203000	91.878000	4.4	2400	visa-free	4.3
82	Varkala	1	Clifftop beach town with wellness vibe	Varkala offers dramatic sea cliffs, calm beaches, and growing yoga/wellness culture.	8.737900	76.716300	4.5	3500	visa-free	4.6
83	Gokarna	1	Laid-back beaches and cliffside trails	Gokarna is a quieter coastal alternative with scenic beach treks and relaxed atmosphere.	14.550000	74.318800	4.4	3200	visa-free	4.6
84	Majuli	1	River island with monasteries and culture	Majuli, one of the world’s largest river islands, is known for satras, art, and Assamese traditions.	26.954800	94.203700	4.0	2600	visa-free	4.2
85	Ziro	1	Pine-covered plateau and Apatani culture	Ziro combines cool weather, scenic valleys, and rich indigenous heritage, popular during Ziro Festival.	27.633300	93.833300	4.3	2800	visa-free	4.4
86	Mechuka	1	Remote valley with dramatic mountain scenery	Mechuka is an offbeat Arunachal valley known for pristine landscapes and unique tribal culture.	28.597600	94.118500	4.1	3000	visa-free	4.2
1	Manali	1	Himalayan hill town with snow views	Manali is a picturesque hill town in Himachal Pradesh ringed by snow peaks and cedar forests. It draws adventure lovers for paragliding, skiing, river rafting, and high-altitude treks. Nearby Solang Valley and Rohtang Pass deliver year-round mountain scenery. Old Manali lanes, cafes, and the Hidimba Devi Temple add culture and calm. Apple orchards, local woolens, and cozy stays make it a balanced mix of thrill and relaxation. It is popular with both backpackers and families.	32.239600	77.188700	4.2	2500	visa-free	4.5
87	Tawang	1	Monasteries and high-altitude Himalayan views	Tawang offers serene monasteries, mountain roads, and less-crowded northeast Himalayan charm.	27.586900	91.869400	4.2	3200	visa-free	4.3
88	Koh Lanta	2	Quiet Andaman island with long beaches	Koh Lanta is ideal for slower island travel, sunset beaches, and easy diving access.	7.613400	99.036900	4.5	3800	visa-on-arrival	4.5
89	Pai	2	Mountain town with hot springs and cafes	Pai is a relaxed northern Thailand retreat with waterfalls, scenic roads, and laid-back vibes.	19.361100	98.439700	4.4	3000	visa-on-arrival	4.5
90	Bromo	3	Volcanic sunrise landscapes in East Java	Mount Bromo region is known for surreal volcanic terrain and iconic sunrise viewpoints.	-7.942500	112.953000	4.2	3300	visa-free	4.5
91	George Town	36	Heritage streets and diverse food culture	George Town (Penang) blends colonial-era heritage, street art, and exceptional food scenes.	5.414100	100.328800	4.6	3600	visa-free	4.7
92	Ha Giang	35	Epic motorbike loops through mountain passes	Ha Giang is Vietnam’s top offbeat mountain adventure with stunning roads and ethnic villages.	22.823300	104.983600	4.3	2800	e-visa	4.5
93	Ninh Binh	35	Limestone karsts and river boat landscapes	Ninh Binh offers dramatic karst scenery, caves, and peaceful countryside boat rides.	20.250600	105.974500	4.6	2900	e-visa	4.6
94	Siquijor	49	Hidden island with waterfalls and reefs	Siquijor is an offbeat Philippine island with clear waters, cliff jumps, and relaxed pace.	9.214800	123.515000	4.3	3200	visa-free	4.4
95	Luang Prabang	50	Mekong heritage town and temples	Luang Prabang offers golden temples, colonial charm, and calm riverside life.	19.885600	102.134700	4.7	3500	visa-on-arrival	4.6
96	Kampot	51	Riverside town near caves and pepper farms	Kampot is a chilled Cambodian town with river cruises, countryside loops, and French-era architecture.	10.610400	104.181500	4.4	3000	visa-on-arrival	4.3
97	Bagan	52	Ancient temple plains at sunrise	Bagan features thousands of historic pagodas across open plains with magical sunrise views.	21.171700	94.858500	4.2	3400	e-visa	4.6
2	Goa	1	India’s party & beach capital	Goa is India's signature beach escape with long golden shores and a carefree vibe. Portuguese-era churches and colorful villages give it a unique coastal heritage. Visitors split days between water sports, sunset cruises, and flea markets. By night, beach shacks and clubs light up with music, seafood, and festivals. Inland spice farms and yoga retreats offer slow days amid greenery. It is equally good for party weekends and laid-back vacations.	15.299300	74.124000	4.0	3000	visa-free	4.8
6	Bali	3	Volcanic island with beaches & culture	Bali mixes volcanoes, rice terraces, and ceremony into a uniquely spiritual island. Ubud is the jungle heart with craft markets, temples, and wellness retreats. Canggu and Uluwatu attract surfers while Seminyak and Kuta bring nightlife and shopping. Offerings, dance, and gamelan music make daily life feel sacred and artistic. Cafes and co-working spaces welcome remote workers in a tropical climate. It is a place to alternate between beach days and inner calm.	-8.340500	115.092000	4.5	5000	visa-on-arrival	4.9
18	Yogyakarta	3	Cultural hub of Java	Yogyakarta, or Jogja, is Java's cultural classroom and creative workshop. Borobudur and Prambanan, two UNESCO giants, sit within easy reach for sunrise or sunset. Batik studios, puppet theaters, and street art keep traditions alive with modern flair. The Sultan's Palace and Malioboro Street anchor the city's heritage and bustle. Students give it youthful energy and affordable, tasty food. It blends history, learning, and everyday warmth.	-7.795600	110.369500	4.3	2500	visa-on-arrival	4.5
19	Komodo Island	3	Home of the legendary Komodo dragon	Komodo Island is home to the world's largest lizard and a rugged chain of hills over bright seas. Rangers guide safe walks to view the dragons in their natural habitat. Pink Beach and glass-clear bays invite long snorkels with corals and rays. Short hikes deliver ridgeline panoramas at golden hour. The park's limits protect wildlife while welcoming small-boat exploration. It is raw, photogenic, and unforgettable.	-8.566200	119.489200	4.6	5000	visa-on-arrival	4.7
20	Kathmandu	4	Cultural capital of Nepal	Kathmandu layers shrines, courtyards, and living traditions into a busy valley city. Durbar Squares, Swayambhu, and Boudhanath map centuries of craft and faith. Markets overflow with metalwork, prayer flags, and spiced street snacks. Trekking plans, permits, and gear shops make it the launchpad for the Himalaya. Festivals ring with drums and color through the year. Chaos and charm mingle into a vivid introduction to Nepal.	27.717200	85.324000	4.1	2000	visa-free	4.4
21	Chitwan	4	Wildlife and jungle adventures	Chitwan shelters rhinos, deer, and birdlife in riverine forests and grasslands. Jeep safaris and canoe rides bring quiet encounters at dawn and dusk. The Rapti River glides past crocodiles warming in the sun. Tharu villages share dances, food, and stories that root the forest in culture. Lodges balance conservation and gentle tourism along the park edge. It is Nepal's classic wildlife pause after the mountains.	27.529100	84.354200	4.3	2200	visa-free	4.5
22	Zermatt	5	Alpine resort at the Matterhorn	Zermatt is a car-free alpine village at the foot of the Matterhorn. Year-round skiing, glacier hikes, and high viewpoints keep the peaks close. Gornergrat and Rothorn railways deliver sweeping panoramas within minutes. Chalets, spas, and fine dining offer deep comfort after mountain days. The village streets glow warm in winter and crisp in summer. It is pure Swiss mountain theatre done with precision.	46.020700	7.749100	4.9	15000	schengen	4.8
23	Lucerne	5	Lake city with medieval charm	Lucerne curls around a sparkling lake with bridges and painted facades in its medieval core. Chapel Bridge and the Lion Monument headline a compact but rich old town. Boats shuttle to villages while cog railways climb Pilatus and Rigi. Concert halls, museums, and markets add culture beside the water. Snowy peaks sit photogenically behind promenades and terraces. The city blends scenery and story in equal measure.	47.050200	8.309300	4.8	12000	schengen	4.7
3	Leh Ladakh	1	High-altitude desert & passes	Leh Ladakh is a stark high-altitude desert of passes, blue lakes, and ancient monasteries. Riders cross dramatic roads like Khardung La while trekkers head for Markha and Zanskar. Pangong and Tso Moriri shimmer with surreal colors under vast skies. Monasteries such as Hemis and Thiksey add a deep Buddhist rhythm to daily life. The region's thin air, starry nights, and silence feel otherworldly. It is the Himalayan dream for bikers, photographers, and seekers.	34.152600	77.577100	4.1	2800	visa-free	4.6
4	Andaman Islands	1	Tropical islands with coral reefs	The Andaman Islands scatter turquoise lagoons, white beaches, and coral gardens across the Bay of Bengal. Radhanagar and Elephant Beach are favorites for swimming and sunsets. Divers and snorkelers meet turtles, reef fish, and vivid hard corals. Mangrove creeks and bioluminescent bays add gentle adventure at night. Port Blair's Cellular Jail keeps poignant freedom-struggle history alive. Together they make a calm, tropical, and slightly wild getaway.	11.740100	92.658600	4.3	3500	visa-free	4.4
5	Phuket	2	Thailand’s famous beach island	Phuket is Thailand's largest island, a sunny base for beaches, island hops, and nightlife. Patong buzzes with shows and clubs, while Kata and Karon feel family friendly. Day trips fan out to Phang Nga Bay and the Phi Phi archipelago for warm, clear water. Big Buddha viewpoints and Old Town sino-portuguese streets add culture and color. Resorts, markets, and water sports keep every day easy to fill. It is a classic tropical holiday with something for everyone.	7.880400	98.392300	4.4	4500	visa-on-arrival	4.7
7	Pokhara	4	Gateway to Annapurna treks	Pokhara rests by Phewa Lake with the Annapurna range reflected on calm mornings. Paragliding and zip lines add easy thrills above terraced hills and forests. Boat rides, caves, and waterfalls fill restful afternoons near town. Trekkers stage Annapurna and Mardi treks with dependable services and guides. Cafes and lakeside paths keep the pace slow when legs need a break. It is Nepal's gentlest gateway to big mountains.	28.209600	83.985600	4.6	2500	visa-free	4.3
9	Kyoto	6	Historic temples & gardens	Kyoto keeps Japan's classical soul alive in wooden lanes, gardens, and shrines. Spring blossoms and autumn maples turn familiar temples into new scenes. Fushimi Inari's gates, Kinkaku-ji's gold, and Arashiyama's bamboo define the postcard. Tea ceremony, kaiseki cuisine, and geiko districts preserve refined traditions. River walks and quiet sub-temples give space for slower days. It is a gentle city that rewards attention.	35.011600	135.768100	4.9	8000	visa-on-arrival	4.8
10	Paris	7	City of Lights & Romance	Paris pairs world icons with everyday pleasures in riverside neighborhoods. The Eiffel Tower and Louvre headline, but cafes and markets carry the mood. Walks over Seine bridges connect islands, boutiques, and bookstalls. Museums, fashion, and patisserie craft turn rainy hours into gifts. At night the city glows with theatres, bistros, and soft streetlight. It is romance, culture, and routine living beautifully together.	48.856600	2.352200	4.7	15000	schengen	4.9
11	Sydney	8	Harbour city with beaches	Sydney wraps a blue harbor with beaches and neighborhoods full of fresh air. Ferries slide past the Opera House and under the Harbour Bridge all day. Coastal walks link cafes with ocean pools from Bondi to Manly. Markets, galleries, and gardens make the center more than a skyline. Evenings bring harborside dining and easy trains home. It balances city pace with beach routine.	-33.868800	151.209300	4.6	12000	visa-on-arrival	4.7
12	Rio de Janeiro	9	Beaches & Carnival capital	Rio de Janeiro dances between granite peaks and Atlantic surf. Christ the Redeemer and Sugarloaf set the stage for broad beaches below. Samba, football, and street art pulse through busy neighborhoods. Carnival explodes each year in color and rhythm known worldwide. Trailheads and viewpoints bring sunrise crowds to green hills. Rio feels alive, dramatic, and welcoming in equal measure.	-22.906800	-43.172900	4.3	7000	visa-on-arrival	4.6
13	Cape Town	10	Mountains, beaches & wildlife	Cape Town spreads around Table Mountain with ocean on two sides and vineyards behind. Hikes, cable cars, and beaches make outdoor days simple to plan. Cape Point road trips stitch cliffs, penguins, and lighthouses into one loop. Robben Island adds vital history to the city's story of change. Markets and food halls mix Cape flavors with global tastes. It is a city of scenery, culture, and possibility.	-33.924900	18.424100	4.5	6000	visa-on-arrival	4.5
8	Interlaken	5	Swiss base for Alps adventure	Interlaken sits between Lakes Thun and Brienz with the Jungfrau massif above. It is a launchpad for hiking, canyoning, winter sports, and paragliding. Scenic trains climb toward Kleine Scheidegg and Jungfraujoch for ice and views. Lake cruises, chocolate shops, and alpine gardens slow the tempo in town. Traditional chalets line walkable streets framed by meadows. The location makes day trips simple in every season.	46.686300	7.863200	4.8	12000	schengen	4.2
\.


--
-- TOC entry 4859 (class 0 OID 49572)
-- Dependencies: 224
-- Data for Name: seasonality; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seasonality (destination_id, month, suitability) FROM stdin;
1	1	5
1	2	5
1	3	5
1	4	3
1	5	3
1	6	3
1	7	2
1	8	2
1	9	2
1	10	5
1	11	5
1	12	5
2	1	5
2	2	5
2	3	4
2	4	4
2	5	4
2	6	3
2	7	3
2	8	3
2	9	3
2	10	4
2	11	5
2	12	5
3	1	1
3	2	1
3	3	1
3	4	3
3	5	5
3	6	5
3	7	5
3	8	5
3	9	5
3	10	3
3	11	1
3	12	1
4	1	5
4	2	5
4	3	5
4	4	5
4	5	3
4	6	3
4	7	3
4	8	3
4	9	3
4	10	3
4	11	5
4	12	5
5	1	5
5	2	5
5	3	5
5	4	5
5	5	3
5	6	3
5	7	3
5	8	3
5	9	3
5	10	3
5	11	5
5	12	5
6	1	3
6	2	3
6	3	3
6	4	5
6	5	5
6	6	5
6	7	5
6	8	5
6	9	5
6	10	5
6	11	3
6	12	3
7	1	5
7	2	5
7	3	5
7	4	5
7	5	3
7	6	2
7	7	2
7	8	2
7	9	2
7	10	5
7	11	5
7	12	5
8	1	5
8	2	5
8	3	5
8	4	3
8	5	5
8	6	5
8	7	5
8	8	5
8	9	5
8	10	3
8	11	3
8	12	5
9	1	3
9	2	3
9	3	5
9	4	5
9	5	5
9	6	3
9	7	3
9	8	3
9	9	3
9	10	5
9	11	5
9	12	3
10	1	4
10	2	4
10	3	4
10	4	5
10	5	5
10	6	5
10	7	3
10	8	3
10	9	5
10	10	5
10	11	4
10	12	4
11	1	5
11	2	5
11	3	5
11	4	3
11	5	3
11	6	3
11	7	3
11	8	3
11	9	3
11	10	3
11	11	3
11	12	5
12	1	4
12	2	5
12	3	5
12	4	3
12	5	3
12	6	3
12	7	3
12	8	3
12	9	3
12	10	3
12	11	3
12	12	4
13	1	5
13	2	5
13	3	5
13	4	3
13	5	3
13	6	3
13	7	3
13	8	3
13	9	3
13	10	3
13	11	5
13	12	5
14	1	3
15	1	3
16	1	3
17	1	3
18	1	3
19	1	3
20	1	3
21	1	3
22	1	3
23	1	3
14	2	3
15	2	3
16	2	3
17	2	3
18	2	3
19	2	3
20	2	3
21	2	3
22	2	3
23	2	3
14	3	3
15	3	3
16	3	3
17	3	3
18	3	3
19	3	3
20	3	3
21	3	3
22	3	3
23	3	3
14	4	3
15	4	3
16	4	3
17	4	3
18	4	3
19	4	3
20	4	3
21	4	3
22	4	3
23	4	3
14	5	3
15	5	3
16	5	3
17	5	3
18	5	3
19	5	3
20	5	3
21	5	3
22	5	3
23	5	3
14	6	3
15	6	3
16	6	3
17	6	3
18	6	3
19	6	3
20	6	3
21	6	3
22	6	3
23	6	3
14	7	3
15	7	3
16	7	3
17	7	3
18	7	3
19	7	3
20	7	3
21	7	3
22	7	3
23	7	3
14	8	3
15	8	3
16	8	3
17	8	3
18	8	3
19	8	3
20	8	3
21	8	3
22	8	3
23	8	3
14	9	3
15	9	3
16	9	3
17	9	3
18	9	3
19	9	3
20	9	3
21	9	3
22	9	3
23	9	3
14	10	3
15	10	3
16	10	3
17	10	3
18	10	3
19	10	3
20	10	3
21	10	3
22	10	3
23	10	3
14	11	3
15	11	3
16	11	3
17	11	3
18	11	3
19	11	3
20	11	3
21	11	3
22	11	3
23	11	3
14	12	3
15	12	3
16	12	3
17	12	3
18	12	3
19	12	3
20	12	3
21	12	3
22	12	3
23	12	3
42	1	2
42	2	2
42	3	3
42	4	4
42	5	5
42	6	5
42	7	4
42	8	4
42	9	5
42	10	5
42	11	3
42	12	2
43	1	2
43	2	2
43	3	3
43	4	4
43	5	5
43	6	5
43	7	4
43	8	4
43	9	5
43	10	5
43	11	3
43	12	2
44	1	2
44	2	2
44	3	3
44	4	4
44	5	5
44	6	5
44	7	5
44	8	5
44	9	4
44	10	4
44	11	3
44	12	2
45	1	2
45	2	2
45	3	3
45	4	4
45	5	5
45	6	5
45	7	4
45	8	4
45	9	4
45	10	4
45	11	3
45	12	2
46	1	5
46	2	5
46	3	4
46	4	3
46	5	2
46	6	1
46	7	1
46	8	1
46	9	2
46	10	3
46	11	4
46	12	5
47	1	3
47	2	3
47	3	4
47	4	4
47	5	4
47	6	4
47	7	4
47	8	4
47	9	4
47	10	4
47	11	3
47	12	3
48	1	2
48	2	2
48	3	3
48	4	4
48	5	5
48	6	5
48	7	4
48	8	4
48	9	4
48	10	4
48	11	3
48	12	2
49	1	4
49	2	4
49	3	4
49	4	3
49	5	2
49	6	2
49	7	2
49	8	2
49	9	3
49	10	4
49	11	4
49	12	4
50	1	4
50	2	4
50	3	4
50	4	4
50	5	3
50	6	2
50	7	1
50	8	1
50	9	2
50	10	3
50	11	4
50	12	4
51	1	4
51	2	4
51	3	4
51	4	3
51	5	2
51	6	1
51	7	1
51	8	1
51	9	2
51	10	3
51	11	4
51	12	4
52	1	2
52	2	2
52	3	3
52	4	4
52	5	5
52	6	5
52	7	5
52	8	5
52	9	4
52	10	4
52	11	3
52	12	2
53	1	1
53	2	1
53	3	2
53	4	3
53	5	4
53	6	5
53	7	5
53	8	5
53	9	4
53	10	3
53	11	2
53	12	1
54	1	2
54	2	2
54	3	3
54	4	4
54	5	5
54	6	5
54	7	5
54	8	4
54	9	4
54	10	3
54	11	2
54	12	2
55	1	4
55	2	4
55	3	4
55	4	4
55	5	4
55	6	3
55	7	3
55	8	3
55	9	4
55	10	4
55	11	4
55	12	4
56	1	2
56	2	2
56	3	3
56	4	4
56	5	5
56	6	5
56	7	4
56	8	4
56	9	4
56	10	4
56	11	3
56	12	2
57	1	2
57	2	2
57	3	3
57	4	4
57	5	5
57	6	5
57	7	4
57	8	4
57	9	4
57	10	4
57	11	3
57	12	2
58	1	2
58	2	2
58	3	3
58	4	4
58	5	5
58	6	5
58	7	5
58	8	5
58	9	4
58	10	4
58	11	3
58	12	2
59	1	1
59	2	1
59	3	2
59	4	3
59	5	4
59	6	4
59	7	4
59	8	4
59	9	3
59	10	3
59	11	2
59	12	1
60	1	1
60	2	1
60	3	2
60	4	3
60	5	4
60	6	5
60	7	5
60	8	5
60	9	4
60	10	3
60	11	2
60	12	1
61	1	1
61	2	1
61	3	2
61	4	3
61	5	4
61	6	5
61	7	5
61	8	5
61	9	4
61	10	3
61	11	2
61	12	1
62	1	1
62	2	1
62	3	2
62	4	3
62	5	4
62	6	5
62	7	5
62	8	5
62	9	4
62	10	3
62	11	2
62	12	1
63	1	1
63	2	1
63	3	2
63	4	3
63	5	4
63	6	5
63	7	5
63	8	5
63	9	4
63	10	3
63	11	2
63	12	1
64	1	1
64	2	1
64	3	2
64	4	3
64	5	4
64	6	5
64	7	5
64	8	5
64	9	4
64	10	3
64	11	2
64	12	1
65	1	4
65	2	4
65	3	4
65	4	4
65	5	4
65	6	3
65	7	3
65	8	3
65	9	4
65	10	4
65	11	4
65	12	4
66	1	3
66	2	3
66	3	3
66	4	4
66	5	4
66	6	5
66	7	5
66	8	5
66	9	4
66	10	4
66	11	3
66	12	3
67	1	5
67	2	5
67	3	4
67	4	3
67	5	2
67	6	2
67	7	2
67	8	2
67	9	3
67	10	4
67	11	5
67	12	5
68	1	5
68	2	5
68	3	4
68	4	3
68	5	2
68	6	2
68	7	2
68	8	2
68	9	3
68	10	4
68	11	5
68	12	5
69	1	3
69	2	3
69	3	4
69	4	4
69	5	4
69	6	3
69	7	3
69	8	3
69	9	4
69	10	4
69	11	4
69	12	3
70	1	4
70	2	4
70	3	4
70	4	4
70	5	4
70	6	4
70	7	4
70	8	4
70	9	4
70	10	4
70	11	4
70	12	4
71	1	4
71	2	4
71	3	4
71	4	3
71	5	3
71	6	3
71	7	3
71	8	3
71	9	4
71	10	4
71	11	4
71	12	4
72	1	4
72	2	4
72	3	4
72	4	4
72	5	3
72	6	2
72	7	1
72	8	1
72	9	2
72	10	3
72	11	4
72	12	4
73	1	4
73	2	4
73	3	4
73	4	4
73	5	3
73	6	3
73	7	3
73	8	3
73	9	4
73	10	4
73	11	4
73	12	4
74	1	4
74	2	4
74	3	4
74	4	3
74	5	3
74	6	3
74	7	3
74	8	3
74	9	4
74	10	4
74	11	4
74	12	4
75	1	1
75	2	1
75	3	2
75	4	3
75	5	4
75	6	4
75	7	5
75	8	5
75	9	4
75	10	3
75	11	2
75	12	1
76	1	1
76	2	1
76	3	2
76	4	3
76	5	4
76	6	4
76	7	4
76	8	4
76	9	3
76	10	3
76	11	2
76	12	1
77	1	1
77	2	1
77	3	2
77	4	3
77	5	4
77	6	4
77	7	4
77	8	4
77	9	3
77	10	3
77	11	2
77	12	1
78	1	1
78	2	1
78	3	2
78	4	3
78	5	4
78	6	5
78	7	5
78	8	5
78	9	4
78	10	3
78	11	2
78	12	1
79	1	2
79	2	2
79	3	3
79	4	4
79	5	5
79	6	5
79	7	5
79	8	5
79	9	4
79	10	3
79	11	2
79	12	2
80	1	2
80	2	2
80	3	3
80	4	4
80	5	5
80	6	5
80	7	5
80	8	5
80	9	4
80	10	3
80	11	2
80	12	2
81	1	3
81	2	3
81	3	4
81	4	4
81	5	4
81	6	3
81	7	3
81	8	3
81	9	4
81	10	4
81	11	4
81	12	3
82	1	4
82	2	4
82	3	4
82	4	3
82	5	2
82	6	2
82	7	2
82	8	2
82	9	3
82	10	4
82	11	4
82	12	4
83	1	4
83	2	4
83	3	4
83	4	3
83	5	2
83	6	2
83	7	2
83	8	2
83	9	3
83	10	4
83	11	4
83	12	4
84	1	3
84	2	3
84	3	4
84	4	4
84	5	4
84	6	3
84	7	2
84	8	2
84	9	3
84	10	4
84	11	4
84	12	4
85	1	2
85	2	2
85	3	3
85	4	4
85	5	5
85	6	5
85	7	5
85	8	5
85	9	4
85	10	3
85	11	2
85	12	2
86	1	2
86	2	2
86	3	3
86	4	4
86	5	5
86	6	5
86	7	5
86	8	5
86	9	4
86	10	3
86	11	2
86	12	2
87	1	2
87	2	2
87	3	3
87	4	4
87	5	5
87	6	5
87	7	5
87	8	5
87	9	4
87	10	3
87	11	2
87	12	2
88	1	4
88	2	4
88	3	4
88	4	3
88	5	2
88	6	2
88	7	2
88	8	2
88	9	3
88	10	4
88	11	4
88	12	4
89	1	4
89	2	4
89	3	4
89	4	4
89	5	3
89	6	3
89	7	3
89	8	3
89	9	4
89	10	4
89	11	4
89	12	4
90	1	4
90	2	4
90	3	4
90	4	4
90	5	4
90	6	4
90	7	4
90	8	4
90	9	4
90	10	4
90	11	4
90	12	4
91	1	4
91	2	4
91	3	4
91	4	4
91	5	4
91	6	4
91	7	4
91	8	4
91	9	4
91	10	4
91	11	4
91	12	4
92	1	2
92	2	2
92	3	3
92	4	4
92	5	5
92	6	5
92	7	4
92	8	4
92	9	4
92	10	4
92	11	3
92	12	2
93	1	3
93	2	3
93	3	4
93	4	4
93	5	4
93	6	3
93	7	3
93	8	3
93	9	4
93	10	4
93	11	4
93	12	3
94	1	4
94	2	4
94	3	4
94	4	3
94	5	2
94	6	2
94	7	2
94	8	2
94	9	3
94	10	4
94	11	4
94	12	4
95	1	4
95	2	4
95	3	4
95	4	4
95	5	4
95	6	3
95	7	3
95	8	3
95	9	4
95	10	4
95	11	4
95	12	4
96	1	4
96	2	4
96	3	4
96	4	4
96	5	3
96	6	3
96	7	3
96	8	3
96	9	4
96	10	4
96	11	4
96	12	4
97	1	5
97	2	5
97	3	4
97	4	4
97	5	3
97	6	2
97	7	1
97	8	1
97	9	2
97	10	3
97	11	4
97	12	5
\.


--
-- TOC entry 4855 (class 0 OID 49530)
-- Dependencies: 220
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (id, name) FROM stdin;
1	beach
2	mountain
3	trekking
4	jungle
5	city
6	desert
7	heritage
8	snow
9	island
10	nightlife
11	wine
12	wildlife
13	surfing
14	festival
15	cultural
\.


--
-- TOC entry 4871 (class 0 OID 0)
-- Dependencies: 217
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.countries_id_seq', 52, true);


--
-- TOC entry 4872 (class 0 OID 0)
-- Dependencies: 225
-- Name: destination_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.destination_images_id_seq', 123, true);


--
-- TOC entry 4873 (class 0 OID 0)
-- Dependencies: 221
-- Name: destinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.destinations_id_seq', 97, true);


--
-- TOC entry 4874 (class 0 OID 0)
-- Dependencies: 219
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_id_seq', 66, true);


--
-- TOC entry 4677 (class 2606 OID 49528)
-- Name: countries countries_iso_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_iso_code_key UNIQUE (iso_code);


--
-- TOC entry 4679 (class 2606 OID 49526)
-- Name: countries countries_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_name_key UNIQUE (name);


--
-- TOC entry 4681 (class 2606 OID 49524)
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- TOC entry 4699 (class 2606 OID 49593)
-- Name: destination_images destination_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_images
    ADD CONSTRAINT destination_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4691 (class 2606 OID 49561)
-- Name: destination_tags destination_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_pkey PRIMARY KEY (destination_id, tag_id);


--
-- TOC entry 4693 (class 2606 OID 49605)
-- Name: destination_tags destination_tags_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_unique UNIQUE (destination_id, tag_id);


--
-- TOC entry 4687 (class 2606 OID 49551)
-- Name: destinations destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_pkey PRIMARY KEY (id);


--
-- TOC entry 4697 (class 2606 OID 49578)
-- Name: seasonality seasonality_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasonality
    ADD CONSTRAINT seasonality_pkey PRIMARY KEY (destination_id, month);


--
-- TOC entry 4683 (class 2606 OID 49539)
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- TOC entry 4685 (class 2606 OID 49537)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- TOC entry 4688 (class 1259 OID 49599)
-- Name: idx_dest_country; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dest_country ON public.destinations USING btree (country_id);


--
-- TOC entry 4689 (class 1259 OID 49600)
-- Name: idx_dest_visa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dest_visa ON public.destinations USING btree (visa_type);


--
-- TOC entry 4694 (class 1259 OID 49601)
-- Name: idx_dt_tag; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dt_tag ON public.destination_tags USING btree (tag_id);


--
-- TOC entry 4700 (class 1259 OID 49603)
-- Name: idx_image_dest; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_image_dest ON public.destination_images USING btree (destination_id);


--
-- TOC entry 4695 (class 1259 OID 49602)
-- Name: idx_season_month; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_season_month ON public.seasonality USING btree (month);


--
-- TOC entry 4701 (class 1259 OID 49610)
-- Name: ux_destination_images_one_cover; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_destination_images_one_cover ON public.destination_images USING btree (destination_id) WHERE is_cover;


--
-- TOC entry 4706 (class 2606 OID 49594)
-- Name: destination_images destination_images_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_images
    ADD CONSTRAINT destination_images_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


--
-- TOC entry 4703 (class 2606 OID 49562)
-- Name: destination_tags destination_tags_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


--
-- TOC entry 4704 (class 2606 OID 49567)
-- Name: destination_tags destination_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- TOC entry 4702 (class 2606 OID 49552)
-- Name: destinations destinations_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id) ON DELETE RESTRICT;


--
-- TOC entry 4705 (class 2606 OID 49579)
-- Name: seasonality seasonality_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasonality
    ADD CONSTRAINT seasonality_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


-- Completed on 2026-04-22 15:52:28

--
-- PostgreSQL database dump complete
--

