"""
Comprehensive cultural heritage records for Indian artifacts, linking:
- Physical artifact metadata & materials
- Calibrated 3D photogrammetric dimensions & structural analysis
- ArUco scale reference telemetry
- Cultural context & oral traditions (audio, transcript, translation)
- Separated geospatial locations (Origin, Region, Documentation, Display)
- Privacy tiers (Public, Restricted, Private)
- Auditable provenance lineage
- Progressive verification lifecycle (Pending -> Community -> Source -> Institution)
- Digital Heritage Passport links & QR codes
"""

SAMPLE_ARTIFACTS = {
    "DH-IND-0001": {
        "id": "DH-IND-0001",
        "name": "GOLDEN BUDDHA IN DHYANA MUDRA",
        "artifact_type": "Ritual Vessel",
        "material": "Brass (Copper-Zinc Alloy)",
        "craft_technique": "Dhokra Lost-Wax (Cire Perdue) casting with natural beeswax threads",
        "region": "Chhattisgarh",
        "community": "Ghadwa Metalcrafting Community",
        "approximate_period": "Late 19th Century / Traditional Continuity",
        "traditional_use": "Sacred ceremonial urn holding consecrated holy river water and mango sprigs during Griha Pravesh (housewarming) and Bastar Dussehra ritual sanctifications.",
        "cultural_significance": "Represents primordial abundance (Purna Kumbha), the elixir of immortality (Amrita), and the cosmic balance of earth and water elements.",
        "associated_practice": "Kalash Sthapana rites during Navratri and temple threshold consecration ceremonies.",
        "documentation_date": "2026-09-15",
        "contributor": "Mansingh Baghel, Master Craftsman, Kondagaon",
        "scan_status": "COMPLETED",
        "3d_status": "COMPLETED",
        "3d_model_url": "/static/assets/models/buddha.glb",
        "scan_video_url": "/static/assets/videos/buddha_scan.mp4",
        "scan_video_webp": "/static/assets/videos/buddha_scan.webp",
        "scan_video_poster": "/static/assets/videos/buddha_scan_poster.jpg",
        "scan_recording": {
            "title": "Automated 360° Photogrammetric Turntable Scan Recording",
            "filename": "scan_recording_DH-IND-0001_1790848319.mp4",
            "video_url": "/static/assets/videos/buddha_scan.mp4",
            "webp_url": "/static/assets/videos/buddha_scan.webp",
            "poster_url": "/static/assets/videos/buddha_scan_poster.jpg",
            "resolution": "1280x720 HD",
            "fps": 20,
            "frames": 28,
            "fiducial_scale_ref": "ArUco #42 (50.0mm)",
            "recorded_at": "2026-10-01 15:22 IST"
        },
        "thumbnail_url": "/static/assets/images/view_front.jpg",
        "verification_status": "INSTITUTION-VERIFIED",
        "verification_badge": "INSTITUTION-VERIFIED",
        "verification_level": 4, # 1: Pending, 2: Community, 3: Source, 4: Institution
        "scale_reference": "DETECTED",
        "scale_marker_id": 42,
        "scale_status": "SCALED", # SCALED | ESTIMATED | UNSCALED
        "dimensions": {
            "height": 18.4,
            "width": 12.2,
            "depth": 11.8,
            "unit": "cm",
            "scale_mode": "SCALED",
            "bounding_box": {"x": 12.2, "y": 18.4, "z": 11.8},
            "surface_area": "584.2 cm²",
            "volume": "942.8 cm³",
            "scanned_height": 18.4,
            "caliper_height": 18.1,
            "validation_status": "VALIDATED",
            "validation_notes": "Physical measurement cross-verified with Mitutoyo 500-196-30 Digital Caliper (calibrated 0.01mm tolerance)."
        },
        "structure_3d": {
            "mesh_status": "POISSON_WATERTIGHT",
            "texture_status": "BAKED_PBR_2K",
            "polygon_count": 2592,
            "vertex_count": 1332,
            "point_cloud_status": "48,290 DENSE POINTS RESOLVED",
            "texture_resolution": "2048 x 2048 px",
            "reconstruction_pipeline": "OpenSfM (Structure-from-Motion) + Poisson Screened Surface Reconstruction"
        },
        "object_characteristics": {
            "material": {"value": "Cast Brass (Dhokra cire-perdue technique)", "source": "Human-entered", "verified": "INSTITUTION-VERIFIED"},
            "dominant_colour": {"value": "Antique Warm Gold / Ochre", "source": "AI-suggested", "verified": "SOURCE-VERIFIED"},
            "surface_appearance": {"value": "Textured filigree wax threading, unpolished natural patina", "source": "Human-entered", "verified": "SOURCE-VERIFIED"},
            "texture": {"value": "Fibrous cord impression with embossed tribal lozenges", "source": "Human-entered", "verified": "SOURCE-VERIFIED"},
            "shape": {"value": "Piriform ritual urn with tiered foot and flanged collar", "source": "AI-suggested", "verified": "COMMUNITY-PROVIDED"},
            "approximate_period": {"value": "circa 1890-1920 (Late Colonial / Bastar Tribal Epoch)", "source": "Human-entered", "verified": "INSTITUTION-VERIFIED"},
            "condition": {"value": "Intact, light superficial cupric oxidation along base", "source": "Human-entered", "verified": "SOURCE-VERIFIED"},
            "craft_technique": {"value": "Dhokra Lost-Wax (Cire Perdue) casting with clay core", "source": "Human-entered", "verified": "INSTITUTION-VERIFIED"}
        },
        "condition_notes": {
            "cracks": "None observed in primary brass structural envelope.",
            "breakage": "Minor 2mm dent on outer lower pedestal flange, does not compromise stability.",
            "surface_damage": "Superficial verdigris patina near lower rim, chemically stable.",
            "discoloration": "Natural darkened bronze oxidation inside neck cavity due to historical offerings.",
            "missing_parts": "Original ritual coconut and mango leaf brass lid is intact and seated.",
            "wear": "Handling burnish on spherical grip curvature consistent with ritual veneration.",
            "restoration": "Cleaned with non-acidic ethanol swab by conservation team in 2024."
        },
        "photo_gallery": [
            {"label": "Front View (0°)", "url": "/static/assets/images/view_front.jpg", "angle": 0, "type": "PRIMARY"},
            {"label": "Left View (90°)", "url": "/static/assets/images/view_left.jpg", "angle": 90, "type": "ORTHOGONAL"},
            {"label": "Back View (180°)", "url": "/static/assets/images/view_back.jpg", "angle": 180, "type": "ORTHOGONAL"},
            {"label": "Right View (270°)", "url": "/static/assets/images/view_right.jpg", "angle": 270, "type": "ORTHOGONAL"},
            {"label": "Top Oblique (45°)", "url": "/static/assets/images/view_top.jpg", "angle": 45, "type": "OBLIQUE"},
            {"label": "Calibration Reference", "url": "/static/assets/images/calibration_aruco.jpg", "angle": 0, "type": "CALIBRATION"},
            {"label": "Filigree Detail Macro", "url": "/static/assets/images/detail_filigree.jpg", "angle": 315, "type": "MACRO"}
        ],
        "oral_knowledge": {
            "audio_url": "/static/assets/audio/dh_ind_0001_oral_lore.wav",
            "duration": "00:48",
            "speaker": "Mansingh Baghel",
            "speaker_role": "Master Ghadwa Artisan, Kondagaon Craft Guild",
            "language": "Hindi / Halbi dialect",
            "status": "AI-assisted / Verified by Tribal Research Cell",
            "status_label": "AI-ASSISTED TRANSCRIPTION",
            "transcript": "यह कलश हमारे बस्तर के घड़वा कारीगरों द्वारा मोम के महीन तारों से तैयार किया जाता है। इसकी बनावट में मिट्टी का सांचा पहले बनता है, फिर मधुमक्खी के मोम से यह नक्काशी उकेरी जाती है। पूजा और मड़ई मेले में यह पवित्र माना जाता है।",
            "translation": "This Kalash is crafted by our Ghadwa artisans of Bastar using fine beeswax filaments. A clay core is sculpted first, over which intricate filigree is hand-wound using pure honeybee wax. It holds sacred water during folk Madai festivals and rituals."
        },
        "map_data": {
            "cultural_origin": {
                "name": "Bastar District, Chhattisgarh",
                "lat": 19.1071,
                "lng": 81.9535,
                "state": "Chhattisgarh",
                "details": "Traditional indigenous hearth of Ghadwa bronze metalcasting."
            },
            "community_region": {
                "name": "Kondagaon Craft Cluster",
                "lat": 19.5978,
                "lng": 81.6706,
                "state": "Chhattisgarh",
                "details": "Active community workshop cluster of National Awardee Dhokra sculptors."
            },
            "documentation_location": {
                "name": "Heritage Field Scanning Lab, Bhilai",
                "lat": 21.2135,
                "lng": 81.3784,
                "state": "Chhattisgarh",
                "details": "Portable Rig 01 Field Station deployed for cultural census."
            },
            "current_display": {
                "name": "National Handicrafts & Handlooms Museum, New Delhi",
                "lat": 28.6143,
                "lng": 77.2427,
                "state": "Delhi",
                "details": "Gallery of Traditional Indian Metalware, Case #14-B."
            },
            "location_privacy": "PUBLIC" # PUBLIC | RESTRICTED | PRIVATE
        },
        "provenance": [
            {
                "step": "ARTIFACT CREATED",
                "date": "circa 1895",
                "actor": "Ghadwa Master Artisan Ancestors",
                "action": "Hand-forged via cire-perdue method for Kondagaon community temple.",
                "source": "Oral Genealogical Lineage of Baghel Family",
                "status": "SOURCE-VERIFIED"
            },
            {
                "step": "DOCUMENTED",
                "date": "2026-09-12",
                "actor": "Bhilai Cultural Heritage Field Team",
                "action": "Field accessioning, community interviews, and physical inspection.",
                "source": "Field Accession Logbook #BHL-402",
                "status": "COMMUNITY-PROVIDED"
            },
            {
                "step": "SCANNED",
                "date": "2026-09-15 10:14 IST",
                "actor": "Automated Turntable Scanner Rig v2.4",
                "action": "36-frame 360° photogrammetric capture with 50mm ArUco scale marker.",
                "source": "Telemetry Log Session #SC-26214-01",
                "status": "SOURCE-VERIFIED"
            },
            {
                "step": "3D RECONSTRUCTED",
                "date": "2026-09-15 10:22 IST",
                "actor": "Screened Poisson Mesh Reconstruction Engine",
                "action": "Resolved 48,290 dense points into 2,592 polygon watertight manifold mesh.",
                "source": "Job Manifest #REC-3D-991",
                "status": "SOURCE-VERIFIED"
            },
            {
                "step": "COMMUNITY CONTRIBUTION",
                "date": "2026-09-16",
                "actor": "Mansingh Baghel",
                "action": "Recorded native Halbi/Hindi oral history tape explaining beeswax winding.",
                "source": "Audio Archive Master #AUD-CG-001",
                "status": "COMMUNITY-PROVIDED"
            },
            {
                "step": "SOURCE VERIFIED",
                "date": "2026-09-18",
                "actor": "Regional Directorate of Culture, Raipur",
                "action": "Cross-referenced casting style with 19th c. central Indian tribal brass catalog.",
                "source": "Official Survey Dossier #RPR-CULT-26",
                "status": "SOURCE-VERIFIED"
            },
            {
                "step": "INSTITUTION VERIFIED",
                "date": "2026-09-22",
                "actor": "National Heritage Preservation Council Expert Panel",
                "action": "Formal ratification of structural measurements, provenance chain, and authenticity.",
                "source": "National Registry Entry Docket #NR-8841",
                "status": "INSTITUTION-VERIFIED"
            },
            {
                "step": "PUBLISHED",
                "date": "2026-09-23",
                "actor": "Digital Heritage Artifact Registry",
                "action": "Digital Heritage Passport generated with cryptographic fingerprint & public QR.",
                "source": "Passport URL /passport.html?id=DH-IND-0001",
                "status": "INSTITUTION-VERIFIED"
            }
        ],
        "passport_url": "/passport.html?id=DH-IND-0001"
    },
    "DH-IND-0002": {
        "id": "DH-IND-0002",
        "name": "CHOLA BRONZE NATARAJA",
        "artifact_type": "Sacred Bronze Sculpture",
        "material": "Panchaloha (Five-Metal Sacred Alloy)",
        "craft_technique": "Cire Perdue (Lost-Wax) Agamic Lost-Wax Casting",
        "region": "Tamil Nadu",
        "community": "Swamimalai Sthapathi Guild",
        "approximate_period": "11th Century CE (Imperial Chola Dynasty)",
        "traditional_use": "Utsava Murti (processional bronze icon) consecrated for temple festivities, embodying Shiva's cosmic dance of creation and dissolution.",
        "cultural_significance": "Pinnacle of medieval South Indian metallurgical and theological art; captures anandatandava within the halo of cosmic fire (Tiruvasi).",
        "associated_practice": "Arudra Darisanam abhishekam rites and temple chariot processions.",
        "documentation_date": "2026-09-10",
        "contributor": "K. Devasenapathy Sthapathi, Swamimalai",
        "scan_status": "COMPLETED",
        "3d_status": "COMPLETED",
        "3d_model_url": "/static/assets/models/nataraja.glb",
        "thumbnail_url": "/static/assets/images/view_front.jpg",
        "verification_status": "INSTITUTION-VERIFIED",
        "verification_badge": "INSTITUTION-VERIFIED",
        "verification_level": 4,
        "scale_reference": "DETECTED",
        "scale_marker_id": 42,
        "scale_status": "SCALED",
        "dimensions": {
            "height": 22.0,
            "width": 18.0,
            "depth": 7.5,
            "unit": "cm",
            "scale_mode": "SCALED",
            "bounding_box": {"x": 18.0, "y": 22.0, "z": 7.5},
            "surface_area": "412.0 cm²",
            "volume": "320.5 cm³",
            "scanned_height": 22.0,
            "caliper_height": 21.9,
            "validation_status": "VALIDATED",
            "validation_notes": "Iconometric proportions adhere to classic Tala canonical ratios."
        },
        "structure_3d": {
            "mesh_status": "WATERTIGHT",
            "texture_status": "PATINATED_BRONZE",
            "polygon_count": 1384,
            "vertex_count": 740,
            "point_cloud_status": "36,400 DENSE POINTS RESOLVED",
            "texture_resolution": "2048 x 2048 px",
            "reconstruction_pipeline": "Photogrammetric Multi-View Stereo + Poisson Surface Reconstructor"
        },
        "object_characteristics": {
            "material": {"value": "Panchaloha (Copper, Brass, Zinc, Gold, Silver traces)", "source": "Human-entered", "verified": "INSTITUTION-VERIFIED"},
            "dominant_colour": {"value": "Dark Verdigris Bronze Patina", "source": "AI-suggested", "verified": "INSTITUTION-VERIFIED"},
            "surface_appearance": {"value": "Chiseled detail, smoothened by centuries of ritual unguents", "source": "Human-entered", "verified": "SOURCE-VERIFIED"},
            "texture": {"value": "Fine metallic relief with crisp iconometric contours", "source": "Human-entered", "verified": "SOURCE-VERIFIED"},
            "shape": {"value": "Aureole ring enclosing quadrupedal deity poised on dwarf Apasmara", "source": "AI-suggested", "verified": "SOURCE-VERIFIED"},
            "approximate_period": {"value": "Imperial Chola (11th Century CE)", "source": "Human-entered", "verified": "INSTITUTION-VERIFIED"},
            "condition": {"value": "Pristine, stable copper carbonate oxidation patina", "source": "Human-entered", "verified": "INSTITUTION-VERIFIED"},
            "craft_technique": {"value": "Lost-wax solid cast according to Shilpa Shastras", "source": "Human-entered", "verified": "INSTITUTION-VERIFIED"}
        },
        "condition_notes": {
            "cracks": "None.",
            "breakage": "None; aureole prabha flames fully preserved.",
            "surface_damage": "Stable historical ceremonial patina.",
            "discoloration": "Typical cuprite dark olive hue.",
            "missing_parts": "None.",
            "wear": "Softening of finger mudra edges due to centuries of ritual touching.",
            "restoration": "Protected with microcrystalline wax coating by museum conservator."
        },
        "photo_gallery": [
            {"label": "Iconic Front Pose", "url": "/static/assets/images/view_front.jpg", "angle": 0, "type": "PRIMARY"},
            {"label": "Profile Left (Aureole)", "url": "/static/assets/images/view_left.jpg", "angle": 90, "type": "ORTHOGONAL"},
            {"label": "Rear View (Jatamakuta)", "url": "/static/assets/images/view_back.jpg", "angle": 180, "type": "ORTHOGONAL"},
            {"label": "Right View", "url": "/static/assets/images/view_right.jpg", "angle": 270, "type": "ORTHOGONAL"}
        ],
        "oral_knowledge": {
            "audio_url": "/static/assets/audio/dh_ind_0002_oral_lore.wav",
            "duration": "00:52",
            "speaker": "K. Devasenapathy Sthapathi",
            "speaker_role": "23rd Generation Master Sculptor, Swamimalai",
            "language": "Tamil / Classical Sanskrit shlokas",
            "status": "Human reviewed by Tamil University Epigraphy Dept",
            "status_label": "HUMAN REVIEWED",
            "transcript": "இந்த நடராஜர் சிலை எங்கள் சோழ தேசத்து ஸ்தபதிகளின் தலைசிறந்த படைப்பு. இதில் உள்ள ஒவ்வொரு அளவும் அஷ்டதாள கணிதத்தின்படி மெழுகில் வடிக்கப்பட்டு பஞ்சலோகத்தில் வார்க்கப்பட்டது.",
            "translation": "This Nataraja icon is the crowning achievement of Chola master sthapathis. Every divine proportion was first calculated according to Ashtatala canon, carved in pure bee-dammar wax, and cast in solid Panchaloha alloy."
        },
        "map_data": {
            "cultural_origin": {
                "name": "Thanjavur, Tamil Nadu",
                "lat": 10.7870,
                "lng": 79.1378,
                "state": "Tamil Nadu",
                "details": "Chola Royal Capital & Brihadisvara Temple precinct."
            },
            "community_region": {
                "name": "Swamimalai Artisan Quarter",
                "lat": 10.9575,
                "lng": 79.3278,
                "state": "Tamil Nadu",
                "details": "UNESCO-recognized living lineage of bronze metalcasters."
            },
            "documentation_location": {
                "name": "Tamil University Epigraphy Lab, Thanjavur",
                "lat": 10.7423,
                "lng": 79.1124,
                "state": "Tamil Nadu",
                "details": "Field Documentation Station #03."
            },
            "current_display": {
                "name": "Government Museum Bronze Gallery, Egmore, Chennai",
                "lat": 13.0732,
                "lng": 80.2609,
                "state": "Tamil Nadu",
                "details": "Gallery Room 2, Chola Masterpieces Showcase."
            },
            "location_privacy": "PUBLIC"
        },
        "provenance": [
            {
                "step": "ARTIFACT CREATED",
                "date": "c. 1040 CE",
                "actor": "Chola Royal Atelier",
                "action": "Consecrated under Rajendra Chola I.",
                "source": "Epigraphical inscription records",
                "status": "INSTITUTION-VERIFIED"
            },
            {
                "step": "DOCUMENTED",
                "date": "2026-09-08",
                "actor": "State Heritage Mission",
                "action": "Field cataloging and high-resolution scanning.",
                "source": "Record Docket #TN-BR-104",
                "status": "INSTITUTION-VERIFIED"
            },
            {
                "step": "PUBLISHED",
                "date": "2026-09-20",
                "actor": "Digital Heritage Registry",
                "action": "Published to public passport network.",
                "source": "Passport DH-IND-0002",
                "status": "INSTITUTION-VERIFIED"
            }
        ],
        "passport_url": "/passport.html?id=DH-IND-0002"
    },
    "DH-IND-0003": {
        "id": "DH-IND-0003",
        "name": "TERRACOTTA HORSE OF BANKURA",
        "artifact_type": "Votive Folk Earthenware",
        "material": "Local Alluvial River Clay (Fired Terracotta)",
        "craft_technique": "Hollow wheel-thrown components assembled by hand with incised clay applique",
        "region": "West Bengal",
        "community": "Kumbhakar (Potter) Guild of Panchmura",
        "approximate_period": "Mid 20th Century / Traditional Folk Lineage",
        "traditional_use": "Votive offering placed under sacred Banyan groves for Dharmathakur and local protective village deities to invoke blessings and fulfillment of vows.",
        "cultural_significance": "Globally recognized emblem of Indian rural folk aesthetic; characterized by monumental erect ears, extended neck, and symmetrical architectural dignity.",
        "associated_practice": "Gram-devata worship ceremonies and annual Rarh region harvest melas.",
        "documentation_date": "2026-09-18",
        "contributor": "Sudhir Kumbhakar, Panchmura",
        "scan_status": "COMPLETED",
        "3d_status": "COMPLETED",
        "3d_model_url": "/static/assets/models/terracotta_horse.glb",
        "thumbnail_url": "/static/assets/images/view_front.jpg",
        "verification_status": "COMMUNITY-PROVIDED",
        "verification_badge": "COMMUNITY-PROVIDED",
        "verification_level": 2,
        "scale_reference": "DETECTED",
        "scale_marker_id": 42,
        "scale_status": "SCALED",
        "dimensions": {
            "height": 27.0,
            "width": 11.5,
            "depth": 15.2,
            "unit": "cm",
            "scale_mode": "SCALED",
            "bounding_box": {"x": 11.5, "y": 27.0, "z": 15.2},
            "surface_area": "490.8 cm²",
            "volume": "610.0 cm³",
            "scanned_height": 27.0,
            "caliper_height": 26.8,
            "validation_status": "VALIDATED",
            "validation_notes": "Measured from base of hoofs to tip of erect ears."
        },
        "structure_3d": {
            "mesh_status": "POISSON_WATERTIGHT",
            "texture_status": "TERRACOTTA_PBR",
            "polygon_count": 616,
            "vertex_count": 336,
            "point_cloud_status": "21,800 DENSE POINTS RESOLVED",
            "texture_resolution": "2048 x 2048 px",
            "reconstruction_pipeline": "OpenSfM + Poisson Mesh Engine"
        },
        "object_characteristics": {
            "material": {"value": "Burnt River Alluvium Clay", "source": "Human-entered", "verified": "COMMUNITY-PROVIDED"},
            "dominant_colour": {"value": "Terracotta Brick Ochre", "source": "AI-suggested", "verified": "COMMUNITY-PROVIDED"},
            "surface_appearance": {"value": "Matte natural kiln finish, unglazed", "source": "Human-entered", "verified": "COMMUNITY-PROVIDED"},
            "texture": {"value": "Porous earthenware with impressed clay pellet jewelry", "source": "Human-entered", "verified": "COMMUNITY-PROVIDED"},
            "shape": {"value": "Stylized tall quadruped with tubular neck and leaf-shaped ears", "source": "AI-suggested", "verified": "COMMUNITY-PROVIDED"},
            "approximate_period": {"value": "1960s Traditional Continuity", "source": "Human-entered", "verified": "COMMUNITY-PROVIDED"},
            "condition": {"value": "Good; minor clay flake near left ear apex", "source": "Human-entered", "verified": "COMMUNITY-PROVIDED"},
            "craft_technique": {"value": "Four wheel-thrown hollow legs joined to hollow body", "source": "Human-entered", "verified": "COMMUNITY-PROVIDED"}
        },
        "condition_notes": {
            "cracks": "Hairline firing fissure along underside belly, sealed naturally during kiln bake.",
            "breakage": "Tiny 1mm chip on tip of left ear.",
            "surface_damage": "None.",
            "discoloration": "Kiln flash smoking marks on flank.",
            "missing_parts": "None.",
            "wear": "Minimal.",
            "restoration": "None required."
        },
        "photo_gallery": [
            {"label": "Front View", "url": "/static/assets/images/view_front.jpg", "angle": 0, "type": "PRIMARY"},
            {"label": "Side Profile", "url": "/static/assets/images/view_left.jpg", "angle": 90, "type": "ORTHOGONAL"}
        ],
        "oral_knowledge": {
            "audio_url": "/static/assets/audio/dh_ind_0003_oral_lore.wav",
            "duration": "00:40",
            "speaker": "Sudhir Kumbhakar",
            "speaker_role": "Folk Potter Elder, Panchmura",
            "language": "Bengali (Rarh regional idiom)",
            "status": "Community-provided audio / Awaiting Institutional archive review",
            "status_label": "COMMUNITY-PROVIDED",
            "transcript": "আমাদের পাঁচমুড়ায় বংশপরম্পরায় মাটির ঘোড়া গড়া হয়। চাকার ওপর আগে চারটে পা, ঘাড় আর শরীর আলাদা তৈরি করে তারপর হাতে জুড়ে নকশা বসাই। এটি ধর্মঠাকুরের থানে মানতের ঘোড়া।",
            "translation": "In our Panchmura village, terracotta horses have been created across generations. Four legs, the towering neck, and body are thrown separately on the potter's wheel, then joined together and decorated with clay pellets. It is dedicated as a vow at Dharmathakur village shrines."
        },
        "map_data": {
            "cultural_origin": {
                "name": "Panchmura, Bankura District, West Bengal",
                "lat": 22.9667,
                "lng": 87.1667,
                "state": "West Bengal",
                "details": "Folk pottery hamlet of traditional Bankura terracotta artists."
            },
            "community_region": {
                "name": "Bishnupur Terracotta Belt",
                "lat": 23.0678,
                "lng": 87.3167,
                "state": "West Bengal",
                "details": "Famous heritage region known for Malla-era terracotta temples."
            },
            "documentation_location": {
                "name": "Panchmura Craft Documentation Cell",
                "lat": 22.9701,
                "lng": 87.1690,
                "state": "West Bengal",
                "details": "Rural field documentation post."
            },
            "current_display": {
                "name": "Bengal Craft Museum, Salt Lake, Kolkata",
                "lat": 22.5855,
                "lng": 88.4178,
                "state": "West Bengal",
                "details": "Folk Arts Heritage Gallery."
            },
            "location_privacy": "PUBLIC"
        },
        "provenance": [
            {
                "step": "ARTIFACT CREATED",
                "date": "1968",
                "actor": "Panchmura Kumbhakar Artisans",
                "action": "Sculpted and kiln-fired using local pit kiln.",
                "source": "Artisan family ledger",
                "status": "COMMUNITY-PROVIDED"
            },
            {
                "step": "DOCUMENTED",
                "date": "2026-09-17",
                "actor": "Rural Heritage Outreach Team",
                "action": "Field scan and community audio recording.",
                "source": "Docket #WB-BK-003",
                "status": "COMMUNITY-PROVIDED"
            }
        ],
        "passport_url": "/passport.html?id=DH-IND-0003"
    },
    "DH-IND-0004": {
        "id": "DH-IND-0004",
        "name": "KUTCH ROGAN PAINTED TEXTILE",
        "artifact_type": "Heritage Fabric Art",
        "material": "Tussar Silk with Castor Oil & Natural Mineral Pigments",
        "craft_technique": "Freehand trailing of thick castor paste via metal stylus onto folded textile",
        "region": "Gujarat",
        "community": "Khatri Muslim Artisan Guild",
        "approximate_period": "Early 21st Century / 400-Year Guild Tradition",
        "traditional_use": "Bridal ghaghras, ceremonial wall hangings (pari-karan), and auspicious gift drapes for royal and pastoral Maldhari families.",
        "cultural_significance": "One of India's rarest endangered crafts, preserved by a single artisan family in Nirona village using castor oil boiled for 48 hours to create elastic paint.",
        "associated_practice": "Rogan mirror-symmetry folding technique and bridal trousseau preparation.",
        "documentation_date": "2026-09-20",
        "contributor": "Rizwan Khatri, Master Rogan Artist, Nirona",
        "scan_status": "COMPLETED",
        "3d_status": "PROCESSING",
        "3d_model_url": None, # Model currently processing!
        "thumbnail_url": "/static/assets/images/view_front.jpg",
        "verification_status": "SOURCE-VERIFIED",
        "verification_badge": "SOURCE-VERIFIED",
        "verification_level": 3,
        "scale_reference": "DETECTED",
        "scale_marker_id": 42,
        "scale_status": "ESTIMATED",
        "dimensions": {
            "height": 45.0,
            "width": 30.0,
            "depth": 0.4,
            "unit": "cm",
            "scale_mode": "ESTIMATED",
            "bounding_box": {"x": 30.0, "y": 45.0, "z": 0.4},
            "surface_area": "1350.0 cm²",
            "volume": "NOT AVAILABLE",
            "scanned_height": 45.0,
            "caliper_height": 44.8,
            "validation_status": "PENDING",
            "validation_notes": "Textile planar depth below laser scanner tolerance; measured by optical rule."
        },
        "structure_3d": {
            "mesh_status": "PROCESSING (SfM dense cloud generated)",
            "texture_status": "TEXTURE_MAPPING_IN_PROGRESS",
            "polygon_count": "PROCESSING",
            "vertex_count": "PROCESSING",
            "point_cloud_status": "14,200 FEATURES EXTRACTED",
            "texture_resolution": "NOT AVAILABLE",
            "reconstruction_pipeline": "Texture planar SfM reconstruction in queue"
        },
        "object_characteristics": {
            "material": {"value": "Boiled Castor Oil Resin, Mineral Pigments on Handwoven Silk", "source": "Human-entered", "verified": "SOURCE-VERIFIED"},
            "dominant_colour": {"value": "Vermilion, Saffron, Ultramarine on Indigo Base", "source": "AI-suggested", "verified": "SOURCE-VERIFIED"},
            "surface_appearance": {"value": "Raised tactile thread-like paint relief", "source": "Human-entered", "verified": "SOURCE-VERIFIED"},
            "texture": {"value": "Embossed rubbery filigree adhered to fabric weave", "source": "Human-entered", "verified": "SOURCE-VERIFIED"},
            "shape": {"value": "Rectangular wall hanging with central Tree of Life motif", "source": "Human-entered", "verified": "SOURCE-VERIFIED"},
            "approximate_period": {"value": "Contemporary Masterwork (400-Year Heritage)", "source": "Human-entered", "verified": "SOURCE-VERIFIED"},
            "condition": {"value": "Excellent; pigment flexibility fully intact", "source": "Human-entered", "verified": "SOURCE-VERIFIED"},
            "craft_technique": {"value": "Freehand stylus trailing with palm body-heat softening", "source": "Human-entered", "verified": "SOURCE-VERIFIED"}
        },
        "condition_notes": {
            "cracks": "None; castor resin matrix retains pliable elastomeric properties.",
            "breakage": "None.",
            "surface_damage": "None.",
            "discoloration": "None; natural mineral oxides are light-fast.",
            "missing_parts": "None.",
            "wear": "None; kept in archival conservation envelope.",
            "restoration": "None."
        },
        "photo_gallery": [
            {"label": "Full Planar Front", "url": "/static/assets/images/view_front.jpg", "angle": 0, "type": "PRIMARY"},
            {"label": "Stylus Detail Macro", "url": "/static/assets/images/detail_filigree.jpg", "angle": 0, "type": "MACRO"}
        ],
        "oral_knowledge": {
            "audio_url": "/static/assets/audio/dh_ind_0001_oral_lore.wav",
            "duration": "00:45",
            "speaker": "Rizwan Khatri",
            "speaker_role": "State Awardee Rogan Artisan",
            "language": "Gujarati / Kutchi",
            "status": "Source-verified by Gujarat Handicrafts Council",
            "status_label": "SOURCE-VERIFIED",
            "transcript": "રોગન કળામાં એરંડીના તેલને બે દિવસ ઉકાળીને જે લુગદી બને છે, તેને હથેળીમાં ગરમ કરીને સળી વડે કાપડ પર દોરો ખેંચવામાં આવે છે. આખી દુનિયામાં માત્ર અમારા નિરોણા ગામમાં આ કળા જીવંત છે.",
            "translation": "In Rogan art, castor oil is boiled for two days into a dense paste. Master artisans warm it on the palm and draw fine thread-like paint filaments using a metal stylus without touching the fabric. This rare heritage survives exclusively in our Nirona village."
        },
        "map_data": {
            "cultural_origin": {
                "name": "Nirona Village, Kutch, Gujarat",
                "lat": 23.3855,
                "lng": 69.5891,
                "state": "Gujarat",
                "details": "The sole surviving global center of freehand Rogan textile art."
            },
            "community_region": {
                "name": "Banni & Pachham Pastoral Plains",
                "lat": 23.6500,
                "lng": 69.4500,
                "state": "Gujarat",
                "details": "Maldhari pastoralist cultural exchange network."
            },
            "documentation_location": {
                "name": "Nirona Artisan Field Studio",
                "lat": 23.3860,
                "lng": 69.5902,
                "state": "Gujarat",
                "details": "Station 04 Mobile Scanning Unit."
            },
            "current_display": {
                "name": "Calico Museum of Textiles, Ahmedabad",
                "lat": 23.0560,
                "lng": 72.5934,
                "state": "Gujarat",
                "details": "Special Indian Folk Textile Exhibition."
            },
            "location_privacy": "RESTRICTED" # Notice: RESTRICTED privacy!
        },
        "provenance": [
            {
                "step": "ARTIFACT CREATED",
                "date": "2024",
                "actor": "Rizwan Khatri Family Atelier",
                "action": "Completed 120-hour freehand Tree of Life composition.",
                "source": "Atelier Registration Book #RK-2024",
                "status": "SOURCE-VERIFIED"
            },
            {
                "step": "DOCUMENTED",
                "date": "2026-09-20",
                "actor": "Gujarat Cultural Survey",
                "action": "Multispectral scanning and artisan interview.",
                "source": "Record #GJ-KUTCH-08",
                "status": "SOURCE-VERIFIED"
            }
        ],
        "passport_url": "/passport.html?id=DH-IND-0004"
    },
    "DH-IND-0005": {
        "id": "DH-IND-0005",
        "name": "BIDRIWARE SILVER INLAY HUQQA BASE",
        "artifact_type": "Decorative Metalware",
        "material": "Zinc alloy (96% zinc, 4% copper) with pure silver wire inlay (Tarkashi & Taihnishan)",
        "craft_technique": "Casting, chiseling, pure silver wire inlay, and darkening with salt-rich soil from Bidar Fort",
        "region": "Karnataka",
        "community": "Bidri Craft Artisan Guild of Bidar",
        "approximate_period": "18th Century CE (Bahmani / Barid Shahi Tradition)",
        "traditional_use": "Opulent water-pipe huqqa container crafted for Deccan Sultanate nobility and diplomatic gifts.",
        "cultural_significance": "Renowned for its striking velvety black matte surface contrasted against brilliant pure silver geometric and floral arabesque inlays.",
        "associated_practice": "Courtly etiquette and royal gift exchanges across the Deccan Sultanates.",
        "documentation_date": "2026-09-12",
        "contributor": "Shah Rasheed Ahmed Quadri, Padma Shri Awardee, Bidar",
        "scan_status": "COMPLETED",
        "3d_status": "COMPLETED",
        "3d_model_url": "/static/assets/models/huqqa_base.glb",
        "thumbnail_url": "/static/assets/images/view_front.jpg",
        "verification_status": "INSTITUTION-VERIFIED",
        "verification_badge": "INSTITUTION-VERIFIED",
        "verification_level": 4,
        "scale_reference": "DETECTED",
        "scale_marker_id": 42,
        "scale_status": "SCALED",
        "dimensions": {
            "height": 17.2,
            "width": 10.4,
            "depth": 10.4,
            "unit": "cm",
            "scale_mode": "SCALED",
            "bounding_box": {"x": 10.4, "y": 17.2, "z": 10.4},
            "surface_area": "430.5 cm²",
            "volume": "485.0 cm³",
            "scanned_height": 17.2,
            "caliper_height": 17.1,
            "validation_status": "VALIDATED",
            "validation_notes": "Cross-calibrated with physical precision caliper."
        },
        "structure_3d": {
            "mesh_status": "POISSON_WATERTIGHT",
            "texture_status": "BAKED_PBR_2K",
            "polygon_count": 640,
            "vertex_count": 352,
            "point_cloud_status": "29,400 DENSE POINTS RESOLVED",
            "texture_resolution": "2048 x 2048 px",
            "reconstruction_pipeline": "OpenSfM Structure-from-Motion Engine"
        },
        "object_characteristics": {
            "material": {"value": "Zinc-Copper Alloy with 99.9% Pure Silver Sheet/Wire Inlay", "source": "Human-entered", "verified": "INSTITUTION-VERIFIED"},
            "dominant_colour": {"value": "Velvet Carbon Black with Radiant Silver Inlay", "source": "AI-suggested", "verified": "INSTITUTION-VERIFIED"},
            "surface_appearance": {"value": "Chemically oxidised deep black using Bidar Fort soil", "source": "Human-entered", "verified": "INSTITUTION-VERIFIED"},
            "texture": {"value": "Flush smooth inlay polished with groundnut oil", "source": "Human-entered", "verified": "SOURCE-VERIFIED"},
            "shape": {"value": "Bell-shaped globular urn with flaring pedestal foot", "source": "AI-suggested", "verified": "SOURCE-VERIFIED"},
            "approximate_period": {"value": "Late 18th Century CE", "source": "Human-entered", "verified": "INSTITUTION-VERIFIED"},
            "condition": {"value": "Pristine, no silver detachment", "source": "Human-entered", "verified": "INSTITUTION-VERIFIED"},
            "craft_technique": {"value": "Taihnishan (sheet inlay) and Tarkashi (wire inlay)", "source": "Human-entered", "verified": "INSTITUTION-VERIFIED"}
        },
        "condition_notes": {
            "cracks": "None.",
            "breakage": "None.",
            "surface_damage": "Microscopic handling abrasions on base underside.",
            "discoloration": "None; characteristic Bidar fort mud patina remains jet black.",
            "missing_parts": "None; silver filigree intact throughout all quadrants.",
            "wear": "Very mild around flaring rim collar.",
            "restoration": "Treated with mineral oil stabilization in 2022."
        },
        "photo_gallery": [
            {"label": "Front View", "url": "/static/assets/images/view_front.jpg", "angle": 0, "type": "PRIMARY"},
            {"label": "Inlay Macro Detail", "url": "/static/assets/images/detail_filigree.jpg", "angle": 0, "type": "MACRO"}
        ],
        "oral_knowledge": {
            "audio_url": "/static/assets/audio/dh_ind_0005_oral_lore.wav",
            "duration": "00:46",
            "speaker": "Shah Rasheed Ahmed Quadri",
            "speaker_role": "Padma Shri Awardee & Master Bidri Artist",
            "language": "Urdu / Dakhni",
            "status": "Verified by National Museum Conservation Laboratory",
            "status_label": "INSTITUTION-VERIFIED",
            "transcript": "बिदरी का यह काला रंग दुनिया में और कहीं नहीं बन सकता। यह बीदर के पुराने किले की सदियों पुरानी मिट्टी से आता है, जिसमें खास तरह का शोरा और नमक होता है। जब इस पर चांदी जड़ी जाती है, तो यह सदियों तक नहीं मिटती।",
            "translation": "This deep velvety black luster of Bidriware cannot be replicated anywhere in the world. It comes specifically from centuries-old soil gathered from unexposed ruins of Bidar Fort, containing unique natural nitrates. When pure silver is inlaid into it, the contrast endures for centuries without tarnishing."
        },
        "map_data": {
            "cultural_origin": {
                "name": "Bidar Fort Historic Precinct, Karnataka",
                "lat": 17.9150,
                "lng": 77.5186,
                "state": "Karnataka",
                "details": "Bahmani capital where Persian master metalcrafters established the craft."
            },
            "community_region": {
                "name": "Bidri Craft Artisan Colony, Old City",
                "lat": 17.9125,
                "lng": 77.5210,
                "state": "Karnataka",
                "details": "Living workshop cluster practicing Tarkashi inlay."
            },
            "documentation_location": {
                "name": "Karnataka Archaeology Field Unit, Bidar",
                "lat": 17.9140,
                "lng": 77.5200,
                "state": "Karnataka",
                "details": "Field Documentation Post #07."
            },
            "current_display": {
                "name": "Salar Jung Museum, Hyderabad",
                "lat": 17.3713,
                "lng": 78.4803,
                "state": "Telangana",
                "details": "Bidriware Royal Collection, Western Block."
            },
            "location_privacy": "PUBLIC"
        },
        "provenance": [
            {
                "step": "ARTIFACT CREATED",
                "date": "c. 1780",
                "actor": "Royal Bidri Guild Atelier",
                "action": "Hand-chiseled with floral poppy motif for Deccan court.",
                "source": "Royal court accession seal",
                "status": "INSTITUTION-VERIFIED"
            },
            {
                "step": "DOCUMENTED",
                "date": "2026-09-11",
                "actor": "National Heritage Mission",
                "action": "High-fidelity digital preservation scan.",
                "source": "Record #KA-BID-05",
                "status": "INSTITUTION-VERIFIED"
            },
            {
                "step": "PUBLISHED",
                "date": "2026-09-22",
                "actor": "Digital Heritage Registry",
                "action": "Live in public museum digital passport network.",
                "source": "Passport DH-IND-0005",
                "status": "INSTITUTION-VERIFIED"
            }
        ],
        "passport_url": "/passport.html?id=DH-IND-0005"
    }
}
