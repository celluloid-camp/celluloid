export default {
  menu: {
    login: 'connexion',
    signup: 'inscription',
    legalNotice: 'Mention légales',
    termsAndConditions: 'Conditions Générales d\'Utilisation',
    about: 'à propos'
  },

  home: {
    title: 'Apprendre ensemble avec une vidéo',
    description:
      'Partagez une vidéo Youtube avec vos élèves, vos'
      + ' étudiant.e.s ou un groupe en formation : créez'
      + ' votre projet pédagogique, annotez les images,'
      + ' posez des questions et répondez à celles des'
      + ' participant.e.s.',
    teachers: 'Enseignants et formateurs',
    students: 'Élèves et étudiants',
    addVideo: 'Ajoutez un lien vers une vidéo YouTube...',
    newProject: 'Nouveau projet',
    joinProject: 'Rejoindre un projet',
    searchProject: 'Rechercher un projet…',
    myProjects: 'Mes projets',
    publicProjects: 'Projets publics',
    emptySearchResult: 'Aucun projet ne correspond à votre recherche',
  },

  about: {
    title: 'À propos',
    intro: {
      prefix: 'Le développement de la plateforme ',
      suffix: ' s’inscrit dans le cadre d’un projet de recherche'
        + ' porté par Michaël Bourgatte et Laurent Tessier au sein'
        + ' de l’Atelier du Numérique de l’Institut Catholique de Paris.'
    },
    support: 'Le développement de cette plateforme d’annotation vidéo'
      + ' à vocation pédagogique a bénéficié du soutien de la'
      + ' Fondation Saint Matthieu.',
    opensource: {
      prefix: 'Celluloid est un projet Open Source développé par Erwan'
        + ' Queffélec dans le cadre d\'un partenariat avec La Paillasse.'
        + ' L’ensemble du code est accessible librement ',
      github: 'sur GitHub'
    }
  },

  signin: {
    signupTitle: 'Inscription',
    loginTitle: 'Connexion',
    confirmSignupTitle: 'Confirmation',
    forgotPasswordTitle: 'Mot de passe perdu',
    joinProjectTitle: 'Rejoindre un projet',

    login: 'Email ou nom d\'utilisateur',
    username: 'Nom complet ou pseudo',
    code: 'Code de confirmation',
    email: 'Adresse email',
    password: 'Mot de passe',
    passwordHint: 'Question secrète',
    secretAnswer: 'Réponse à la question',
    projectCode: 'Code du projet',
    confirmPassword: 'Confirmer le mot de passe',

    passwordHelper: '8 caractères minimum',
    codeHelper: 'Ce code vous a été envoyé par email',
    passwordMismatch: 'Les mots de passe ne correspondent pas',

    notRegistered: 'Pas encore de compte ?',
    alreadyRegistered: 'Déjà un compte ?',
    rememberAnswer: 'Attention ! Cette réponse sert de mot de passe'
      + ' et ne pourra pas être récupérée !',
    defaultQuestion: 'Quel est le nom de ton livre préféré ?',

    resetAction: 'mettre à jour',
    resendCodeAction: 'Envoyer un nouveau code',
    confirmSignupAction: 'Confirmer l\'inscription',
    signupAction: 's\'inscrire',
    forgotPasswordAction: 'mot de passe oublié',
    loginAction: 'se connecter',
    changePasswordAction: 'changer le mot de passe',
    joinAction: 'rejoindre',

    upgradeAccountMessage: 'Pour continuer, vous devez renseigner'
      + ' votre adresse email et un mot de passe',
    signupOrLoginMessage: 'Pour continuer, vous devez vous inscrire'
      + ' ou vous connecter',
  },

  notFound: {
    title: 'Page introuvable :(',
    description: 'La page que vous cherchez est peut-être privée'
      + ' ou à peut-être été supprimée',
    action: 'retour à l\'accueil'
  },

  project: {
    createAction: 'Créer le projet',
    cancelAction: 'Annuler',
    createTitle: 'Nouveau projet',
    objective: 'Objectif',
    assignments: 'Exercice',
    title: 'Titre',
    description: 'Description',
    public: 'Public',
    collaborative: 'Collaboratif',
    shared: 'Partage',
    members: '{{ count }} participant',
    members_plural: '{{ count }} participants',

    titleHelper: 'Donnez un titre à votre projet',
    descriptionHelper: 'Décrivez brièvement le contenu de la vidéo',
    objectiveHelper: 'Fixez l\'objectif pédagogique du projet',
    assignmentsHelper: 'Listez les différentes activités que'
      + ' vous proposez au partcipants',
    tagsHelper: 'Choisissez un ou plusieurs domaines correspondant'
      + ' à votre projet',
    levelsHelper: 'Veuillez préciser à quels niveaux s\'adresse'
      + ' ce projet',
    publicHelper: 'Rendre un projet public signifie que tous'
      + ' les utilisateurs de la plateforme pourront le consulter,'
      + ' mais ils ne pourront'
      + ' pas y participer, ni voir les annotations.',
    collaborativeHelper: '`Rendre un projet collaboratif signifie'
      + ' que les personnes que vous invitez pourront annoter la'
      + ' vidéo. Si le projet n’est pas collaboratif, vous seul.e'
      + ' pourrez annoter la vidéo.',

    assignmentsSection: 'Activités proposées',
    tagsSection: 'Domaines',
    levelsSection: 'Niveau',
    visibilitySection: 'Partage',

    assignmentPlaceholder: 'Ajouter une activité',
    tagsPlaceholder: '"Recherchez ou ajoutez un autre domaine…',

    codeWarning: {
      title: 'Conservez bien ce code.',
      description: 'L\'application ne pourra plus l\'afficher une fois'
        + ' cette fenêtre fermée. En cas de perte, il faudra'
        + ' en créer un nouveau.'
    },

    share: {
      dialog: {
        description: 'Pour ouvrir une fiche pédagogique'
          + ' imprimable dans une nouvelle fenêtre, ',
        linkText: 'cliquez ici'
      },
      guide: {
        title: 'Fiche pédagogique',
        subtitle: 'Comment utiliser Celluloid ?',
        step1: 'Allez sur le site internet',
        step2: 'Sur la page d\'accueil, cliquez sur '
          + ' "rejoindre un projet"',
        step3: 'Entrez le code du projet',
        step4: 'Indiquez votre nom et une réponse secrète',
        step5: 'Lisez bien les consignes et l\'exercice',
        step6: 'Réalisez l\'exercice et annotez la vidéo' +
          ' au fil de la lecture'
      }
    },
    creatorRole: 'Créateur'
  },

  update: {
    message: 'L\'application a été mise à jour.'
      + ' Veuillez rafraîchir la page.',
    action: 'Rafraîchir'
  },

  annotation: {
    pauseLabel: 'mettre en pause ?',
    contentPlaceholder: 'Saisissez votre annotation…',
    commentPlaceholade: 'Laissez un commentaire…',
    hintLabel: '{{count}} annotation',
    hintLabel_plural: '{{count}} annotations',
    hintLabelNone: 'Aucune annotation',
    commentLabel: '{{count}} commentaire',
    commentLabel_plural: '{{count}} commentaires'
  },

  tagSearch: {
    createLabel: 'Créer le domaine',
    prefix: 'Domaine : '
  },

  levels: {
    kinderGarten: 'Cycle 1',
    elementarySchool1: 'Cycle 2',
    elementarySchool2: 'Cycle 3',
    middleSchool: 'Collège',
    highSchool: 'Lycée',
    higherEducation: 'Supérieur',
    research: 'Recherche'
  },

  createAction: 'Enregistrer',
  cancelAction: 'Annuler',
  deleteAction: 'Supprimer',
  shareAction: 'Partager',
  printAction: 'Imprimer'
};
