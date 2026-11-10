# Livraison et commercialisation — nibylogames

## Plateformes

Distribution commerciale exclusivement sur Google Play (Android) et App Store (iOS), avec interface mobile portrait. Aucune distribution Steam ou PC. La PWA et les archives web sont des outils de test : leur disponibilité ne constitue pas une sortie commerciale web. Les achats et annonces restent réservés aux applications natives configurées.

## Identité

- Nom : In That Order
- Éditeur public : nibylogames
- Identifiant proposé Android/iOS : `com.nibylogames.inthatorder` (à confirmer libre et identique à vos fiches avant premier envoi).
- Version : 1.0.0 / build 1.
- Android : min API 24, cible/compilation API 36. iOS : 15.4+ (dialogues natifs HTML et API modernes du moteur WebKit).
- Application gratuite, avec publicités et achat intégré unique ; pas d’abonnement.

## Configurer les services réels

1. Créer les deux fiches d’application dans Google Play Console et App Store Connect. Un compte Apple Developer et un Mac avec Xcode sont nécessaires pour iOS.
2. Dans chaque store, créer un produit **non consommable** `no_ads_lifetime`, nommé « Sans pubs + indices illimités ». Définir **1,99 €** pour le marché français et vérifier les prix locaux. Le jeu affiche le prix fourni par le store, pas un prix universel codé en dur.
3. Créer/configurer un projet RevenueCat pour les deux applications. Relier les stores via leurs mécanismes sécurisés ; aucun secret serveur dans le client. Créer l’entitlement `no_ads`, y associer les deux produits et placer le package à vie dans l’offering courant. Fournir les clés SDK **publiques** Android/iOS.
4. Dans AdMob, enregistrer les deux applications et créer une unité interstitielle et une unité récompensée pour chacune. Configurer les messages de consentement UMP, la politique de confidentialité et les réglages correspondant au public effectivement déclaré.
5. Copier `.env.example` vers `.env.production.local` (ignoré par Git), renseigner les identifiants publics, l’URL HTTPS de confidentialité et l’adresse de contact. Ne jamais placer de secrets Apple/Google/RevenueCat dans une variable `VITE_*` : elles sont publiques dans le bundle.
6. Exécuter `npm run mobile:sync`, puis `npm run release:check`. La configuration par défaut utilise les app IDs de démonstration Google et désactive les annonces et achats non configurés. Ce n’est pas une configuration commerciale.

L’intégration RevenueCat est réalisée, mais un compte/configuration RevenueCat n’a pas été fourni pendant le développement. Il s’agit d’un service tiers à activer selon ses conditions ; aucun compte ni abonnement n’a été souscrit automatiquement.

## Android

```sh
npm ci
npm run mobile:sync
npm run release:check
cd android
./gradlew --no-daemon --max-workers=2 assembleDebug bundleRelease
```

`assembleDebug` produit un APK de test. `bundleRelease` produit un AAB **non signé** en l’absence de configuration de signature. Pour la publication, ouvrir `android/` dans Android Studio et utiliser **Generate Signed App Bundle**, avec votre clé d’envoi Google Play. Ne pas créer une clé de production jetable ou committer un keystore. Tester ensuite le bundle signé sur une piste interne Google Play, avec des comptes testeurs de licence.

Un APK debug n’est pas un produit à envoyer au store. Un AAB non signé ne permet pas la publication.

## iOS

```sh
npm ci
npm run mobile:sync
npx cap open ios
```

Dans Xcode : choisir l’équipe Apple de nibylogames, vérifier le bundle ID, les capacités achats intégrés et le profil de signature, résoudre les packages Swift, compiler, tester sur iPhone/iPad, puis Archive / Distribute App vers TestFlight. Le projet fournit les icônes, le lancement et le manifeste d’utilisation des préférences `CA92.1`.

Le fichier Info.plist inclut l’identifiant SKAdNetwork Google. Avant distribution publicitaire iOS, compléter la liste des identifiants des partenaires réellement utilisés à partir de la documentation Google actuelle, vérifier les manifests de confidentialité des SDK résolus et les déclarations App Privacy. Aucun dialogue ATT n’est déclenché par le jeu ; les demandes d’annonces utilisent `npa: true`. Les annonces non personnalisées restent soumises aux obligations de consentement applicables.

## Recette bloquante avant publication

- Achat sandbox réussi, annulé, en attente et refusé sur **les deux stores** ; restauration après réinstallation ; remboursement/révocation et reprise réseau.
- Premium confirmé : zéro demande publicitaire, indices gratuits illimités, compteur de pièces masqué.
- Vidéo terminée : un seul indice ; vidéo interrompue ou sans inventaire : aucune récompense indue ; l’aide gratuite reste accessible.
- Refus de consentement, formulaire indisponible, modification des choix, pas de publicité avant autorisation UMP.
- Reprise après interruption pendant un vote, une publicité et un achat ; mode avion ; petit téléphone, appareil avec encoche, tablette.
- Vérification tactile sur Android et iOS, lecteur d’écran, taille de texte, silence et réduction d’animations.
- Sélection humaine des niveaux et courbe de difficulté. La solvabilité est testée automatiquement ; le plaisir n’est pas certifié par un solveur.
- Héberger la politique de confidentialité complétée ; renseigner assistance, identité légale, App Privacy / Data safety, âge et présence de publicités/achats. Ne pas déclarer « aucune donnée collectée » sans tenir compte d’AdMob et RevenueCat.
- Compléter et héberger `app-ads.txt` avec la ligne exacte fournie par AdMob, sur le domaine d’éditeur déclaré ; ne pas inventer de publisher ID.

## Publication

Les textes français sont préparés dans `docs/STORE-FR.md`. Les captures de navigateur représentent le jeu mais ne remplacent pas les captures finales sur appareils exigées par les stores. La publication n’a pas été effectuée. Les comptes développeur, certificats, contrats, prix et fiches ne sont pas modifiés automatiquement par le code.
