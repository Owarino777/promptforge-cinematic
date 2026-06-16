# Tâche.md — PromptForge Cinematic Scene

## Objectif global

Transformer le hero actuel en scène cinématique scroll-driven premium avec plusieurs assets 3D, plusieurs backgrounds, du parallax, des transitions de caméra, des overlays, des HUD panels et une progression visuelle longue mais dense.

Le site ne doit pas ressembler à une landing page classique. Le scroll doit donner l’impression que l’utilisateur traverse une scène animée.

## Stack à conserver

* React
* TypeScript
* GSAP
* ScrollTrigger
* Lenis
* CSS custom
* Une seule scène principale pinned
* Une seule timeline GSAP principale
* Pas de `whileInView`
* Pas de `setTimeout`
* Pas de ScrollTrigger séparés pour chaque asset

## Règles permanentes

* Ne pas casser l’engine GSAP / Lenis existant.
* Ne pas supprimer le cleanup React.
* Ne pas supprimer `prefers-reduced-motion`.
* Ne pas créer de sections classiques.
* Ne pas créer de fade-in générique.
* Ne pas empiler les assets sans hiérarchie.
* Ne pas modifier tout le projet en une seule passe.
* Les commentaires du code doivent être en anglais.
* Les éléments décoratifs doivent être `aria-hidden="true"`.
* Les fichiers à modifier en priorité sont `src/App.tsx` et `src/index.css`.

## Direction artistique

Style recherché :

* premium
* cinématique
* sombre
* futuriste
* 3D
* profondeur
* parallax
* objets lumineux
* HUD panels
* wireframe
* light streaks
* transition d’ambiance

Ne pas rester uniquement sur le violet. Utiliser aussi :

* bleu / cyan
* orange / amber
* vert HUD
* blanc glacé
* noir profond

## Assets disponibles

Les assets ajoutés au projet doivent être organisés dans `src/assets/scene/`.

Noms attendus, à adapter aux fichiers réellement présents :

* `object-violet-stack.png`
* `object-blue-stack.png`
* `object-amber-stack.png`
* `object-ring.png`
* `object-orb.png`
* `background-violet-clouds.png`
* `background-blue-clouds.png`
* `background-warm-clouds.png`
* `wireframe-violet.png`
* `hud-violet.png`
* `hud-blue.png`
* `hud-green.png`
* `light-streaks-violet.png`

## Parcours cible final

La scène complète devra progressivement évoluer comme ceci :

1. Intro

   * objet violet principal
   * headline massive
   * background violet
   * halo
   * grille subtile

2. Object Awake

   * objet qui avance vers la caméra
   * light sweep
   * glow plus fort
   * léger parallax

3. Camera Dive

   * sortie du texte
   * mouvement caméra autour de l’objet
   * profondeur accentuée

4. Blueprint Mode

   * wireframe dominant
   * objet plus technique
   * grille / lignes / construction

5. System Panels

   * HUD panels en 3D
   * stagger
   * rotation
   * blur
   * profondeur

6. Color Shift

   * transition violet vers bleu ou orange
   * changement progressif de background
   * changement d’objet ou superposition d’objet

7. Orb / Ring Reveal

   * apparition d’un anneau ou d’une orbe
   * effet premium de nouveau chapitre

8. Final Composition

   * recomposition propre
   * CTA
   * panneaux
   * objet principal
   * sortie sans retour au début

## Découpage obligatoire en passes

Ne pas tout faire d’un coup.

### Passe 01 — Asset registry + layers DOM

Objectif :
Préparer proprement tous les assets et tous les layers dans le JSX, sans refaire toute l’animation.

À faire :

* Importer tous les assets disponibles.
* Créer une constante `SCENE_ASSETS`.
* Ajouter les layers JSX nécessaires.
* Ajouter les classes CSS de base.
* Placer les assets avec `position: absolute`.
* Mettre tous les nouveaux assets décoratifs en `aria-hidden="true"`.
* Ne pas encore créer toute la timeline longue.
* Ne pas encore faire le color shift complet.
* Ne pas encore faire le ring/orb reveal complet.

Critères d’acceptation :

* Le projet compile.
* Les assets sont importés proprement.
* Le DOM contient des layers distincts.
* Le rendu visuel actuel reste stable.
* Aucun ScrollTrigger supplémentaire n’est créé.
* Aucun écran noir vide n’apparaît.

### Passe 02 — Timeline longue et labels

Objectif :
Transformer la timeline existante en vraie timeline longue avec labels clairs.

À faire :

* Passer `.hero-scene` autour de `720vh`.
* Créer les labels :

  * `intro`
  * `objectAwake`
  * `cameraDive`
  * `blueprintMode`
  * `systemPanels`
  * `colorShift`
  * `orbReveal`
  * `finalComposition`
  * `sceneExit`
* Ne pas encore chercher le polish visuel final.
* S’assurer que le scroll ne boucle pas.
* S’assurer que le titre ne revient pas en scroll descendant.

### Passe 03 — Parallax multi-layers

Objectif :
Ajouter du parallax différencié.

À faire :

* background lent
* wireframe moyen
* objet principal fort
* HUD panels plus marqués
* light streaks rapides
* halo et glow synchronisés

### Passe 04 — Blueprint mode

Objectif :
Créer une phase technique / wireframe claire.

À faire :

* rendre le wireframe dominant
* baisser l’opacité de l’objet principal
* ajouter grille / lignes / contours
* donner une impression de construction du système

### Passe 05 — HUD panels

Objectif :
Faire entrer les panels HUD comme vrais éléments 3D.

À faire :

* entrée en stagger
* rotation 3D
* blur vers net
* profondeur
* scale
* opacity
* parallax

### Passe 06 — Color shift

Objectif :
Créer une transition d’ambiance forte.

À faire :

* violet vers bleu ou orange
* crossfade background
* changement progressif d’objet
* pas de coupure brutale

### Passe 07 — Orb / Ring reveal

Objectif :
Introduire un nouvel objet premium.

À faire :

* ring ou orb en foreground
* rotation
* glow
* scale
* composition avec les autres assets

### Passe 08 — Final composition

Objectif :
Recomposer une scène finale propre.

À faire :

* objet principal
* panels
* background
* CTA
* sortie propre

### Passe 09 — Responsive

Objectif :
Corriger mobile/tablette.

### Passe 10 — Performance

Objectif :
Limiter les layers trop lourds, vérifier `will-change`, éviter les animations inutiles.

## Passe active

La passe active est : Passe 03 — Compositing cleanup.
