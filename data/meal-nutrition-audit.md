# 67-meal nutrition dataset audit

## Scope and status

- **67 complete records** for the **67 JPG filenames** in `data/image-colors.json`.
- **67 unique `imageFilename` values** and **67 unique `mealId` values**.
- Exact filename sets match; there are no missing or extra filenames.
- Every record has 10 numeric nutrition fields, at least one estimated food with gram weight, confidence, estimation basis, and notes. There are no `null` nutrition values.
- These are one-time, image-specific, reference-based estimates for the entire photographed meal. They are not laboratory measurements, per-100-g values, runtime AI results, or the previous nine UI placeholders.
- UI code and Supabase Storage were not changed during Phase 1.

## Method

1. Inspect each JPG and identify visible dishes and ingredients.
2. Estimate the edible mass of each visible component using plate, bowl, sandwich, piece, and restaurant-serving scale cues.
3. Combine generic ingredient/prepared-food nutrient profiles from [USDA FoodData Central](https://fdc.nal.usda.gov/).
4. When a dish is obscured or shared, start with the closest typical restaurant composite meal and scale it to the visible count/size.
5. Store absolute amounts only. Future `%DV` values must be derived from the constants in `dailyValueReferences`; total sugar intentionally has no `%DV`.

## Daily Value constants reserved for future derived calculations

| Nutrient      |   Daily Value |
| ------------- | ------------: |
| Protein       |          50 g |
| Carbohydrates |         275 g |
| Fat           |          78 g |
| Fiber         |          28 g |
| Sodium        |      2,300 mg |
| Potassium     |      4,700 mg |
| Calcium       |      1,300 mg |
| Iron          |         18 mg |
| Total sugar   | No project DV |

## Distribution audit

| Nutrient      |      Min |    Median |       Max |
| ------------- | -------: | --------: | --------: |
| Calories      | 460 kcal | 1380 kcal | 3820 kcal |
| Protein       |     13 g |      69 g |     244 g |
| Carbohydrates |     25 g |     121 g |     492 g |
| Fat           |     18 g |      58 g |     216 g |
| Fiber         |      3 g |      10 g |      45 g |
| Total sugar   |      5 g |      19 g |     112 g |
| Sodium        |   310 mg |   2580 mg |   7820 mg |
| Potassium     |   610 mg |   2180 mg |   6630 mg |
| Calcium       |    95 mg |    360 mg |   1040 mg |
| Iron          |   2.1 mg |    8.6 mg |   29.4 mg |

## Records (67)

Nutrition order in each row: **kcal; protein g; carbohydrates g; fat g; fiber g; total sugar g; sodium mg; potassium mg; calcium mg; iron mg**.

### meal-001 — `2EF31F95-D801-4A30-B799-334534FF4476.jpg`

![2EF31F95-D801-4A30-B799-334534FF4476.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/2EF31F95-D801-4A30-B799-334534FF4476.jpg)

- **Meal:** Shared Chinese meal with noodles, rice, tomato eggs, spring rolls, dumplings, edamame and soup
- **Estimated foods / portions:** dry noodles with sauce (520 g); tomato scrambled eggs (520 g); spring rolls (240 g); soup dumplings (300 g); cooked white rice (500 g); edamame and soup (380 g)
- **Nutrition:** 3820; 154; 492; 142; 36; 53; 7420; 4580; 610; 22.4
- **Confidence:** 0.56
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Large multi-person spread; totals cover all clearly visible dishes, so serving count and hidden oil are uncertain.

### meal-002 — `C6196600-F6C0-45AE-A139-026F9B0EDE91.jpg`

![C6196600-F6C0-45AE-A139-026F9B0EDE91.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/C6196600-F6C0-45AE-A139-026F9B0EDE91.jpg)

- **Meal:** Egg and avocado focaccia sandwich with cabbage and cheese
- **Estimated foods / portions:** focaccia bread (150 g); fried egg (55 g); avocado (70 g); cabbage and greens (45 g); cheese and spread (45 g)
- **Nutrition:** 790; 29; 76; 43; 11; 8; 1180; 970; 260; 4.8
- **Confidence:** 0.79
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-003 — `E0D7B526-64D1-423A-8921-B737C136B907.jpg`

![E0D7B526-64D1-423A-8921-B737C136B907.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/E0D7B526-64D1-423A-8921-B737C136B907.jpg)

- **Meal:** Sichuan-style sliced beef and offal salad with cucumber and chili oil
- **Estimated foods / portions:** cooked beef and offal (220 g); cucumber and vegetables (130 g); chili oil dressing (65 g); corn and herbs (55 g)
- **Nutrition:** 760; 58; 32; 46; 6; 8; 1980; 1280; 105; 7.4
- **Confidence:** 0.68
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** The exact meat cuts and amount of chili oil are not fully visible; a typical fuqi feipian-style composition was used.

### meal-004 — `IMG_0043.jpg`

![IMG_0043.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_0043.jpg)

- **Meal:** Fish with roasted potatoes and greens plus two burgers
- **Estimated foods / portions:** cooked white fish fillet (190 g); roasted potatoes (240 g); leafy greens (80 g); two cheeseburgers (500 g)
- **Nutrition:** 2470; 119; 183; 137; 16; 25; 3560; 3210; 590; 13.1
- **Confidence:** 0.51
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** The frame contains three plates; totals include the foreground fish plate and both background burgers as one photographed meal.

### meal-005 — `IMG_0045.jpg`

![IMG_0045.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_0045.jpg)

- **Meal:** Omurice with meat rice filling and tomato sauce
- **Estimated foods / portions:** cooked seasoned rice (300 g); egg omelet (150 g); ground meat filling (100 g); tomato sauce (120 g); cooking oil (18 g)
- **Nutrition:** 1010; 38; 119; 41; 5; 16; 1420; 980; 150; 5.4
- **Confidence:** 0.78
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-006 — `IMG_0373.jpg`

![IMG_0373.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_0373.jpg)

- **Meal:** Beef tartare rice bowl with egg yolk, grilled vegetables and small dessert
- **Estimated foods / portions:** beef tartare (170 g); cooked rice (250 g); egg yolk (18 g); grilled vegetables (180 g); fried bites and dessert (180 g)
- **Nutrition:** 1510; 70; 156; 66; 13; 32; 2680; 2180; 330; 10.2
- **Confidence:** 0.61
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Several shared side dishes are visible; standard small-plate portions were used.

### meal-007 — `IMG_1165.jpg`

![IMG_1165.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_1165.jpg)

- **Meal:** Beef noodle soup with bok choy
- **Estimated foods / portions:** cooked wheat noodles (250 g); braised beef (150 g); broth (450 g); bok choy (90 g)
- **Nutrition:** 820; 47; 91; 30; 6; 8; 2260; 1250; 150; 6.3
- **Confidence:** 0.84
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-008 — `IMG_1605.jpg`

![IMG_1605.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_1605.jpg)

- **Meal:** Assorted nigiri sushi, about ten pieces
- **Estimated foods / portions:** sushi rice (260 g); assorted raw fish and seafood (190 g); soy sauce and garnishes (35 g)
- **Nutrition:** 700; 43; 91; 18; 3; 10; 1450; 920; 95; 4.2
- **Confidence:** 0.82
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-009 — `IMG_1711.jpg`

![IMG_1711.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_1711.jpg)

- **Meal:** Four large deli sandwiches with pastrami, turkey, avocado and vegetables
- **Estimated foods / portions:** four large bread rolls (520 g); pastrami and corned beef (300 g); turkey (220 g); avocado and vegetables (220 g); cheese and condiments (160 g)
- **Nutrition:** 2860; 151; 292; 116; 26; 32; 6780; 3910; 710; 25.8
- **Confidence:** 0.63
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Multi-person order; totals include all four sandwiches.

### meal-010 — `IMG_1948.jpg`

![IMG_1948.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_1948.jpg)

- **Meal:** Lamb chops with roasted carrots and mushroom risotto
- **Estimated foods / portions:** cooked lamb chops (260 g); mushroom risotto (330 g); roasted carrots and vegetables (180 g); cooking fat and sauce (35 g)
- **Nutrition:** 1470; 87; 108; 79; 10; 16; 1890; 2440; 240; 9.8
- **Confidence:** 0.77
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-011 — `IMG_1975.jpg`

![IMG_1975.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_1975.jpg)

- **Meal:** Full English breakfast with pancakes
- **Estimated foods / portions:** eggs (110 g); sausage and bacon (210 g); baked beans (180 g); hash browns and mushrooms (230 g); pancakes with cream (230 g); grilled tomato (90 g)
- **Nutrition:** 1820; 73; 177; 92; 18; 45; 3720; 3060; 460; 14.2
- **Confidence:** 0.72
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** The photographed meal combines a full breakfast plate and a pancake plate.

### meal-012 — `IMG_2031.jpg`

![IMG_2031.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_2031.jpg)

- **Meal:** Three loaded burgers with fries and onion rings
- **Estimated foods / portions:** three loaded cheeseburgers (840 g); french fries (300 g); onion rings (220 g); sauces (80 g)
- **Nutrition:** 3710; 173; 336; 190; 23; 52; 6330; 4200; 1040; 24.5
- **Confidence:** 0.66
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Large multi-person platter; all visible burgers and fried sides are included.

### meal-013 — `IMG_2076.jpg`

![IMG_2076.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_2076.jpg)

- **Meal:** White fish fillet with rice and tomato scrambled egg
- **Estimated foods / portions:** cooked white fish (170 g); cooked white rice (220 g); tomato scrambled egg (220 g); cooking oil and sauce (25 g)
- **Nutrition:** 720; 49; 76; 25; 4; 8; 980; 1150; 135; 4.1
- **Confidence:** 0.86
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-014 — `IMG_2298.jpg`

![IMG_2298.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_2298.jpg)

- **Meal:** Steak and lobster surf-and-turf with a small pasta side
- **Estimated foods / portions:** cooked steak (260 g); lobster meat with butter (180 g); small pasta side (180 g); sauce and vegetables (90 g)
- **Nutrition:** 1610; 145; 81; 76; 6; 10; 2450; 2700; 330; 14.6
- **Confidence:** 0.73
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-015 — `IMG_2311.jpg`

![IMG_2311.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_2311.jpg)

- **Meal:** Cafe spread with avocado toast, pretzel, matcha cake, pastry and two sweet drinks
- **Estimated foods / portions:** avocado toast (260 g); large pretzel (180 g); matcha roll cake and pastry (260 g); two sweet milk coffee drinks (600 g)
- **Nutrition:** 2290; 55; 326; 82; 20; 112; 2700; 2690; 760; 11.2
- **Confidence:** 0.62
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Multi-person cafe spread; drink sugar and pastry fillings use typical cafe recipes.

### meal-016 — `IMG_2559.jpg`

![IMG_2559.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_2559.jpg)

- **Meal:** Creamy risotto, tofu with herb sauce and beet-yogurt side
- **Estimated foods / portions:** creamy vegetable risotto (360 g); tofu with herb sauce (220 g); beet and yogurt side (180 g)
- **Nutrition:** 1390; 48; 134; 74; 15; 24; 2160; 2290; 620; 10.1
- **Confidence:** 0.64
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Three shared dishes; sauces and dairy content are partly hidden.

### meal-017 — `IMG_3143.jpg`

![IMG_3143.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3143.jpg)

- **Meal:** Grilled salmon salad and calamari grain bowl
- **Estimated foods / portions:** grilled salmon (220 g); large green salad with dressing (260 g); calamari (180 g); cooked grain or risotto (260 g)
- **Nutrition:** 1690; 106; 121; 84; 16; 19; 2550; 3120; 350; 9.2
- **Confidence:** 0.67
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Two entrees are included as the photographed meal.

### meal-018 — `IMG_3251.jpg`

![IMG_3251.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3251.jpg)

- **Meal:** Radish and feta salad with vinaigrette
- **Estimated foods / portions:** radishes and mixed vegetables (230 g); feta cheese (80 g); vinaigrette (45 g); seeds and herbs (20 g)
- **Nutrition:** 460; 15; 25; 35; 8; 12; 980; 920; 420; 3.2
- **Confidence:** 0.80
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-019 — `IMG_3296.jpg`

![IMG_3296.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3296.jpg)

- **Meal:** Seafood paella with fish, squid, mussels, scallops and prawns
- **Estimated foods / portions:** cooked seasoned rice (360 g); mixed seafood and fish (290 g); vegetables and tomato (140 g); olive oil and stock (45 g)
- **Nutrition:** 1210; 78; 139; 38; 8; 11; 2310; 1980; 220; 9.5
- **Confidence:** 0.80
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-020 — `IMG_3392.jpg`

![IMG_3392.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3392.jpg)

- **Meal:** Creamy mushroom risotto
- **Estimated foods / portions:** cooked risotto rice (330 g); mushrooms (120 g); cream, cheese and butter (100 g)
- **Nutrition:** 820; 21; 92; 42; 5; 8; 1230; 910; 310; 3.1
- **Confidence:** 0.85
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-021 — `IMG_3438.jpg`

![IMG_3438.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3438.jpg)

- **Meal:** Tuna tataki salad with two tacos and tomato side
- **Estimated foods / portions:** seared tuna (170 g); mixed salad and dressing (220 g); two small tacos (180 g); tomato side (100 g)
- **Nutrition:** 940; 62; 76; 43; 12; 15; 1740; 1940; 240; 7.1
- **Confidence:** 0.73
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-022 — `IMG_3445.jpg`

![IMG_3445.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3445.jpg)

- **Meal:** Braised lamb shank over mushroom risotto
- **Estimated foods / portions:** cooked lamb shank meat (280 g); mushroom risotto (360 g); braising sauce (100 g)
- **Nutrition:** 1460; 91; 103; 78; 6; 12; 2180; 2400; 250; 11.8
- **Confidence:** 0.82
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-023 — `IMG_3475.jpg`

![IMG_3475.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3475.jpg)

- **Meal:** Spicy seafood curry or stew with crab, shellfish and noodles
- **Estimated foods / portions:** mixed crab, fish and shellfish (420 g); cooked noodles or rice (260 g); curry broth and coconut milk (380 g); vegetables (160 g)
- **Nutrition:** 1360; 96; 121; 57; 12; 22; 3290; 2890; 390; 12.4
- **Confidence:** 0.63
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** The starch under the seafood is partly obscured; a typical seafood curry bowl was used.

### meal-024 — `IMG_3788.jpg`

![IMG_3788.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3788.jpg)

- **Meal:** Pork ramen with egg
- **Estimated foods / portions:** cooked ramen noodles (260 g); chashu pork (120 g); egg (55 g); broth (500 g); vegetables and toppings (80 g)
- **Nutrition:** 920; 47; 98; 38; 7; 9; 2780; 1260; 170; 5.5
- **Confidence:** 0.85
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-025 — `IMG_3811.jpg`

![IMG_3811.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3811.jpg)

- **Meal:** Three pasta dishes with breadsticks
- **Estimated foods / portions:** squid ink seafood pasta (380 g); tomato meat pasta (380 g); cream pasta (380 g); breadsticks (150 g)
- **Nutrition:** 2920; 104; 372; 111; 22; 35; 4480; 3120; 760; 15.6
- **Confidence:** 0.65
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Three full pasta plates and the visible bread are treated as one multi-person photographed meal.

### meal-026 — `IMG_3823.jpg`

![IMG_3823.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3823.jpg)

- **Meal:** Eggs Benedict with green salad and orange juice
- **Estimated foods / portions:** eggs Benedict, two halves (300 g); green salad with dressing (130 g); orange juice (250 g)
- **Nutrition:** 990; 35; 82; 58; 7; 28; 1880; 1250; 280; 5.4
- **Confidence:** 0.83
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-027 — `IMG_3856.jpg`

![IMG_3856.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3856.jpg)

- **Meal:** Beef udon noodle soup
- **Estimated foods / portions:** cooked udon noodles (270 g); cooked beef (140 g); broth (450 g); vegetables (80 g)
- **Nutrition:** 800; 43; 99; 25; 6; 12; 2240; 1190; 130; 5.8
- **Confidence:** 0.84
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-028 — `IMG_3882.jpg`

![IMG_3882.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3882.jpg)

- **Meal:** Shared Chinese mushroom hotpot with tofu and vegetables
- **Estimated foods / portions:** mixed mushrooms and vegetables (700 g); tofu and bean products (350 g); lotus root and starches (300 g); hotpot broth and sauces (500 g)
- **Nutrition:** 2170; 93; 228; 93; 45; 38; 6540; 5300; 940; 21.2
- **Confidence:** 0.55
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Large shared table; ingredient weights and absorbed broth/oil are estimated from a standard four-person hotpot.

### meal-029 — `IMG_3949.jpg`

![IMG_3949.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3949.jpg)

- **Meal:** Beef hotpot with rice and side dishes
- **Estimated foods / portions:** cooked beef hotpot (420 g); vegetables and mushrooms (350 g); cooked rice (300 g); side dishes and sauces (220 g)
- **Nutrition:** 1740; 105; 162; 69; 24; 28; 4860; 4080; 510; 16.8
- **Confidence:** 0.64
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Shared meal; hotpot broth intake and sauce use are uncertain.

### meal-030 — `IMG_3979.jpg`

![IMG_3979.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_3979.jpg)

- **Meal:** Large steak platter with fries and green salad
- **Estimated foods / portions:** cooked steak (520 g); french fries (330 g); green salad with dressing (220 g); steak sauce and butter (70 g)
- **Nutrition:** 2350; 167; 150; 124; 16; 17; 3180; 4210; 270; 20.5
- **Confidence:** 0.76
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** The steak is an unusually large sharing portion.

### meal-031 — `IMG_4066.jpg`

![IMG_4066.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4066.jpg)

- **Meal:** Chicken ramen with egg and fried chicken side
- **Estimated foods / portions:** ramen noodles and broth (750 g); chicken and egg toppings (190 g); fried chicken or dumpling side (210 g); vegetables (80 g)
- **Nutrition:** 1340; 69; 135; 58; 8; 11; 3760; 1840; 230; 7.3
- **Confidence:** 0.74
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** No additional image-specific uncertainty noted.

### meal-032 — `IMG_4105.jpg`

![IMG_4105.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4105.jpg)

- **Meal:** Two Korean stone-bowl set meals with banchan
- **Estimated foods / portions:** two meat and rice stone bowls (1050 g); assorted banchan (650 g); soups and sauces (450 g)
- **Nutrition:** 2590; 122; 306; 91; 31; 47; 6940; 4920; 760; 21.5
- **Confidence:** 0.57
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Two full trays are visible; totals represent both sets and use typical Korean restaurant portions.

### meal-033 — `IMG_4186.jpg`

![IMG_4186.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4186.jpg)

- **Meal:** Three lobster rolls
- **Estimated foods / portions:** three split-top rolls (240 g); lobster meat (330 g); mayonnaise and butter (95 g); celery and herbs (35 g)
- **Nutrition:** 1810; 94; 126; 101; 5; 16; 3210; 1880; 410; 5.9
- **Confidence:** 0.76
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** All three rolls are included.

### meal-034 — `IMG_4194.jpg`

![IMG_4194.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4194.jpg)

- **Meal:** Shared beef hotpot with tofu, noodles and vegetables
- **Estimated foods / portions:** thin-sliced raw beef (700 g); tofu and bean products (400 g); noodles and starches (350 g); vegetables and mushrooms (650 g); broth and dipping sauces (600 g)
- **Nutrition:** 3070; 226; 218; 145; 40; 34; 7820; 6630; 980; 29.4
- **Confidence:** 0.59
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Large multi-person hotpot; broth consumption and sauce use drive the sodium uncertainty.

### meal-035 — `IMG_4242.jpg`

![IMG_4242.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4242.jpg)

- **Meal:** Thai green curry with rice, grilled chicken plate and sweet drink
- **Estimated foods / portions:** green curry (420 g); cooked rice (280 g); grilled chicken or fish with vegetables (260 g); sweet orange drink (350 g)
- **Nutrition:** 1570; 72; 194; 57; 11; 62; 2750; 2390; 340; 8.4
- **Confidence:** 0.66
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** No additional image-specific uncertainty noted.

### meal-036 — `IMG_4255.jpg`

![IMG_4255.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4255.jpg)

- **Meal:** Large Korean barbecue platter with beef, pork, shrimp and vegetables
- **Estimated foods / portions:** assorted cooked beef (520 g); assorted cooked pork (360 g); shrimp (140 g); grilled vegetables (300 g); sauces and cooking oil (120 g)
- **Nutrition:** 3260; 244; 75; 216; 15; 24; 5160; 5740; 420; 27.8
- **Confidence:** 0.72
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Meat-heavy shared platter. Totals include all visible meat and seafood; exact cuts and rendered fat are uncertain.

### meal-037 — `IMG_4277.jpg`

![IMG_4277.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4277.jpg)

- **Meal:** Matcha soft-serve parfait with mochi, cereal, kinako and syrup
- **Estimated foods / portions:** matcha soft serve (210 g); mochi and cereal (100 g); kinako powder and syrup (55 g)
- **Nutrition:** 640; 13; 95; 24; 4; 63; 310; 610; 330; 2.1
- **Confidence:** 0.79
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-038 — `IMG_4326.jpg`

![IMG_4326.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4326.jpg)

- **Meal:** Prosciutto pasta with peanut-butter toast and matcha latte
- **Estimated foods / portions:** pasta with prosciutto and vegetables (390 g); peanut butter toast (130 g); sweetened matcha latte (350 g)
- **Nutrition:** 1380; 50; 167; 58; 12; 39; 2420; 1870; 480; 8.3
- **Confidence:** 0.70
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** All three photographed items are included; sauce and drink sweetness use standard cafe portions.

### meal-039 — `IMG_4379.jpg`

![IMG_4379.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4379.jpg)

- **Meal:** Italian deli sandwich with cured meat, cheese, tomato and greens
- **Estimated foods / portions:** bread roll (170 g); cured meats (120 g); cheese (55 g); tomato and greens (80 g); spread and oil (30 g)
- **Nutrition:** 900; 43; 82; 44; 8; 9; 2110; 840; 390; 5.2
- **Confidence:** 0.82
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-040 — `IMG_4472.jpg`

![IMG_4472.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4472.jpg)

- **Meal:** Salmon rice bowl and tuna sashimi bowl with extra rice
- **Estimated foods / portions:** salmon and avocado rice bowl (520 g); tuna sashimi bowl (360 g); extra cooked rice (250 g); sauces and garnishes (60 g)
- **Nutrition:** 1510; 89; 184; 48; 12; 18; 2650; 2480; 260; 9.1
- **Confidence:** 0.68
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Two bowls plus a separate rice bowl are counted as one photographed meal.

### meal-041 — `IMG_4516.jpg`

![IMG_4516.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4516.jpg)

- **Meal:** Lamb chops with roasted potatoes
- **Estimated foods / portions:** cooked lamb chops (300 g); roasted potatoes (320 g); cooking oil and seasoning (35 g)
- **Nutrition:** 1160; 82; 72; 59; 7; 5; 1150; 2360; 120; 8.8
- **Confidence:** 0.86
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-042 — `IMG_4619.jpg`

![IMG_4619.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4619.jpg)

- **Meal:** Cheeseburger with fries and a pasta side
- **Estimated foods / portions:** cheeseburger (300 g); french fries (220 g); pasta side (260 g)
- **Nutrition:** 1910; 66; 199; 91; 12; 25; 3270; 2220; 540; 10.3
- **Confidence:** 0.69
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Both plates in the frame are included.

### meal-043 — `IMG_4684.jpg`

![IMG_4684.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4684.jpg)

- **Meal:** Salmon and ikura rice bowl with six hand rolls
- **Estimated foods / portions:** salmon ikura rice bowl (520 g); six assorted hand rolls (430 g); soy sauce and condiments (45 g)
- **Nutrition:** 1580; 83; 190; 53; 9; 20; 3050; 2200; 310; 8.2
- **Confidence:** 0.72
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** The full hand-roll tray and rice bowl are included.

### meal-044 — `IMG_4749.jpg`

![IMG_4749.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4749.jpg)

- **Meal:** Seared tuna mixed salad with creamy dressing
- **Estimated foods / portions:** seared tuna (180 g); mixed leafy vegetables (230 g); creamy dressing (55 g); seeds and garnishes (25 g)
- **Nutrition:** 520; 49; 25; 27; 8; 9; 980; 1450; 170; 5.1
- **Confidence:** 0.84
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-045 — `IMG_4751.jpg`

![IMG_4751.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4751.jpg)

- **Meal:** Three fried chicken sliders with side salad and dipping sauce
- **Estimated foods / portions:** three fried chicken sliders (540 g); green salad with dressing (180 g); dipping sauce (45 g)
- **Nutrition:** 1250; 61; 116; 62; 9; 20; 2590; 1730; 330; 7.2
- **Confidence:** 0.80
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-046 — `IMG_4764.jpg`

![IMG_4764.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4764.jpg)

- **Meal:** Loaded cheeseburger with creamy slaw
- **Estimated foods / portions:** beef cheeseburger (330 g); creamy coleslaw (100 g); pickle (35 g)
- **Nutrition:** 1010; 48; 72; 56; 5; 14; 1930; 1130; 360; 6.1
- **Confidence:** 0.83
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-047 — `IMG_4903.jpg`

![IMG_4903.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_4903.jpg)

- **Meal:** Ham and cheese sandwich with lettuce and tomato
- **Estimated foods / portions:** bread roll (160 g); ham (100 g); cheese (45 g); lettuce and tomato (70 g); mayonnaise (25 g)
- **Nutrition:** 690; 35; 73; 29; 6; 8; 1760; 690; 350; 4.2
- **Confidence:** 0.86
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-048 — `IMG_5014.jpg`

![IMG_5014.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_5014.jpg)

- **Meal:** Full English breakfast with poached eggs, bacon, sausage, beans and potatoes
- **Estimated foods / portions:** poached eggs (110 g); bacon and sausage (190 g); baked beans (170 g); roasted potatoes (190 g); tomato and mushrooms (150 g); toast and sauce (100 g)
- **Nutrition:** 1390; 69; 112; 76; 16; 24; 3140; 2830; 340; 12.1
- **Confidence:** 0.82
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-049 — `IMG_5148.jpg`

![IMG_5148.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_5148.jpg)

- **Meal:** Asparagus and mushroom pizza with coconut water
- **Estimated foods / portions:** whole thin-crust vegetable pizza (620 g); coconut water (330 g)
- **Nutrition:** 1210; 43; 165; 42; 15; 24; 2140; 2180; 560; 8.6
- **Confidence:** 0.83
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-050 — `IMG_5161.jpg`

![IMG_5161.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_5161.jpg)

- **Meal:** Chicken sandwich with avocado, cabbage and creamy dressing
- **Estimated foods / portions:** bread roll (170 g); cooked chicken (140 g); avocado and cabbage (100 g); creamy dressing (35 g)
- **Nutrition:** 830; 51; 79; 34; 10; 9; 1470; 1190; 190; 5.1
- **Confidence:** 0.84
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-051 — `IMG_5719.jpg`

![IMG_5719.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_5719.jpg)

- **Meal:** Tuna salad sandwich with herbs and vegetables
- **Estimated foods / portions:** bread roll (175 g); tuna salad (175 g); vegetables and herbs (70 g)
- **Nutrition:** 760; 42; 78; 30; 7; 9; 1510; 830; 160; 5.0
- **Confidence:** 0.82
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-052 — `IMG_5834.jpg`

![IMG_5834.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_5834.jpg)

- **Meal:** Creamy chicken ramen with mushrooms and bamboo shoots
- **Estimated foods / portions:** cooked ramen noodles (260 g); chicken (140 g); creamy broth (500 g); mushrooms and bamboo shoots (120 g)
- **Nutrition:** 950; 50; 101; 39; 8; 10; 2870; 1430; 190; 5.8
- **Confidence:** 0.78
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Broth base is visually ambiguous; a typical creamy chicken ramen profile was used.

### meal-053 — `IMG_5975.jpg`

![IMG_5975.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_5975.jpg)

- **Meal:** Roasted vegetable and cheese sandwich
- **Estimated foods / portions:** bread roll (170 g); roasted vegetables (150 g); cheese (55 g); pesto or oil (30 g)
- **Nutrition:** 700; 24; 82; 32; 10; 11; 1260; 1040; 360; 4.3
- **Confidence:** 0.74
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Filling appears vegetable-forward; exact cheese and spread quantities are partly obscured.

### meal-054 — `IMG_6774.jpg`

![IMG_6774.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_6774.jpg)

- **Meal:** Three Chinese noodle dishes: beef soup noodles, minced dry noodles and dumpling soup
- **Estimated foods / portions:** beef noodle soup (780 g); minced-meat dry noodles (480 g); dumpling soup (520 g)
- **Nutrition:** 2140; 105; 277; 68; 19; 25; 6020; 3350; 430; 16.4
- **Confidence:** 0.64
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Three bowls are included as one photographed meal.

### meal-055 — `IMG_6956.jpg`

![IMG_6956.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_6956.jpg)

- **Meal:** Three breakfast plates with scrambled eggs, croissants, vegetables, yogurt and juice
- **Estimated foods / portions:** scrambled eggs (330 g); croissants and toast (300 g); breakfast meat and vegetables (360 g); yogurt (250 g); juice (500 g)
- **Nutrition:** 2640; 94; 294; 118; 19; 95; 3810; 3690; 840; 15.2
- **Confidence:** 0.58
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Multi-person breakfast table; all visible plates and drinks are included.

### meal-056 — `IMG_7208.jpg`

![IMG_7208.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_7208.jpg)

- **Meal:** Prosciutto and burrata open-faced toast with vegetables
- **Estimated foods / portions:** sourdough toast (120 g); prosciutto (65 g); burrata (90 g); vegetable relish and greens (120 g); olive oil (15 g)
- **Nutrition:** 720; 33; 62; 39; 7; 9; 1570; 910; 360; 4.1
- **Confidence:** 0.80
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-057 — `IMG_7266.jpg`

![IMG_7266.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_7266.jpg)

- **Meal:** Black pasta or ravioli with creamy beef sauce
- **Estimated foods / portions:** filled black pasta (340 g); ground beef (120 g); cream sauce (180 g); cheese (30 g)
- **Nutrition:** 1020; 49; 105; 47; 6; 10; 1540; 1230; 370; 6.2
- **Confidence:** 0.69
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Pasta type and filling are not fully visible; a typical filled-pasta composition was used.

### meal-058 — `IMG_7571.jpg`

![IMG_7571.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_7571.jpg)

- **Meal:** Open-faced pastrami Reuben sandwich with pickle
- **Estimated foods / portions:** bread (150 g); pastrami (190 g); cheese (65 g); sauerkraut and dressing (100 g); pickle (55 g)
- **Nutrition:** 1080; 67; 79; 54; 8; 14; 3060; 1280; 520; 8.4
- **Confidence:** 0.81
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-059 — `IMG_7783.jpg`

![IMG_7783.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_7783.jpg)

- **Meal:** Pappardelle with beef ragu and burrata
- **Estimated foods / portions:** cooked pappardelle (320 g); beef ragu (240 g); burrata (90 g); olive oil and herbs (20 g)
- **Nutrition:** 1110; 52; 121; 48; 8; 14; 1380; 1460; 390; 7.3
- **Confidence:** 0.86
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-060 — `IMG_7785.jpg`

![IMG_7785.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_7785.jpg)

- **Meal:** Dim sum spread with char siu, shrimp dumplings, egg tarts and sesame balls
- **Estimated foods / portions:** char siu pork (260 g); shrimp dumplings (240 g); egg tarts (180 g); fried sesame balls (180 g); small dumpling side (100 g)
- **Nutrition:** 1780; 82; 205; 71; 10; 66; 3460; 1980; 390; 11.2
- **Confidence:** 0.70
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Shared dim sum order; all visible plates and baskets are included.

### meal-061 — `IMG_7884.jpg`

![IMG_7884.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_7884.jpg)

- **Meal:** Shared brunch spread with eggs, toast, shakshuka, meat and vegetables
- **Estimated foods / portions:** eggs and toast plates (620 g); shakshuka and pita (480 g); meat and potato plate (430 g); drinks and sauces (350 g)
- **Nutrition:** 2680; 112; 289; 119; 32; 55; 4850; 4860; 720; 19.4
- **Confidence:** 0.58
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Four-person shared brunch; portions are based on typical restaurant plates.

### meal-062 — `IMG_8192.jpg`

![IMG_8192.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_8192.jpg)

- **Meal:** Poached chicken, two corn cobs and tofu or offal side
- **Estimated foods / portions:** poached chicken (330 g); corn on the cob (300 g); tofu or offal side (180 g); sauces (45 g)
- **Nutrition:** 1120; 99; 79; 48; 10; 20; 1980; 2590; 260; 9.6
- **Confidence:** 0.62
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** The pale side dish is visually ambiguous; a mixed tofu/offal reference was used.

### meal-063 — `IMG_8390.jpg`

![IMG_8390.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_8390.jpg)

- **Meal:** Shared Chinese meal with pork cutlet, buns, noodles, salads and braised dishes
- **Estimated foods / portions:** fried pork cutlet (360 g); steamed buns (260 g); sauced noodles (360 g); egg and seafood stew (320 g); salads and braised sides (420 g)
- **Nutrition:** 2460; 126; 268; 96; 28; 41; 5960; 4210; 730; 18.7
- **Confidence:** 0.57
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Large multi-dish shared meal; all visible plates are included.

### meal-064 — `IMG_9228.jpg`

![IMG_9228.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_9228.jpg)

- **Meal:** Shared Mexican meal with tacos, fried sides, beans, salads and drinks
- **Estimated foods / portions:** assorted tacos and meat dishes (620 g); fried potatoes or chips (280 g); beans, salad and sauces (360 g); sweetened drinks (700 g)
- **Nutrition:** 2250; 94; 270; 83; 31; 76; 4750; 3780; 610; 17.1
- **Confidence:** 0.54
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Several partially visible shared dishes and drinks require standard restaurant portion estimates.

### meal-065 — `IMG_9349.jpg`

![IMG_9349.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_9349.jpg)

- **Meal:** Braised beef noodle bowl with greens
- **Estimated foods / portions:** cooked wheat noodles (270 g); braised beef (170 g); vegetables (120 g); broth and sauce (350 g)
- **Nutrition:** 880; 51; 105; 29; 8; 12; 2420; 1570; 150; 6.8
- **Confidence:** 0.85
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-066 — `IMG_9757.jpg`

![IMG_9757.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_9757.jpg)

- **Meal:** Fried chicken and waffles with syrup
- **Estimated foods / portions:** fried chicken (300 g); waffles (260 g); syrup and butter (100 g)
- **Nutrition:** 1410; 63; 153; 66; 5; 59; 2580; 1310; 360; 8.0
- **Confidence:** 0.84
- **Basis:** Visible component estimate. USDA FoodData Central generic prepared-food component profiles; visible portions scaled against standard restaurant servings.
- **Notes:** No additional image-specific uncertainty noted.

### meal-067 — `IMG_9786.jpg`

![IMG_9786.jpg](https://flnkvcdlgefobrtacric.supabase.co/storage/v1/object/public/265/IMG_9786.jpg)

- **Meal:** Two pasta dishes with mushroom cream sauce, gnocchi and bread
- **Estimated foods / portions:** mushroom fettuccine (480 g); creamy gnocchi or shell pasta (480 g); garlic bread (140 g)
- **Nutrition:** 2260; 70; 309; 82; 18; 24; 3420; 2500; 760; 12.6
- **Confidence:** 0.66
- **Basis:** Standard composite + visible scaling. USDA FoodData Central and typical restaurant composite-meal profiles; the standard serving was adjusted to the photographed portion.
- **Notes:** Two full pasta plates and bread are included as one photographed meal.

## Records driven mainly by a standard meal reference

34 records rely primarily on a standard restaurant/composite profile because ingredients, cooking fat, broth intake, or sharing portions are partly obscured:

`2EF31F95-D801-4A30-B799-334534FF4476.jpg`, `E0D7B526-64D1-423A-8921-B737C136B907.jpg`, `IMG_0043.jpg`, `IMG_0373.jpg`, `IMG_1711.jpg`, `IMG_1975.jpg`, `IMG_2031.jpg`, `IMG_2311.jpg`, `IMG_2559.jpg`, `IMG_3143.jpg`, `IMG_3475.jpg`, `IMG_3811.jpg`, `IMG_3882.jpg`, `IMG_3949.jpg`, `IMG_4066.jpg`, `IMG_4105.jpg`, `IMG_4194.jpg`, `IMG_4242.jpg`, `IMG_4255.jpg`, `IMG_4326.jpg`, `IMG_4472.jpg`, `IMG_4619.jpg`, `IMG_4684.jpg`, `IMG_5834.jpg`, `IMG_5975.jpg`, `IMG_6774.jpg`, `IMG_6956.jpg`, `IMG_7266.jpg`, `IMG_7785.jpg`, `IMG_7884.jpg`, `IMG_8192.jpg`, `IMG_8390.jpg`, `IMG_9228.jpg`, `IMG_9786.jpg`

The remaining records use visible component estimates first, while still taking nutrient profiles from USDA FoodData Central.
