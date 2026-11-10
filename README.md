# In That Order

Jeu de logique mobile de **nibylogames**. Réorganisez les votants pour obtenir le résultat demandé. 300 niveaux, 10 chapitres, 5 comportements, aucun chronomètre. Interface française.

## Lancer

Prérequis : Node.js 22.12+ (testé avec 24), npm.

```sh
npm ci
npm run dev
```

Ouvrir le serveur annoncé par Vite. Le projet utilise React/TypeScript et Capacitor 8. **La commercialisation vise uniquement les mobiles Android (Google Play) et iOS (App Store). Aucune version Steam ou PC n’est prévue. La PWA installable sert uniquement aux tests.** Son affichage reste en format mobile portrait, y compris depuis un navigateur de bureau. Les fichiers sources sont dans `src/`, les projets natifs dans `android/` et `ios/`.

```sh
npm test
npm run test:e2e
npm run build
node scripts/check-offline.mjs
npm run mobile:sync
```

Les tests navigateur utilisent Chromium (`/usr/bin/chromium` ici). Ailleurs, fournir `CHROMIUM_PATH` pointant sur Chrome/Chromium. La compilation web se trouve dans `dist/` ; la servir en HTTP(S), ne pas ouvrir directement `index.html` avec file://. L’installation PWA exige HTTPS ou une origine locale de développement.

## Direction visuelle

Interface casual colorée : violet, corail et turquoise, cartes de personnages différenciées, boutons en relief et police arrondie Nunito embarquée pour fonctionner hors ligne. Mise en page mobile en une colonne ; orientation portrait dans les projets natifs.

## Fonctionnalités

- Déplacement tactile, souris, clavier, boutons haut/bas ou sélection puis destination ; annulation des déplacements.
- Votes déterministes, affichage séquentiel accélérable et explication de chaque vote.
- Objectifs de majorité, score exact et vote individuel ; positions imposées.
- +10 pièces par première réussite, 30 pièces par indice, aucun farming sur les relectures.
- Indice compatible avec les verrous existants ; aide progressive gratuite et illimitée, utilisable hors ligne.
- Sauvegarde versionnée, validation des ordres restaurés, reprise, sons originaux synthétisés et réduction des animations.
- Achat non consommable `no_ads_lifetime`, entitlement RevenueCat `no_ads` : aucune publicité et indices illimités.
- AdMob : consentement UMP avant initialisation, annonces non personnalisées, récompense uniquement après événement SDK, intervalle minimal de huit minutes, aucune interstitielle pendant une énigme.

## État de livraison

Cette livraison contient le jeu et ses intégrations natives. **Elle ne doit pas être décrite comme publiée ou validée par Apple/Google.** Les identifiants de produits, le consentement réel, les paiements sandbox, la signature, les essais sur appareils et les informations légales de l’éditeur doivent être finalisés avant commercialisation. Aucun faux achat n’est proposé dans le navigateur.

Lire `docs/RELEASE.md`, `docs/QA.md` et `.env.example`. `npm run release:check` échoue volontairement tant que la configuration de production manque.

## Campagne

Les 300 niveaux sont livrés en données statiques, avec des identifiants permanents. Le solveur vérifie chaque niveau et chaque indice ; les tests comparent également toutes leurs permutations à un second interpréteur des règles.

`npm run levels` reconstruit la campagne depuis la graine 549283. **Ne pas régénérer la campagne après sa publication** : des sauvegardes utilisent les identifiants existants. Ajouter de futurs niveaux avec de nouveaux identifiants et une migration explicite. La génération élimine certains doublons structurels, mais ne constitue pas une validation humaine du plaisir ou de la difficulté.

## Environnement cloud

Utiliser le checkout existant dans `/workspace/In-That-Order`. Chaque tâche est isolée ; ne pas créer de worktree sauf demande explicite. `npm ci`, `npm run build`, puis `npm run dev` remettent l’application en route. Les processus ne survivent pas aux nouvelles sessions.

Dans l’environnement préparé, Android SDK est dans `/workspace/.tools/android-sdk` et le cache Gradle dans `/workspace/.tools/gradle`. `android/local.properties` est local et ignoré. Ailleurs, configurer son propre SDK Android 36 et JDK 21. iOS nécessite macOS/Xcode.

Le JDK complet installé dans cette session est `/workspace/.tools/temurin/jdk-21.0.13+9` (définir `JAVA_HOME` sur ce dossier pour compiler ici). Le Java système initial était un JRE sans compilateur. Les téléchargements JDK et Gradle ont été vérifiés contre les sommes de contrôle de leurs éditeurs. Dans le cloud, conserver le proxy et la confiance TLS fournis lors des builds natifs.

## Droits

Code et dessins originaux réalisés pour nibylogames. Aucune licence open source n’est appliquée à votre code propriétaire. Les dépendances conservent leurs propres licences : voir `THIRD_PARTY_NOTICES.md`. Les emoji sont rendus par le système de l’utilisateur, sans images tierces embarquées.
