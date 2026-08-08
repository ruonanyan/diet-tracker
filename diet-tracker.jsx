import { useState, useEffect } from "react";

/**
 * DIET TRACKER - RUONAN
 *
 * Body: 35F · 5'4" · 156 lbs · 70.8 kg · RHR 64 bpm
 * RMR (Katch-McArdle): 1,288 kcal · Rest-day baseline (RMR + NEAT): 1,717 kcal
 * Workout burn: avg of Karvonen HR & MET methods × 1.10 EPOC multiplier
 * Goal deficit: 300 kcal/day ≈ 0.6 lbs/week fat loss · Protein target: 120–130g/day
 */

const INITIAL_LOG = {
  "2026-08-07": [
    { id: 401, time: "morning", item: "Matcha latte (cafe, ~12 oz) + lox bagel - Apollo Brooklyn (bagel + cream cheese + smoked salmon) + Beyond Good 92% chocolate (1 piece)", calories: 675, protein: 31, carbs: 72, fat: 22 },
    { id: 402, time: "lunch", item: "Borgo NYC: branzino (~150g) + chickpeas (~200g) + potatoes + pesto trapanese + pine nuts", calories: 640, protein: 49, carbs: 60, fat: 22 },
    { id: 403, time: "lunch", item: "Lycee NYC mousse cake: Korean toasted brown rice mousse + caramel + pecan sablé + praliné", calories: 380, protein: 4, carbs: 42, fat: 20 },
  ],
  "2026-08-06": [
    { id: 394, time: "morning", item: "Beyond Good 92% chocolate (1 piece) + Fage 0% yogurt (200g) + blueberries (54g) + honey (2g)", calories: 158, protein: 21, carbs: 18, fat: 1 },
    { id: 395, time: "lunch", item: "Grilled salmon (152g cooked) + grilled asparagus (232g cooked)", calories: 364, protein: 49, carbs: 10, fat: 16 },
    { id: 396, time: "afternoon", item: "Yasso yogurt bar", calories: 80, protein: 4, carbs: 15, fat: 1 },
    { id: 397, time: "dinner", item: "Maki combo: tuna roll (6 pcs) + salmon roll (6 pcs) + California roll (6 pcs) + miso soup + salad", calories: 695, protein: 31, carbs: 95, fat: 13 },
    { id: 398, time: "evening", item: "Deli turkey (30g)", calories: 30, protein: 6, carbs: 1, fat: 0 },
    { id: 399, time: "evening", item: "Protein shake: Naked Whey (44g) + Lactaid whole milk (150g)", calories: 280, protein: 30, carbs: 11, fat: 10 },
    { id: 400, time: "evening", item: "Lays BBQ chips (14g)", calories: 75, protein: 1, carbs: 8, fat: 5 },
  ],
  "2026-08-05": [
    { id: 390, time: "morning", item: "Bob Evans sausage patties (2) + 1 egg + Bob Evans Egg Whites (1 serving) + avocado (1 whole, ~150g) + Tropicana OJ (1/2 cup, 120g)", calories: 600, protein: 29, carbs: 29, fat: 44 },
    { id: 391, time: "morning", item: "Siggi's vanilla yogurt (110g)", calories: 78, protein: 12, carbs: 9, fat: 0 },
    { id: 392, time: "lunch", item: "Yoshinoya gyudon (170g serving) + mixed rice (150g) + shrimp (56g)", calories: 550, protein: 38, carbs: 52, fat: 21 },
    { id: 393, time: "dinner", item: "Dig Inn bowl: steak + roasted chicken + farro & butternut squash + carrots + broccoli + orange pop soda", calories: 845, protein: 70, carbs: 0, fat: 0 },
  ],
  "2026-08-04": [
    { id: 385, time: "morning", item: "Half avocado (~75g) + Bob Evans sausage patties (1.5) + 1 egg + Bob Evans Egg Whites (1 serving)", calories: 373, protein: 24, carbs: 8, fat: 30 },
    { id: 386, time: "morning", item: "Tropicana OJ (75g)", calories: 34, protein: 1, carbs: 8, fat: 0 },
    { id: 387, time: "lunch", item: "Pulmuone Kimchi Pork Mandu (2.5 pieces) + Wei Chuan Pork Bun (1) + Beyond Good 92% chocolate (1 piece)", calories: 520, protein: 16, carbs: 65, fat: 22 },
    { id: 388, time: "dinner", item: "Roasted sweet potatoes (1 lb / 454g cooked) + 2 tbsp olive oil", calories: 650, protein: 9, carbs: 95, fat: 28 },
    { id: 389, time: "evening", item: "Protein shake: Naked Whey (44g) + Lactaid whole milk (100g) + Bob Evans Egg Whites (1 serving)", calories: 272, protein: 33, carbs: 10, fat: 6 },
  ],
  "2026-08-03": [
    { id: 378, time: "morning", item: "Beyond Good 92% Pure Dark Chocolate (1 piece)", calories: 15, protein: 0, carbs: 1, fat: 1 },
    { id: 379, time: "morning", item: "Homemade pork wontons (9 pieces)", calories: 423, protein: 18, carbs: 36, fat: 18 },
    { id: 380, time: "morning", item: "Siggi's vanilla yogurt (100g)", calories: 71, protein: 11, carbs: 8, fat: 0 },
    { id: 381, time: "lunch", item: "Chicken breast (206.5g raw) + broccoli (128.7g) + curry sauce (140g used, most consumed) + half whole wheat naan (120 kcal)", calories: 562, protein: 57, carbs: 50, fat: 12 },
    { id: 382, time: "afternoon", item: "Yasso yogurt bar", calories: 80, protein: 4, carbs: 15, fat: 1 },
    { id: 383, time: "dinner", item: "Banana (~118g)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 384, time: "evening", item: "Smoothie: Lactaid Whole Milk (150g) + Frozen Mango chunks (50g) + Naked Whey Protein Powder (44g) + Wyman's Frozen Mixed Berries (50g)", calories: 340, protein: 30, carbs: 0, fat: 0 },
  ],
  "2026-08-02": [
    { id: 371, time: "morning", item: "Beyond Good 92% Pure Dark Chocolate (1 piece)", calories: 15, protein: 0, carbs: 1, fat: 1 },
    { id: 372, time: "morning", item: "Challah french toast: Gertel's raisin challah (~97g raw) cooked to 140g + half egg", calories: 305, protein: 7, carbs: 49, fat: 7 },
    { id: 373, time: "morning", item: "Blueberries (40g)", calories: 23, protein: 0, carbs: 6, fat: 0 },
    { id: 374, time: "lunch", item: "Homemade turkey chili (433g, ~30% of half recipe: ground turkey + kidney beans + tomatoes + onions + jalapeño + celery) + 15g cheddar + 3 tbsp reduced fat sour cream", calories: 588, protein: 48, carbs: 36, fat: 19 },
    { id: 375, time: "dinner", item: "Protein shake: Naked Whey (44g) + milk (100g) + Bob Evans Egg Whites (2 servings, 6 tbsp)", calories: 297, protein: 38, carbs: 8, fat: 6 },
    { id: 376, time: "dinner", item: "Siggi's vanilla yogurt (120g)", calories: 85, protein: 13, carbs: 9, fat: 0 },
    { id: 377, time: "dinner", item: "Banana (~118g)", calories: 105, protein: 1, carbs: 27, fat: 0 },
  ],
  "2026-08-01": [
    { id: 362, time: "morning", item: "Beyond Good 92% Pure Dark Chocolate (2 pieces)", calories: 30, protein: 1, carbs: 1, fat: 3 },
    { id: 363, time: "morning", item: "Siggi's vanilla yogurt (170g) + blueberries (61g) + honey (2g)", calories: 161, protein: 18, carbs: 23, fat: 0 },
    { id: 364, time: "morning", item: "Banana (~118g)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 365, time: "lunch", item: "Sweetgreen kale Caesar salad (roasted chicken + tomatoes + parmesan + kale + romaine)", calories: 510, protein: 41, carbs: 30, fat: 22 },
    { id: 366, time: "lunch", item: "Extra roasted tofu (1 cup, ~150g)", calories: 160, protein: 14, carbs: 5, fat: 9 },
    { id: 367, time: "lunch", item: "Hibiscus berry tea", calories: 45, protein: 0, carbs: 11, fat: 0 },
    { id: 369, time: "morning", item: "Yellow nectarine (172g)", calories: 75, protein: 1, carbs: 18, fat: 0 },
    { id: 370, time: "dinner", item: "Mashawy mixed grill platter - Ayat Bushwick (shared, half meat): chicken thighs ~150g + beef kofta ~100g + lamb ~75g + small bites rice ~40g + most of salad", calories: 735, protein: 58, carbs: 20, fat: 35 },
  ],
  "2026-07-31": [
    { id: 356, time: "morning", item: "Chocolove 70% Dark Chocolate (3 pieces)", calories: 75, protein: 3, carbs: 7, fat: 4 },
    { id: 357, time: "morning", item: "1 egg + Bob Evans Egg Whites (1 serving) + avocado (1 whole, ~150g) + Bob Evans sausage patty (2)", calories: 545, protein: 28, carbs: 16, fat: 44 },
    { id: 358, time: "morning", item: "Siggi's vanilla yogurt (120g) + blueberries (30g)", calories: 102, protein: 13, carbs: 12, fat: 0 },
    { id: 359, time: "lunch", item: "Tom yum soup with chicken (2 containers, ate chicken ~140g + veg, left broth) + mixed rice (100g)", calories: 391, protein: 47, carbs: 34, fat: 5 },
    { id: 360, time: "dinner", item: "Protein shake: Naked Whey (44g) + milk (100g) + Bob Evans Egg Whites (1 serving, 3 tbsp)", calories: 272, protein: 33, carbs: 10, fat: 6 },
    { id: 361, time: "dinner", item: "Grilled chicken sandwich on ciabatta (no bacon, 1/4 bread): chicken ~150g + avocado ~40g + tomato + lettuce + onion", calories: 372, protein: 48, carbs: 10, fat: 14 },
    { id: 368, time: "dinner", item: "Yellow nectarine (172g)", calories: 75, protein: 1, carbs: 18, fat: 0 },
  ],
  "2026-07-30": [
    { id: 350, time: "morning", item: "Challah french toast: Gertel's raisin challah (~66g raw) cooked to 89g + butter (~5g)", calories: 250, protein: 5, carbs: 38, fat: 9 },
    { id: 351, time: "morning", item: "Eggs: 1.5 eggs + Bob Evans Egg Whites (164g raw) cooked to 237g", calories: 230, protein: 27, carbs: 0, fat: 8 },
    { id: 352, time: "morning", item: "Avocado (1 whole, ~150g edible)", calories: 240, protein: 3, carbs: 14, fat: 23 },
    { id: 353, time: "lunch", item: "青椒肉丝 (pork 134g cooked + green peppers ~100g + oil ~12g + soy sauce + oyster sauce + starch) + mixed rice (180g)", calories: 637, protein: 44, carbs: 68, fat: 21 },
    { id: 354, time: "dinner", item: "Fresh summer rolls (2 rolls, 174g)", calories: 190, protein: 8, carbs: 33, fat: 4 },
    { id: 355, time: "dinner", item: "Protein shake: Naked Whey (44g) + milk (140g) + Bob Evans Egg Whites (1 serving, 3 tbsp)", calories: 298, protein: 35, carbs: 12, fat: 8 },
  ],
  "2026-07-29": [
    { id: 346, time: "morning", item: "Homemade pork wonton (9 pieces)", calories: 423, protein: 18, carbs: 35, fat: 24 },
    { id: 347, time: "morning", item: "Chocolove 70% Dark Chocolate (3 pieces)", calories: 75, protein: 3, carbs: 7, fat: 4 },
    { id: 348, time: "lunch", item: "Curry bowl: Ottogi 3 Min Spicy Curry Sauce (1 pouch) + mixed rice (150g) + mixed veg cooked (100g) + chicken breast cooked (155g)", calories: 641, protein: 57, carbs: 71, fat: 11 },
    { id: 349, time: "dinner", item: "Smoothie: banana (112g) + milk (110g) + Naked Whey (44g) + Daisy cottage cheese (100g) + frozen mango (42g)", calories: 459, protein: 42, carbs: 48, fat: 9 },
  ],
  "2026-07-28": [
    { id: 341, time: "morning", item: "Challah french toast: Gertel's raisin challah (115g) + 1/2 egg + butter (~4g)", calories: 393, protein: 7, carbs: 66, fat: 9 },
    { id: 342, time: "morning", item: "Blueberries (3/4 cup, ~110g) + avocado (half, ~75g)", calories: 183, protein: 3, carbs: 22, fat: 11 },
    { id: 343, time: "lunch", item: "Sirloin steak (9 oz / 255g raw, ~180g cooked)", calories: 420, protein: 56, carbs: 0, fat: 18 },
    { id: 344, time: "dinner", item: "Protein shake: Naked Whey (44g) + milk (100g) + Bob Evans Egg Whites (4 servings, 12 tbsp)", calories: 347, protein: 48, carbs: 9, fat: 6 },
    { id: 345, time: "dinner", item: "LesserEvil White Cheddar Popcorn (1 cup)", calories: 40, protein: 1, carbs: 4, fat: 2 },
  ],
  "2026-07-27": [
    { id: 335, time: "morning", item: "Chocolove 70% Dark Chocolate (2 pieces)", calories: 50, protein: 2, carbs: 5, fat: 4 },
    { id: 336, time: "morning", item: "Homemade pork wonton (9 pieces)", calories: 423, protein: 18, carbs: 35, fat: 24 },
    { id: 337, time: "lunch", item: "Kimchi udon (1/4 noodles + full broth) + 1 egg + shrimp (139g) + 虾滑 (24g) + 牛肩肉片 (100g)", calories: 578, protein: 62, carbs: 21, fat: 20 },
    { id: 338, time: "lunch", item: "LesserEvil White Cheddar Popcorn (1 cup)", calories: 40, protein: 1, carbs: 4, fat: 2 },
    { id: 339, time: "dinner", item: "Peruvian rotisserie chicken (1/4 bird, ~200g edible, est.)", calories: 400, protein: 45, carbs: 0, fat: 22 },
    { id: 340, time: "dinner", item: "LesserEvil White Cheddar Popcorn (1 cup)", calories: 40, protein: 1, carbs: 4, fat: 2 },
  ],
  "2026-07-26": [
    { id: 332, time: "morning", item: "Hashbrown (108g) + 1 egg + Bob Evans Egg Whites (1 serving) + avocado (half, ~75g) + Bob Evans sausage patty (2)", calories: 514, protein: 30, carbs: 26, fat: 34 },
    { id: 333, time: "lunch", item: "Pasta: Eataly tagliatelle (126g raw) + Eataly bolognese sauce (110g) + homemade turkey meatballs (4)", calories: 621, protein: 42, carbs: 58, fat: 24 },
    { id: 334, time: "dinner", item: "Protein shake: Naked Whey (44g) + milk (100g) + Bob Evans Egg Whites (2 servings, 6 tbsp) + deli turkey (1 slice, ~28g)", calories: 327, protein: 43, carbs: 11, fat: 7 },
  ],
  "2026-07-25": [
    { id: 327, time: "morning", item: "Cafe yogurt bowl: whole milk plain yogurt (~160g) + blueberries (~60g) + honey (1 cup total, est.)", calories: 140, protein: 6, carbs: 19, fat: 5 },
    { id: 328, time: "lunch", item: "Sweetgreen Summer Market Bowl (3/4 portion)", calories: 548, protein: 36, carbs: 64, fat: 15 },
    { id: 329, time: "lunch", item: "Figo pistachio gelato (1 scoop)", calories: 230, protein: 4, carbs: 28, fat: 11 },
    { id: 330, time: "dinner", item: "Blue Collar crispy chicken tenders (240g, est.)", calories: 610, protein: 43, carbs: 29, fat: 36 },
    { id: 331, time: "dinner", item: "Protein shake: Naked Whey (44g) + milk (120g) + Bob Evans Egg Whites (1 serving, 3 tbsp)", calories: 285, protein: 34, carbs: 11, fat: 7 },
  ],
  "2026-07-24": [
    { id: 323, time: "morning", item: "Siggi's vanilla yogurt (100g) + blueberries (50g) + honey (1.8g)", calories: 106, protein: 11, carbs: 16, fat: 0 },
    { id: 324, time: "lunch", item: "Nene's Taqueria birria burrito: birria beef + flour tortilla + rice + beans + guacamole + cheese + sour cream + pico de gallo (est.)", calories: 880, protein: 47, carbs: 85, fat: 37 },
    { id: 325, time: "dinner", item: "Small salmon + tuna + avocado poke bowl (rice, fish ~120g, avocado ~40g, sauces, est.)", calories: 450, protein: 30, carbs: 43, fat: 16 },
    { id: 326, time: "dinner", item: "Ice cream (3/4 cup)", calories: 200, protein: 3, carbs: 26, fat: 11 },
  ],
  "2026-07-23": [
    { id: 316, time: "morning", item: "Omelette: mushroom (68.8g) + onion (74.3g) + SPAM (22.4g) + 1 egg + Bob Evans Egg Whites (60g)", calories: 220, protein: 19, carbs: 9, fat: 11 },
    { id: 317, time: "morning", item: "Avocado (112.6g)", calories: 180, protein: 2, carbs: 10, fat: 17 },
    { id: 318, time: "morning", item: "Tropicana OJ (111g)", calories: 51, protein: 1, carbs: 12, fat: 0 },
    { id: 319, time: "morning", item: "Matcha latte: matcha powder (1 tsp) + milk (100g)", calories: 72, protein: 3, carbs: 6, fat: 3 },
    { id: 320, time: "morning", item: "Chocolove 70% Dark Chocolate (2 pieces)", calories: 50, protein: 2, carbs: 5, fat: 4 },
    { id: 321, time: "lunch", item: "Salad: shrimp (135g) + cherry tomatoes (171g) + lettuce (213g) + corn (128g) + pan grilled chicken thigh (86g) + EVOO (14g) + mint (1g)", calories: 583, protein: 63, carbs: 37, fat: 23 },
    { id: 322, time: "dinner", item: "Hot pot: angus beef (~70g) + 龙利鱼片 (~80g) + 潮州鱼丸 (2) + 响铃卷 (3) + 菠菜 (~50g)", calories: 390, protein: 43, carbs: 15, fat: 17 },
  ],
  "2026-07-22": [
    { id: 312, time: "morning", item: "Homemade pork wonton (9 pieces)", calories: 423, protein: 18, carbs: 35, fat: 24 },
    { id: 313, time: "lunch", item: "Turkey meatballs (3.5) + Rao's marinara (~1/2 cup) + sourdough (2 slices, ~104g)", calories: 620, protein: 32, carbs: 78, fat: 18 },
    { id: 314, time: "lunch", item: "Chocolove 70% Dark Chocolate (2 pieces)", calories: 50, protein: 2, carbs: 5, fat: 4 },
    { id: 315, time: "dinner", item: "Protein shake: Naked Whey (44g) + milk (120g) + Bob Evans Egg Whites (3 servings, 9 tbsp)", calories: 335, protein: 44, carbs: 11, fat: 7 },
  ],
  "2026-07-21": [
    { id: 307, time: "morning", item: "Blueberry toast: sourdough (52.9g toasted) + butter (1/2 tbsp) + Daisy cottage cheese (142g) + blueberries (55g) + honey (1.7g)", calories: 343, protein: 21, carbs: 42, fat: 10 },
    { id: 308, time: "morning", item: "Chocolove 70% Dark Chocolate (2 pieces)", calories: 50, protein: 2, carbs: 5, fat: 4 },
    { id: 309, time: "lunch", item: "Sourdough turkey sandwich: sourdough (108.8g) + provolone 2 slices (56g) + lettuce (55g) + turkey breast (121g)", calories: 625, protein: 46, carbs: 60, fat: 19 },
    { id: 310, time: "dinner", item: "Pulmuone Kimchi Pork Mandu (4 pieces)", calories: 320, protein: 12, carbs: 36, fat: 10 },
    { id: 311, time: "dinner", item: "Protein shake: Naked Whey (44g) + milk (120g) + Bob Evans Egg Whites (6 tbsp)", calories: 310, protein: 39, carbs: 11, fat: 7 },
  ],
  "2026-07-20": [
    { id: 302, time: "morning", item: "Bob Evans sausage patties (2) + frozen hash browns (85g) + sunny side up eggs (2)", calories: 420, protein: 28, carbs: 16, fat: 28 },
    { id: 303, time: "morning", item: "Tropicana OJ (1 cup, 240mL)", calories: 110, protein: 2, carbs: 26, fat: 0 },
    { id: 304, time: "midday", item: "Salad: cucumber (213g) + corn (110g) + cherry tomatoes (280g) + shrimp (92g) + pan-grilled chicken thigh (134.6g) + EVOO (5g) + mint (2g)", calories: 553, protein: 54, carbs: 40, fat: 21 },
    { id: 305, time: "evening", item: "Protein shake: Naked Whey (44g) + Lactaid whole milk (120g) + Bob Evans Egg Whites (4 tbsp, ~61g)", calories: 293, protein: 36, carbs: 9, fat: 7 },
    { id: 306, time: "evening", item: "Prosciutto & provolone roll (half)", calories: 67, protein: 6, carbs: 0, fat: 5 },
  ],
  "2026-07-19": [
    { id: 299, time: "morning", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 300, time: "midday", item: "Dim sum: 2 huge fishballs + half serving 豉汁蒸排骨 (black bean steamed pork ribs) + 2 腐皮卷 (fried bean curd rolls) + 1 huge fried shrimp ball + half 流沙包 (salted egg custard bun) + jasmine milk tea (110 cal)", calories: 685, protein: 35, carbs: 56, fat: 33 },
    { id: 301, time: "evening", item: "Indian: rice (half takeout container, ~1 cup cooked) + chicken tikka masala (half serving, 4 pieces chicken) + samosa (1) + aloo papri chaat (1/2 cup)", calories: 846, protein: 38, carbs: 95, fat: 30 },
  ],
  "2026-07-18": [
    { id: 294, time: "morning", item: "Smoothie: Siggi's vanilla yogurt (75g) + frozen mango (20g) + frozen mixed berries (10g) + Lactaid whole milk (200g) + Naked Whey protein powder (44g) + banana (1 medium)", calories: 489, protein: 41, carbs: 50, fat: 10 },
    { id: 297, time: "midday", item: "BBQ: pork ribs (2 pieces, 6\" each, ~100g meat) + beef brisket (1.5 pieces, 6\" each, ~180g)", calories: 730, protein: 69, carbs: 3, fat: 49 },
    { id: 298, time: "evening", item: "Salad: cherry tomatoes (~150g) + cucumber (138g) + corn (100g) + fresh mint + EVOO (1 tbsp)", calories: 256, protein: 5, carbs: 30, fat: 15 },
  ],
  "2026-07-17": [
    { id: 290, time: "morning", item: "Shakshuka with feta (NYT recipe, half portion): 4 eggs total in dish, 28oz canned tomatoes, 1/4 cup feta (~33g), 1 onion, 1 red bell pepper, 3 tbsp EVOO, spices", calories: 500, protein: 19, carbs: 33, fat: 33 },
    { id: 291, time: "morning", item: "Toasted baguette (4 slices, ~120g)", calories: 325, protein: 11, carbs: 64, fat: 1 },
    { id: 292, time: "midday", item: "Pulmuone Kimchi Pork Mandu (3 pieces) + Wei Chuan Pork Bun (3 buns)", calories: 780, protein: 24, carbs: 99, fat: 30 },
    { id: 293, time: "afternoon", item: "Ice cream (~100 cal)", calories: 100, protein: 1, carbs: 12, fat: 5 },
    { id: 295, time: "evening", item: "Thin-crust Margherita pizza with pepperoni (2 slices, handmade)", calories: 460, protein: 20, carbs: 44, fat: 18 },
    { id: 296, time: "evening", item: "LesserEvil White Cheddar Popcorn (1 cup)", calories: 40, protein: 1, carbs: 5, fat: 2 },
  ],
  "2026-07-16": [
    { id: 286, time: "morning", item: "Egg sandwich: Martin's Potato Bun + 2 eggs + cheese (1 slice, ~20g) + Spam (1 slice, ~28g)", calories: 430, protein: 26, carbs: 27, fat: 24 },
    { id: 287, time: "morning", item: "Matcha latte (111g Lactaid whole milk) + Chocolove 70% (2 pieces)", calories: 130, protein: 6, carbs: 11, fat: 8 },
    { id: 288, time: "midday", item: "Pan-grilled salmon fillet (medium, ~140g raw) + mixed rice (1.5 cups cooked) + arugula (38g) + feta (25g) + EVOO dressing (~1 tbsp)", calories: 755, protein: 40, carbs: 70, fat: 33 },
    { id: 289, time: "afternoon", item: "Protein shake: Naked Whey (44g) + Lactaid whole milk (122g)", calories: 261, protein: 29, carbs: 9, fat: 7 },
  ],
  "2026-07-10": [
    { id: 260, time: "morning", item: "Challah french toast (3 slices) + blueberries (1/2 cup, 75g) + Bob Evans sausage patties (2) + Chocolove 70% (2 pieces)", calories: 753, protein: 34, carbs: 67, fat: 34 },
    { id: 261, time: "midday", item: "青椒肉丝 (shredded pork 150g + green pepper ~100g, stir-fried) + 米饭 (180g cooked white rice)", calories: 610, protein: 33, carbs: 58, fat: 21 },
    { id: 262, time: "evening", item: "Protein shake: Naked Whey (44g) + Lactaid whole milk (150g)", calories: 280, protein: 30, carbs: 13, fat: 6 },
    { id: 263, time: "evening", item: "Banana (1 medium) + mozzarella (1 slice, ~28g) + deli turkey (3 slices, ~75g)", calories: 260, protein: 22, carbs: 28, fat: 6 },
  ],
  "2026-07-15": [
    { id: 282, time: "morning", item: "Omelette (2 eggs + spam ~40g + jalapeño ~20g + red onion ~50g + mushroom ~52g, total toppings 162g + 1 tbsp veg oil)", calories: 427, protein: 20, carbs: 6, fat: 36 },
    { id: 283, time: "morning", item: "Banana (1 medium) + Chocolove 70% (2 pieces)", calories: 155, protein: 3, carbs: 37, fat: 4 },
    { id: 284, time: "midday", item: "Chicken breast (150g raw) + Ottogi curry sauce (1 pouch) + mixed vegetables (3/4 cup, ~115g) + mixed rice (1.5 cups cooked)", calories: 553, protein: 45, carbs: 55, fat: 8 },
    { id: 285, time: "evening", item: "Sloppy Joe (1/2 cup cooked meat from 1lb 80% pork + full can sauce, Martin's Potato Bun, cheddar ~7g) + Idahoan mashed potato (100g prepared)", calories: 440, protein: 23, carbs: 52, fat: 16 },
  ],
  "2026-07-14": [
    { id: 276, time: "morning", item: "Omelette (2 eggs + spam ~40g + jalapeño ~20g + red onion ~50g + mushroom ~52g, total toppings 162g + 1 tbsp veg oil)", calories: 427, protein: 20, carbs: 6, fat: 36 },
    { id: 277, time: "morning", item: "Tropicana 100% OJ (83g)", calories: 38, protein: 1, carbs: 9, fat: 0 },
    { id: 278, time: "afternoon", item: "LesserEvil White Cheddar Popcorn (1 cup) + Chocolove 70% (2 pieces)", calories: 90, protein: 3, carbs: 14, fat: 6 },
    { id: 279, time: "midday", item: "Turkey sandwich on baguette (baguette ~140g + deli turkey ~110g + mozzarella 2 slices ~56g + arugula ~65g, total 371g)", calories: 672, protein: 48, carbs: 48, fat: 22 },
    { id: 280, time: "evening", item: "Deli turkey (~100g)", calories: 100, protein: 20, carbs: 2, fat: 1 },
    { id: 281, time: "evening", item: "Protein shake: Naked Whey (44g) + Lactaid whole milk (150g) + LesserEvil White Cheddar Popcorn (1 cup)", calories: 320, protein: 31, carbs: 24, fat: 7 },
  ],
  "2026-07-13": [
    { id: 271, time: "morning", item: "Everything bagel (120g) + cream cheese (3 tbsp)", calories: 489, protein: 15, carbs: 66, fat: 17 },
    { id: 272, time: "morning", item: "Green juice 16oz (cucumber, apple, spinach, kale) + croissant", calories: 390, protein: 8, carbs: 52, fat: 12 },
    { id: 274, time: "morning", item: "Small citrus cake (~1×1×3 inch slice)", calories: 130, protein: 2, carbs: 20, fat: 5 },
    { id: 275, time: "afternoon", item: "LesserEvil White Cheddar Popcorn (1 cup) + banana (3/4)", calories: 120, protein: 2, carbs: 24, fat: 2 },
    { id: 273, time: "evening", item: "Sirloin steak (1, 170g/6oz) + broccoli (1 cup, ~90g)", calories: 370, protein: 39, carbs: 8, fat: 18 },
  ],
  "2026-07-12": [
    { id: 267, time: "morning", item: "Everything bagel (120g) + cream cheese (3 tbsp)", calories: 489, protein: 15, carbs: 66, fat: 17 },
    { id: 268, time: "midday", item: "Pulmuone Kimchi Hotpot Udon (1 packet) + 潮汕牛肉丸 (4 pieces, ~72g) + 虾仁 (37.2g frozen) + 2 eggs", calories: 677, protein: 42, carbs: 52, fat: 18 },
    { id: 269, time: "afternoon", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 270, time: "evening", item: "Protein shake: Naked Whey (37.2g) + Lactaid whole milk (100g)", calories: 219, protein: 24, carbs: 10, fat: 5 },
  ],
  "2026-07-11": [
    { id: 264, time: "morning", item: "Chocolove 70% (2 pieces) + challah french toast (265g cooked, 1 egg + butter) + blueberries (30g)", calories: 677, protein: 20, carbs: 88, fat: 24 },
    { id: 265, time: "midday", item: "Half 'Not a Margarita' drink + 双拼饭 (豉油鸡 ~100g + 叉烧 ~80g + 米饭 ~200g cooked)", calories: 730, protein: 36, carbs: 68, fat: 24 },
    { id: 266, time: "evening", item: "Restaurant cheeseburger with lettuce & tomato (regular size)", calories: 700, protein: 38, carbs: 44, fat: 36 },
  ],
  "2026-07-09": [
    { id: 255, time: "morning", item: "Chocolove 70% Dark Chocolate (2 pieces)", calories: 50, protein: 1, carbs: 5, fat: 4 },
    { id: 256, time: "morning", item: "Siggi's Vanilla yogurt (180g) + blueberries (58g) + honey (1/2 tsp)", calories: 171, protein: 19, carbs: 25, fat: 0 },
    { id: 257, time: "morning", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 258, time: "midday", item: "Drunken noodles with chicken (lunch special) + small side salad", calories: 470, protein: 26, carbs: 58, fat: 13 },
    { id: 259, time: "evening", item: "Fried rice with 1.5 eggs + Spam (~50g) + mixed veggies (~350g total)", calories: 540, protein: 15, carbs: 58, fat: 20 },
  ],
  "2026-07-08": [
    { id: 249, time: "morning", item: "Chocolove 70% Dark Chocolate (2 pieces) + 2 eggs + Spam (1 slice) + white bread (3/4 slice)", calories: 325, protein: 19, carbs: 17, fat: 22 },
    { id: 250, time: "midday", item: "TJ's Chicken Tikka Masala (1 tray, 241g) + broccoli (50g)", calories: 377, protein: 23, carbs: 42, fat: 14 },
    { id: 251, time: "afternoon", item: "LesserEvil White Cheddar Popcorn (2 cups)", calories: 80, protein: 1, carbs: 9, fat: 5 },
    { id: 252, time: "evening", item: "Homemade turkey meatballs (5.5 pieces) + Carbone marinara sauce (1 serving) + broccoli (50g)", calories: 492, protein: 33, carbs: 18, fat: 12 },
    { id: 253, time: "evening", item: "Protein shake: Naked Whey (44g) + Lactaid whole milk (120g)", calories: 260, protein: 29, carbs: 8, fat: 5 },
    { id: 254, time: "evening", item: "Watermelon (3 slices, 1/8 of 8.5lb melon, ~290g flesh)", calories: 90, protein: 2, carbs: 22, fat: 0 },
  ],
  "2026-07-07": [
    { id: 246, time: "morning", item: "Chocolove 70% Dark Chocolate (2 pieces) + matcha latte (100g milk) + homemade pork wontons (6 pieces) + 2 eggs", calories: 562, protein: 28, carbs: 43, fat: 24 },
    { id: 247, time: "midday", item: "Grilled chicken pita sandwich with tzatziki", calories: 415, protein: 43, carbs: 39, fat: 8 },
    { id: 248, time: "evening", item: "Smoothie: Naked Whey 44g + milk 120g + frozen mango 50g + frozen berries 50g + chia seeds 1 tbsp + cottage cheese 90g + almond butter 3/4 tbsp", calories: 524, protein: 43, carbs: 34, fat: 20 },
  ],
  "2026-07-06": [
    { id: 245, time: "morning", item: "Chocolove 70% Dark Chocolate (2 pieces)", calories: 50, protein: 1, carbs: 5, fat: 4 },
    { id: 246, time: "morning", item: "2 breakfast sausage links + 2 eggs + frozen hash browns (1/4 bag, ~1.5 servings/127g)", calories: 385, protein: 23, carbs: 26, fat: 20 },
    { id: 247, time: "midday", item: "Turkey sandwich (Aunt Millie's white bread 2 slices, turkey breast 144g, Muenster cheese 2 slices, Graza mayo 10g)", calories: 697, protein: 50, carbs: 55, fat: 26 },
  ],
  "2026-07-05": [
    { id: 241, time: "morning", item: "Omelette (2 eggs, 4 bella mushrooms, half small white onion, 1 slice Spam) + small matcha latte (100g milk)", calories: 356, protein: 21, carbs: 18, fat: 21 },
    { id: 242, time: "morning", item: "Chocolove 70% Dark Chocolate (2 pieces)", calories: 50, protein: 1, carbs: 5, fat: 4 },
    { id: 243, time: "midday", item: "传统牛肉面 (beef tendon noodle soup, hand-pulled noodles ~150g, beef tendon ~80g, radish, broth, chili oil) + 牛肉肉夹馍 (braised beef in Chinese flatbread)", calories: 910, protein: 49, carbs: 107, fat: 29 },
    { id: 244, time: "afternoon", item: "Fried yuca sticks (3 pieces, ~90g)", calories: 225, protein: 2, carbs: 38, fat: 8 },
  ],
  "2026-07-04": [
    { id: 238, time: "morning", item: "Banana + omelette (1.5 eggs, mushroom, onion, jalapeño, low-sodium Spam ~2 slices) + OJ (1 cup)", calories: 518, protein: 21, carbs: 62, fat: 21 },
    { id: 239, time: "midday", item: "Smoked brisket (1/2 lb / 227g) + chicharrón (1/4 lb / 113g)", calories: 1192, protein: 110, carbs: 0, fat: 80 },
    { id: 240, time: "afternoon", item: "Prosciutto + Muenster roll (1 roll: 1 prosciutto slice + 2 Muenster slices)", calories: 235, protein: 15, carbs: 0, fat: 19 },
  ],
  "2026-07-03": [
    { id: 235, time: "morning", item: "Smoothie: Lactaid milk 200g + Naked Whey 44g + frozen berries 20g + frozen mango 30g + chia seeds 1 tbsp + banana + cottage cheese 70g + almond butter 1 tbsp + acai puree 1 packet", calories: 730, protein: 47, carbs: 66, fat: 29 },
    { id: 236, time: "midday", item: "Zaru udon + 2 shrimp tempura + pistachio gelato (1 scoop)", calories: 640, protein: 21, carbs: 96, fat: 18 },
    { id: 237, time: "evening", item: "Prosciutto + Muenster rolls (2 rolls: 1 prosciutto slice + 2 Muenster slices each)", calories: 470, protein: 30, carbs: 0, fat: 37 },
  ],
  "2026-07-02": [
    { id: 231, time: "morning", item: "Chocolove 70% Dark Chocolate (2 pieces) + banana (1 medium)", calories: 155, protein: 2, carbs: 32, fat: 4 },
    { id: 232, time: "morning", item: "Homemade pork wontons (6 pieces) + 2 eggs", calories: 422, protein: 24, carbs: 31, fat: 17 },
    { id: 233, time: "midday", item: "Sushi: eel maki (5 pcs) + salmon nigiri (2 pcs) + tuna nigiri (3 pcs) + spicy tuna roll (~5 pcs) + avocado cream cheese roll (2 pcs)", calories: 815, protein: 38, carbs: 94, fat: 23 },
    { id: 234, time: "evening", item: "Beef banh mi", calories: 620, protein: 28, carbs: 65, fat: 22 },
  ],
  "2026-07-01": [
    { id: 228, time: "morning", item: "Challah French toast (2 slices, ~100g challah, 2 eggs, 1 tsp butter) + Chocolove 70% Dark Chocolate (2 pieces)", calories: 494, protein: 21, carbs: 51, fat: 27 },
    { id: 229, time: "midday", item: "Bibimbap: mixed rice with lima beans (220g) + 肥牛 (133g) + onion, corn, sweet potato, mushrooms + gochujang + 1 sunny side egg", calories: 860, protein: 34, carbs: 89, fat: 39 },
    { id: 230, time: "afternoon", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
  ],
  "2026-06-30": [
    { id: 227, time: "morning", item: "Bob Evans Original Pork Sausage Patty (2) + frozen hash browns (1/4 bag, ~149g/1.75 servings) + Chocolove 70% Dark Chocolate (2 pieces)", calories: 383, protein: 19, carbs: 31, fat: 26 },
    { id: 228, time: "midday", item: "Sirloin steak (1, 170g/6oz)", calories: 320, protein: 35, carbs: 0, fat: 18 },
    { id: 229, time: "afternoon", item: "Protein shake (Naked Whey 1 serving, Lactaid whole milk 150g)", calories: 280, protein: 30, carbs: 21, fat: 9 },
    { id: 230, time: "afternoon", item: "McDonald's Chicken McNuggets (2)", calories: 94, protein: 5, carbs: 6, fat: 6 },
  ],
  "2026-06-29": [
    { id: 222, time: "morning", item: "Chocolove 70% Dark Chocolate (2 pieces)", calories: 50, protein: 1, carbs: 5, fat: 4 },
    { id: 223, time: "morning", item: "Homemade pork wontons (7 pieces)", calories: 329, protein: 14, carbs: 35, fat: 12 },
    { id: 224, time: "midday", item: "Big salad (6 shrimp, tomato, feta ~30g, red onion, kale, corn, cucumber, half avocado) + EVOO ~1 tbsp dressing", calories: 570, protein: 30, carbs: 44, fat: 33 },
    { id: 225, time: "afternoon", item: "Banana (1 medium) + 烤鱼片 original (1/3 package, ~33g)", calories: 215, protein: 19, carbs: 30, fat: 2 },
    { id: 226, time: "evening", item: "1/4 Peruvian chicken with small yellow rice and beans", calories: 580, protein: 48, carbs: 48, fat: 22 },
  ],
  "2026-06-28": [
    { id: 223, time: "morning", item: "Challah French toast (177g Gertel's raisin challah, 1/2 egg, 1 tbsp butter) + blueberries (30g)", calories: 659, protein: 10, carbs: 106, fat: 20 },
    { id: 224, time: "morning", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 225, time: "midday", item: "Bibimbap half portion (肥牛卷 76g, red onion 75g, mushrooms 75g, roasted sweet potato 100g, kale 50g, mixed rice+lima beans ~3/4 cup, bibimbap sauce 1 tbsp) + 1 sunny side egg", calories: 641, protein: 33, carbs: 76, fat: 23 },
  ],
  "2026-06-27": [
    { id: 215, time: "morning", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 216, time: "afternoon", item: "Veggie sticks (celery, carrots, cucumber, ~1 cup) + hummus (~2 tbsp)", calories: 105, protein: 3, carbs: 13, fat: 5 },
    { id: 217, time: "evening", item: "Buffalo chicken wings (6, restaurant-style, fried with buffalo sauce)", calories: 660, protein: 42, carbs: 12, fat: 42 },
    { id: 218, time: "evening", item: "Reuben sandwich (~1/3 portion)", calories: 200, protein: 12, carbs: 18, fat: 8 },
    { id: 219, time: "evening", item: "Pulmuone Kimchi Pork Mandu (4 pieces)", calories: 320, protein: 12, carbs: 44, fat: 12 },
    { id: 220, time: "evening", item: "Lactaid Whole Milk (1 cup / 240ml)", calories: 160, protein: 8, carbs: 12, fat: 8 },
    { id: 221, time: "evening", item: "Cocojune Organic Coconut Yogurt (1 serving, 114g)", calories: 180, protein: 2, carbs: 13, fat: 14 },
    { id: 222, time: "evening", item: "烤鱼片 original (1/3 bag, ~33g/1.65 servings)", calories: 110, protein: 11, carbs: 13, fat: 1 },
  ],
  "2026-06-26": [
    { id: 210, time: "morning", item: "Challah French toast (90g Gertel's raisin challah, 2 eggs, 1 tsp butter)", calories: 431, protein: 15, carbs: 52, fat: 17 },
    { id: 212, time: "afternoon", item: "Fresh mango (~100g, other half from yesterday)", calories: 60, protein: 1, carbs: 15, fat: 0 },
    { id: 213, time: "afternoon", item: "TJ's prosciutto-wrapped mozzarella (2 sticks)", calories: 160, protein: 12, carbs: 2, fat: 12 },
    { id: 214, time: "midday", item: "Homemade marinara pizza 1/3 (TJ pizza dough 1/3, BelGioioso fresh mozzarella 1/3 ball, Carbone marinara ~2/3 tbsp, basil)", calories: 564, protein: 24, carbs: 71, fat: 19 },
  ],
  "2026-06-25": [
    { id: 205, time: "morning", item: "Bob Evans sausage patties (2) + 2 eggs + blueberries (1/4 cup) + Chocolove 70% dark chocolate (2 pieces)", calories: 421, protein: 27, carbs: 8, fat: 33 },
    { id: 206, time: "midday", item: "Pan-grilled chicken breast (medium, ~170g) + 9 asparagus spears", calories: 365, protein: 55, carbs: 7, fat: 10 },
    { id: 207, time: "afternoon", item: "烤鱼片 original (1 of 3 pieces, ~33g/1.65 servings) + TJ's prosciutto-wrapped mozzarella (1 stick) + yellow dip 1 tbsp + green dip (pimento cheese) 1 tbsp + 3 strawberries", calories: 255, protein: 17, carbs: 20, fat: 11 },
    { id: 208, time: "evening", item: "TJ's prosciutto-wrapped mozzarella (1 stick) + Cocojune Organic Coconut Yogurt (1 serving, 114g) + fresh mango (~100g)", calories: 290, protein: 7, carbs: 24, fat: 21 },
    { id: 209, time: "evening", item: "Protein shake (Naked Whey 1 serving, Lactaid whole milk 150g)", calories: 280, protein: 30, carbs: 21, fat: 9 },
  ],
  "2026-06-24": [
    { id: 199, time: "morning", item: "Homemade pork wontons (7 pieces) + hard boiled eggs (2)", calories: 469, protein: 26, carbs: 24, fat: 17 },
    { id: 200, time: "morning", item: "Watermelon (73g)", calories: 22, protein: 0, carbs: 5, fat: 0 },
    { id: 201, time: "morning", item: "Chocolove 70% Dark Chocolate (2 pieces)", calories: 50, protein: 1, carbs: 5, fat: 4 },
    { id: 202, time: "midday", item: "Homemade turkey meatballs (7 pieces) + Carbone marinara sauce (125g)", calories: 590, protein: 43, carbs: 35, fat: 32 },
    { id: 203, time: "evening", item: "Protein shake (Naked Whey 44g, Lactaid whole milk 150g)", calories: 280, protein: 30, carbs: 21, fat: 9 },
    { id: 204, time: "evening", item: "Satay chicken skewers (6 skewers, ~2-3 pieces each) with a little peanut sauce", calories: 450, protein: 38, carbs: 4, fat: 26 },
  ],
  "2026-06-23": [
    { id: 195, time: "morning", item: "Dim sum: 2 糯米烧卖 duck yolk sticky rice siu mai, 2 小笼包, 2 eggs, 1 虾饺, 1 虾烧卖", calories: 745, protein: 38, carbs: 72, fat: 33 },
    { id: 197, time: "morning", item: "Matcha latte (Lactaid whole milk 100g)", calories: 72, protein: 3, carbs: 6, fat: 3 },
    { id: 196, time: "midday", item: "Pulmuone Kimchi Hotpot Udon (1 packet) + 潮汕牛肉丸 50g + 肥牛 140g + 冻豆腐 73g + 虾滑 21g (all frozen weight)", calories: 764, protein: 43, carbs: 79, fat: 28 },
    { id: 198, time: "evening", item: "Protein shake (Naked Whey 44g, Lactaid whole milk 150g)", calories: 280, protein: 30, carbs: 21, fat: 9 },
  ],
  "2026-06-22": [
    { id: 190, time: "morning", item: "Homemade pancakes (1/3 recipe: flour, egg, Lactaid milk, baking powder) + 2 breakfast sausage links", calories: 409, protein: 17, carbs: 36, fat: 21 },
    { id: 191, time: "midday", item: "Mixed white & brown rice with lima beans (160g cooked) + Ottogi 3 Min Spicy Curry Sauce (half pouch, 95g) + chicken thighs (225g cooked)", calories: 740, protein: 46, carbs: 50, fat: 33 },
    { id: 192, time: "afternoon", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 193, time: "evening", item: "Salad (corn 250g, shrimp 85g, feta 27g, tomato 250g, EVOO 17g)", calories: 565, protein: 34, carbs: 59, fat: 28 },
    { id: 194, time: "evening", item: "Cocojune Organic Coconut Yogurt (50g)", calories: 79, protein: 1, carbs: 4, fat: 7 },
  ],
  "2026-06-21": [
    { id: 185, time: "morning", item: "Chocolove 65% Dark Chocolate (3 pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 186, time: "midday", item: "Egg, cheese & avocado ciabatta sandwich (ciabatta roll, 1 fried egg, 1 slice melted cheese, ~1/4 avocado) + Tropicana OJ (8 fl oz)", calories: 610, protein: 24, carbs: 79, fat: 23 },
    { id: 187, time: "afternoon", item: "Cocojune Organic Coconut Yogurt (50g)", calories: 79, protein: 1, carbs: 4, fat: 7 },
    { id: 188, time: "evening", item: "Tomato, corn, shrimp & feta salad with mint and EVOO (half portion; full: 419g tomato, 234g corn, 21.9g EVOO, 113g feta, 148.8g shrimp, 20g mint)", calories: 459, protein: 27, carbs: 32, fat: 26 },
    { id: 189, time: "evening", item: "Smoothie (Naked Whey 1 serving, Lactaid milk 300g, Daisy 2% cottage cheese 80g, frozen mixed berries 50g, frozen mango 50g, banana 1 medium)", calories: 609, protein: 45, carbs: 75, fat: 16 },
  ],
  "2026-06-20": [
    { id: 180, time: "morning", item: "Chocolove 65% Dark Chocolate (3 pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 181, time: "morning", item: "2.5 pop-up bagels with scallion cream cheese dip (~3 tbsp)", calories: 600, protein: 20, carbs: 98, fat: 12 },
    { id: 182, time: "midday", item: "Carrot-cucumber-apple-lemon-ginger juice + Sweetgreen Summer Market Bowl (spring mix + wild rice, sunflower seeds, cucumbers, roasted sweet potatoes, pickled onions, summer tomatoes, summer vegetable medley, feta, roasted chicken, pesto vinaigrette)", calories: 940, protein: 47, carbs: 92, fat: 40 },
    { id: 183, time: "afternoon", item: "Cocojune Organic Coconut Yogurt (60g)", calories: 95, protein: 1, carbs: 5, fat: 9 },
    { id: 184, time: "midday", item: "1/4 Peruvian chicken with small yellow rice and beans", calories: 580, protein: 48, carbs: 48, fat: 22 },
  ],
  "2026-06-19": [
    { id: 176, time: "morning", item: "Hash browns (170g/2 servings), 2 breakfast sausage links, 2 eggs", calories: 460, protein: 24, carbs: 31, fat: 26 },
    { id: 177, time: "morning", item: "Chocolove 65% Dark Chocolate (2 pieces)", calories: 100, protein: 1, carbs: 11, fat: 6 },
    { id: 178, time: "midday", item: "Pan-seared salmon (88g, half fillet), sautéed spinach (~100g cooked), mixed white & brown rice with lima beans (1 cup)", calories: 505, protein: 29, carbs: 63, fat: 14 },
    { id: 179, time: "evening", item: "冷面 bowl (noodles + broth/sauce, 2 shrimp, 2 small 酱牛肉, octopus & scallop pieces) + Hokkaido original cream puff", calories: 660, protein: 36, carbs: 86, fat: 18 },
  ],
  "2026-06-18": [
    { id: 171, time: "morning", item: "Sourdough toast (1 slice) with cottage cheese 40g, blueberries 40g, honey ~7g, and 2 eggs", calories: 343, protein: 21, carbs: 36, fat: 13 },
    { id: 173, time: "midday", item: "Shredded beef with green chili, cucumber salad (1/2), white rice (9/10)", calories: 560, protein: 32, carbs: 50, fat: 22 },
    { id: 172, time: "evening", item: "Dark chocolate (2 small pieces)", calories: 100, protein: 1, carbs: 11, fat: 6 },
    { id: 174, time: "evening", item: "Watermelon (~1 cup / 152g)", calories: 46, protein: 1, carbs: 11, fat: 0 },
    { id: 175, time: "evening", item: "Smoothie (Lactaid whole milk 200g, Naked Whey 44g, frozen mixed berries 25g, frozen mango 25g, banana, cottage cheese 170g)", calories: 612, protein: 52, carbs: 64, fat: 15 },
  ],
  "2026-06-17": [
    { id: 160, time: "morning", item: "Dark chocolate (3 small pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 161, time: "morning", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 162, time: "morning", item: "Handmade pork wontons (6 pieces)", calories: 280, protein: 13, carbs: 30, fat: 10 },
    { id: 163, time: "morning", item: "Hard boiled eggs (2)", calories: 156, protein: 12, carbs: 2, fat: 10 },
    { id: 164, time: "midday", item: "Pulmuone Kimchi Hotpot Udon (1 packet) with Chaoshan beef meatballs 潮汕牛肉丸 (50g frozen), frozen tofu 冻豆腐 (80g frozen), fatty beef slices 肥牛 (95g frozen)", calories: 760, protein: 39, carbs: 82, fat: 30 },
    { id: 165, time: "evening", item: "Prosciutto (2 slices)", calories: 70, protein: 6, carbs: 0, fat: 5 },
    { id: 166, time: "evening", item: "Provolone cheese (1 slice)", calories: 100, protein: 7, carbs: 0, fat: 8 },
    { id: 167, time: "evening", item: "Muenster cheese (1 slice)", calories: 100, protein: 6, carbs: 0, fat: 8 },
    { id: 168, time: "evening", item: "Kettle Brand BBQ potato chips (1 oz)", calories: 150, protein: 2, carbs: 18, fat: 8 },
    { id: 169, time: "afternoon", item: "Trail mix (2 servings, 1/4 cup/30g each)", calories: 280, protein: 4, carbs: 32, fat: 18 },
    { id: 170, time: "afternoon", item: "Honey coated turkey deli meat (2 slices)", calories: 60, protein: 6, carbs: 2, fat: 1 },
  ],
  "2026-06-16": [
    { id: 151, time: "morning", item: "Dark chocolate (3 small pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 152, time: "morning", item: "Sourdough toast with cottage cheese, blueberries & honey", calories: 147, protein: 8, carbs: 22, fat: 3 },
    { id: 153, time: "midday", item: "香菇滑鸡 Shiitake mushroom steamed chicken with small multi-grain rice", calories: 430, protein: 37, carbs: 38, fat: 15 },
    { id: 154, time: "evening", item: "Honey coated turkey deli meat (4 slices)", calories: 120, protein: 12, carbs: 4, fat: 2 },
    { id: 155, time: "evening", item: "Provolone cheese (2 slices)", calories: 200, protein: 14, carbs: 1, fat: 16 },
    { id: 156, time: "evening", item: "Prosciutto (2 slices)", calories: 70, protein: 6, carbs: 0, fat: 5 },
    { id: 157, time: "evening", item: "Protein shake (Naked Whey 1 serving/44g, Lactaid whole milk 200g/0.83 serving)", calories: 313, protein: 32, carbs: 24, fat: 10 },
    { id: 158, time: "evening", item: "Kettle Brand BBQ potato chips (1 oz)", calories: 150, protein: 2, carbs: 18, fat: 8 },
  ],
  "2026-06-15": [
    { id: 130, time: "midday", item: "8 turkey meatballs in marinara sauce (1/4 jar), 2 slices toasted sourdough bread", calories: 935, protein: 58, carbs: 77, fat: 53 },
    { id: 146, time: "morning", item: "Sourdough toast with cottage cheese, blueberries & honey", calories: 147, protein: 8, carbs: 22, fat: 3 },
    { id: 147, time: "morning", item: "Matcha latte (200ml, whole milk)", calories: 135, protein: 7, carbs: 13, fat: 6 },
    { id: 148, time: "morning", item: "Sunny side eggs (2) with leftover butter", calories: 150, protein: 12, carbs: 1, fat: 11 },
    { id: 149, time: "evening", item: "Protein shake (Naked Whey 1 serving/44g, Lactaid whole milk 200g/0.83 serving)", calories: 313, protein: 32, carbs: 24, fat: 10 },
    { id: 150, time: "afternoon", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
  ],
  "2026-06-14": [
    { id: 140, time: "morning", item: "Dark chocolate (3 small pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 141, time: "morning", item: "Lox everything bagel with cream cheese (3/4 bagel)", calories: 390, protein: 19, carbs: 45, fat: 15 },
    { id: 142, time: "morning", item: "Scrambled egg (small piece, ~1oz)", calories: 25, protein: 2, carbs: 0, fat: 2 },
    { id: 143, time: "afternoon", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 144, time: "evening", item: "Elote sourdough pizza, 9-inch thin crust (1/3 of pizza)", calories: 523, protein: 25, carbs: 45, fat: 27 },
    { id: 145, time: "evening", item: "Smoothie (Naked Whey 2 scoops, milk 170g, cottage cheese 40g)", calories: 345, protein: 37, carbs: 20, fat: 13 },
  ],
  "2026-06-13": [
    { id: 120, time: "morning", item: "Dark chocolate (3 small pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 121, time: "morning", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 122, time: "afternoon", item: "Not A Margarita (jasmine tea, agave, tonic, blue spirulina) 410ml", calories: 100, protein: 0, carbs: 24, fat: 0 },
    { id: 123, time: "midday", item: "叉烧葱鸡双拼饭 Char siu & scallion chicken combo rice (half char siu)", calories: 420, protein: 35, carbs: 52, fat: 11 },
    { id: 124, time: "evening", item: "Fried chicken tenders/wings (5 pieces) with dipping sauce, tater tots (~6)", calories: 730, protein: 29, carbs: 50, fat: 45 },
  ],
  "2026-06-12": [
    { id: 110, time: "morning", item: "Homemade pork wontons (4 pieces, ~62g)", calories: 187, protein: 9, carbs: 20, fat: 7 },
    { id: 111, time: "morning", item: "Hard boiled eggs (2)", calories: 156, protein: 12, carbs: 2, fat: 10 },
    { id: 112, time: "morning", item: "Dark chocolate (3 small pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 113, time: "midday", item: "Shredded beef with green chili, cucumber salad (1/2), multi-grain rice (6/10)", calories: 502, protein: 32, carbs: 42, fat: 22 },
    { id: 114, time: "evening", item: "Lean smoothie (Naked Whey, berries 50g, milk, cottage cheese 80g)", calories: 391, protein: 41, carbs: 32, fat: 13 },
    { id: 115, time: "evening", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
  ],
  "2026-06-11": [
    { id: 100, time: "morning", item: "Scrambled eggs (2)", calories: 140, protein: 12, carbs: 1, fat: 10 },
    { id: 101, time: "morning", item: "Bob Evans sausage patties (2)", calories: 210, protein: 13, carbs: 0, fat: 18 },
    { id: 102, time: "morning", item: "Hash brown (half 9-inch cast iron pan)", calories: 125, protein: 2, carbs: 15, fat: 7 },
    { id: 103, time: "morning", item: "Dark chocolate (2 small pieces)", calories: 100, protein: 1, carbs: 11, fat: 6 },
    { id: 104, time: "midday", item: "1/4 Peruvian chicken with yellow rice and beans", calories: 670, protein: 53, carbs: 60, fat: 25 },
    { id: 105, time: "evening", item: "Lean smoothie (Naked Whey, milk, cottage cheese 60g)", calories: 345, protein: 38, carbs: 24, fat: 12 },
    { id: 106, time: "evening", item: "Watermelon (1/4 small)", calories: 90, protein: 2, carbs: 22, fat: 0 },
  ],
  "2026-06-10": [
    { id: 90, time: "morning", item: "Dark chocolate (3 small pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 91, time: "morning", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 92, time: "morning", item: "Cocojune coconut yogurt (~0.6 serving)", calories: 108, protein: 1, carbs: 5, fat: 10 },
    { id: 93, time: "midday", item: "Pan-seared salmon with lettuce, half avocado, cucumber, EVOO balsamic dressing", calories: 600, protein: 42, carbs: 16, fat: 42 },
    { id: 94, time: "evening", item: "Lean smoothie (Naked Whey, berries 50g, milk, cottage cheese 60g)", calories: 373, protein: 39, carbs: 31, fat: 12 },
    { id: 95, time: "evening", item: "Honey coated turkey (66g)", calories: 72, protein: 12, carbs: 3, fat: 1 },
  ],
  "2026-06-09": [
    { id: 80, time: "morning", item: "Smoothie (berries, acai, mango, chia, milk, banana, cottage cheese, Naked Whey)", calories: 598, protein: 41, carbs: 70, fat: 21 },
    { id: 81, time: "morning", item: "Dark chocolate (3 small pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 82, time: "midday", item: "香菇滑鸡要 Shiitake mushroom steamed chicken with brown rice", calories: 495, protein: 39, carbs: 46, fat: 17 },
    { id: 83, time: "evening", item: "Turkey sandwich (white bread, honey turkey 138g, mayo, Muenster x2, lettuce)", calories: 630, protein: 44, carbs: 57, fat: 23 },
  ],
  "2026-06-08": [
    { id: 70, time: "morning", item: "Dark chocolate (3 small pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 71, time: "morning", item: "Homemade pork wontons (6 pieces) in broth", calories: 280, protein: 13, carbs: 30, fat: 10 },
    { id: 72, time: "morning", item: "Banana (half)", calories: 53, protein: 1, carbs: 14, fat: 0 },
    { id: 73, time: "morning", item: "Matcha latte (1.5 cup, likely whole milk)", calories: 150, protein: 6, carbs: 15, fat: 7 },
    { id: 74, time: "midday", item: "豉油鸡 Soy sauce chicken, no skin (~200g)", calories: 280, protein: 42, carbs: 4, fat: 10 },
    { id: 75, time: "midday", item: "Broccoli (~1 cup)", calories: 35, protein: 3, carbs: 7, fat: 0 },
    { id: 76, time: "midday", item: "Mixed rice (1/3 white, 2/3 brown, ~1/2 cup)", calories: 110, protein: 2, carbs: 23, fat: 1 },
    { id: 77, time: "evening", item: "Sweetgreen Classic Chicken Caesar Wrap", calories: 830, protein: 45, carbs: 72, fat: 35 },
  ],
  "2026-06-07": [
    { id: 60, time: "morning", item: "Dark chocolate (2 small pieces)", calories: 100, protein: 1, carbs: 11, fat: 6 },
    { id: 61, time: "morning", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 62, time: "midday", item: "牛肉腸粉 Beef Cheung Fun (½ portion)", calories: 230, protein: 11, carbs: 32, fat: 6 },
    { id: 63, time: "evening", item: "Margherita + pepperoni pizza, 18-inch, 2 slices (light crust)", calories: 480, protein: 22, carbs: 38, fat: 26 },
    { id: 64, time: "evening", item: "Protein smoothie (whey, milk, berries, mango, chia, almond butter)", calories: 555, protein: 45, carbs: 48, fat: 23 },
    { id: 65, time: "evening", item: "Provolone cheese (2.5 slices)", calories: 250, protein: 18, carbs: 0, fat: 20 },
    { id: 66, time: "evening", item: "Watermelon (1 large slice, ~300g)", calories: 90, protein: 2, carbs: 22, fat: 0 },
    { id: 67, time: "evening", item: "Mandarin orange (1)", calories: 45, protein: 1, carbs: 11, fat: 0 },
  ],
  "2026-06-06": [
    { id: 40, time: "morning", item: "Scrambled eggs (2) with provolone (1 slice)", calories: 230, protein: 17, carbs: 1, fat: 17 },
    { id: 41, time: "morning", item: "Avocado (1 whole)", calories: 240, protein: 3, carbs: 13, fat: 22 },
    { id: 42, time: "morning", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 43, time: "morning", item: "Blueberries (~¼ cup)", calories: 20, protein: 0, carbs: 5, fat: 0 },
    { id: 44, time: "morning", item: "Dark chocolate (3 small pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 45, time: "morning", item: "Orange juice (200ml)", calories: 100, protein: 1, carbs: 24, fat: 0 },
    { id: 46, time: "midday", item: "Hakuna Burrata Salad with roasted turkey", calories: 545, protein: 50, carbs: 17, fat: 31 },
    { id: 47, time: "evening", item: "Ammi's lamb chops (3 pieces)", calories: 480, protein: 42, carbs: 8, fat: 30 },
    { id: 48, time: "evening", item: "Yogurt kabab (1)", calories: 120, protein: 6, carbs: 10, fat: 6 },
    { id: 49, time: "evening", item: "Banarasi puri (3.5 pieces)", calories: 210, protein: 5, carbs: 28, fat: 9 },
    { id: 50, time: "evening", item: "Garlic naan (~1 piece)", calories: 220, protein: 6, carbs: 38, fat: 5 },
    { id: 51, time: "evening", item: "Rose Kulfi Falooda (½ portion)", calories: 180, protein: 4, carbs: 28, fat: 6 },
  ],
  "2026-06-05": [
    { id: 30, time: "morning", item: "Thin sourdough toast with butter, cottage cheese, blueberries & honey", calories: 210, protein: 11, carbs: 28, fat: 6 },
    { id: 31, time: "morning", item: "Dark chocolate (3 small pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 32, time: "morning", item: "Mandarin orange (1)", calories: 45, protein: 1, carbs: 11, fat: 0 },
    { id: 33, time: "midday", item: "Rigatoni (40g) with turkey meatballs x6, marinara & parmesan", calories: 590, protein: 50, carbs: 40, fat: 30 },
    { id: 34, time: "evening", item: "Lu Rou Fan with braised egg & fish ball", calories: 610, protein: 29, carbs: 57, fat: 28 },
  ],
  "2026-06-04": [
    { id: 20, time: "morning", item: "Sourdough toast with butter, cottage cheese, blueberries & honey", calories: 280, protein: 14, carbs: 35, fat: 8 },
    { id: 21, time: "midday", item: "Pulmuone Kimchi Pork Mandu (5 pieces)", calories: 400, protein: 15, carbs: 50, fat: 15 },
    { id: 22, time: "midday", item: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: 23, time: "evening", item: "Half sourdough turkey sandwich (turkey, provolone x3, olive oil mayo)", calories: 590, protein: 44, carbs: 36, fat: 30 },
  ],
  "2026-06-03": [
    { id: 10, time: "midday", item: "Roasted chicken breast", calories: 280, protein: 53, carbs: 0, fat: 6 },
    { id: 11, time: "morning", item: "Chips Ahoy cookie (1)", calories: 55, protein: 1, carbs: 8, fat: 2 },
    { id: 12, time: "morning", item: "Mandarin orange (1)", calories: 45, protein: 1, carbs: 11, fat: 0 },
    { id: 13, time: "morning", item: "Sourdough bread (3 slices, 1 with cottage cheese & blueberries)", calories: 310, protein: 14, carbs: 52, fat: 4 },
    { id: 14, time: "afternoon", item: "Dark chocolate (3 small pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 15, time: "afternoon", item: "Smoothie (acai, berries, banana, whole milk, mango, protein powder, chia, cottage cheese, almond butter)", calories: 700, protein: 54, carbs: 72, fat: 27 },
  ],
  "2026-05-31": [
    { id: 1, time: "morning", item: "Dark chocolate (3 small pieces)", calories: 150, protein: 2, carbs: 17, fat: 9 },
    { id: 2, time: "morning", item: "Whole wheat bagel (¾) with tofu spread", calories: 230, protein: 11, carbs: 38, fat: 5 },
    { id: 3, time: "midday", item: "Fried rice (1 bowl)", calories: 500, protein: 12, carbs: 72, fat: 18 },
  ],
};

// Workout burn logged per day (kcal)
const INITIAL_WORKOUTS = {
  "2026-08-05": 675, // Gym ~60min upper body + 2km treadmill + 2× jog ~1.4mi (dog pickup); cumulative HR zones Peak 15min@168bpm + Vigorous 27min@149bpm + Moderate 61min@115bpm; Karvonen 526, MET 824; burn = 1,717 + round(675×1.10) = 2,460
  "2026-08-03": 366, // Gym ~60min: glutes + legs + chest + abs + 2km treadmill in 13:37; HR zones Peak 8min@168bpm + Vigorous 11min@149bpm + Moderate 40min@115bpm; Karvonen 278, MET 453; burn = 1,717 + round(366×1.10) = 2,120
  "2026-08-01": 498, // F45 Hybrid ~60min; HR zones Vigorous 47min@149bpm + Moderate 24min@115bpm; Karvonen 403, MET 592; burn = 1,717 + round(498×1.10) = 2,265
  "2026-07-31": 139, // Bike ride to dinner; HR zones Vigorous 2min@149bpm + Moderate 23min@115bpm; Karvonen 89, MET 189; burn = 1,717 + round(139×1.10) = 1,870
  "2026-07-30": 357, // Gym ~60min: back + chest strength + 2km treadmill in 13:33; HR zones Peak 7min@168bpm + Vigorous 7min@149bpm + Moderate 48min@115bpm; Karvonen 268, MET 446; burn = 1,717 + round(357×1.10) = 2,110
  "2026-07-29": 270, // Incline treadmill 30min (12% grade, 3mph); HR zones Vigorous 28min@149bpm + Moderate 15min@115bpm; Karvonen 242, MET 298 (ACSM 8.3×71.7kg×0.5hr); burn = 1,717 + round(270×1.10) = 2,014
  "2026-07-27": 306, // Gym: strength training + 2km treadmill in 13:33; HR zones Peak 4min@168bpm + Vigorous 11min@149bpm + Moderate 36min@115bpm; Karvonen 229, MET 382; burn = 1,717 + round(306×1.10) = 2,054
  "2026-07-25": 511, // F45 Hybrid ~60min; HR zones Peak 2min@168bpm + Vigorous 46min@149bpm + Moderate 24min@115bpm; Karvonen 414, MET 608; burn = 1,717 + round(511×1.10) = 2,279
  "2026-07-23": 371, // Bike commute both ways ~66min; HR zones Vigorous 11min@149bpm + Moderate 47min@115bpm + Light 8min; Karvonen 234, MET 507; burn = 1,717 + round(371×1.10) = 2,125
  "2026-07-21": 230, // Gym: upper body strength ~45min + 2km treadmill in 13:32 (8.9km/h); HR zones Peak 6min@168bpm + Vigorous 8min@149bpm + Moderate 16min@115bpm; Karvonen 160, MET 301; burn = 1,717 + round(230×1.10) = 1,970
  "2026-07-19": 403, // F45 Hybrid 45min + bike commute both ways to train (light zone only); HR zones Vigorous 33min@149bpm + Moderate 21min@115bpm (F45); Karvonen 294, MET 451 (F45) + ~30 bike est. (light zone); burn = 1,717 + round(403×1.10) = 2,160
  "2026-07-18": 57, // Bike commute (round trip); HR zones Vigorous 1min@149bpm + Moderate 9min@115bpm; Karvonen 36, MET 77; burn = 1,717 + round(57×1.10) = 1,780
  "2026-07-16": 290, // Gym ~60min: lat pulldown 6×10 + booty booster 3×10 + leg curl 3×10 + tricep 3×10 + 100 wall balls + 1km treadmill in 6:54; HR zones Peak 3min@168bpm + Vigorous 16min@149bpm + Moderate 27min@115bpm; Karvonen 224, MET 357; burn = 1,717 + round(290×1.10) = 2,036
  "2026-07-14": 358, // 5km treadmill run in 34:58 (7:00/km); HR zones Peak 2min@168bpm + Vigorous 34min@149bpm + Moderate 11min@115bpm; Karvonen 287, MET 429; burn = 1,717 + round(358×1.10) = 2,111
  "2026-07-13": 245, // Gym ~70min: lat row + barbell chest press + 30 sit-ups + dead hang + KB swings + Bulgarian lunge 4×10 + incline treadmill (13%, 3mph, 10min); HR zones Vigorous 9min@149bpm + Moderate 20min@115bpm; Karvonen 126, MET 364; burn = 1,717 + round(245×1.10) = 1,987
  "2026-07-11": 529, // F45 Hybrid class ~60min; HR zones Peak 2min@168bpm + Vigorous 39min@149bpm + Moderate 43min@115bpm; Karvonen 425, MET 632; burn = 1,717 + round(529×1.10) = 2,299
  "2026-07-10": 353, // Gym (no Fitbit — estimated): barbell squat 4×10 (90/100lbs) + deadlift 3×10 (100lbs) + lat pulldown 3×10 (85lbs) + chest press 3×10 (55lbs) + 2km treadmill in 13:42; Est. zones Vigorous ~25min + Moderate ~40min; Karvonen 301, MET 405; burn = 1,717 + round(353×1.10) = 2,105
  "2026-07-08": 305, // Gym: 100 squats (2×4lb DBs) + 1k row in 5:00 + incline treadmill (12%, 2.5mph, 10min) + lat pull 4×10 + bicep curl 3×10 + dead hang 3×20sec + 1k ski erg (avg 2:50/500m); HR zones Vigorous 20min@149bpm + Moderate 43min@115bpm; Karvonen 276, MET 339; burn = 1,717 + round(305×1.10) = 2,053
  "2026-07-07": 281, // 4km treadmill run in 27:40 (~8.7 km/h); HR zones Peak 7min@168bpm + Vigorous 21min@149bpm + Moderate 23min@115bpm; Karvonen 280, MET 282; burn = 1,717 + round(281×1.10) = 2,026
  "2026-07-06": 195, // Gym 1hr strength + incline treadmill (12% grade, 3mph, 10min); HR zones Vigorous 9min@149bpm + Moderate 17min@115bpm; Karvonen 117, MET 269 (treadmill MET 8.3 per ACSM, strength MET 2.8); burn = 1,717 + round(195×1.10) = 1,932
  "2026-07-04": 490, // Gym 1.5hr strength + 3.1km treadmill in 21:18 + bike to lunch; HR zones Peak 10min@168bpm + Vigorous 17min@149bpm + Moderate 52min@115bpm; Karvonen 374, MET 609 (strength MET 2.8 adjusted for rest); burn = 1,717 + round(490×1.10) = 2,256
  "2026-07-03": 160, // going out; HR zone Moderate 37min@115bpm; Karvonen 119, MET 201; burn = 1,717 + round(160×1.10) = 1,893
  "2026-07-02": 510, // Gym 40min strength + 3km run in 20:38 + bike errands; HR zones Peak 17min@168bpm + Vigorous 19min@149bpm + Moderate 66min@115bpm; Karvonen 495, MET 529; burn = 1,717 + round(510×1.10) = 2,278
  "2026-06-30": 484, // F45 cardio 45min; HR zones Peak 6min@168bpm + Vigorous 28min@148bpm + Moderate 25min@111bpm; Karvonen 466, MET 501; burn = 1,717 + round(484×1.10) = 2,249
  "2026-06-27": 244, // bike ride to/from movie; HR zones Vigorous 5min@148bpm + Moderate 34min@111bpm; Karvonen 230, MET 257; burn = 1,717 + round(244×1.10) = 1,985
  "2026-06-25": 479, // F45 cardio 45min; HR zones Peak 7min@168bpm + Vigorous 24min@148bpm + Moderate 29min@111bpm; Karvonen 461, MET 497; burn = 1,717 + round(479×1.10) = 2,244
  "2026-06-23": 190, // booty boost machine + chest press + 2km run @6:45/km
  "2026-06-21": 261, // 2km treadmill run + strength (chest/bicep/tricep) + leisure bike errands
  "2026-06-20": 310, // 3 walks (81 min total)
  "2026-06-18": 305, // Gym - stair machine 25min + bicep curl/chest press/leg press
  "2026-06-17": 275, // Gym - incline walk + stairs + cycling + bicep curls
  "2026-06-15": 92,  // Gym - strength + incline treadmill
  "2026-06-13": 602, // Gym - 2 min peak / 47 min vigorous / 31 min moderate
  "2026-06-11": 608, // Gym - 13 min peak / 4 min vigorous / 77 min moderate
  "2026-06-09": 271, // Gym - 10 min peak / 4 min vigorous / 22 min moderate
  "2026-06-07": 378, // F45 - 2 min peak / 26 min vigorous / 23 min moderate
  "2026-06-05": 555, // Gym - 16 min peak / 6 min vigorous / 58 min moderate
  "2026-06-03": 691, // Gym - 15 min peak / 7 min vigorous / 83 min moderate
};

// Workout activity breakdown per day (for "view details" in bottom sheet)
const WORKOUT_DETAILS = {
  "2026-06-17": [
    { name: "Incline treadmill walk (20 min)", calories: 80 },
    { name: "Stair machine level 6 (10 min)", calories: 104 },
    { name: "Cycling (10 min)", calories: 60 },
    { name: "Bicep curls (5 min)", calories: 30 },
  ],
  "2026-06-15": [
    { name: "Strength training + incline treadmill", calories: 92 },
  ],
  "2026-06-13": [
    { name: "Gym — 2 min peak / 47 min vigorous / 31 min moderate", calories: 602 },
  ],
  "2026-06-11": [
    { name: "Gym — 13 min peak / 4 min vigorous / 77 min moderate", calories: 608 },
  ],
  "2026-06-09": [
    { name: "Gym — 10 min peak / 4 min vigorous / 22 min moderate", calories: 271 },
  ],
  "2026-06-07": [
    { name: "F45 — 2 min peak / 26 min vigorous / 23 min moderate", calories: 378 },
  ],
  "2026-06-05": [
    { name: "Gym — 16 min peak / 6 min vigorous / 58 min moderate", calories: 555 },
  ],
  "2026-06-03": [
    { name: "Gym — 15 min peak / 7 min vigorous / 83 min moderate", calories: 691 },
  ],
};

// Frequently eaten foods reference list
const FREQUENT_FOODS = [
  { name: "Lactaid Whole Milk", serving: "1 cup (240ml)", calories: 160, protein: 8 },
  { name: "Naked Whey Protein Powder", serving: "44g", calories: 180, protein: 25 },
  { name: "Chocolove 65% Rich Dark Chocolate", serving: "6 pieces (1/3 bar, 30g)", calories: 150, protein: 2 },
  { name: "Homemade pork wonton", serving: "6 pieces", calories: 282, protein: 12 },
  { name: "Homemade turkey meatball", serving: "4 pieces", calories: 280, protein: 24 },
  { name: "Pulmuone Kimchi Hotpot Udon", serving: "1 packet", calories: 390, protein: 12 },
  { name: "Wyman's Frozen Mixed Berries", serving: "1 cup (140g)", calories: 80, protein: 1 },
  { name: "Frozen Mango chunks", serving: "1 cup (227g)", calories: 140, protein: 2 },
  { name: "Frozen Hash Browns", serving: "2/3 cup (85g)", calories: 70, protein: 2 },
  { name: "Cocojune Organic Coconut Yogurt", serving: "4 oz (114g)", calories: 180, protein: 2 },
  { name: "Chocolove 70% Dark Chocolate Bar", serving: "1/3 bar (30g)", calories: 150, protein: 5 },
  { name: "Tropicana 100% OJ No Pulp", serving: "8 fl oz (240mL)", calories: 110, protein: 2 },
  { name: "Daisy 2% Cottage Cheese", serving: "1/2 cup (113g)", calories: 90, protein: 13 },
  { name: "Ottogi 3 Min Spicy Curry Sauce", serving: "1 pouch (190g)", calories: 140, protein: 3 },
  { name: "Carbone Marinara Sauce", serving: "1/2 cup (113g)", calories: 90, protein: 1 },
  { name: "Pulmuone Kimchi Pork Mandu", serving: "1 piece", calories: 130, protein: 4 },
  { name: "Bob Evans Original Pork Sausage Patty", serving: "1 patty (29.5g)", calories: 105, protein: 7 },
  { name: "LesserEvil White Cheddar Popcorn", serving: "3 cups (28g)", calories: 120, protein: 2 },
  { name: "Siggi's Vanilla Yogurt (0% fat)", serving: "3/4 cup (170g)", calories: 120, protein: 18 },
  { name: "SPAM Classic", serving: "2 oz (56g)", calories: 180, protein: 7 },
  { name: "Sloppy Joe Sauce", serving: "1/4 cup (64g)", calories: 35, protein: 0 },
  { name: "Idahoan Buttery Homestyle Mashed Potatoes", serving: "1/4 cup dry (28g / 140g prepared)", calories: 110, protein: 2 },
  { name: "Martin's Potato Bun", serving: "1 roll (53g)", calories: 130, protein: 6 },
  { name: "Wei Chuan Pork Bun", serving: "1 bun (56g)", calories: 180, protein: 5, carbs: 23, fat: 7 },
  { name: "Bob Evans Egg Whites", serving: "3 tbsp (46g)", calories: 25, protein: 5, carbs: 0, fat: 0 },
  { name: "Gertel's Raisin Challah", serving: "1 oz (28g)", calories: 80, protein: 1, carbs: 16, fat: 2 },
  { name: "Beyond Good 92% Pure Dark Chocolate", serving: "6 pieces (15g)", calories: 90, protein: 2, carbs: 3, fat: 8 },
  { name: "Yoshinoya Gyudon", serving: "1 serving (170g)", calories: 300, protein: 21, carbs: 10, fat: 20 },
  { name: "Fage 0% Greek Yogurt", serving: "170g", calories: 90, protein: 18, carbs: 6, fat: 0 },
];

// Gram weight of one serving for each frequent food (null = piece/packet-based)
const SERVING_GRAMS = {
  "Lactaid Whole Milk": 240,
  "Naked Whey Protein Powder": 44,
  "Chocolove 65% Rich Dark Chocolate": 30,
  "Wyman's Frozen Mixed Berries": 140,
  "Frozen Mango chunks": 227,
  "Frozen Hash Browns": 85,
  "Cocojune Organic Coconut Yogurt": 114,
  "Chocolove 70% Dark Chocolate Bar": 30,
  "Tropicana 100% OJ No Pulp": 240,
  "Daisy 2% Cottage Cheese": 113,
  "Ottogi 3 Min Spicy Curry Sauce": 190,
  "Carbone Marinara Sauce": 113,
  "Bob Evans Original Pork Sausage Patty": 29.5,
  "LesserEvil White Cheddar Popcorn": 28,
  "Siggi's Vanilla Yogurt (0% fat)": 170,
  "SPAM Classic": 56,
  "Sloppy Joe Sauce": 64,
  "Idahoan Buttery Homestyle Mashed Potatoes": 28,
  "Martin's Potato Bun": 53,
  "Wei Chuan Pork Bun": 56,
  "Bob Evans Egg Whites": 46,
  "Gertel's Raisin Challah": 28,
  "Beyond Good 92% Pure Dark Chocolate": 15,
  "Yoshinoya Gyudon": 170,
  "Fage 0% Greek Yogurt": 170,
};

const TDEE = 1717; // rest-day baseline (RMR + NEAT, no workout)
const EPOC_FACTOR = 1.10; // afterburn multiplier on logged workout burns

const STORAGE_KEY = "diet-log-v1";
const WORKOUT_KEY = "workout-log-v1";
const TIMES = ["morning", "midday", "afternoon", "evening", "night"];
const EMPTY_ENTRY = { item: "", calories: "", protein: "", carbs: "", fat: "", time: "morning" };

// Merge saved log with initial: keeps user-added/deleted entries, but adds any
// newly hardcoded entries (by id) that aren't already in the saved state.
function mergeLog(initial, saved) {
  if (!saved) return initial;
  const result = {};
  const allDates = new Set([...Object.keys(initial), ...Object.keys(saved)]);
  for (const date of allDates) {
    const initEntries = initial[date] || [];
    const savedEntries = saved[date] || [];
    const initIds = new Set(initEntries.map(e => e.id));
    result[date] = [
      ...initEntries,
      ...savedEntries.filter(e => !initIds.has(e.id)),
    ];
  }
  return result;
}

function getTotals(entries) {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (Number(e.calories) || 0),
      protein: acc.protein + (Number(e.protein) || 0),
      carbs: acc.carbs + (Number(e.carbs) || 0),
      fat: acc.fat + (Number(e.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function DietTracker() {
  const [log, setLog] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return mergeLog(INITIAL_LOG, saved);
    } catch { return INITIAL_LOG; }
  });
  const [workouts, setWorkouts] = useState(INITIAL_WORKOUTS);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)); } catch {}
  }, [log]);
  const [sheetDate, setSheetDate] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showFrequent, setShowFrequent] = useState(false);
  const [showSmoothie, setShowSmoothie] = useState(false);
  const [smoothieItems, setSmoothieItems] = useState([]);
  const [smoothieSearch, setSmoothieSearch] = useState("");
  const [smoothieDropdown, setSmoothieDropdown] = useState(false);
  const [smoothieLogged, setSmoothieLogged] = useState(false);
  const [smoothieCopyText, setSmoothieCopyText] = useState("");
  const [showCustomRow, setShowCustomRow] = useState(false);
  const [customRow, setCustomRow] = useState({ name: "", amount: "", cal: "", protein: "" });
  const [customRowError, setCustomRowError] = useState(false);
  const [frequentSearch, setFrequentSearch] = useState("");
  const [customFoods, setCustomFoods] = useState([]);
  const [freqForm, setFreqForm] = useState({ name: "", serving: "", calories: "", protein: "" });
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);
  const [workoutInput, setWorkoutInput] = useState("");
  const [form, setForm] = useState(EMPTY_ENTRY);
  const [newDate, setNewDate] = useState("");

  function saveLog(updated) { setLog(updated); }
  function saveWorkouts(updated) { setWorkouts(updated); }

  const dates = Object.keys(log).sort().reverse();

  // Smoothie calculator — latest day context
  const latestDate = dates[0];
  const latestEntries = latestDate ? (log[latestDate] || []) : [];
  const latestTotals = getTotals(latestEntries);
  const latestWorkoutBurn = latestDate ? (workouts[latestDate] || 0) : 0;
  const latestBurn = TDEE + Math.round(latestWorkoutBurn * EPOC_FACTOR);
  const smoothieCals = smoothieItems.reduce((sum, item) => sum + (item.servingG ? Math.round((item.grams / item.servingG) * item.calsPerServing) : Math.round(item.servings * item.calsPerServing)), 0);
  const smoothieProtein = smoothieItems.reduce((sum, item) => sum + (item.servingG ? Math.round((item.grams / item.servingG) * item.proteinPerServing) : Math.round(item.servings * item.proteinPerServing)), 0);
  const calBudgetLeft = (latestBurn - 300) - latestTotals.calories;
  const proteinLeft = 120 - latestTotals.protein;
  const calDeficitAfter = latestBurn - (latestTotals.calories + smoothieCals);
  const proteinAfter = latestTotals.protein + smoothieProtein;

  function addEntry() {
    if (!form.item || !sheetDate) return;
    const updated = {
      ...log,
      [sheetDate]: [...(log[sheetDate] || []),
        { ...form, id: Date.now(), calories: Number(form.calories) || 0, protein: Number(form.protein) || 0, carbs: Number(form.carbs) || 0, fat: Number(form.fat) || 0 }],
    };
    saveLog(updated);
    setForm(EMPTY_ENTRY);
    setAdding(false);
  }

  function removeEntry(date, id) {
    saveLog({ ...log, [date]: (log[date] || []).filter(e => e.id !== id) });
  }

  function saveWorkoutBurn() {
    const val = Number(workoutInput);
    if (!val || !sheetDate) { setEditingWorkout(false); return; }
    saveWorkouts({ ...workouts, [sheetDate]: val });
    setEditingWorkout(false);
    setWorkoutInput("");
  }

  function openSmoothiePage() {
    setSmoothieItems([]);
    setSmoothieSearch("");
    setSmoothieDropdown(false);
    setSmoothieLogged(false);
    setSmoothieCopyText("");
    setShowSmoothie(true);
  }

  function closeSmoothiePage() {
    setShowSmoothie(false);
    setSmoothieItems([]);
    setSmoothieSearch("");
    setSmoothieDropdown(false);
    setSmoothieLogged(false);
    setSmoothieCopyText("");
  }

  function submitCustomRow() {
    if (!customRow.name.trim() || !customRow.amount.trim()) { setCustomRowError(true); return; }
    setCustomRowError(false);
    const cal = customRow.cal.trim() !== "" ? parseInt(customRow.cal) : null;
    const protein = customRow.protein.trim() !== "" ? parseInt(customRow.protein) : null;
    setSmoothieItems(prev => [...prev, {
      id: Date.now(),
      name: customRow.name.trim(),
      servingG: null,
      grams: 0,
      servings: 1,
      calsPerServing: cal !== null ? cal : 0,
      proteinPerServing: protein !== null ? protein : 0,
      customCal: cal,
      customProtein: protein,
      customAmount: customRow.amount.trim(),
    }]);
    setCustomRow({ name: "", amount: "", cal: "", protein: "" });
    setShowCustomRow(false);
  }

  function copyIngredients() {
    if (smoothieItems.length === 0) return;
    const desc = smoothieItems.map(item =>
      item.customAmount ? `${item.name} (${item.customAmount})` : item.servingG ? `${item.name} (${item.grams}g)` : `${item.name} (${item.servings} srv)`
    ).join(" + ");
    const suffix = (smoothieCals > 0 || smoothieProtein > 0) ? ` — ${smoothieCals} cal, ${smoothieProtein}g protein` : "";
    const text = `Smoothie: ${desc}${suffix}`;
    setSmoothieCopyText(text);
    setSmoothieLogged(true);
  }

  function addSmoothieItem() {
    if (!smoothiePick) return;
    const allFoods = [...FREQUENT_FOODS, ...customFoods];
    const food = allFoods.find(f => f.name === smoothiePick);
    if (!food) return;
    const sG = SERVING_GRAMS[food.name] || null;
    setSmoothieItems(prev => [...prev, {
      id: Date.now(),
      name: food.name,
      servingLabel: food.serving,
      servingG: sG,
      grams: sG || 0,
      servings: 1,
      calsPerServing: food.calories,
      proteinPerServing: food.protein,
    }]);
    setSmoothiePick("");
  }

  function updateSmoothieGrams(id, val) {
    setSmoothieItems(prev => prev.map(item => item.id === id ? { ...item, grams: Number(val) || 0 } : item));
  }

  function updateSmoothieServings(id, val) {
    setSmoothieItems(prev => prev.map(item => item.id === id ? { ...item, servings: Number(val) || 0 } : item));
  }

  function removeSmoothieItem(id) {
    setSmoothieItems(prev => prev.filter(item => item.id !== id));
  }

  function addDate() {
    if (!newDate) return;
    saveLog({ ...log, [newDate]: log[newDate] || [] });
    setSheetDate(newDate);
    setNewDate("");
  }

  const sheetEntries = sheetDate ? (log[sheetDate] || []) : [];
  const sheetTotals = getTotals(sheetEntries);
  const sheetWorkout = sheetDate ? (workouts[sheetDate] || 0) : 0;
  const sheetWorkoutAdj = Math.round(sheetWorkout * EPOC_FACTOR);
  const sheetTotalBurn = TDEE + sheetWorkoutAdj;
  const sheetDeficit = sheetTotalBurn - sheetTotals.calories;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef", fontFamily: "'Georgia', serif", color: "#2c2418" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .wrap { max-width: 640px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
        h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 400; color: #2c2418; }
        .subtitle { font-family: 'DM Mono', monospace; font-size: 0.63rem; color: #9a8f7e; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.2rem; margin-bottom: 0.5rem; }
        .goal-note { font-family: 'DM Mono', monospace; font-size: 0.63rem; color: #b5a898; margin-bottom: 1.5rem; }
        .goal-note span { color: #b07d3a; }

        .tbl { width: 100%; border-collapse: collapse; }
        .tbl thead th { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: #b5a898; padding: 0 0.5rem 0.6rem; text-align: right; }
        .tbl thead th:first-child { text-align: left; }
        .tbl tbody tr { border-top: 1px solid #e8e2d8; cursor: pointer; transition: background 0.1s; }
        .tbl tbody tr:hover { background: #eee9e0; }
        .tbl tbody td { padding: 0.65rem 0.5rem; font-family: 'DM Mono', monospace; text-align: right; color: #6b5f52; vertical-align: middle; }
        .tbl tbody td:first-child { text-align: left; color: #3d3228; }
        .cell-main { font-size: 1rem; color: #2c2418; font-weight: 500; line-height: 1.2; display: inline; }
        .cell-sub { font-size: 0.78rem; color: #b5a898; line-height: 1.2; display: block; margin-top: 0.1rem; }
        .date-str { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #3d3228; }
        .deficit-pos { color: #3a7d44; font-weight: 500; font-size: 1rem; }
        .deficit-neg { color: #b84040; font-weight: 500; font-size: 1rem; }
        .bar-wrap { width: 40px; display: inline-block; vertical-align: middle; height: 3px; background: #e8e2d8; border-radius: 2px; margin-left: 0.3rem; }
        .bar-fill { height: 100%; border-radius: 2px; }

        .add-date-row { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .add-date-row input { font-family: 'DM Mono', monospace; font-size: 0.72rem; background: #fff; border: 1px solid #d6cfc4; color: #2c2418; padding: 0.35rem 0.6rem; border-radius: 2px; }
        .add-date-row button { font-family: 'DM Mono', monospace; font-size: 0.7rem; background: transparent; border: 1px solid #d6cfc4; color: #9a8f7e; padding: 0.35rem 0.65rem; cursor: pointer; border-radius: 2px; }
        .add-date-row button:hover { color: #b07d3a; border-color: #b07d3a; }

        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 10; animation: fadeIn 0.2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .sheet { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 16px 16px 0 0; z-index: 20; padding: 0 1.25rem 2.5rem; max-height: 82vh; overflow-y: auto; animation: slideUp 0.25s ease; box-shadow: 0 -4px 24px rgba(0,0,0,0.1); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .sheet-handle { width: 36px; height: 4px; background: #d6cfc4; border-radius: 2px; margin: 0.75rem auto 1.25rem; }
        .sheet-date { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-style: italic; color: #9a8f7e; margin-bottom: 0.9rem; }

        .sheet-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 1.25rem; }
        .stat-card { background: #f7f4ef; border-radius: 6px; padding: 0.6rem 0.75rem; }
        .stat-label { font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: #b5a898; margin-bottom: 0.2rem; }
        .stat-val { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: #2c2418; }
        .stat-val.amber { color: #b07d3a; }
        .stat-val.green { color: #3a7d44; }
        .stat-val.red { color: #b84040; }
        .stat-sub { font-family: 'DM Mono', monospace; font-size: 0.6rem; color: #b5a898; margin-top: 0.1rem; }

        .workout-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; padding: 0.6rem 0.75rem; background: #eaf2eb; border-radius: 6px; }
        .workout-label { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: #3a7d44; flex: 1; letter-spacing: 0.06em; }
        .workout-edit { font-family: 'DM Mono', monospace; font-size: 0.65rem; background: transparent; border: none; color: #3a7d44; cursor: pointer; text-decoration: underline; }
        .workout-details { background: #d8edd9; border-radius: 0 0 6px 6px; padding: 0.5rem 0.75rem 0.65rem; margin-top: -4px; }
        .workout-detail-row { display: flex; justify-content: space-between; font-family: 'DM Mono', monospace; font-size: 0.68rem; color: #2d6035; padding: 0.2rem 0; border-bottom: 1px solid #c2dfc4; }
        .workout-detail-row:last-child { border-bottom: none; }
        .workout-input { font-family: 'DM Mono', monospace; font-size: 0.72rem; background: #fff; border: 1px solid #a8d4ad; color: #2c2418; padding: 0.25rem 0.5rem; border-radius: 2px; width: 80px; }
        .workout-save { font-family: 'DM Mono', monospace; font-size: 0.65rem; background: #3a7d44; color: #fff; border: none; padding: 0.28rem 0.6rem; border-radius: 2px; cursor: pointer; }

        .section-label { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: #b5a898; margin-bottom: 0.6rem; }
        .sheet-entry { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0; border-bottom: 1px solid #f0ebe3; }
        .sheet-time { font-family: 'DM Mono', monospace; font-size: 0.6rem; color: #b5a898; min-width: 55px; }
        .sheet-name { flex: 1; font-size: 0.86rem; color: #3d3228; }
        .sheet-cal { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #b07d3a; white-space: nowrap; }
        .sheet-protein { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #6b5f52; white-space: nowrap; }
        .sheet-del { background: none; border: none; color: #d6cfc4; cursor: pointer; font-size: 1rem; padding: 0 0.2rem; }
        .sheet-del:hover { color: #c0392b; }
        .sheet-empty { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #d6cfc4; text-align: center; padding: 1.5rem 0; }
        .sheet-add-btn { font-family: 'DM Mono', monospace; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; background: transparent; border: 1px solid #d6cfc4; color: #9a8f7e; padding: 0.5rem 1rem; cursor: pointer; border-radius: 2px; margin-top: 1rem; }
        .sheet-add-btn:hover { border-color: #b07d3a; color: #b07d3a; }
        .form { background: #f7f4ef; border: 1px solid #e8e2d8; border-radius: 3px; padding: 1rem; margin-top: 0.75rem; display: grid; gap: 0.65rem; }
        .form input, .form select { font-family: 'DM Mono', monospace; font-size: 0.78rem; background: #fff; border: 1px solid #d6cfc4; color: #2c2418; padding: 0.5rem 0.65rem; border-radius: 2px; width: 100%; }
        .form input:focus, .form select:focus { outline: none; border-color: #b07d3a; }
        .form-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem; }
        .form-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
        .btn-primary { font-family: 'DM Mono', monospace; font-size: 0.7rem; background: #b07d3a; color: #fff; border: none; padding: 0.5rem 1rem; cursor: pointer; border-radius: 2px; }
        .btn-cancel { font-family: 'DM Mono', monospace; font-size: 0.7rem; background: transparent; color: #9a8f7e; border: 1px solid #d6cfc4; padding: 0.5rem 1rem; cursor: pointer; border-radius: 2px; }

        .page-links { display: flex; gap: 1.25rem; margin-bottom: 1.5rem; }
        .rules-link { font-family: 'DM Mono', monospace; font-size: 0.63rem; letter-spacing: 0.06em; color: #b07d3a; text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0; }
        .rules-link:hover { color: #8a5f28; }

        .back-link { font-family: 'DM Mono', monospace; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: #9a8f7e; background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 1.25rem; display: inline-block; }
        .back-link:hover { color: #b07d3a; }
        .rules-page h2 { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 400; color: #2c2418; margin: 1.25rem 0 0.4rem; }
        .rules-page h2:first-of-type { margin-top: 0; }
        .rules-page p { font-size: 0.88rem; line-height: 1.55; color: #4a4036; margin-bottom: 0.5rem; }
        .rules-page ul { margin: 0.3rem 0 0.5rem 1.1rem; }
        .rules-page li { font-size: 0.85rem; line-height: 1.55; color: #4a4036; margin-bottom: 0.25rem; }
        .rules-page .num { font-family: 'DM Mono', monospace; color: #b07d3a; }
      `}</style>

      <div className="wrap">
        {showRules ? (
          <div className="rules-page">
            <button className="back-link" onClick={() => setShowRules(false)}>← Back</button>
            <h1>Calculation rule</h1>
            <p className="subtitle">How Eaten, Burn, Deficit & targets are calculated</p>

            <h2>Rest-day baseline</h2>
            <p>
              Your rest-day baseline is <span className="num">1,717 kcal/day</span> — this is your
              estimated maintenance energy with no workout, made up of your RMR (Katch-McArdle, ~1,288 kcal)
              plus non-exercise activity (~258 kcal). On days with no logged workout, this is your full
              "Burn" for the day.
            </p>

            <h2>Workout days</h2>
            <p>
              When you log a workout, its estimated burn (kcal) is added on top of the baseline — scaled up
              by <span className="num">×1.10</span> to account for EPOC (the "afterburn" effect where your
              metabolism stays elevated for hours after exercise).
            </p>
            <p>
              <span className="num">Burn = 1,717 + (workout burn × 1.10)</span>
            </p>
            <p>
              Workout burn itself is estimated as the average of two methods using your heart-rate zone
              minutes: the Karvonen HR formula and the MET (metabolic equivalent) method.
            </p>

            <h2>Eaten & target</h2>
            <p>
              "Eaten" is the sum of calories from everything logged for the day. The grey number underneath
              is your target intake, calculated as:
            </p>
            <p>
              <span className="num">Target = Burn − 300</span>
            </p>
            <p>The 300 kcal gap is your daily goal deficit.</p>

            <h2>Deficit</h2>
            <p>
              <span className="num">Deficit = Burn − Eaten</span>
            </p>
            <ul>
              <li><strong>Green (−):</strong> you're under your burn — on track for fat loss, aiming for ≥300/day.</li>
              <li><strong>Red (+):</strong> you ate more than you burned (a surplus) that day.</li>
            </ul>
            <p>
              Goal deficit of 300 kcal/day corresponds to roughly 0.6 lbs/week of fat loss, on average over
              time (single-day numbers will vary).
            </p>

            <h2>Protein</h2>
            <p>Daily target is <span className="num">120–130g</span>, prioritized ahead of carbs/fat.</p>

            <h2>Notes on accuracy</h2>
            <ul>
              <li>Food calories are mostly visual/portion estimates, not weighed — expect ±15–20% error per meal.</li>
              <li>Workout burns rely on Fitbit HR-zone minutes; actual zone averages may differ from assumptions used.</li>
              <li>The baseline (1,717) is a formula estimate — if weight trends don't match predictions after a few weeks, it should be recalibrated.</li>
            </ul>
          </div>
        ) : showFrequent ? (
          <div className="rules-page">
            <button className="back-link" onClick={() => setShowFrequent(false)}>← Back</button>
            <h1>Frequently eat</h1>
            <p className="subtitle">Common foods, serving sizes & macros</p>
            <input
              value={frequentSearch}
              onChange={e => setFrequentSearch(e.target.value)}
              placeholder="Search foods..."
              style={{width:"100%", boxSizing:"border-box", padding:"0.5rem 0.6rem", fontFamily:"'DM Mono',monospace", fontSize:"0.82rem", border:"1px solid #d8d0c4", borderRadius:"6px", background:"#faf8f5", color:"#3d3228", outline:"none", marginTop:"0.75rem"}}
            />
            <table style={{width:"100%", borderCollapse:"collapse", marginTop:"1rem"}}>
              <thead>
                <tr>
                  {["Food","1 Serving","Cal","Protein",""].map(h => (
                    <th key={h} style={{fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#b5a898", padding:"0 0.5rem 0.6rem", textAlign: h==="Food" ? "left" : "right"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...FREQUENT_FOODS.map(f => ({...f, _custom: false, _customIdx: -1})), ...customFoods.map((f, idx) => ({...f, _custom: true, _customIdx: idx}))].filter(f => f.name.toLowerCase().includes(frequentSearch.toLowerCase())).map((f, i) => (
                  <tr key={i} style={{borderTop:"1px solid #e8e2d8"}}>
                    <td style={{padding:"0.65rem 0.5rem", fontFamily:"'DM Mono',monospace", fontSize:"0.82rem", color:"#3d3228"}}>{f.name}</td>
                    <td style={{padding:"0.65rem 0.5rem", fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", color:"#9a8f7e", textAlign:"right"}}>{f.serving}</td>
                    <td style={{padding:"0.65rem 0.5rem", fontFamily:"'DM Mono',monospace", fontSize:"0.88rem", color:"#2c2418", fontWeight:500, textAlign:"right"}}>{f.calories}</td>
                    <td style={{padding:"0.65rem 0.5rem", fontFamily:"'DM Mono',monospace", fontSize:"0.88rem", color:"#6b5f52", textAlign:"right"}}>{f.protein}g</td>
                    <td style={{padding:"0.65rem 0.5rem", textAlign:"right"}}>{f._custom && (
                      <button onClick={() => {
                        const updated = customFoods.filter((_, j) => j !== f._customIdx);
                        setCustomFoods(updated);
                      }} style={{fontFamily:"'DM Mono',monospace", fontSize:"0.7rem", color:"#b5a898", background:"none", border:"none", cursor:"pointer", padding:0}}>✕</button>
                    )}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:"1.5rem", paddingTop:"1.2rem", borderTop:"1px solid #e8e2d8"}}>
              <p style={{fontFamily:"'DM Mono',monospace", fontSize:"0.7rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"#b5a898", margin:"0 0 0.75rem"}}>Add food</p>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginBottom:"0.5rem"}}>
                <input value={freqForm.name} onChange={e => setFreqForm(p => ({...p, name: e.target.value}))} placeholder="Food name" style={{gridColumn:"1/-1", padding:"0.5rem 0.6rem", fontFamily:"'DM Mono',monospace", fontSize:"0.82rem", border:"1px solid #d8d0c4", borderRadius:"6px", background:"#faf8f5", color:"#3d3228", outline:"none"}} />
                <input value={freqForm.serving} onChange={e => setFreqForm(p => ({...p, serving: e.target.value}))} placeholder="Serving (e.g. 1 cup)" style={{padding:"0.5rem 0.6rem", fontFamily:"'DM Mono',monospace", fontSize:"0.82rem", border:"1px solid #d8d0c4", borderRadius:"6px", background:"#faf8f5", color:"#3d3228", outline:"none"}} />
                <input value={freqForm.calories} onChange={e => setFreqForm(p => ({...p, calories: e.target.value}))} type="number" placeholder="Calories" style={{padding:"0.5rem 0.6rem", fontFamily:"'DM Mono',monospace", fontSize:"0.82rem", border:"1px solid #d8d0c4", borderRadius:"6px", background:"#faf8f5", color:"#3d3228", outline:"none"}} />
                <input value={freqForm.protein} onChange={e => setFreqForm(p => ({...p, protein: e.target.value}))} type="number" placeholder="Protein (g)" style={{padding:"0.5rem 0.6rem", fontFamily:"'DM Mono',monospace", fontSize:"0.82rem", border:"1px solid #d8d0c4", borderRadius:"6px", background:"#faf8f5", color:"#3d3228", outline:"none"}} />
              </div>
              <button onClick={() => {
                const { name, serving, calories, protein } = freqForm;
                if (!name || !serving || !calories || !protein) return;
                const newEntry = { name, serving, calories: parseInt(calories), protein: parseInt(protein) };
                const updated = [...customFoods, newEntry];
                setCustomFoods(updated);
                setFreqForm({ name: "", serving: "", calories: "", protein: "" });
              }} style={{padding:"0.5rem 1rem", fontFamily:"'DM Mono',monospace", fontSize:"0.78rem", background:"#3d3228", color:"#faf8f5", border:"none", borderRadius:"6px", cursor:"pointer"}}>+ Add</button>
            </div>
          </div>
        ) : showSmoothie ? (
          <div className="rules-page" onClick={() => setSmoothieDropdown(false)}>
            <button className="back-link" onClick={closeSmoothiePage}>← Back</button>
            <h1>Smoothie calculator</h1>
            <p className="subtitle">Build your recipe · {latestDate}</p>

            {/* Search bar with dropdown */}
            <div style={{position:"relative", marginTop:"1.25rem", marginBottom:"1.5rem"}} onClick={e => e.stopPropagation()}>
              <input
                value={smoothieSearch}
                onChange={e => { setSmoothieSearch(e.target.value); setSmoothieDropdown(true); }}
                onFocus={() => setSmoothieDropdown(true)}
                onBlur={() => setTimeout(() => setSmoothieDropdown(false), 150)}
                placeholder="Search & add ingredient…"
                style={{width:"100%", boxSizing:"border-box", padding:"0.55rem 0.75rem", fontFamily:"'DM Mono',monospace", fontSize:"0.82rem", border:"1px solid #d8d0c4", borderRadius:"6px", background:"#faf8f5", color:"#3d3228", outline:"none"}}
              />
              {smoothieDropdown && (
                <div style={{position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:"#fff", border:"1px solid #d8d0c4", borderRadius:"6px", zIndex:100, maxHeight:"220px", overflowY:"auto", boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}}>
                  {[...FREQUENT_FOODS, ...customFoods]
                    .filter(f => !smoothieSearch || f.name.toLowerCase().includes(smoothieSearch.toLowerCase()))
                    .map(f => (
                      <div
                        key={f.name}
                        onMouseDown={() => {
                          const sG = SERVING_GRAMS[f.name] || null;
                          setSmoothieItems(prev => [...prev, { id: Date.now(), name: f.name, servingLabel: f.serving, servingG: sG, grams: sG || 0, servings: 1, calsPerServing: f.calories, proteinPerServing: f.protein }]);
                          setSmoothieSearch("");
                          setSmoothieDropdown(false);
                        }}
                        style={{padding:"0.5rem 0.75rem", fontFamily:"'DM Mono',monospace", fontSize:"0.78rem", color:"#3d3228", cursor:"pointer", borderBottom:"1px solid #f5f2ee", display:"flex", justifyContent:"space-between", alignItems:"center"}}
                        onMouseEnter={e => e.currentTarget.style.background="#f7f4ef"}
                        onMouseLeave={e => e.currentTarget.style.background="#fff"}
                      >
                        <span>{f.name}</span>
                        <span style={{color:"#b5a898", fontSize:"0.68rem", marginLeft:"0.75rem", flexShrink:0}}>{f.serving}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* Ingredients table */}
            <table style={{width:"100%", borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  {["Ingredient", "Amount", "Cal", "Protein", ""].map(h => (
                    <th key={h} style={{fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#b5a898", padding:"0 0.4rem 0.6rem", textAlign: h==="Ingredient" ? "left" : "right"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {smoothieItems.length === 0 && !showCustomRow && (
                  <tr>
                    <td colSpan={5} style={{padding:"0.75rem 0"}}></td>
                  </tr>
                )}
                {smoothieItems.map(item => {
                  const cal = item.servingG ? Math.round((item.grams / item.servingG) * item.calsPerServing) : Math.round(item.servings * item.calsPerServing);
                  const prot = item.servingG ? Math.round((item.grams / item.servingG) * item.proteinPerServing) : Math.round(item.servings * item.proteinPerServing);
                  return (
                    <tr key={item.id} style={{borderTop:"1px solid #f0ebe3"}}>
                      <td style={{fontFamily:"'DM Mono',monospace", fontSize:"0.76rem", color:"#3d3228", padding:"0.5rem 0.4rem", maxWidth:"150px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{item.name}</td>
                      <td style={{padding:"0.4rem 0.4rem", textAlign:"right"}}>
                        {item.customAmount ? (
                          <span style={{fontFamily:"'DM Mono',monospace", fontSize:"0.76rem", color:"#6b5f52"}}>{item.customAmount}</span>
                        ) : item.servingG ? (
                          <div style={{display:"flex", alignItems:"center", justifyContent:"flex-end", gap:"0.2rem"}}>
                            <input type="number" value={item.grams} onChange={e => updateSmoothieGrams(item.id, e.target.value)} style={{width:"50px", fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", background:"#fff", border:"1px solid #d6cfc4", color:"#2c2418", padding:"0.18rem 0.3rem", borderRadius:"2px", textAlign:"right"}} />
                            <span style={{fontFamily:"'DM Mono',monospace", fontSize:"0.62rem", color:"#b5a898"}}>g</span>
                          </div>
                        ) : (
                          <div style={{display:"flex", alignItems:"center", justifyContent:"flex-end", gap:"0.2rem"}}>
                            <input type="number" value={item.servings} step="0.5" min="0" onChange={e => updateSmoothieServings(item.id, e.target.value)} style={{width:"38px", fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", background:"#fff", border:"1px solid #d6cfc4", color:"#2c2418", padding:"0.18rem 0.3rem", borderRadius:"2px", textAlign:"right"}} />
                            <span style={{fontFamily:"'DM Mono',monospace", fontSize:"0.62rem", color:"#b5a898"}}>srv</span>
                          </div>
                        )}
                      </td>
                      <td style={{fontFamily:"'DM Mono',monospace", fontSize:"0.76rem", color:"#b07d3a", padding:"0.5rem 0.4rem", textAlign:"right"}}>{item.customAmount && item.customCal === null ? "" : cal}</td>
                      <td style={{fontFamily:"'DM Mono',monospace", fontSize:"0.76rem", color:"#6b5f52", padding:"0.5rem 0.4rem", textAlign:"right"}}>{item.customAmount && item.customProtein === null ? "" : prot + "g"}</td>
                      <td style={{padding:"0.5rem 0.1rem", textAlign:"right"}}><button onClick={() => removeSmoothieItem(item.id)} className="sheet-del">×</button></td>
                    </tr>
                  );
                })}

                {/* Add ingredient link */}
                {!showCustomRow && (
                  <tr>
                    <td colSpan={5} style={{padding:"0.4rem 0.4rem 0.6rem"}}>
                      <button onClick={() => setShowCustomRow(true)} style={{fontFamily:"'DM Mono',monospace", fontSize:"0.68rem", letterSpacing:"0.06em", color:"#6b5f52", background:"none", border:"1px solid #d6cfc4", borderRadius:"3px", cursor:"pointer", padding:"0.25rem 0.65rem"}}>+ add ingredient</button>
                    </td>
                  </tr>
                )}

                {/* Custom ingredient input row */}
                {showCustomRow && (
                  <React.Fragment>
                    <tr style={{borderTop:"1px solid #f0ebe3"}}>
                      <td style={{padding:"0.4rem 0.3rem"}}>
                        <input autoFocus value={customRow.name} onChange={e => setCustomRow(p => ({...p, name: e.target.value}))} placeholder="*" style={{width:"100%", fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", border:"1px solid #d8d0c4", borderRadius:"3px", padding:"0.3rem 0.4rem", background:"#faf8f5", boxSizing:"border-box"}} />
                      </td>
                      <td style={{padding:"0.4rem 0.3rem"}}>
                        <input value={customRow.amount} onChange={e => setCustomRow(p => ({...p, amount: e.target.value}))} placeholder="*" style={{width:"100%", fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", border:"1px solid #d8d0c4", borderRadius:"3px", padding:"0.3rem 0.4rem", background:"#faf8f5", textAlign:"right", boxSizing:"border-box"}} />
                      </td>
                      <td style={{padding:"0.4rem 0.3rem"}}>
                        <input value={customRow.cal} onChange={e => setCustomRow(p => ({...p, cal: e.target.value}))} placeholder="" type="number" style={{width:"100%", fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", border:"1px solid #d8d0c4", borderRadius:"3px", padding:"0.3rem 0.4rem", background:"#faf8f5", textAlign:"right", boxSizing:"border-box"}} />
                      </td>
                      <td style={{padding:"0.4rem 0.3rem"}}>
                        <input value={customRow.protein} onChange={e => setCustomRow(p => ({...p, protein: e.target.value}))} placeholder="" type="number" onKeyDown={e => e.key === "Enter" && submitCustomRow()} style={{width:"100%", fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", border:"1px solid #d8d0c4", borderRadius:"3px", padding:"0.3rem 0.4rem", background:"#faf8f5", textAlign:"right", boxSizing:"border-box"}} />
                      </td>
                      <td style={{padding:"0.4rem 0.2rem", whiteSpace:"nowrap"}}>
                        <button onClick={submitCustomRow} style={{fontFamily:"'DM Mono',monospace", fontSize:"0.65rem", background:"#2c2418", color:"#fff", border:"none", borderRadius:"3px", padding:"0.25rem 0.4rem", cursor:"pointer", marginRight:"0.2rem"}}>✓</button>
                        <button onClick={() => { setShowCustomRow(false); setCustomRow({ name:"", amount:"", cal:"", protein:"" }); setCustomRowError(false); }} style={{fontFamily:"'DM Mono',monospace", fontSize:"0.65rem", background:"none", border:"1px solid #d6cfc4", color:"#9a8f7e", borderRadius:"3px", padding:"0.25rem 0.4rem", cursor:"pointer"}}>✕</button>
                      </td>
                    </tr>
                    {customRowError && (
                      <tr>
                        <td colSpan={5} style={{fontFamily:"'DM Mono',monospace", fontSize:"0.68rem", color:"#c0392b", padding:"0.2rem 0.4rem 0.4rem"}}>Ingredient and amount are required.</td>
                      </tr>
                    )}
                  </React.Fragment>
                )}

                {/* Divider */}
                <tr><td colSpan={5} style={{borderTop:"2px solid #d8d0c4", padding:0}}></td></tr>

                {/* Smoothie total row */}
                <tr style={{background:"#f7f4ef"}}>
                  <td colSpan={2} style={{fontFamily:"'DM Mono',monospace", fontSize:"0.88rem", fontWeight:"600", color:"#2c2418", padding:"0.7rem 0.4rem", letterSpacing:"0.04em"}}>Smoothie total</td>
                  <td style={{fontFamily:"'DM Mono',monospace", fontSize:"0.95rem", fontWeight:"700", color:"#b07d3a", padding:"0.7rem 0.4rem", textAlign:"right"}}>{smoothieCals}</td>
                  <td style={{fontFamily:"'DM Mono',monospace", fontSize:"0.95rem", fontWeight:"700", color:"#3d3228", padding:"0.7rem 0.4rem", textAlign:"right"}}>{smoothieProtein}g</td>
                  <td></td>
                </tr>

                {/* After smoothie row */}
                <tr style={{background:"#eaf2eb"}}>
                  <td colSpan={2} style={{fontFamily:"'DM Mono',monospace", fontSize:"0.88rem", fontWeight:"600", color:"#2c2418", padding:"0.7rem 0.4rem", letterSpacing:"0.04em"}}>After smoothie</td>
                  <td style={{fontFamily:"'DM Mono',monospace", fontSize:"0.95rem", fontWeight:"700", color: calDeficitAfter >= 300 ? "#3a7d44" : calDeficitAfter >= 0 ? "#b07d3a" : "#b84040", padding:"0.7rem 0.4rem", textAlign:"right"}}>{calDeficitAfter} def</td>
                  <td style={{fontFamily:"'DM Mono',monospace", fontSize:"0.95rem", fontWeight:"700", color: proteinAfter >= 120 ? "#3a7d44" : "#b07d3a", padding:"0.7rem 0.4rem", textAlign:"right"}}>{proteinAfter}g</td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <div style={{marginTop:"1.25rem"}}>
              {smoothieLogged ? (
                <div>
                  <div style={{fontFamily:"'DM Mono',monospace", fontSize:"0.7rem", color:"#9a8f7e", marginBottom:"0.4rem"}}>Click to select, then Cmd+C — paste to Claude to log</div>
                  <textarea
                    readOnly
                    value={smoothieCopyText}
                    onClick={e => e.target.select()}
                    rows={2}
                    style={{width:"100%", fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", background:"#f5f0ea", border:"1px solid #d6cfc4", borderRadius:"3px", padding:"0.5rem", color:"#2c2418", resize:"none", cursor:"text", boxSizing:"border-box"}}
                  />
                  <div style={{textAlign:"right", marginTop:"0.5rem"}}>
                    <button onClick={() => { setSmoothieLogged(false); setSmoothieCopyText(""); }} style={{fontFamily:"'DM Mono',monospace", fontSize:"0.7rem", background:"none", border:"1px solid #d6cfc4", color:"#9a8f7e", padding:"0.3rem 0.75rem", borderRadius:"3px", cursor:"pointer"}}>Clear</button>
                  </div>
                </div>
              ) : (
                <div style={{textAlign:"right"}}>
                  <button
                    onClick={copyIngredients}
                    disabled={smoothieItems.length === 0}
                    style={{fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", letterSpacing:"0.08em", textTransform:"uppercase", background: smoothieItems.length > 0 ? "#2c2418" : "#d6cfc4", color:"#fff", border:"none", padding:"0.55rem 1.25rem", borderRadius:"3px", cursor: smoothieItems.length > 0 ? "pointer" : "not-allowed"}}
                  >
                    Generate Ingredient List
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
        <>
        <h1>Calorie Tracker</h1>
        <p className="subtitle">Ruonan · 35F · 5&apos;4&quot; · 156 lbs</p>
        <div className="page-links">
          <button className="rules-link" onClick={() => setShowRules(true)}>Calculation rule</button>
          <button className="rules-link" onClick={() => setShowFrequent(true)}>Frequently eat</button>
          <button className="rules-link" onClick={openSmoothiePage}>Smoothie calculator</button>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th style={{textAlign:"left"}}>Date</th>
              <th>Eaten</th>
              <th>Burn</th>
              <th>Deficit</th>
              <th>Protein</th>
            </tr>
          </thead>
          <tbody>
            {dates.map(d => {
              const entries = log[d] || [];
              const t = getTotals(entries);
              const burn = workouts[d] || 0;
              const burnAdj = Math.round(burn * EPOC_FACTOR);
              const totalBurn = TDEE + burnAdj;
              const deficit = totalBurn - t.calories;
              return (
                <tr key={d} onClick={() => { setSheetDate(d); setAdding(false); setEditingWorkout(false); setShowWorkoutDetails(false); }}>
                  <td>
                    <span className="date-str">{new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </td>
                  <td>
                    <span className="cell-main">{t.calories}</span>
                    <span className="cell-sub">{(totalBurn - 300).toLocaleString()}</span>
                  </td>
                  <td>
                    {burn > 0 && <span style={{fontSize:"16px",marginRight:"4px"}}>💪</span>}
                    <span className="cell-main">{totalBurn.toLocaleString()}</span>
                  </td>
                  <td>
                    <span className={deficit >= 0 ? "deficit-pos" : "deficit-neg"}>
                      {deficit >= 0 ? "−" : "+"}{Math.abs(deficit)}
                    </span>
                  </td>
                  <td>{t.protein}g</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="add-date-row">
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
          <button onClick={addDate}>+ Add day</button>
        </div>
        </>
        )}
      </div>

      {sheetDate && (
        <>
          <div className="overlay" onClick={() => { setSheetDate(null); setAdding(false); setEditingWorkout(false); }} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-date">{formatDate(sheetDate)}</div>

            <div className="sheet-stats">
              <div className="stat-card">
                <div className="stat-label">Eaten</div>
                <div className="stat-val amber">{sheetTotals.calories}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Burn</div>
                <div className="stat-val" style={{color:"#3a7d44"}}>{sheetTotalBurn.toLocaleString()}</div>
                {sheetWorkout > 0 && <div style={{fontSize:"10px",marginTop:"2px"}}>💪 {sheetWorkoutAdj} (workout, incl. +10% EPOC)</div>}
              </div>
              <div className="stat-card">
                <div className="stat-label">Deficit</div>
                <div className={`stat-val ${sheetDeficit >= 0 ? "green" : "red"}`}>
                  {sheetDeficit >= 0 ? "−" : "+"}{Math.abs(sheetDeficit)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Protein</div>
                <div className="stat-val">{sheetTotals.protein}g</div>
                <div className="stat-sub">120–130g</div>
              </div>
            </div>

            {sheetWorkout > 0 ? (
              <div style={{marginBottom:"1.25rem"}}>
                <div className="workout-row" style={{borderRadius: showWorkoutDetails ? "6px 6px 0 0" : "6px", marginBottom: 0}}>
                  <span className="workout-label">🏋️ Workout burn: {sheetWorkoutAdj} kcal (incl. EPOC)</span>
                  <button className="workout-edit" onClick={() => setShowWorkoutDetails(v => !v)}>
                    {showWorkoutDetails ? "hide details" : "view details"}
                  </button>
                </div>
                {showWorkoutDetails && (
                  <div className="workout-details">
                    {(WORKOUT_DETAILS[sheetDate] || [{ name: "Workout session", calories: sheetWorkout }]).map((item, i) => (
                      <div className="workout-detail-row" key={i}>
                        <span>{item.name}</span>
                        <span>{item.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : editingWorkout ? (
              <div className="workout-row" style={{marginBottom:"1.25rem"}}>
                <span className="workout-label">Workout burn (kcal):</span>
                <input className="workout-input" type="number" placeholder="e.g. 335" value={workoutInput} onChange={e => setWorkoutInput(e.target.value)} />
                <button className="workout-save" onClick={saveWorkoutBurn}>Save</button>
              </div>
            ) : (
              <button className="sheet-add-btn" style={{marginTop:0, marginBottom:"1.25rem"}} onClick={() => { setEditingWorkout(true); setWorkoutInput(""); }}>+ Log workout</button>
            )}

            <div className="section-label">Food entries</div>
            {sheetEntries.length === 0 && <div className="sheet-empty">No entries yet</div>}
            {sheetEntries.map(e => (
              <div className="sheet-entry" key={e.id}>
                <span className="sheet-name">{e.item}</span>
                <span className="sheet-protein">{e.protein}g</span>
                <span className="sheet-cal">{e.calories}</span>
                <button className="sheet-del" onClick={() => removeEntry(sheetDate, e.id)}>×</button>
              </div>
            ))}

            {!adding && <button className="sheet-add-btn" onClick={() => setAdding(true)}>+ Add entry</button>}
            {adding && (
              <div className="form">
                <input placeholder="Food item" value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} />
                <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}>
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
                <div className="form-row">
                  <input placeholder="Cal" type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} />
                  <input placeholder="P g" type="number" value={form.protein} onChange={e => setForm(f => ({ ...f, protein: e.target.value }))} />
                  <input placeholder="C g" type="number" value={form.carbs} onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))} />
                  <input placeholder="F g" type="number" value={form.fat} onChange={e => setForm(f => ({ ...f, fat: e.target.value }))} />
                </div>
                <div className="form-actions">
                  <button className="btn-cancel" onClick={() => { setAdding(false); setForm(EMPTY_ENTRY); }}>Cancel</button>
                  <button className="btn-primary" onClick={addEntry}>Save</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
