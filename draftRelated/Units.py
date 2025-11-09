
class Unit(object):
    '''Defines all stats, talents and powers of units'''
    def __init__(self,
                 name,
                 type,
                 cost=None,
                 act_cards=None,
                 strat_val=None,
                 stats=None,
                 talents=None):
        self.name = name
        self.type = type
        if self.type=="troop":
            self.cost = 1
            self.strat_val = 0
        else:
            self.cost = cost
            self.strat_val = strat_val
        self.act_cards = act_cards
        self.stats = dict()
        self.talents = list()

def units_init(exp_list=None):
    '''Returns the list of units in the game'''
    units_list = []
    if "Eternal Cycle" in exp_list:
        ETERNAL_CYCLE_UNITS = [
        #Eternal Cycle TITANS
        Unit(name="Apophis",
             type="titan",
             cost=8),
        Unit(name="Geb",
             type="titan",
             cost=8),
        Unit(name="Khepri",
             type="titan",
             cost=8),
        Unit(name="Ra",
             type="titan",
             cost=8),
        ]
        units_list.extend(ETERNAL_CYCLE_UNITS)
    if "Duat" in exp_list:
        DUAT_UNITS = [
        #DUAT GODS
        Unit(name="Anubis",
             type="god",
             cost=6),
        Unit(name="Osiris",
             type="god",
             cost=6),
        #DUAT MONSTERS
        Unit(name="Am-heh",
             type="monster",
             cost=4),
        Unit(name="Kherty",
             type="monster",
             cost=4),
        Unit(name="Medjed",
             type="monster",
             cost=3),
        #DUAT HEROES
        Unit(name="Narmed",
             type="hero",
             cost=5),
        Unit(name="Serket",
             type="hero",
             cost=4),
        Unit(name="Tutankhamun",
             type="hero",
             cost=2),
        #DUAT TROOPS
        Unit(name="Sons of Anubis",
             type="troop"),
        Unit(name="Ka Priestesses",
             type="troop"),
        ]
        units_list.extend(DUAT_UNITS)
    if "MBI Core" in exp_list:
        MBI_CORE_UNITS = [
        #MBI Core TITANS
        Unit(name="Ammit",
             type="titan",
             cost=8),
        #MBI Core GODS
        Unit(name="Amun",
             type="god",
             cost=6),
        Unit(name="Bastet",
             type="god",
             cost=6),
        Unit(name="Hathor",
             type="god",
             cost=6),
        Unit(name="Horus",
             type="god",
             cost=6),
        Unit(name="Isis",
             type="god",
             cost=6),
        Unit(name="Maat",
             type="god",
             cost=6),
        Unit(name="Ptah",
             type="god",
             cost=6),
        Unit(name="Sekhmet",
             type="god",
             cost=6),
        Unit(name="Set",
             type="god",
             cost=6),
        Unit(name="Sobek",
             type="god",
             cost=6),
        Unit(name="Thoth",
             type="god",
             cost=6),
        #MBI Core MONSTERS
        Unit(name="Ammit",
             type="monster",
             cost=5),
        Unit(name="Apis",
             type="monster",
             cost=3),
        Unit(name="Bennu",
             type="monster",
             cost=3),
        Unit(name="Bes",
             type="monster",
             cost=3),
        Unit(name="Colossus",
             type="monster",
             cost=2),
        Unit(name="Isfetis",
             type="monster",
             cost=4),
        Unit(name="Mnevis",
             type="monster",
             cost=3),
        Unit(name="Nekhbet",
             type="monster",
             cost=4),
        Unit(name="Petsuchos",
             type="monster",
             cost=3),
        Unit(name="Shezmu",
             type="monster",
             cost=5),
        Unit(name="Sphinx Egypt",
             type="monster",
             cost=5),
        Unit(name="Taweret",
             type="monster",
             cost=4),
        Unit(name="Uraeus",
             type="monster",
             cost=4),
        Unit(name="Wadjet",
             type="monster",
             cost=2),
        #MBI Core HEROES
        Unit(name="Akhenaten",
             type="hero",
             cost=4),
        Unit(name="Amanirenas",
             type="hero",
             cost=4),
        Unit(name="Amenhotep III",
             type="hero",
             cost=3),
        Unit(name="Cleopatra",
             type="hero",
             cost=3),
        Unit(name="Hatshepsut",
             type="hero",
             cost=4),
        Unit(name="Imhotep",
             type="hero",
             cost=2),
        Unit(name="Khensha",
             type="hero",
             cost=2),
        Unit(name="Nefertiti",
             type="hero",
             cost=3),
        Unit(name="Ptahhotep",
             type="hero",
             cost=4),
        Unit(name="Ramses II",
             type="hero",
             cost=4),
        Unit(name="Satis",
             type="hero",
             cost=5),
        Unit(name="Taharqua",
             type="hero",
             cost=3),
        Unit(name="Thutmose III",
             type="hero",
             cost=5),
        #MBI Core TROOPS
        Unit(name="Hyksos Warriors",
             type="troop"),
        Unit(name="Judges of Soul",
             type="troop"),
        Unit(name="Medjay Guards",
             type="troop"),
        Unit(name="Mummies",
             type="troop"),
        Unit(name="Serpopard",
             type="troop"),
        Unit(name="Ta-Seti Huntresses",
             type="troop"),
        ]
        units_list.extend(MBI_CORE_UNITS)
    if "Keepers of the Soul" in exp_list:
        KEEPERS_OF_THE_SOUL_UNITS = [
        #Keepers of the Soul GODS
        Unit(name="Hypnos",
             type="god",
             cost=6),
        Unit(name="Thanatos",
             type="god",
             cost=6),
        #Keepers of the Soul MONSTERS
        Unit(name="Charon",
             type="monster",
             cost=5),
        ]
        units_list.extend(KEEPERS_OF_THE_SOUL_UNITS)
    if "Chtonian Wrath" in exp_list:
        CHTONIAN_WRATH_UNITS = [
        #Chtonian Wrath GODS
        Unit(name="Demeter",
             type="god",
             cost=6),
        #Chtonian Wrath MONSTERS
        Unit(name="Erinye",
             type="monster",
             cost=3),
        ]
        units_list.extend(CHTONIAN_WRATH_UNITS)
    if "Kraken" in exp_list:
        KRAKEN_UNITS = [
        #KRAKEN TITANS
        Unit(name="Kraken",
             type="titan",
             cost=8),
        #KRAKEN GODS
        Unit(name="Aegir",
             type="god",
             cost=6),
        #KRAKEN MONSTERS
        Unit(name="Kraken",
             type="monster",
             cost=5),
        Unit(name="Ran",
             type="monster",
             cost=5),
        Unit(name="Daughters of Aegir",
             type="monster",
             cost=3),
        #KRAKEN HEROES
        Unit(name="Erik the Red",
             type="hero",
             cost=4),
        Unit(name="Freydis",
             type="hero",
             cost=3),
        Unit(name="Floki",
             type="hero",
             cost=3),
        Unit(name="Leif Erikson",
             type="hero",
             cost=2),
        #KRAKEN TROOPS
        Unit(name="Disciples of Skadi",
             type="troop"),
        Unit(name="Drowned",
             type="troop"),
        ]
        units_list.extend(KRAKEN_UNITS)
    if "Poseidon" in exp_list:
        POSEIDON_UNITS = [
        #POSEIDON GODS
        Unit(name="Poseidon",
             type="god",
             cost=6),
        #POSEIDON HEROES
        Unit(name="Andromeda",
             type="hero",
             cost=1),
        Unit(name="Antaeus",
             type="hero",
             cost=3),
        Unit(name="Periphetes",
             type="hero",
             cost=2),
        Unit(name="Theseus",
             type="hero",
             cost=4),
        #POSEIDON MONSTERS
        Unit(name="Charybdis",
             type="monster",
             cost=5),
        Unit(name="Polyphemus",
             type="monster",
             cost=5),
        Unit(name="Scylla",
             type="monster",
             cost=5),
        #POSEIDON TROOPS
        Unit(name="Harpies",
             type="troop"),
        Unit(name="Sirens",
             type="troop"),
        ]
        units_list.extend(POSEIDON_UNITS)
    if "Hera" in exp_list:
        HERA_UNITS = [
        #HERA GODS
        Unit(name="Hera",
             type="god",
             cost=4),
        #HERA HEROES
        Unit(name="Autolycus",
             type="hero",
             cost=2),
        Unit(name="Chiron",
             type="hero",
             cost=4),
        Unit(name="Eurystheus",
             type="hero",
             cost=1),
        Unit(name="Perseus",
             type="hero",
             cost=4),
        Unit(name="Veteran Achilles",
             type="hero",
             cost=5),
        Unit(name="Veteran Heracles",
             type="hero",
             cost=5),
        #HERA MONSTERS
        Unit(name="Calydonian Boar",
             type="monster",
             cost=3),
        Unit(name="Geryon",
             type="monster",
             cost=5),
        Unit(name="Ladon",
             type="monster",
             cost=5),
        #HERA TROOPS
        Unit(name="Stymphalian Birds",
             type="troop"),
        ]
        units_list.extend(HERA_UNITS)
    if "Rise of Titans" in exp_list:
        RoT_UNITS = [
        Unit(name="Enceladus",
             type="titan",
             cost=8),
        Unit(name="Gaia",
             type="titan",
             cost=8),
        Unit(name="Kronos",
             type="titan",
             cost=8),
        Unit(name="Typhon",
             type="titan",
             cost=10),
        ]
        units_list.extend(RoT_UNITS)
    if "Hephaistos" in exp_list:
        HEPHAISTOS_UNITS = [
        #HEPHAISTOS GODS
        Unit(name="Hephaistos",
             type="god",
             cost=6),
        #HEPHAISTOS MONSTERS
        Unit(name="Acamas",
             type="monster",
             cost=4),
        Unit(name="Caucasian Eagle",
             type="monster",
             cost=2),
        Unit(name="Colchidian Bull",
             type="monster",
             cost=3),
        Unit(name="Prometheus",
             type="monster",
             cost=5),
        Unit(name="Talos",
             type="monster",
             cost=5),
        #HEPHAISTOS HEROES
        Unit(name="Pandora",
             type="hero",
             cost=1),
        #HEPHAISTOS TROOPS
        Unit(name="Mechanical Warriors",
             type="troop"),
        ]
        units_list.extend(HEPHAISTOS_UNITS)
    if "Echidna's Children" in exp_list:
        ECHIDNAS_UNITS = [
        Unit(name="Basilisk",
             type="monster",
             cost=3),
        Unit(name="Chimera",
             type="monster",
             cost=4),
        Unit(name="Teumessian Fox",
             type="monster",
             cost=3),
        ]
        units_list.extend(ECHIDNAS_UNITS)
    if "Heroes of the Trojan War" in exp_list:
        HotTW_UNITS = [
        Unit(name="Agamemnon",
             type="hero",
             cost=3),
        Unit(name="Ajax",
             type="hero",
             cost=4),
        Unit(name="Diomedes",
             type="hero",
             cost=3),
        Unit(name="Penthesilea",
             type="hero",
             cost=3),
        Unit(name="Paris",
             type="hero",
             cost=2),
        ]
        units_list.extend(HotTW_UNITS)
    if "Ketos" in exp_list:
        KETOS_UNITS = [
        Unit(name="Ketos",
             type="monster",
             cost=4),
        ]
        units_list.extend(KETOS_UNITS)
    if "Judges of the Underworld" in exp_list:
        JotU_UNITS = [
        Unit(name="Aeacus",
             type="hero",
             cost=3),
        Unit(name="Minos",
             type="hero",
             cost=3),
        Unit(name="Rhadamanthus ",
             type="hero",
             cost=3),
        ]
        units_list.extend(JotU_UNITS)
    if "Corinthia" in exp_list:
        CORINTHIA_UNITS = [
        Unit(name="Typhons Herald",
             type="monster",
             cost=3),
        ]
        units_list.extend(CORINTHIA_UNITS)
    if "MBR Core" in exp_list:
        MBR_CORE_UNITS = [
        #MBR CORE TITANS
        Unit(name="Fenrir",
             type="titan",
             cost=8),
        #MBR CORE GODS
        Unit(name="Baldr",
             type="god",
             cost=6),
        Unit(name="Freyja",
             type="god",
             cost=6),
        Unit(name="Freyr",
             type="god",
             cost=6),
        Unit(name="Frigg",
             type="god",
             cost=6),
        Unit(name="Hel",
             type="god",
             cost=6),
        Unit(name="Idunn",
             type="god",
             cost=5),
        Unit(name="Loki",
             type="god",
             cost=6),
        Unit(name="Njord",
             type="god",
             cost=6),
        Unit(name="Sif",
             type="god",
             cost=6),
        Unit(name="Skadi",
             type="god",
             cost=6),
        Unit(name="Thor",
             type="god",
             cost=6),
        Unit(name="Tyr",
             type="god",
             cost=6),
        Unit(name="Vidar",
             type="god",
             cost=6),
        #MBR CORE MONSTERS
        Unit(name="Angrboda",
             type="monster",
             cost=5),
        Unit(name="Draugr",
             type="monster",
             cost=3),
        Unit(name="Fafnir",
             type="monster",
             cost=5),
        Unit(name="Fenrir",
             type="monster",
             cost=5),
        Unit(name="Frost Jotunn",
             type="monster",
             cost=2),
        Unit(name="Garm",
             type="monster",
             cost=3),
        Unit(name="Grendel",
             type="monster",
             cost=4),
        Unit(name="Grendel's Mother",
             type="monster",
             cost=3),
        Unit(name="Hraeslveg",
             type="monster",
             cost=3),
        Unit(name="Hrym",
             type="monster",
             cost=4),
        Unit(name="Hyrrokin",
             type="monster",
             cost=4),
        Unit(name="Mimir",
             type="monster",
             cost=2),
        Unit(name="Ratatosk",
             type="monster",
             cost=2),
        Unit(name="Troll",
             type="monster",
             cost=4),
        Unit(name="Utgarda-Loki",
             type="monster",
             cost=4),
        #MBR CORE HEROES
        Unit(name="Beowulf",
             type="hero",
             cost=4),
        Unit(name="Bodvar Bjarki",
             type="hero",
             cost=4),
        Unit(name="Brunhild",
             type="hero",
             cost=4),
        Unit(name="Egill",
             type="hero",
             cost=3),
        Unit(name="Gullveig",
             type="hero",
             cost=5),
        Unit(name="Harald Hardrada",
             type="hero",
             cost=3),
        Unit(name="Hrolf Kraki",
             type="hero",
             cost=4),
        Unit(name="Lagertha Veteran",
             type="hero",
             cost=4),
        Unit(name="Lagertha",
             type="hero",
             cost=3),
        Unit(name="Norns",
             type="hero",
             cost=4),
        Unit(name="Sigmund",
             type="hero",
             cost=2),
        Unit(name="Sigurd",
             type="hero",
             cost=3),
        Unit(name="Skuld",
             type="hero",
             cost=3),
        #MBR CORE TROOPS
        Unit(name="Berserkers",
             type="troop"),
        Unit(name="Dwarves",
             type="troop"),
        Unit(name="Huscarls",
             type="troop"),
        Unit(name="Jofurr",
             type="troop"),
        Unit(name="Jomsvikings",
             type="troop"),
        Unit(name="Light Elves",
             type="troop"),
        Unit(name="Oathbreakers",
             type="troop"),
        Unit(name="Seers",
             type="troop"),
        Unit(name="Shield-Maidens",
             type="troop"),
        Unit(name="Ulfhednar",
             type="troop"),
        Unit(name="Varangian Guards",
             type="troop"),
        ]
        units_list.extend(MBR_CORE_UNITS)
    if "Asgard" in exp_list:
        ASGARD_UNITS = [
        #ASGARD GODS
        Unit(name="Heimdall",
             type="god",
             cost=6),
        Unit(name="Odin",
             type="god",
             cost=8),
        #ASGARD MONSTERS
        Unit(name="Eikthyrnir",
             type="monster",
             cost=3),
        Unit(name="Son of Muspell",
             type="monster",
             cost=3),
        #ASGARD HEROES
        Unit(name="Sigi",
             type="hero",
             cost=2),
        Unit(name="Thrud",
             type="hero",
             cost=5),
        Unit(name="Valkyrie",
             type="hero",
             cost=3),
        #ASGARD TROOPS
        Unit(name="Einherjar",
             type="troop"),
        ]
        units_list.extend(ASGARD_UNITS)
    if "Ragnar Saga" in exp_list:
        RAGNAR_UNITS = [
        Unit(name="Aslaug",
             type="hero",
             cost=2),
        Unit(name="Bjorn",
             type="hero",
             cost=4),
        Unit(name="Eysteinn",
             type="hero",
             cost=3),
        Unit(name="Ivar",
             type="hero",
             cost=5),
        Unit(name="Ragnar",
             type="hero",
             cost=4),
        ]
        units_list.extend(RAGNAR_UNITS)
    if "Surt" in exp_list:
        SURT_UNITS = [
        Unit(name="Surt",
             type="titan",
             cost=8),
        ]
        units_list.extend(SURT_UNITS)
    if "Yimir" in exp_list:
        YIMIR_UNITS = [
        Unit(name="Yimir",
             type="titan",
             cost=8),
        ]
        units_list.extend(YIMIR_UNITS)
    if "Nidhogg" in exp_list:
        NIDHOGG_UNITS = [
        Unit(name="Nidhogg",
             type="monster",
             cost=5),
        ]
        units_list.extend(NIDHOGG_UNITS)
    if "Jormungand" in exp_list:
        JORMUNGAND_UNITS = [
        Unit(name="Jormungand",
             type="titan",
             cost=10),
        ]
        units_list.extend(JORMUNGAND_UNITS)

    if "Manticore" in exp_list:
        MANTICORE_UNITS = [
        Unit(name="Manticore",
             type="monster",
             cost=5),
        ]
        units_list.extend(MANTICORE_UNITS)
        
    if "Dionysus" in exp_list:
        DIONYSUS_UNITS = [
        Unit(name="Dionysus",
             type="god",
             cost=6),
        ]
        units_list.extend(DIONYSUS_UNITS)
        
    if "Oedypos and Sphinx" in exp_list:
        OAS_UNITS = [
        Unit(name="Sphinx",
             type="monster",
             cost=3),
        Unit(name="Oedipus",
             type="hero",
             cost=2),
        ]
        units_list.extend(OAS_UNITS)
        
    if "Pandora's Box" in exp_list:
        PANDORAS_UNITS = [
        #PANDORAS BOX TITANS
        Unit(name="Atlas",
                    type="titan",
                    cost=8
                    ),
        #PANDORAS BOX GODS
        Unit(name="Aphrodite",
                    type="god",
                    cost=6
                    ),
        Unit(name="Apollo",
                    type="god",
                    cost=6
                    ),
        Unit(name="Artemis",
                    type="god",
                    cost=6
                    ),
        Unit(name="Hecate",
                    type="god",
                    cost=6
                    ),
        Unit(name="Helios",
                    type="god",
                    cost=6
                    ),
        Unit(name="Hermes",
                    type="god",
                    cost=6
                    ),
        Unit(name="Pan",
                    type="god",
                    cost=6
                    ),
        Unit(name="Persephone",
                    type="god",
                    cost=6
                    ),
        #PANDORAS BOX HEROES
        Unit(name="Aegisthus",
                        type="hero",
                        cost=2),
        Unit(name="Bellerophon",
                        type="hero",
                        cost=5),
        Unit(name="Cecrops",
                        type="hero",
                        cost=3),
        Unit(name="Circe",
                        type="hero",
                        cost=2),
        Unit(name="Echo",
                        type="hero",
                        cost=1),
        Unit(name="Eurytion",
                        type="hero",
                        cost=3),
        Unit(name="Eurytos",
                        type="hero",
                        cost=3),
        Unit(name="Hector",
                        type="hero",
                        cost=3),
        Unit(name="Hippolyta",
                        type="hero",
                        cost=2),
        Unit(name="Icarus",
                        type="hero",
                        cost=1),
        Unit(name="Jason",
                        type="hero",
                        cost=3),
        Unit(name="Marsyas",
                        type="hero",
                        cost=1),
        Unit(name="Medea",
                        type="hero",
                        cost=2),
        Unit(name="Orpheus",
                        type="hero",
                        cost=2),
        Unit(name="Sisyphus",
                        type="hero",
                        cost=1),   
        #PANDORAS BOX MONSTERS
        Unit(name="Arachne",
                        type="monster",
                        cost=3),
        Unit(name="Campe",
                        type="monster",
                        cost=3),
        Unit(name="Colchidian Dragon",
                        type="monster",
                        cost=4),
        Unit(name="Dragon of Thebes",
                        type="monster",
                        cost=4),
        Unit(name="Echidna",
                        type="monster",
                        cost=5),
        Unit(name="Graeae",
                        type="monster",
                        cost=1),
        Unit(name="Griffon",
                        type="monster",
                        cost=4),
        Unit(name="Lycaon",
                        type="monster",
                        cost=2),
        Unit(name="Nemean Lion",
                        type="monster",
                        cost=4),
        Unit(name="Orion",
                        type="monster",
                        cost=4),
        Unit(name="Phoenix",
                        type="monster",
                        cost=3),
        Unit(name="Python",
                        type="monster",
                        cost=3),
        Unit(name="Stheno the Gorgon",
                        type="monster",
                        cost=3),
        Unit(name="Tityos",
                        type="monster",
                        cost=4),
        #PANDORAS BOX TROOPS
        Unit(name="Argonauts",
                        type="troop"),
        Unit(name="Infernal Artillerymen",
                        type="troop"),
        Unit(name="Myrmidons",
                        type="troop"),
        Unit(name="Toxotai",
                        type="troop"),
        ]
        units_list.extend(PANDORAS_UNITS)

    if "MBP Core" in exp_list:
        CORE_UNITS = [
        #MBP CORE GODS
        Unit(name="Zeus",
                    type="god",
                    cost=6
                    ),
        Unit(name="Hades",
                    type="god",
                    cost=6
                    ),
        Unit(name="Ares",
                    type="god",
                    cost=6
                    ),
        Unit(name="Athena",
                    type="god",
                    cost=6
                    ),
        #MBP CORE HEROES
        Unit(name="Achilles",
                        type="hero",
                        cost=4),
        Unit(name="Heracles",
                        type="hero",
                        cost=4),
        Unit(name="Odysseus",
                        type="hero",
                        cost=3),
        Unit(name="Leonidas",
                        type="hero",
                        cost=3),
        Unit(name="Atalanta",
                        type="hero",
                        cost=2),
        #MBP CORE MONSTERS
        Unit(name="Hydra",
                        type="monster",
                        cost=4),
        Unit(name="Cerberus",
                        type="monster",
                        cost=4),
        Unit(name="Minotaur",
                        type="monster",
                        cost=3),
        Unit(name="Medusa",
                        type="monster",
                        cost=3),
        #MBP CORE TROOPS
        Unit(name="Amazons",
                        type="troop"),
        Unit(name="Hoplites",
                        type="troop"),
        Unit(name="Spartans",
                        type="troop"),
        Unit(name="Centaurs",
                        type="troop"),
        Unit(name="Infernal Hounds",
                        type="troop"),
        Unit(name="Infernal Warriors",
                        type="troop"),
        ]
        units_list.extend(CORE_UNITS)
    return units_list


    





















































