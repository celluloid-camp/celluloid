export default {
  menu: {
    login: 'login',
    signup: 'signup',
    legalNotice: 'Legal notice',
    termsAndConditions: 'Terms & Conditions',
    about: 'about'
  },

  home: {
    title: 'Learning together with a video',
    description: 'Share a YouTube video with your students,'
      + ' your pupils or your training groups: create your'
      + ' educational project, annotate the video frames,'
      + ' ask questions, provide the answers.',
    teachers: 'Teachers & Trainers',
    students: 'Pupils & Students',
    addVideo: 'Add a link to a YouTube video...',
    newProject: 'new project',
    joinProject: 'join a project',
    searchProject: 'Type anything…',
    myProjects: 'My projects',
    publicProjects: 'Public projects',
    emptySearchResult: 'No matching projects',
  },

  about: {
    title: 'About',
    intro: {
      prefix: '',
      suffix: ' was born from a research project led by'
        + ' Michaël Bourgatte and Laurent Tessier, two senior lecturers in educational sciences'
        + ' involved in the "Atelier du Numérique" (Digital Workshop) of the'
        + ' Paris Catholic University.'
    },
    support: 'Celluloid was made possible thanks to key support '
      + ' from Fondation Saint Matthieu.',
    opensource: {
      prefix: 'Celluloid is an Open Source project crafted by Erwan'
        + ' Queffélec, through a partnership with La Paillasse.'
        + ' Its source code is freely available ',
      github: 'on GitHub'
    }
  },

  signin: {
    signupTitle: 'Signup',
    loginTitle: 'Login',
    confirmSignupTitle: 'Confirm Signup',
    forgotPasswordTitle: 'Forgot password',
    joinProjectTitle: 'Join project',

    login: 'Email or username',
    username: 'Username',
    code: 'Confirmation code',
    email: 'Email address',
    password: 'Password',
    passwordHint: 'Secret question',
    secretAnswer: 'Secret answer',
    projectCode: 'Project code',
    confirmPassword: 'Confirm password',

    passwordHelper: 'Minimum 8 characters',
    codeHelper: 'This code was sent to you by email',
    passwordMismatch: `Confirmation doesn't match password`,

    notRegistered: 'Not registered?',
    alreadyRegistered: 'Already registered?',
    rememberAnswer: 'Warning! This answer will act as your password'
      + ' and cannot be recovered!',
    defaultQuestion: 'What is the title of your favorite book ?',

    resetAction: 'reset',
    resendCodeAction: 'resend code',
    confirmSignupAction: `confirm signup`,
    signupAction: `signup`,
    forgotPasswordAction: 'forgot password',
    loginAction: `login`,
    changePasswordAction: 'reset password',
    joinAction: 'join',

    upgradeAccountMessage: 'Please enter a valid email and a'
      + ' password to continue',
    signupOrLoginMessage: 'Please signup or login to continue'
  },

  notFound: {
    title: 'Page not found :(',
    description: 'The page you are looking for might be private or'
      + ' may have been deleted',
    action: 'back to home'
  },

  project: {
    createAction: ' Create project',
    cancelAction: 'Cancel',
    createTitle: 'New project',
    objective: 'Objective',
    assignment: 'Assignment',
    title: 'Title',
    description: 'Description',
    public: 'Public',
    collaborative: 'Collaborative',
    shared: 'Share',
    members: '{{ count }} attendees',
    members_plural: '{{ count }} attendees',

    titleHelper: 'Choose a meaningful title for your project',
    descriptionHelper: 'Briefly describe your video',
    objectiveHelper: 'Choose an educational objective',
    assignmentsHelper: 'List the assignments submitted to the attendees',
    tagsHelper: 'Choose up to 4 tags that fit your project',
    levelsHelper: 'Select the education levels relevant to your project',
    publicHelper: 'A public project will be visible by all users,'
      + ' even logged-out. However, they won\'t be able to see the'
      + ' annotations and comments, nor to add their own.',
    collaborativeHelper: 'Attendees to a collaborative project will'
      + ' be allowed to annotate or comment the video. If your project'
      + ' is not collaborative, only you can annotate and comment on it.',

    assignmentsSection: 'Assignments',
    tagsSection: 'Tags',
    levelsSection: 'Education levels',
    visibilitySection: 'Visibility',

    assignmentPlaceholder: 'Add an assignment',
    tagsPlaceholder: 'Search or create tag…',

    codeWarning: {
      title: 'Make sure to remember this code.',
      description: 'You won\t be able to recover it once this popup closes.'
        + ' If you loose it, you will have the option to generate a new one.'
    },

    share: {
      dialog: {
        description: 'To open printable instuctions in a new widow',
        linkText: 'click here'
      },
      guide: {
        title: 'Instructions',
        subtitle: 'How to use Celluloid ?',
        step1: 'Open the web page',
        step2: 'On the landing page, click '
          + ' "JOIN PROJECT"',
        step3: 'Enter the project code',
        step4: 'Enter your username and an answer to a secret question',
        step5: 'Make sure to read carefully the objective and assignments!',
        step6: 'Complete the assignments and annotate the video while it\'s playing!'
      }
    },
    creatorRole: 'Creator'
  },

  update: {
    message: 'This app was just updated!'
      + ' Please refresh the page.',
    action: 'refresh'
  },

  annotation: {
    pauseLabel: 'pause video ?',
    contentPlaceholder: 'type in your annotation…',
    commentPlaceholder: 'Leave a comment…',
    hintLabel: '{{count}} annotation',
    hintLabel_plural: '{{count}} annotations',
    hintLabelNone: 'No annotation at this time',
    commentLabel: '{{count}} comment',
    commentLabel_plural: '{{count}} comments'
  },

  tagSearch: {
    createLabel: 'Create tag',
    prefix: 'Tag: '
  },

  levels: {
    kinderGarten: 'Kindergarten',
    elementarySchool1: 'Elementary school 1',
    elementarySchool2: 'Elementary school 2',
    middleSchool: 'Middle school',
    highSchool: 'High school',
    higherEducation: 'Higher education',
    research: 'Research'
  },

  createAction: 'Save',
  cancelAction: 'Cancel',
  deleteAction: 'Delete',
  shareAction: 'Share',
  printAction: 'Print'
};
