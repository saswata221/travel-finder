--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
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
-- Name: countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.countries_id_seq OWNED BY public.countries.id;


--
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
-- Name: destination_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.destination_images_id_seq OWNED BY public.destination_images.id;


--
-- Name: destination_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destination_messages (
    id integer NOT NULL,
    destination_id integer NOT NULL,
    rating integer NOT NULL,
    message_template text NOT NULL,
    CONSTRAINT destination_messages_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.destination_messages OWNER TO postgres;

--
-- Name: destination_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.destination_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destination_messages_id_seq OWNER TO postgres;

--
-- Name: destination_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.destination_messages_id_seq OWNED BY public.destination_messages.id;


--
-- Name: destination_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destination_tags (
    destination_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.destination_tags OWNER TO postgres;

--
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
-- Name: destinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.destinations_id_seq OWNED BY public.destinations.id;


--
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
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
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
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: countries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries ALTER COLUMN id SET DEFAULT nextval('public.countries_id_seq'::regclass);


--
-- Name: destination_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_images ALTER COLUMN id SET DEFAULT nextval('public.destination_images_id_seq'::regclass);


--
-- Name: destination_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_messages ALTER COLUMN id SET DEFAULT nextval('public.destination_messages_id_seq'::regclass);


--
-- Name: destinations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations ALTER COLUMN id SET DEFAULT nextval('public.destinations_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.countries (id, name, iso_code, region) FROM stdin;
1	India	IN	Asia
2	Thailand	TH	Asia
3	Indonesia	ID	Asia
4	Nepal	NP	Asia
5	Switzerland	CH	Europe
6	Japan	JP	Asia
7	France	FR	Europe
8	Australia	AU	Oceania
9	Brazil	BR	South America
10	South Africa	ZA	Africa
\.


--
-- Data for Name: destination_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destination_images (id, destination_id, image_url, is_cover) FROM stdin;
1	14		t
2	15		t
3	16		t
4	17		t
17	2		t
20	18		t
21	19		t
22	20		t
23	21		t
24	22		t
25	23		t
42	14		f
43	15		f
44	16		f
45	17		f
58	2		f
61	18		f
62	19		f
63	20		f
64	21		f
65	22		f
66	23		f
83	14		f
84	15		f
85	16		f
86	17		f
99	2		f
102	18		f
103	19		f
104	20		f
105	21		f
106	22		f
107	23		f
15	1	https://saswata221.github.io/event-assets/Travel/manali/WhatsApp%20Image%202025-08-30%20at%2011.35.54%20PM.jpeg	t
56	1	https://saswata221.github.io/event-assets/Travel/manali/WhatsApp%20Image%202025-08-30%20at%2011.35.53%20PM.jpeg	f
97	1	https://saswata221.github.io/event-assets/Travel/manali/WhatsApp%20Image%202025-08-30%20at%2011.35.53%20PM%20(1).jpeg	f
26	3	https://saswata221.github.io/event-assets/Travel/ladakh/WhatsApp%20Image%202025-08-30%20at%2011.13.56%20PM%20(1).jpeg	t
67	3	https://saswata221.github.io/event-assets/Travel/ladakh/WhatsApp%20Image%202025-08-30%20at%2011.13.56%20PM.jpeg	f
108	3	https://saswata221.github.io/event-assets/Travel/ladakh/WhatsApp%20Image%202025-08-30%20at%2011.13.57%20PM.jpeg	f
28	4	https://saswata221.github.io/event-assets/Travel/andaman/WhatsApp%20Image%202025-08-30%20at%2011.34.18%20PM%20(1).jpeg	t
69	4	https://saswata221.github.io/event-assets/Travel/andaman/WhatsApp%20Image%202025-08-30%20at%2011.34.18%20PM.jpeg	f
110	4	https://saswata221.github.io/event-assets/Travel/andaman/WhatsApp%20Image%202025-08-30%20at%2011.34.19%20PM.jpeg	f
30	5	https://saswata221.github.io/event-assets/Travel/phuket/WhatsApp%20Image%202025-08-30%20at%2011.25.17%20PM.jpeg	t
71	5	https://saswata221.github.io/event-assets/Travel/phuket/WhatsApp%20Image%202025-08-30%20at%2011.25.17%20PM%20(1).jpeg	f
112	5	https://saswata221.github.io/event-assets/Travel/phuket/WhatsApp%20Image%202025-08-30%20at%2011.25.16%20PM.jpeg	f
19	6	https://saswata221.github.io/event-assets/Travel/bali/WhatsApp%20Image%202025-08-30%20at%2010.59.47%20PM.jpeg	t
60	6	https://saswata221.github.io/event-assets/Travel/bali/WhatsApp%20Image%202025-08-30%20at%2010.59.48%20PM.jpeg	f
101	6	https://saswata221.github.io/event-assets/Travel/bali/WhatsApp%20Image%202025-08-30%20at%2010.59.47%20PM%20(1).jpeg	f
33	7	https://saswata221.github.io/event-assets/Travel/pokhra/WhatsApp%20Image%202025-08-30%20at%2011.37.56%20PM%20(2).jpeg	t
74	7	https://saswata221.github.io/event-assets/Travel/pokhra/WhatsApp%20Image%202025-08-30%20at%2011.37.56%20PM%20(1).jpeg	f
115	7	https://saswata221.github.io/event-assets/Travel/pokhra/WhatsApp%20Image%202025-08-30%20at%2011.37.56%20PM.jpeg	f
37	9	https://saswata221.github.io/event-assets/Travel/japan/WhatsApp%20Image%202025-08-30%20at%2011.23.04%20PM%20(1).jpeg	t
78	9	https://saswata221.github.io/event-assets/Travel/japan/WhatsApp%20Image%202025-08-30%20at%2011.23.04%20PM.jpeg	f
119	9	https://saswata221.github.io/event-assets/Travel/japan/WhatsApp%20Image%202025-08-30%20at%2011.23.05%20PM.jpeg	f
38	10	https://saswata221.github.io/event-assets/Travel/paris/WhatsApp%20Image%202025-08-30%20at%2011.05.17%20PM%20(1).jpeg	t
39	11	https://saswata221.github.io/event-assets/Travel/sydney/WhatsApp%20Image%202025-08-30%20at%2011.27.21%20PM%20(1).jpeg	t
40	12	https://saswata221.github.io/event-assets/Travel/rio/WhatsApp%20Image%202025-08-30%20at%2011.31.12%20PM%20(1).jpeg	t
35	8	https://saswata221.github.io/event-assets/Travel/switzerland/WhatsApp%20Image%202025-08-30%20at%2011.17.18%20PM%20(1).jpeg	t
79	10	https://saswata221.github.io/event-assets/Travel/paris/WhatsApp%20Image%202025-08-30%20at%2011.05.17%20PM.jpeg	f
120	10	https://saswata221.github.io/event-assets/Travel/paris/WhatsApp%20Image%202025-08-30%20at%2011.05.18%20PM.jpeg	f
80	11	https://saswata221.github.io/event-assets/Travel/sydney/WhatsApp%20Image%202025-08-30%20at%2011.27.21%20PM.jpeg	f
121	11	https://saswata221.github.io/event-assets/Travel/sydney/WhatsApp%20Image%202025-08-30%20at%2011.27.22%20PM.jpeg	f
81	12	https://saswata221.github.io/event-assets/Travel/rio/WhatsApp%20Image%202025-08-30%20at%2011.31.12%20PM.jpeg	f
122	12	https://saswata221.github.io/event-assets/Travel/rio/WhatsApp%20Image%202025-08-30%20at%2011.31.13%20PM.jpeg	f
41	13	https://saswata221.github.io/event-assets/Travel/cape town/WhatsApp%20Image%202025-08-30%20at%2011.32.16%20PM%20(2).jpeg	t
82	13	https://saswata221.github.io/event-assets/Travel/cape town/WhatsApp%20Image%202025-08-30%20at%2011.32.16%20PM.jpeg	f
123	13	https://saswata221.github.io/event-assets/Travel/cape town/WhatsApp%20Image%202025-08-30%20at%2011.32.16%20PM%20(1).jpeg	f
76	8	https://saswata221.github.io/event-assets/Travel/switzerland/WhatsApp%20Image%202025-08-30%20at%2011.17.19%20PM.jpeg	f
117	8	https://saswata221.github.io/event-assets/Travel/switzerland/WhatsApp%20Image%202025-08-30%20at%2011.17.18%20PM.jpeg	f
\.


--
-- Data for Name: destination_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destination_messages (id, destination_id, rating, message_template) FROM stdin;
1	10	5	Perfect time for {name}! Best months: {best_seasons}. Have an amazing trip!
2	10	4	Great time to visit {name}. Consider these months: {best_seasons}.
3	10	3	Okay time for {name}. Some days may not be ideal. Best months: {best_seasons}.
4	10	2	Not the best season for {name}. If you can, aim for: {best_seasons}.
5	10	1	Low season in {name}. Many activities may be limited. Best months: {best_seasons}.
\.


--
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
\.


--
-- Data for Name: destinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destinations (id, name, country_id, short_description, about, latitude, longitude, safety_score, avg_daily_cost, visa_type, popularity_score) FROM stdin;
14	Jaipur	1	The Pink City of India	Jaipur paints forts, palaces, and markets in warm pink stone. Amber, Jaigarh, and Nahargarh watch the city from the hills. City Palace, Jantar Mantar, and Hawa Mahal keep royal science and style close. Bazaars brim with block prints, gemstones, and brassware to haggle over. Street food and folk shows keep evenings lively in old quarters. It is the grand entrance to Rajasthan's craft and history.	26.912400	75.787300	4.3	3500	visa-free	4.6
15	Varanasi	1	India’s spiritual heart on the Ganges	Varanasi sits on the Ganges with rituals that begin before sunrise and end after dark. Boating past ghats shows cremation fires, prayers, and everyday river life. The evening aarti folds lamps, bells, and chants into a glowing ceremony. Silk weavers, musicians, and philosophers give the lanes their character. Temples and ashrams host seekers from India and abroad. The city is intense, ancient, and deeply moving.	25.317600	82.973900	4.2	2500	visa-free	4.5
16	Chiang Mai	2	Thailand’s cultural northern city	Chiang Mai wraps a laid-back northern city inside ancient walls and mountain green. Hundreds of temples and a lively Old City set an easy cultural rhythm. Night bazaars, coffee roasters, and craft studios showcase creative life. Trekking, zip lines, and elephant sanctuaries bring soft adventure close by. Lantern-lit Yi Peng and Songkran festivals glow with community spirit. Many travelers stay longer for the balance of cost, comfort, and nature.	18.706100	98.981700	4.5	3000	visa-on-arrival	4.7
17	Krabi	2	Beach paradise with limestone cliffs	Krabi lines the Andaman coast with towering limestone cliffs and jade water. Railay is a world favorite for rock climbing and relaxed beaches. Snorkel and dive boats reach coral gardens and gentle tropical fish in minutes. Island-hopping to Hong, Phi Phi, and Poda keeps the scenery changing daily. Markets, long-tail boats, and easy seafood meals keep evenings simple. It is equal parts postcard beauty and approachable adventure.	8.086300	98.906300	4.4	4000	visa-on-arrival	4.6
1	Manali	1	Himalayan hill town with snow views	Manali is a picturesque hill town in Himachal Pradesh ringed by snow peaks and cedar forests. It draws adventure lovers for paragliding, skiing, river rafting, and high-altitude treks. Nearby Solang Valley and Rohtang Pass deliver year-round mountain scenery. Old Manali lanes, cafes, and the Hidimba Devi Temple add culture and calm. Apple orchards, local woolens, and cozy stays make it a balanced mix of thrill and relaxation. It is popular with both backpackers and families.	32.239600	77.188700	4.2	2500	visa-free	4.5
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
\.


--
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
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.countries_id_seq', 10, true);


--
-- Name: destination_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.destination_images_id_seq', 123, true);


--
-- Name: destination_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.destination_messages_id_seq', 5, true);


--
-- Name: destinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.destinations_id_seq', 41, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_id_seq', 15, true);


--
-- Name: countries countries_iso_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_iso_code_key UNIQUE (iso_code);


--
-- Name: countries countries_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_name_key UNIQUE (name);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- Name: destination_images destination_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_images
    ADD CONSTRAINT destination_images_pkey PRIMARY KEY (id);


--
-- Name: destination_messages destination_messages_destination_id_rating_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_messages
    ADD CONSTRAINT destination_messages_destination_id_rating_key UNIQUE (destination_id, rating);


--
-- Name: destination_messages destination_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_messages
    ADD CONSTRAINT destination_messages_pkey PRIMARY KEY (id);


--
-- Name: destination_tags destination_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_pkey PRIMARY KEY (destination_id, tag_id);


--
-- Name: destination_tags destination_tags_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_unique UNIQUE (destination_id, tag_id);


--
-- Name: destinations destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_pkey PRIMARY KEY (id);


--
-- Name: seasonality seasonality_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasonality
    ADD CONSTRAINT seasonality_pkey PRIMARY KEY (destination_id, month);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: idx_dest_country; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dest_country ON public.destinations USING btree (country_id);


--
-- Name: idx_dest_visa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dest_visa ON public.destinations USING btree (visa_type);


--
-- Name: idx_dt_tag; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dt_tag ON public.destination_tags USING btree (tag_id);


--
-- Name: idx_image_dest; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_image_dest ON public.destination_images USING btree (destination_id);


--
-- Name: idx_season_month; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_season_month ON public.seasonality USING btree (month);


--
-- Name: ux_destination_images_one_cover; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_destination_images_one_cover ON public.destination_images USING btree (destination_id) WHERE is_cover;


--
-- Name: destination_images destination_images_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_images
    ADD CONSTRAINT destination_images_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


--
-- Name: destination_messages destination_messages_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_messages
    ADD CONSTRAINT destination_messages_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


--
-- Name: destination_tags destination_tags_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


--
-- Name: destination_tags destination_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: destinations destinations_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id) ON DELETE RESTRICT;


--
-- Name: seasonality seasonality_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasonality
    ADD CONSTRAINT seasonality_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

