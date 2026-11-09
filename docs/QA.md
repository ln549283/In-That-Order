# Vérifications de livraison

Les résultats ci-dessous proviennent de commandes réellement exécutées dans l’environnement Linux de développement. Ils ne constituent pas des tests sur téléphones physiques ni une validation des stores.

## Exécuté avec succès

- **28 tests automatisés** avec Vitest, répartis entre moteur, économie/sauvegarde et adaptateur commercial.
- **300 niveaux** : état initial perdant, au moins une solution, contraintes respectées et résolution complète possible avec les indices gratuits.
- Chaque objectif individuel exclut au moins un ordre qui serait gagnant sans cette condition.
- Toutes les permutations des 300 niveaux comparées à un second interpréteur des votes.
- Campagne complète simulée et sauvegardée/rechargée après chaque niveau : 300 réussites, récompenses attribuées une seule fois.
- Égalités, première position, minorité avec zéro vote, objectif individuel, ordres invalides, verrous incohérents et sauvegarde corrompue.
- Achat annulé/en attente, restauration et révocation, premium sans publicité, consentement refusé, vidéo interrompue et récompense unique : **SDK natifs simulés dans les tests**, aucun paiement réel.
- **6 parcours Chromium** : première réussite et niveau suivant ; relecture sans farming ; indice conservé après rechargement ; aide gratuite ; achat web indisponible ; clavier ; glisser-déposer tactile émulé ; annulation ; sélection en deux touchers ; interruption de vote ; réinitialisation conservant les verrous.
- Écrans testés : 390×844, 320×740, 1365×950. Vérification d’absence de débordement horizontal et captures dans `release/screenshots/`.
- Compilation TypeScript et Vite de production.
- **Hors ligne réel dans Chromium** : service worker installé, réseau coupé, rechargement, résolution, récompense, passage au niveau suivant et nouvelle reprise après rechargement.
- Projets Android et iOS générés et synchronisés avec les plugins natifs, identifiants d’application et assets nibylogames.
- **Android compilé avec succès** : `assembleDebug` et `bundleRelease`, SDK 36, JDK Temurin 21.0.13, Gradle 8.14.3. APK de test signé et signature vérifiée avec `apksigner` ; AAB de release non signé. Identifiant `com.nibylogames.inthatorder`, version 1.0.0 (1), API minimale 24, cible 36. Analyse `lintVitalRelease` passée.

## Contrôle volontairement bloquant

`npm run release:check` signale la configuration commerciale absente : clés SDK publiques RevenueCat, identifiants AdMob de l’éditeur, activation production des annonces, URL de confidentialité et contact d’assistance. Ce résultat empêche de présenter la livraison de test comme une application prête à être publiée avec la monétisation active.

## Non vérifié ici

- Achat, restauration, remboursement et consentement avec les **vrais services** Google/Apple/AdMob/RevenueCat.
- Application native sur téléphone physique, iPhone/iPad, Safari/WebKit, VoiceOver/TalkBack, coupure pendant un paiement réel.
- Compilation, signature et archive Xcode : macOS et l’équipe Apple de l’éditeur sont nécessaires.
- Attractivité et difficulté ressentie de chacun des 300 niveaux : un contrôle de solvabilité ne remplace pas des tests joueurs. Les niveaux proviennent d’une génération déterministe avec filtres structurels ; ils ne sont pas présentés comme 300 énigmes validées humainement.
- Validation des déclarations légales, de la classification d’âge, des pages stores et de l’acceptation par Apple/Google.

Les captures distribuées sont des rendus du jeu dans Chromium, pas des captures d’appareils natifs.

Le workflow GitHub Actions fourni prépare des contrôles web, Android et iOS sur macOS. Ce workflow n’a pas été lancé sur GitHub dans cette session ; il ne constitue pas une preuve de compilation iOS.
