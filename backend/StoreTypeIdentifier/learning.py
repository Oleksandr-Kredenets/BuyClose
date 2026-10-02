from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import joblib

training_words = [
    # 101
    "хліб", "молоко", "сир", "масло", "кефір", "йогурт", "сметана", "вершки", "творог", "яйця",
    "ковбаса", "сосиски", "шинка", "бекон", "курятина", "яловичина", "свинина", "риба", "оселедець",
    "лосось", "тунець", "картопля", "морква", "цибуля", "помідор", "огірок", "капуста", "буряк",
    "перець", "часник", "яблуко", "банан", "апельсин", "лимон", "виноград", "полуниця", "кавун",
    "диня", "борошно", "цукор", "сіль", "рис", "гречка", "макарони", "вівсянка", "квасоля", "горох",
    "кукурудза", "олія", "майонез", "хліб", "батон", "багет", "лаваш", "булочка", "круасан", "пончик",
    "печиво", "вафлі", "шоколад", "цукерки", "мармелад", "зефір", "халва", "мед", "варення", "джем",
    "арахіс", "мигдаль", "фісташки", "волоський горіх", "насіння соняшника", "родзинки", "чорнослив",
    "курага", "мюслі", "гранола", "манка", "пшоно", "перловка", "ячна крупа", "нут", "сочевиця",
    "локшина", "спагеті", "томатна паста", "гірчиця", "соєвий соус", "оцет", "кетчуп", "маргарин",
    "сир плавлений", "бринза", "моцарела", "пармезан", "ряжанка", "кисломолочний сир",
    "кокосове молоко", "зелений горошок", "солоні огірки", "квашена капуста",

    # 96
    "milk", "cheese", "butter", "yogurt", "cream", "eggs",
    "sausage", "ham", "bacon", "chicken", "beef", "pork", "fish", "salmon", "tuna", "potato", "carrot",
    "onion", "tomato", "cucumber", "cabbage", "beetroot", "pepper", "garlic", "apple", "banana",
    "orange", "lemon", "grapes", "strawberry", "watermelon", "melon", "flour", "sugar", "salt",
    "rice", "buckwheat", "pasta", "oatmeal", "beans", "peas", "corn", "oil", "mayonnaise", "ketchup",
    "breadsticks", "bagel", "croissant", "donut", "cookies", "crackers", "chocolate", "candy",
    "marshmallows", "halva", "honey", "jam", "marmalade", "peanut", "almond", "pistachio", "walnut",
    "sunflower seeds", "raisins", "prunes", "dried apricots", "muesli", "granola", "semolina", "millet",
    "pearl barley", "chickpeas", "lentils", "noodles", "spaghetti", "tomato paste", "mustard",
    "soy sauce", "vinegar", "margarine", "processed cheese", "feta", "mozzarella", "parmesan",
    "ryazhenka", "cottage cheese", "coconut milk", "green peas", "pickles", "sauerkraut", "olive oil",
    "black tea", "green tea", "coffee", "cocoa", "juice",


    # 100
    "зошит", "блокнот", "щоденник", "ручка", "олівець", "маркер", "фломастер", "ластик", "точилка",
    "лінійка", "циркуль", "транспортир", "ножиці", "клей", "скотч", "степлер", "скоби", "діркопробивач",
    "папір", "картон", "конверт", "папка", "файл", "тека", "органайзер", "календар", "стікери", "стікер",
    "закладка", "крейда", "гуаш", "акварель", "пензлик", "палітра", "пластилін", "кулькова ручка",
    "гелевий олівець", "коректор", "гумка", "клей-олівець", "ватман", "калька", "копіювальний папір",
    "папка-реєстратор", "щоденник", "пенал", "підставка для ручок", "скотч-диспенсер", "планер", "бланк",
    "альбом", "скетчбук", "щоденник настільний", "записник", "папір для принтера", "кольоровий папір",
    "папір для креслення", "креслярська дошка", "креслярський набір", "циркульний набір", "рейсфедер",
    "лекало", "кутник", "масштабна лінійка", "механічний олівець", "грифелі", "перманентний маркер",
    "текстовиділювач", "акриловий маркер", "крейдяний маркер", "штамп", "чорнило", "штемпельна подушка",
    "скріпки", "канцелярські кнопки", "затискач", "скотч двосторонній", "ізоляційна стрічка",
    "резинка для паперу", "паперовий зажим", "папка на блискавці", "папка-конверт", "архівна коробка",
    "коробка для документів", "розділювачі", "етикетки", "цінники", "бейдж", "шнурок для бейджа",
    "планшет для паперу", "підкладка для письма", "настільний органайзер", "лоток для паперів",
    "календар настінний", "дошка для нотаток", "магнітна дошка", "стікери-закладки",
    "скотч декоративний", "ножиці для паперу", "паперорізка",

    # 95
    "notebook", "notepad", "diary", "pen", "pencil", "marker", "highlighter", "eraser", "sharpener",
    "ruler", "compass", "protractor", "scissors", "glue", "tape", "stapler", "staples", "hole punch",
    "paper", "cardboard", "envelope", "folder", "file", "binder", "organizer", "calendar",
    "sticky notes", "bookmark", "chalk", "gouache", "watercolor", "paintbrush", "palette",
    "modeling clay", "ballpoint pen", "gel pen", "correction fluid", "glue stick", "drawing paper",
    "tracing paper", "copy paper", "ring binder", "pencil case", "pen holder", "tape dispenser",
    "planner", "form", "sketchbook", "journal", "printer paper", "colored paper", "drawing paper",
    "drafting board", "drafting set", "ruler set", "technical pen", "template", "set square",
    "scale ruler", "mechanical pencil", "lead refills", "permanent marker", "highlighter pen",
    "acrylic marker", "chalk marker", "stamp", "ink", "stamp pad", "paper clips", "push pins",
    "binder clip", "double-sided tape", "rubber band", "paper clamp", "zip folder", "document wallet",
    "archive box", "document box", "dividers", "labels", "name tag", "badge holder", "writing board",
    "desk pad", "desk organizer", "paper tray", "wall calendar", "memo board", "magnetic board",
    "page flags", "decorative tape", "paper cutter", "book cover", "bookplate", "index cards",


    # 99
    "комп'ютер", "ноутбук", "моноблок", "монітор", "клавіатура", "миша", "вебкамера", "мікрофон",
    "навушники", "гарнітура", "принтер", "сканер", "роутер", "модем", "флешка", "жорсткий диск",
    "SSD", "відеокарта", "процесор", "материнська плата", "оперативна пам'ять", "блок живлення",
    "корпус", "кулер", "вентилятор", "термопаста", "мережевий кабель", "адаптер", "перехідник",
    "USB-хаб", "док-станція", "геймпад", "джойстик", "ігрова консоль", "акустика", "колонки",
    "кардрідер", "мережева карта", "звукова карта", "Wi-Fi адаптер", "Bluetooth адаптер",
    "кабель HDMI", "кабель USB", "зарядний пристрій", "павербанк", "графічний планшет",
    "моніторна підставка", "килимок для миші", "ігрове крісло", "комп'ютерний стіл", "сервер",
    "мережевий комутатор", "маршрутизатор", "точка доступу", "NAS", "мережевий накопичувач",
    "оптичний привід", "DVD-привід", "зовнішній SSD", "зовнішній HDD", "карта пам'яті", "microSD",
    "SD-карта", "оперативна пам'ять DDR4", "оперативна пам'ять DDR5", "процесорний кулер",
    "рідинне охолодження", "корпусний вентилятор", "кабель DisplayPort", "кабель VGA",
    "кабель Ethernet", "Thunderbolt кабель", "USB-C кабель", "зарядна станція", "мережевий фільтр",
    "джерело безперебійного живлення", "UPS", "внутрішній SSD", "NVMe накопичувач", "SATA кабель",
    "материнська плата Mini-ITX", "материнська плата ATX", "процесор Intel", "процесор AMD",
    "відеокарта NVIDIA", "відеокарта AMD", "операційна система", "ліцензія Windows", "антивірус",
    "офісний пакет", "зовнішня звукова карта", "студійний мікрофон", "графічний монітор",
    "ігрова клавіатура", "механічна клавіатура", "бездротова миша", "ігрова миша", "ігрові навушники",
    "гарнітура Bluetooth",

    # 98
    "computer", "laptop", "desktop", "all-in-one PC", "monitor", "keyboard", "mouse", "webcam",
    "microphone", "headphones", "headset", "printer", "scanner", "router", "modem", "USB flash drive",
    "hard drive", "SSD", "graphics card", "processor", "motherboard", "RAM", "power supply",
    "computer case", "CPU cooler", "fan", "thermal paste", "network cable", "adapter", "converter",
    "USB hub", "docking station", "gamepad", "joystick", "game console", "speakers", "card reader",
    "network card", "sound card", "Wi-Fi adapter", "Bluetooth adapter", "HDMI cable", "USB cable",
    "charger", "power bank", "graphics tablet", "monitor stand", "mouse pad", "gaming chair",
    "computer desk", "server", "network switch", "wireless access point", "NAS", "network storage",
    "optical drive", "DVD drive", "external SSD", "external HDD", "memory card", "microSD card",
    "SD card", "DDR4 memory", "DDR5 memory", "CPU cooler", "liquid cooling", "case fan",
    "DisplayPort cable", "VGA cable", "Ethernet cable", "Thunderbolt cable", "USB-C cable",
    "charging station", "surge protector", "uninterruptible power supply", "UPS", "internal SSD",
    "NVMe drive", "SATA cable", "Mini-ITX motherboard", "ATX motherboard", "Intel processor",
    "AMD processor", "NVIDIA graphics card", "AMD graphics card", "operating system",
    "Windows license", "antivirus software", "office suite", "external sound card",
    "studio microphone", "gaming monitor", "gaming keyboard", "mechanical keyboard", "wireless mouse",
    "gaming mouse", "gaming headset", "Bluetooth headset",


    # 101
    "цегла", "цемент", "бетон", "пісок", "щебінь", "штукатурка", "шпаклівка", "ґрунтовка", "фарба",
    "лак", "емаль", "гіпсокартон", "профіль", "утеплювач", "мінеральна вата", "пінопласт",
    "монтажна піна", "герметик", "силікон", "клей", "плитка", "ламінат", "паркет", "лінолеум",
    "плінтус", "цвях", "шуруп", "саморіз", "болт", "гайка", "шайба", "дюбель", "анкер", "дріт",
    "кабель", "труба", "фітинг", "кран", "змішувач", "лопата", "молоток", "викрутка", "плоскогубці",
    "гайковий ключ", "дриль", "перфоратор", "болгарка", "пилка", "рубанок", "рівень", "цегла",
    "арматура", "металопрофіль", "профнастил", "металочерепиця", "шифер", "руберойд", "бітум",
    "гідроізоляція", "пароізоляція", "теплоізоляція", "скловата", "екструдований пінополістирол",
    "керамзит", "вапно", "гіпс", "цементна суміш", "клей для плитки", "затирка", "шовна стрічка",
    "серпянка", "малярна стрічка", "будівельна сітка", "армувальна сітка", "дерев'яний брус", "дошка",
    "фанера", "OSB", "ДСП", "МДФ", "вагонка", "дерев'яна рейка", "скоби будівельні", "заклепка",
    "різьбова шпилька", "шуруповерт", "лобзик", "циркулярна пила", "бетономішалка", "будівельний міксер",
    "шліфувальна машина", "зварювальний апарат", "будівельний фен", "рулетка", "лазерний рівень",
    "кутник будівельний", "будівельний ніж", "кельма", "шпатель", "терка", "відро",

    # 100
    "brick", "cement", "concrete", "sand", "gravel", "plaster", "putty", "primer", "paint", "varnish",
    "enamel", "drywall", "profile", "insulation", "mineral wool", "foam insulation", "expanding foam",
    "sealant", "silicone", "adhesive", "tile", "laminate", "parquet", "linoleum", "baseboard", "nail",
    "screw", "self-tapping screw", "bolt", "nut", "washer", "dowel", "anchor", "wire", "cable", "pipe",
    "fitting", "faucet", "mixer tap", "shovel", "hammer", "screwdriver", "pliers", "wrench", "drill",
    "hammer drill", "angle grinder", "saw", "hand plane", "spirit level", "rebar", "metal profile",
    "corrugated sheet", "metal roofing", "slate", "roofing felt", "bitumen", "waterproofing",
    "vapor barrier", "thermal insulation", "fiberglass wool", "extruded polystyrene", "expanded clay",
    "lime", "gypsum", "cement mixture", "tile adhesive", "grout", "joint tape", "fiberglass mesh tape",
    "masking tape", "construction mesh", "reinforcement mesh", "wooden beam", "wood board", "plywood",
    "OSB board", "particle board", "MDF board", "wood paneling", "wooden batten", "construction staples",
    "rivet", "threaded rod", "screw gun", "jigsaw", "circular saw", "concrete mixer",
    "construction mixer", "sander", "welding machine", "heat gun", "measuring tape", "laser level",
    "carpenter's square", "utility knife", "trowel", "putty knife", "float", "bucket",


    # 98
    "парацетамол", "ібупрофен", "аспірин", "анальгін", "амоксицилін", "азитроміцин", "пеніцилін",
    "омепразол", "активоване вугілля", "смекта", "но-шпа", "валеріана", "корвалол", "антисептик",
    "йод", "перекис водню", "хлоргексидин", "бинт", "пластир", "марля", "вата", "термометр",
    "тонометр", "інгалятор", "шприц", "маска", "рукавички", "вітаміни", "магній", "кальцій", "залізо",
    "цинк", "вітамін C", "вітамін D", "риб'ячий жир", "сироп від кашлю", "краплі для носа",
    "спрей для горла", "очні краплі", "вушні краплі", "мазь", "крем", "гель", "свічки", "таблетки",
    "капсули", "розчин", "лікарський чай", "термометр електронний", "диклофенак", "кеторолак",
    "напроксен", "німесулід", "метформін", "амлодипін", "лізиноприл", "лозартан", "аторвастатин",
    "фуросемід", "лоратадин", "цетиризин", "фексофенадин", "амброксол", "ацетилцистеїн", "бутамірат",
    "ксилометазолін", "оксиметазолін", "фенілефрин", "нітрофурал", "мірамістин", "пантенол", "бепантен",
    "клотримазол", "тербінафін", "ацикловір", "флуконазол", "карбамазепін", "валідол", "мелатонін",
    "глюкометр", "тест на вагітність", "тест на глюкозу", "тест-смужки", "інсуліновий шприц",
    "інфузійна система", "медичний термометр", "небулайзер", "грілка", "медичний бинт еластичний",
    "турнікет", "медичний пластир", "марлева серветка", "спиртові серветки", "одноразові шприци",
    "медичні маски", "антисептичний спрей", "зволожувальні краплі", "сонцезахисний крем",

    # 97
    "paracetamol", "ibuprofen", "aspirin", "analgin", "amoxicillin", "azithromycin", "penicillin",
    "omeprazole", "activated charcoal", "smecta", "drotaverine", "valerian", "antiseptic", "iodine",
    "hydrogen peroxide", "chlorhexidine", "bandage", "plaster", "gauze", "cotton wool", "thermometer",
    "blood pressure monitor", "inhaler", "syringe", "face mask", "gloves", "vitamins", "magnesium",
    "calcium", "iron", "zinc", "vitamin C", "vitamin D", "fish oil", "cough syrup", "nasal drops",
    "throat spray", "eye drops", "ear drops", "ointment", "cream", "gel", "suppositories", "tablets",
    "capsules", "solution", "medicinal tea", "digital thermometer", "diclofenac", "ketorolac",
    "naproxen", "nimesulide", "metformin", "amlodipine", "lisinopril", "losartan", "atorvastatin",
    "furosemide", "loratadine", "cetirizine", "fexofenadine", "ambroxol", "acetylcysteine",
    "butamirate", "xylometazoline", "oxymetazoline", "phenylephrine", "nitrofural", "miramistin",
    "panthenol", "dexpanthenol", "clotrimazole", "terbinafine", "acyclovir", "fluconazole",
    "carbamazepine", "validol", "melatonin", "glucometer", "pregnancy test", "glucose test",
    "test strips", "insulin syringe", "infusion set", "medical thermometer", "nebulizer",
    "heating pad", "elastic medical bandage", "tourniquet", "medical adhesive tape", "gauze pad",
    "alcohol wipes", "disposable syringes", "medical masks", "antiseptic spray",
    "lubricating eye drops", "sunscreen"
]

training_labels = []

for i in range(101):
    training_labels.append("Продуктовий магазин")
for i in range(96):
    training_labels.append("Grocery store")

for i in range(100):
    training_labels.append("Канцелярський магазин")
for i in range(95):
    training_labels.append("Stationery store")

for i in range(99):
    training_labels.append("Комп'ютерний магазин")
for i in range(98):
    training_labels.append("Computer store")

for i in range(101):
    training_labels.append("Будівельний магазин")
for i in range(100):
    training_labels.append("Hardware store")

for i in range(98):
    training_labels.append("Фармацевтичний магазин")
for i in range(97):
    training_labels.append("Pharmacy")

model = make_pipeline(
    CountVectorizer(analyzer='char', ngram_range=(2, 4)), 
    MultinomialNB()
)

model.fit(training_words, training_labels)
print("Модель успішно навчена!")
joblib.dump(model, 'model.joblib')