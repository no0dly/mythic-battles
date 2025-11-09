import random
from Units import units_init, Unit
from prettytable import PrettyTable
def create_draft_pool(units_list, 
                      draft_size=40,
                      num_gods=4,
                      num_titans=0):
    titan_list = []
    gods_list = []
    monster_list = []
    heroes_list = []
    troops_list = []
    for unit in units_list:
        if unit.type=="god":
            gods_list.append(unit)
        elif unit.type=="monster":
            monster_list.append(unit)
        elif unit.type=="hero":
            heroes_list.append(unit)
        elif unit.type=="troop":
            troops_list.append(unit)
        elif unit.type=="titan":
            titan_list.append(unit)
    selected_units = []
    #TITAN SELECTION
    for i in range(num_titans):
        titan = random.choice(titan_list)
        selected_units.append(titan)
        titan_list.remove(titan)
        #Special cases handling
        if "Fenrir" in titan.name:
            for monster in monster_list:
                if "Fenrir" in monster.name:
                    monster_list.remove(monster)
                    break
        elif "Ammit" in titan.name:
            for monster in monster_list:
                if "Ammit" in monster.name:
                    monster_list.remove(monster)
                    break
        elif "Kraken" in titan.name:
            for monster in monster_list:
                if "Kraken" in monster.name:
                    monster_list.remove(monster)
                    break
                    
    #GODS SELECTION
    for i in range(num_gods):
        god = random.choice(gods_list)
        selected_units.append(god)
        gods_list.remove(god)
    cur_size=0
    while cur_size != draft_size:

        #Monster selection
        try:
            monster = random.choice(monster_list)        
            if monster.cost+cur_size<= draft_size:
                selected_units.append(monster)
                cur_size+=monster.cost
            monster_list.remove(monster)
        except IndexError:
            pass #No monsters left for the cost
        
        #Heroes selection
        try:
            hero = random.choice(heroes_list)
            if hero.cost+cur_size<= draft_size:
                selected_units.append(hero)
                cur_size+=hero.cost
            heroes_list.remove(hero)
            #Special cases handling
            if "Achilles" in hero.name:
                for hero in heroes_list:
                    if "Achilles" in hero.name:
                        heroes_list.remove(hero)
                        break
            elif "Heracles" in hero.name:
                for hero in heroes_list:
                    if "Heracles" in hero.name:
                        heroes_list.remove(hero)
                        break
            elif "Lagertha" in hero.name:
                for hero in heroes_list:
                    if "Lagertha" in hero.name:
                        heroes_list.remove(hero)
                        break

        except IndexError:
            pass #No heroes left for the cost
        
        #Troops selection
        try:
            troop = random.choice(troops_list)
            if troop.cost+cur_size<= draft_size:
                selected_units.append(troop)
                cur_size+=troop.cost
            troops_list.remove(troop)
        except IndexError:
            raise ValueError("not enough units for the draft size")
        
                
    return selected_units
    
#MAIN    
if __name__ == "__main__":
    my_expansions = ["MBP Core", 
                     "Pandora's Box", 
                     "Manticore", 
                     "Oedypos and Sphinx",
                     "Dionysus",
                     "Poseidon",
                     "Hera",
                     "Rise of Titans",
                     "Hephaistos",
                     "Echidna's Children",
                     "Heroes of the Trojan War",
                     "Ketos",
                     "Judges of the Underworld",
                     "Corinthia", 
                     "Keepers of the Soul",
                     "Chtonian Wrath",

                     "MBR Core",
                     "Asgard",
                     "Ragnar Saga",
                     "Surt",
                     "Yimir",
                     "Nidhogg",
                     "Jormungand",
                     "Kraken",
                     
                     "MBI Core",
                     "Duat",
                     "Eternal Cycle",
                     
                     ]
    units_list = units_init(my_expansions)
    titans = []
    gods = []
    monsters = []
    heroes = []
    troops = []

    #Split units by type for table
    for unit in create_draft_pool(units_list, num_gods=4, num_titans=2):
        if unit.type=="god":
            gods.append(unit)
        elif unit.type=="titan":
            titans.append(unit)
        elif unit.type=="monster":
            monsters.append(unit)
        elif unit.type=="hero":
            heroes.append(unit)
        elif unit.type=="troop":
            troops.append(unit)

    #Find out longest list for spacing
    longest_list = max([len(gods), len(monsters), len(heroes), len(troops)])
    for i in [titans, gods, monsters, heroes, troops]:
        while len(i)!= longest_list:
            #Padding the table with empty unit
            i.append(Unit(name='', type = '', cost=''))
    #Display the table
    t = PrettyTable(['Titans', 'Gods', 'Monsters', "Heroes", "Troops"])
    for idx in range(longest_list):
        t.add_row([titans[idx].name,
                   gods[idx].name, 
                   monsters[idx].name, 
                   heroes[idx].name, 
                   troops[idx].name])
    print(t)

    
    
    
    